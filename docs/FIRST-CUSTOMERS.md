# First 100 Customers: Local AGI Network (2026-03-27)

## Your situation

Working product (desktop app + P2P network) with a supply-side-first strategy. First 100 "customers" are Neurons — privacy-conscious people with capable hardware (Apple Silicon, gaming PCs) who want to run agentic AI tasks locally. They're customers even if they don't pay yet, because they're the supply that makes the network work.

Not selling a SaaS subscription. Recruiting the first 100 nodes of a network. Closer to Airbnb recruiting hosts than Gumroad selling to creators.

---

## Circle 1: Friends & Family (This Week)

Target 10 people who own Apple Silicon Macs or decent GPUs. The pitch isn't "support my startup." It's:

> "You use ChatGPT, right? Would you want the same thing but everything stays on your laptop? I built an app that does data analysis, image generation, web automation — all locally. No account, no cloud, no censorship. Can I install it on your Mac and show you?"

**Who to target:**
1. Friends/family who are Mac users and already use ChatGPT or Midjourney
2. Anyone who has ever complained about AI privacy or censorship
3. Tech-adjacent friends (designers, analysts, small business owners) — not just developers
4. Friends who handle sensitive data at work (finance, legal, medical, freelance)

**What you're learning from them:**
- Do they finish the install? (friction test)
- Which use case do they try first? (tells you the wedge)
- Do they open it again next week without being asked? (retention signal)
- What confuses them? (UX feedback)

Don't ask "do you like it?" Ask "what did you try to do with it?"

---

## Circle 2: Your Communities (Week 1-4)

This is where your first 100 realistically come from. Target communities where privacy + AI overlap:

### High-priority communities

| Community | Where | Why they care |
|-----------|-------|---------------|
| r/LocalLLaMA | Reddit | Already running local models, frustrated by limitations |
| r/StableDiffusion | Reddit | Power users who know ComfyUI pain, want easier tools |
| r/selfhosted | Reddit | Privacy-first crowd, run everything locally |
| r/privacy | Reddit | Will resonate with "nothing leaves your device" |
| Ollama Discord | Discord | Hit the ceiling of chat-only local AI, want more |
| LM Studio community | Discord/Reddit | Same — chat-only frustration |
| Hacker News | Show HN | "Show HN: P2P network for local AI agents" is catnip |
| AI Twitter/X | X | Privacy-AI intersection accounts |
| Mac power user communities | Reddit/forums | Apple Silicon owners looking to use their hardware |

### How to approach (not spam)

1. **Contribute first.** Answer questions in r/LocalLLaMA about running models on Apple Silicon. Share benchmarks. Help people. Do this for 1-2 weeks before ever mentioning Local AGI.

2. **Share the problem, not the product.** Post something like:
   > "I was frustrated that Ollama only does chat. I wanted to analyze my business data locally without sending it to OpenAI. ComfyUI was too complex. So I built something that bundles agents + models into one app. Here's what it looks like. Would love feedback from this community."

3. **DM the vocal ones.** In every thread about local AI privacy, someone is passionate. DM them personally:
   > "Hey, saw your comment about wanting local AI for [specific thing]. I built a desktop app that does exactly that — runs agentic tasks (not just chat) entirely on your machine. Would you try the beta? Looking for 10 power users to shape the product."

4. **"Show HN" post.** Write it as a technical story, not a pitch:
   > "Show HN: Local AGI — P2P network where AI agents run on your device, not the cloud"
   > Lead with the technical architecture. HN respects builders. Mention it runs on Apple Silicon. Show real task examples.

---

## Circle 3: Cold Outreach Template

Target: people who publicly complain about AI privacy, ChatGPT censorship, or ComfyUI complexity.

Find them by searching Twitter/X, Reddit, and HN for phrases like:
- "I wish I could run this locally"
- "ChatGPT won't let me"
- "ComfyUI is so confusing"
- "don't trust OpenAI with my data"
- "local AI" + frustration

**Template (adapt per person, never copy-paste):**

> Hi [name],
>
> Saw your [post/comment] about [specific thing they said — e.g., "wanting to analyze client data without sending it to ChatGPT"]. I've been working on exactly this problem.
>
> I built a desktop app called Local AGI that runs AI agents entirely on your device — data analysis, image generation, web automation, not just chat. Everything stays local. It bundles the models and agents so there's nothing to configure (no ComfyUI workflows, no terminal commands).
>
> It runs well on Apple Silicon. Would you try the beta? I'm looking for [10/20] early users who care about privacy to help shape it.
>
> Either way, happy to chat about local AI setups — I've been deep in this space.
>
> [your name]

**Key rules:**
- Reference something specific they said. Proves you're not spamming.
- Offer value even if they say no ("happy to chat about local AI setups")
- Don't oversell. "Would you try the beta?" is low-pressure.
- Send 5 of these per day. That's 100 in a month.

---

## Pricing Strategy

### Phase 1: First 100 Neurons (now)
**Price: Free.** Goal is nodes online, not revenue. The app is free to download and use locally. Charging now adds friction that kills growth before the network has value.

### Phase 2: Users start submitting tasks to the network (50+ Neurons online)
**Price: Market-driven, with a floor.** Let Neurons set their own rates for compute, but set a minimum so there's no race to zero. Take a platform cut (15-20%).

Suggested starting point:
- Text/analysis tasks: $0.01-0.05 per task
- Image generation: $0.05-0.15 per image
- Video generation: $0.25-1.00 per video
- Platform takes 20%

Compare to cloud: if ChatGPT Plus is $20/month for censored, limited AI... a user spending $5-10/month on Local AGI for uncensored, private access is compelling.

### Phase 3: Subscription layer (100+ active users)
Optional "Local AGI Pro" for Users: $9.99/month for priority task routing, faster Neurons, higher limits. Neurons still earn per-task.

Don't overthink pricing now. Free for Neurons, cheap per-task for Users, iterate from there.

---

## Weekly Sales Goal & Tracking

### The 100-day plan

| Week | Goal | Channel | Milestone |
|------|------|---------|-----------|
| 1 | 10 installs | Friends/family | App works on someone else's machine |
| 2-3 | 25 installs | r/LocalLLaMA, r/selfhosted, Ollama Discord | First community feedback |
| 4 | 40 installs | Show HN post + cold DMs | First strangers using the app |
| 5-6 | 60 installs | Double down on what worked in week 4 | 10+ users opening app weekly |
| 7-8 | 80 installs | Cold outreach at scale (5/day) | First network tasks between strangers |
| 9-12 | 100 active Neurons | Repeat, refine | Network has enough supply to serve Users |

### What to track weekly

| Metric | Why |
|--------|-----|
| New downloads | Is distribution working? |
| Weekly active Neurons (opened app) | Are they sticking? |
| Tasks completed per user | Is the product useful? |
| Top use case by volume | Tells you your real wedge |
| Drop-off point (installed but never ran a task) | UX friction to fix |

### How to track
Simple spreadsheet. Don't build analytics infrastructure yet. Every Sunday, fill in the numbers. If a number went down, figure out why before Monday.

---

## The #1 Thing That Will Make or Break This

**The download button on the landing page needs to work.** Right now it goes nowhere. You have a built product, a real gap, and a solid strategy. The bottleneck is that nobody can actually get the app.

Ship the download. Everything else follows from there.
