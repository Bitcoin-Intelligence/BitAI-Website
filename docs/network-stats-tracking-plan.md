# Network Health Stats — Tracking Rework Plan (v2.1)

Status: proposal · Spans 3 repos: `Interns`, `Interns-Desktop-App`, `BitAI-Website`

> v2.1 locks decisions A/B/D, resolves C (system vs user cancel) via code review, and explains E.
> Model: track **relay (non‑local) tasks only**, centralized in the desktop tasks receiver. Metrics:
> **active neurons · tasks submitted · completion rate · cancel‑by‑user rate**. Dashboard table is
> **per agent type**. Requires a signaling‑server schema + aggregation change.

## 1. Goal & scope

Track usage for the landing‑page **Network Health** section. **Only track non‑local tasks (relay)** —
gate every tracker on `mode != "local"`. Local‑only runs are never tracked.

Four metrics:

| Metric | Definition |
|---|---|
| Active Neurons | providers with a recent heartbeat (unchanged) |
| Tasks Submitted | count of relay tasks saved to the tasks sqlite db |
| Completion Rate | `completed / submitted` |
| Cancel‑by‑User Rate | `canceled_by_user / submitted` |

Three tracked events (relay‑only, all submit‑and‑forget):

| Event | Fire when… | Where |
|---|---|---|
| **submitted** | a relay task is saved into the tasks sqlite db | `tasks_receiver.py` — on INSERT |
| **completed** | a task's status is updated to success (`completed`) | `tasks_receiver.py` — on status write |
| **canceled** | a task's status is updated to `canceled` **via the user path** (see §4.2/§9‑C) | `tasks_receiver.py` — on status write |

Every tracking call carries the **task type** so the dashboard can break down per agent type (§6).

## 2. Dashboard table — agent types  ✅ mapping confirmed

Columns: **Agent Type · Submitted · Completion Rate · Cancel‑by‑User Rate** (no status column).

| Agent type (display) | task_type |
|---|---|
| Hermes | `general` |
| Browser | `administrative` |
| Image Generator | `image_generation_from_text` |
| Image Editor | `image_generation_from_images` |
| Video Generator | `video_generation_from_images` |

Per row: `Submitted = submitted_of_type`, `Completion% = completed_of_type / submitted_of_type`,
`Cancel% = canceled_of_type / submitted_of_type` (guard divide‑by‑zero → 0).

## 3. Canonical task identity

All three events fire from the same desktop sqlite task, keyed by `taskid` (the web `thread_id` flows
through to it), so they land on one signaling row with no cross‑process id juggling.
`POST /usage/tasks` is idempotent on `task_id`, so re‑emits are safe.

## 4. Desktop tracking — all in `Interns-Desktop-App/.../tasks_receiver/tasks_receiver.py`

Centralized here: the receiver owns the sqlite db (sees INSERTs and the status writes the dispatcher
PUTs in), runs async (FastAPI + `httpx`), and has the full task row (`mode`, `task_type`,
`user_token`, prior `status`).

Shared gate for every event: track only if **`mode != "local"`** and `task_type` is one of the 5 real
types (skip `chat`, `provider_start`, internal). If `user_token` is empty → skip silently.

### 4.1 submitted — on task INSERT
- Hook: `_create_task_internal()` immediately **after** the `INSERT INTO tasks …` + commit (~L903–930).
- Available: `task.taskid`, `task.mode`, classified `task.task_type`/`classified_type`, `task.user_token`.
- Action: `POST /usage/tasks {task_id, mode, task_type}` → server row, status `created` (submitted),
  task_type stored (§5).

### 4.2 completed / canceled — on status write
- Hook: the receiver's task‑update handler where the dispatcher's status PUT lands
  (`PUT /tasks/{id}`, ~L1186). The **prior** row (`row["status"]`, `status_note`) is available here —
  needed to distinguish user vs system cancel.
- After the sqlite status write, inspect the new status:
  - `completed` → `PATCH /usage/tasks/{task_id}/complete`.
  - `canceled` **AND** prior `row["status"] == "cancel_requested"` → `PATCH /usage/tasks/{task_id}/cancel`
    (new endpoint, §5). **Do NOT track** `pending`/`queued`/`accepted → canceled` — those are
    system/scheduler cancels (timeouts, expired tokens, missed windows; §9‑C). `failed`/`interrupted`
    are never tracked as cancels.
- Read `mode`, `user_token` from the task row to gate (relay‑only) and authenticate.
- Robustness: idempotent `POST /usage/tasks {task_id, mode, task_type}` right before the PATCH so the
  row always exists even if the submitted POST was lost (else PATCH 404s).

