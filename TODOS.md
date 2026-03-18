# TODOS

## Design System (Priority 1 — Foundation)

- [ ] **Run /design-consultation** to create DESIGN.md with typography, color tokens, spacing scale, elevation, border radius, component patterns, and accessibility specs (ARIA patterns, keyboard nav, contrast, focus indicators, touch targets). This is the foundation for all other improvements. Without it, every change adds more inconsistency. Currently: 5 different border radii, inconsistent spacing, AI-generic aesthetic. **Depends on:** Nothing — step 1.

## High Priority (Can ship independently)

- [ ] **Fix Download CTA** — either link to actual download or reframe as "Join Waitlist" / "Get Early Access" with email capture. Currently scrolls to network diagram, which is misleading and erodes trust on first interaction. **Depends on:** Business decision on whether download is available.

- [ ] **Replace suggestive prompt captions** on image generation/editing video cards with impressive but appropriate creative prompts. Video content stays as-is. Current prompts alienate professional audience. **Depends on:** Nothing.

- [ ] **Add video modal loading spinner** — show a subtle spinner/skeleton while videos buffer from Cloudinary. Currently shows black rectangle with no feedback on slow connections. **Depends on:** Nothing.

## Design Implementation (Depends on DESIGN.md)

- [ ] **Group video cards by category** — add section labels (Analysis, Create, Automate) above grouped cards in the Use Cases section. Currently 8 identical cards in a flat grid with no visual hierarchy. **Depends on:** DESIGN.md.

- [ ] **Add network diagram legend + labels** — make the hero diagram self-explanatory without hover interaction. Add caption, legend for lock icon, center label. **Depends on:** DESIGN.md.

- [ ] **Reframe section 3 as "How It Works"** — redesign from repeated component cards to a sequential flow (You ask → Agents execute → Models run locally). Current section repeats info from diagram hover states. **Depends on:** DESIGN.md + new copy.

- [ ] **Add footer** with final CTA (Download/Waitlist), community links (GitHub, Discord), and copyright. Page currently just ends. **Depends on:** DESIGN.md + Download CTA decision.

- [ ] **Design intentional mobile layouts** — horizontal scrolling carousel for video cards, simplified network diagram, proper mobile navigation. Currently everything just stacks vertically (8 full-width cards = enormous scroll). **Depends on:** DESIGN.md.
