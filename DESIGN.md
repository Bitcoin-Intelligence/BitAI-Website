# Design System — Local AGI

## Product Context
- **What this is:** A two-sided marketplace for local AI compute. Consumers get AI capabilities from the network; providers share spare compute and earn rewards. One desktop app serves both sides — a "Provide" button in the UI toggles provider mode.
- **Who it's for:** Regular people (not just developers). Consumers who want private AI without cloud dependency. Providers with powerful machines who want to earn by sharing compute.
- **Space/industry:** Local AI / decentralized AI compute marketplace. Competitors include Ollama, LM Studio, Jan.ai (single-player tools) and Akash Network (decentralized compute marketplace).
- **Project type:** Marketing landing page for a desktop application
- **Key differentiator:** Every competitor is a single-player local AI tool. Local AGI is the only two-sided marketplace where both providers AND consumers benefit from sovereign privacy (all processing runs on the provider's local device, never shipped to a cloud).

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — confident infrastructure that regular people trust
- **Decoration level:** Intentional — the network/node motif (dots, connections, dotted lines) is the visual language across the entire site. Section dividers, background texture, card accents. The product IS a network; the design echoes that.
- **Mood:** Trustworthy, competent, warm. Think Stripe meets early internet optimism. Not playful (handling compute and privacy), not brutalist (need consumer warmth). The gold accent adds humanity to the industrial base.
- **Reference sites:** Akash Network (marketplace energy, high contrast), LM Studio (clean typography, product-forward), Stripe (trust through clarity)

## Typography
- **Display/Hero:** Space Grotesk (700/600) — geometric precision, techy but distinctive. Not used by any direct competitor. Carries the "infrastructure" message.
- **Body:** DM Sans (400/500/600) — clean, modern, excellent readability at all sizes. Tabular-nums support for data. 500 weight for emphasis/labels.
- **UI/Labels:** DM Sans 500
- **Data/Tables:** JetBrains Mono (400/500) — for model names, status indicators, technical data, terminal-style outputs
- **Code:** JetBrains Mono
- **Loading:** Google Fonts — `Space+Grotesk:wght@400;500;600;700` + `DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400` + `JetBrains+Mono:wght@400;500;600`
- **Scale:**
  - Hero: 56px / line-height 1.1 / letter-spacing -1.5px
  - H2: 36px / line-height 1.2 / letter-spacing -0.5px
  - H3: 20px / line-height 1.3
  - Body: 16px / line-height 1.6
  - Small/Caption: 14px / line-height 1.5
  - Label/Mono: 12-13px / line-height 1.4 / letter-spacing 1-1.5px (uppercase)
  - Section labels: 11px / JetBrains Mono / uppercase / letter-spacing 1.5px / gold color

## Color
- **Approach:** Balanced — gold primary for value/reward, teal secondary for active/success, restrained use of color elsewhere
- **Dark mode (default):**
  - Base: `#0B1120` — deep navy-black, not pure black
  - Surface: `#131B2E` — card backgrounds, slightly elevated
  - Elevated: `#1A2540` — modals, dropdowns, inputs
  - Hover: `#1E2D4A` — hover states on surfaces
  - Border: `rgba(255,255,255,0.08)` — subtle dividers
  - Border strong: `rgba(255,255,255,0.15)` — interactive borders
- **Accent:**
  - Primary (Gold): `#E8A830` — signals value, reward, premium. Used for CTAs, active states, emphasis. On dark backgrounds.
  - Primary hover: `#F0BC50`
  - Primary muted: `rgba(232,168,48,0.15)` — backgrounds, badges
  - Secondary (Teal): `#38BFA0` — active/online indicators, success states, consumer-side accent
  - Secondary muted: `rgba(56,191,160,0.12)`
- **Text (dark mode):**
  - Primary: `#F0F2F5` — headings, important text (not pure white — reduces eye strain)
  - Secondary: `#8B95A8` — body text, descriptions
  - Tertiary: `#5A6478` — captions, metadata, disabled
- **Semantic:**
  - Success: `#38BFA0` (same as secondary — teal)
  - Warning: `#E8A830` (same as primary — gold)
  - Error: `#E85858`
  - Info: `#5B8DEF`
- **Light mode (toggle):**
  - Base: `#F5F6F8`
  - Surface: `#FFFFFF`
  - Text primary: `#0B1120`
  - Primary accent: `#C88D1E` (darkened gold for contrast on light)
  - Secondary accent: `#2A9A7E` (darkened teal)
- **DO NOT USE:** `#2ecc71` (generic AI green), `#1e3c72` (generic AI navy gradient), purple/violet gradients

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — consumer audience, not data-dense
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(80px)
- **Section padding:** 80px vertical (desktop), 48px vertical (mobile)
- **Card padding:** 24px
- **Component gap:** 16px default, 24px between cards, 32px between major groups

## Layout
- **Approach:** Grid-disciplined — marketplace = trust = clarity = predictable alignment
- **Grid:** 12-column, 1200px max-width, 32px gutters
- **Breakpoints:**
  - Mobile: 0–767px (1 column, stacked)
  - Tablet: 768–1023px (8 columns, 2-up cards)
  - Desktop: 1024px+ (12 columns, full grid)
- **Border radius:**
  - sm: 4px (inputs, small badges)
  - md: 8px (cards, buttons, modals)
  - lg: 12px (hero cards, major containers)
  - full: 9999px (pills, circular badges, avatar)
- **Max content width:** 1200px
- **Card grid:** 3 columns desktop, 2 tablet, 1 mobile

### Page Structure (Landing Page)
```
1. NAV
   Logo | Use Cases | How It Works | Network | [Download]
   Fixed, transparent → blurred on scroll. Gold download button.

2. HERO (full viewport)
   H1: "AI, powered by people"
   Subtitle: "A peer-to-peer network where AI lives on real devices,
   not corporate clouds. Uncensorable. Unstoppable."
   No bullet points — subtitle carries the message.
   CTAs: [Download App] [See How It Works →]
   Right: Network visualization — providers (gold) + consumers (teal)
   connected with dashed lines. Legend always visible.
   No toggle — single unified network view.

3. SOCIAL PROOF BAR (thin strip)
   ● 2,847 Providers | 184K Tasks | 156 Models | 1.2s Avg
   Surface background, JetBrains Mono numbers, green dot for liveness.

4. USE CASES (grouped video cards)
   Section label: "USE CASES" (gold mono uppercase)
   H2: "What can Local AGI do?"
   Categories with labels: ANALYSIS (3 cards) | CREATE (4 cards) | AUTOMATE (1 card)
   Each card: video thumbnail + play button + title + prompt text + copy button
   Click opens fullscreen modal with loading spinner.
   Mobile: horizontal scroll carousel per category.

5. FOR PROVIDERS
   Section label: "FOR PROVIDERS" (gold mono uppercase)
   H2: "Power the Network"
   Subtitle: "Share your spare compute. Stay private. Earn rewards."
   Three benefit cards:
   - Earn Rewards: Get paid for compute you aren't using
   - Private Processing: Tasks run entirely on YOUR device. No cloud.
   - Unlimited Usage: Use AI agents without limits while providing
   Closing line: "Same app. Just click 'Provide' to get started."
   CTA: [Download App]

6. HOW IT WORKS (two-track)
   Section label: "HOW IT WORKS"
   H2: "Two paths, one app"
   Side-by-side columns:
   CONSUMERS:              PROVIDERS:
   ① Download the app      ① Download the app
   ② Ask the agent         ② Enable Provide mode
   ③ Get results privately  ③ Earn while staying private
   Dashed gold connector lines between steps.
   Mobile: stacked, consumers first.

7. NETWORK STATS (dashboard)
   Section label: "NETWORK"
   H2: "Network Health"
   4 stat cards: Providers, Tasks, Models, Avg Latency
   Data table: model name | providers | latency | status badge
   JetBrains Mono for all numbers.

8. FOOTER
   Logo + tagline | GitHub | Discord | Docs
   [Download App] CTA (gold)
   © 2026 Local AGI
```

### Network Visualization Design
- Providers: Gold border (#E8A830), gold glow, filled node icon
- Consumers: Teal border (#38BFA0), teal glow, outlined node icon
- Connections: Dashed lines between providers and consumers, showing compute flow
- Legend: Always visible below diagram — "◉ Provider  ◎ Consumer"
- Single view: shows the full marketplace network (no toggle)
- Animation: gentle floating/drifting nodes, subtle pulse on connection lines

## Motion
- **Approach:** Intentional — purposeful transitions that aid comprehension
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Patterns:**
  - Cards: translateY(-4px) on hover, 200ms ease-out
  - Buttons: translateY(-1px) + shadow increase on hover, 200ms
  - Page sections: subtle fade-in on scroll, 400ms ease-out
  - Network diagram: gentle floating/drifting nodes, connection line pulse animation
  - Tab transitions: 300ms opacity crossfade
- **DO NOT:** Use bounce animations, excessive parallax, or decorative motion that doesn't serve comprehension

## Accessibility
- **Contrast:** All text must meet WCAG AA (4.5:1 for body, 3:1 for large text). Gold on dark navy passes. Tertiary text (#5A6478) is decorative only — never for essential content.
- **Keyboard navigation:** All interactive elements focusable. Tab order matches visual order. Focus indicators: 3px gold outline offset by 2px.
- **Touch targets:** Minimum 44x44px for all interactive elements
- **ARIA:** Tabs use role="tablist"/role="tab"/role="tabpanel". Video modal has focus trap. Cards use role="article". Network diagram has aria-label describing the visualization.
- **Screen readers:** Canvas diagram must have a text alternative. Video cards need aria-labels. Copy buttons need accessible names.
- **Reduced motion:** Respect prefers-reduced-motion — disable all animations except opacity transitions.

## Component Patterns

### Buttons
- **Primary:** Gold background (#E8A830), dark text (#0B1120), 12px 28px padding, md radius, 600 weight
- **Secondary:** Transparent, white text, 1px border (border-strong), md radius
- **Ghost:** Transparent, secondary text color, no border, sm padding

### Cards
- **Surface:** bg-surface, 1px border, lg radius, 24px padding
- **Hover:** border-strong, shadow-md, translateY(-4px)
- **Video card:** Overflow hidden, video/image top, caption bottom with h3 + prompt text

### Badges
- **Pattern:** Pill shape (full radius), 4px 12px padding, 12px font, 600 weight
- **Variants:** success (teal), warning (gold), error (red), info (blue) — each uses muted background + solid text color
- **Dot indicator:** 6px circle before text, same color as text

### Alerts
- **Pattern:** md radius, 14px 18px padding, 1px border, muted background
- **Variants:** success, warning, error, info — matching badge color scheme

### Data Tables
- **Headers:** JetBrains Mono, 11px, uppercase, letter-spacing 1px, tertiary color
- **Cells:** DM Sans 14px, secondary color, 14px 16px padding
- **Rows:** 1px bottom border, hover state with bg-hover
- **Numbers:** tabular-nums via font-variant-numeric

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-18 | Initial design system created | Created by /design-consultation based on competitive research (LM Studio, Jan.ai, Ollama, GPT4All, Akash) and product context (two-sided marketplace) |
| 2026-03-18 | Gold (#E8A830) as primary accent | Signals value exchange in marketplace. No competitor uses gold. Differentiates from generic green/blue/purple AI tools. |
| 2026-03-18 | Space Grotesk for display | Geometric precision communicates infrastructure. Distinctive vs. competitors (none use it). Replaces overused Poppins. |
| 2026-03-18 | Dark mode default | Communicates privacy/security (core value prop). Industry convention for AI tools. |
| 2026-03-18 | Two-sided layout structure | Product is a marketplace, not a single-player tool. Layout must speak to both consumers and providers simultaneously. |
| 2026-03-18 | Provider/consumer visual distinction in network diagram | Gold border = provider, teal border = consumer. Connection lines show compute flow. Legend always visible. |
| 2026-03-18 | Provider privacy as key message | Providers also benefit from sovereign privacy — all task processing runs on their local device, never shipped to cloud. |
| 2026-03-18 | Same app, "Provide" button | Both consumers and providers download the same app. Provider mode is enabled via a "Provide" toggle in the app UI. Single Download CTA on landing page. |
| 2026-03-18 | Remove local/network toggle from hero | Page structure now handles dual storytelling. Hero shows unified network. Toggle was a crutch when hero was the only way to explain both sides. |
| 2026-03-18 | Hero copy: "AI, powered by people" | Sells the P2P network concept, not just local AI. "Uncensorable. Unstoppable." as closing punch. |
| 2026-03-18 | Provider benefits include unlimited usage | Providers get: earn rewards + sovereign privacy + choose models + unlimited usage. |