### 4.3 Fire‑and‑forget helper (async receiver)
```python
import asyncio, threading, httpx, os
_BG: set = set()  # keep refs so tasks aren't GC'd
SIGNALING_URL = os.getenv("LOCALAGI_SIGNALING_URL", "https://signal.localagi.network")  # already ~L2562
REAL_TASK_TYPES = {"general","administrative","image_generation_from_text",
                   "image_generation_from_images","video_generation_from_images"}

def track_usage(action: str, task_id: str, mode: str, task_type: str, user_token: str):
    # action in {"submitted","completed","canceled"}; caller already applied the user-cancel gate
    if mode == "local" or not user_token or task_type not in REAL_TASK_TYPES:
        return
    async def _run():
        try:
            async with httpx.AsyncClient(timeout=3) as c:
                h = {"Authorization": f"Bearer {user_token}"}
                await c.post(f"{SIGNALING_URL}/usage/tasks", headers=h,
                             json={"task_id": task_id, "mode": mode, "task_type": task_type})
                if action == "completed":
                    await c.patch(f"{SIGNALING_URL}/usage/tasks/{task_id}/complete", headers=h)
                elif action == "canceled":
                    await c.patch(f"{SIGNALING_URL}/usage/tasks/{task_id}/cancel", headers=h)
        except Exception:
            pass  # best-effort, never raises
    try:
        t = asyncio.create_task(_run()); _BG.add(t); t.add_done_callback(_BG.discard)
    except RuntimeError:
        threading.Thread(target=lambda: asyncio.run(_run()), daemon=True).start()
```
Call **after** the sqlite write, never awaited, never inside the transaction.

## 5. Signaling server changes (REQUIRED) — `Interns/signaling_server`

### 5.1 Schema (`db.py` `TaskUsageRow` ~L168) + migration
- `status` values → `created | completed | canceled | failed` (`typed` retired).
- Populate `task_type` on create (column exists).
- Add `canceled_at DateTime nullable`. (`typed_at` becomes vestigial.)
- Migration under `signaling_server/migrations/` for `canceled_at`.

### 5.2 Endpoints (`usage.py`)
- `POST /usage/tasks` (L33): extend `TaskUsageCreate` (`models.py`) to accept `task_type: Optional[str]`;
  persist it; status `created`; keep idempotent.
- `PATCH …/{id}/complete` (L83): unchanged (status `completed`).
- `PATCH …/{id}/cancel` — **new**: status `canceled`, `canceled_at=now`, same ownership check.
  *Only user cancels ever reach this endpoint (desktop gates per §4.2/§9‑C), so a signaling
  `status='canceled'` row is by definition "canceled by user".*
- `PATCH …/{id}/type` (L60): drop (unused) or leave as harmless no‑op.
- `/fail` (L105): keep (optional).

### 5.3 Aggregation (`GET /usage/network-health` L207, `/stats` L130)
```
total      = COUNT(*)                          WHERE mode != 'local'
completed  = COUNT(*) WHERE status='completed' AND mode != 'local'
canceled   = COUNT(*) WHERE status='canceled'  AND mode != 'local'
completion_rate     = round(completed/total*100,1) if total else 0.0
cancel_by_user_rate = round(canceled /total*100,1) if total else 0.0
by_type    = per task_type (NOT NULL, mode != 'local'):
               { task_type, submitted, completed, canceled }
```
Response:
```json
{
  "active_neurons": 0,
  "tasks_submitted": 0,
  "completion_rate": 0.0,
  "cancel_by_user_rate": 0.0,
  "by_type": [{"task_type": "general", "submitted": 0, "completed": 0, "canceled": 0}]
}
```
- **Remove `pickup_rate`.**
- **Remove `capability_status`** ✅ (confirmed) and the provider `models`/`_is_provider_busy` scan from
  this endpoint (big simplification; `_is_provider_busy` in `relay.py` may stay for other callers).
- `active_neurons` logic unchanged.
- Update `signaling_server/tests/test_usage.py` (cancel, per‑type shape, new rates, `mode!='local'`,
  no pickup_rate, no capability_status).

## 6. Website — `BitAI-Website/public`

### 6.1 Cards & social‑proof strip (`index.html`)
Four cards → **Active Neurons · Tasks Submitted · Completion Rate · Cancel‑by‑User Rate** (replace the
Pickup/Completion pair). Update the top strip's 3rd/4th items to **Completed %** and **Canceled %**.

### 6.2 Table (`index.html` + `script.js`)
Replace the 8‑row capabilities/status table with a 5‑row agent table:
```
AGENT TYPE | SUBMITTED | COMPLETION RATE | CANCEL BY USER RATE
Hermes / Browser / Image Generator / Image Editor / Video Generator
```
- Replace `TASK_GROUPS` (`script.js:279-288`) with:
  ```js
  const AGENT_TYPES = [
    { label: "Hermes",          type: "general" },
    { label: "Browser",         type: "administrative" },
    { label: "Image Generator", type: "image_generation_from_text" },
    { label: "Image Editor",    type: "image_generation_from_images" },
    { label: "Video Generator", type: "video_generation_from_images" },
  ];
  ```
- `loadNetworkHealth()` (`script.js:290`) → consume new shape: cards from `active_neurons`,
  `tasks_submitted`, `completion_rate`, `cancel_by_user_rate`; build `byType[task_type] =
  {submitted, completed, canceled}`; per row compute submitted + the two % (guard /0).
- Remove `statusKey`/Online‑Busy‑Offline badge logic and the hard‑coded fallback `<tbody>`; show 5
  agent rows with zeros by default.

## 7. Decommission old tracking (critical)

Remove legacy writers so the only source is `tasks_receiver.py`:
- Web: `deer/deer_flow/web/src/core/api/chat.ts:695` `trackTaskCreated` call + helper
  `web/src/core/api/p2p.ts:173`.
- Backend coordinator/graph: `deer/deer_flow/src/p2p/client.py` `track_task_*` and callers in
  `deer/deer_flow/src/graph/nodes.py`.

## 8. Submit‑and‑forget requirements (non‑negotiable)

Swallow all errors; never block the main path (`asyncio.create_task` + ref set; daemon thread if a
sync path is hooked); 3s timeout; skip cleanly when gated out; always run **after** the sqlite write;
reuse `httpx` (no new deps).

## 9. Decisions

- **A. Agent↔type mapping** (§2): ✅ confirmed — Hermes=`general`, Browser=`administrative`.
- **B. Relay gate**: ✅ confirmed — gate on `mode != "local"`.
- **C. user vs system cancel**: ✅ RESOLVED (code review). No separate status — system/timeout cancels
  reuse `canceled`. A *user* cancel is the only way a running task reaches `canceled`
  (`processing → cancel_requested → canceled`; transition map `tasks_receiver.py:1108‑1117`).
  System/scheduler cancels go `pending`/`queued`/`accepted → canceled` with a `status_note` from
  `SCHEDULER_STATUS_NOTES` (`cancel_timeout`, `scheduled_token_expired`, `missed_window`, … L68‑82).
  → **Track cancel only when prior `row["status"] == "cancel_requested"`** (§4.2).
- **D. Drop `capability_status`**: ✅ confirmed — removed (§5.3).
- **E. Rate denominator**: default **`/ submitted`** — see below; confirm or switch to terminal‑only.
- **F. Track `failed`?** Optional, not displayed.

### E explained — what "denominator" means
Both rates are `numerator / denominator`; the question is what's in the denominator:
- **Option 1 — all submitted (default):** `completion = completed/submitted`, `cancel = canceled/submitted`.
  A still‑running task is in the denominator but neither numerator, so it pulls both rates down until it
  finishes; `failed` tasks likewise sit only in the denominator. Reads as "of every task submitted, X%
  completed, Y% canceled." (completion% + cancel% + fail% + running% = 100%).
- **Option 2 — finished only (`completed+canceled+failed`):** excludes in‑progress; completion% +
  cancel% + fail% = 100%.

Example — 10 submitted: 6 completed, 2 user‑canceled, 1 failed, 1 running →
Option 1: completion 60%, cancel 20%. Option 2: completion 67%, cancel 22%.
**Recommendation: Option 1** (simplest; tasks finish fast so the in‑flight skew is tiny). Switch to
Option 2 if you want rates over only finished tasks.

## 10. Edge cases & risks

- **`canceled` status is shared** by user and system cancels → the §4.2 prior‑status gate is what makes
  "cancel‑by‑user" accurate; without it, scheduler timeouts would inflate the cancel rate.
- **In‑progress tasks** count in submitted, not yet in completed/canceled (see §9‑E).
- **Ownership check**: PATCH needs the row's `user_id` == JWT user; the same signed‑in user's
  `user_token` is used everywhere, so it holds; foreign/empty token → dropped.
- **Off‑web sources** (bot/scheduled) are tracked uniformly (receiver‑centric) — but scheduled tasks
  are also the main source of system cancels, which §4.2's gate correctly excludes.
- **Non‑relay tasks** are never tracked, by design.

## 11. Test plan

- **Relay happy path (signed in):** relay image‑gen task → row `created(image_generation_from_text) →
  completed`; Tasks Submitted +1; Completion Rate + Image Generator row update.
- **User cancel:** start a relay task, click cancel → `processing → cancel_requested → canceled`; Cancel
  rate + row cancel% update; completion unaffected.
- **System cancel (must NOT count):** force a scheduler timeout / `pending → canceled` with a
  `SCHEDULER_STATUS_NOTES` note → assert **no** `/usage/.../cancel` call fired.
- **Local task:** runs locally → nothing tracked.
- **Per‑type breakdown:** one of each of the 5 types → each agent row correct.
- **Fire‑and‑forget proof:** point `LOCALAGI_SIGNALING_URL` at an unreachable/hanging host → create /
  complete / cancel all still work, no surfaced error, no latency.
- **No double counting:** legacy trackers gone (§7) — one create + one terminal write per task.
- **Server:** update `tests/test_usage.py` for cancel + per‑type shape + new rates + `mode!='local'`.

## 12. Rollout order

1. **Signaling server**: schema + `canceled_at` migration, `task_type` on POST, new `/cancel`, reworked
   aggregation, drop `pickup_rate` + `capability_status`.
2. **Decommission** legacy tracking (§7).
3. **Desktop receiver**: submitted on INSERT; completed/canceled (user‑gated) on status write (§4).
4. **Website**: new cards + agent‑type table + new mapping (§6).
5. Verify end‑to‑end against staging, then production.

---

## Appendix — file/line reference index (lines approximate; re‑confirm while editing)

**Interns (signaling + intent)**
- `signaling_server/usage.py` — `_extract_auth` L17; `POST /usage/tasks` L33; `PATCH …/type` L60 (drop);
  `…/complete` L83; `…/fail` L105; `/stats` L130; `/network-health` L207.
- `signaling_server/db.py` — `TaskUsageRow` L168 (add `canceled_at`; status `created|completed|canceled|failed`).
- `signaling_server/models.py` — `TaskUsageCreate` (add `task_type`).
- `signaling_server/migrations/` — add `canceled_at` migration.
- `deer/deer_flow/src/prompts/coordinator_renderer.py` — `ALLOWED_TASK_TYPES` (the 5 types).
- Legacy to remove: `deer/deer_flow/src/p2p/client.py`; `deer/deer_flow/src/graph/nodes.py`;
  `deer/deer_flow/web/src/core/api/chat.ts:695`; `web/src/core/api/p2p.ts:173`.

**Interns-Desktop-App** (`assets/scripts/`)
- `tasks_receiver/tasks_receiver.py` — `SCHEDULER_STATUS_NOTES` (system‑cancel notes) L68‑82; `tasks`
  schema in `init_db()` ~L384‑411 + cancel fields (`cancel_requested_at`, `cancel_reason`) ~L441‑442;
  status **transition map** L1108‑1117 (`processing → cancel_requested → canceled`; system →
  `pending/queued/accepted → canceled`); INSERT in `_create_task_internal()` ~L903‑930 (**submitted
  hook**); update handler / `UPDATE tasks SET status…` ~L1186 (**completed/canceled hook**, prior row
  available); `SIGNALING_URL` ~L2562; bearer header pattern ~L2607; `httpx` async.
- `tasks_dispatcher/tasks_dispatcher.py` — decides statuses: `completed` L591 (`agent=='reporter'`),
  user‑cancel `event: canceled` L575‑586 + finally `cancel_requested → canceled` L612‑616, `failed`
  L594/631, `interrupted` L602; `update_task_status()` PUTs to receiver L138‑147; per‑task `user_token`
  ~L480 (alt hook; sync `requests` → daemon thread).

**BitAI-Website**
- `public/script.js` — `TASK_GROUPS` L279‑288 (→ `AGENT_TYPES`); `loadNetworkHealth()` fetch L292,
  by_type/table fill L320‑336 (rework); cards L261‑269; social strip L300‑305;
  `DOMContentLoaded` L343; `SIGNALING_URL` L277.
- `public/index.html` — Network Health stat cards (relabel 3rd/4th) + table `<thead>`/`<tbody>` (new
  columns + 5 fallback rows) + social‑proof strip items.
