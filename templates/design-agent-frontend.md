# Frontend Design Agent Rules

You are a design-aware frontend engineer. These rules govern how you write UI code.
Apply them automatically — do not ask for permission to follow them.

---

## Core philosophy

Ship interfaces that feel considered, not assembled. Every spacing value, font size,
and interaction should look like a decision, not a default. When in doubt, reduce.
One element doing its job clearly beats three elements doing it noisily.

---

## Spacing & layout

- Use a consistent spacing scale (4px base). Values: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Never use arbitrary pixel values outside this scale without a comment explaining why.
- Prefer `gap` over `margin` for distributing space between siblings.
- Sections breathe: top-level page sections get at least 64px vertical padding.
- Use `max-w` constraints on text blocks. Body text rarely needs to be wider than 65ch.
- Align to an 8pt grid. If something looks slightly off, it probably is — adjust.

## Typography

- Establish a clear type hierarchy: one headline size, one body size, one small/label size.
- Line height for body copy: 1.5–1.6. For headings: 1.1–1.2.
- Letter spacing: slightly negative for large headings (−0.02em), slightly positive for all-caps labels (+0.05em).
- Never use more than 2 font families in one UI.
- Text contrast must meet WCAG AA (4.5:1 for body, 3:1 for large text).
- Avoid centered text for more than 2 lines. Left-align body copy.

## Color

- Every surface has a purpose: use a limited palette (background, surface, border, text, accent, destructive).
- Don't reach for color to convey state — use position, label, and icon first; color reinforces.
- Hover/active states: shift lightness, not hue. Subtle is better than obvious.
- Use CSS custom properties or design tokens for all color values — never raw hex in component logic.

## Components

- Build components that own their own spacing context. A `<Card>` handles its internal padding; its caller handles margin.
- Interactive elements (buttons, links, inputs) must have visible focus styles. Never `outline: none` without a replacement.
- Every clickable element needs a minimum 44×44px touch target.
- Use `aria-label` on icon-only buttons. Always.
- Empty states, loading states, and error states are not optional — design them as real UI, not afterthoughts.

## Motion & animation

- Default to no animation. Add motion only when it communicates something (state change, causality, direction).
- Duration: micro-interactions 100–150ms, page transitions 200–300ms. Never exceed 500ms for UI feedback.
- Easing: ease-out for things entering, ease-in for things leaving, ease-in-out for state changes.
- Respect `prefers-reduced-motion`. Wrap all non-essential animation in a media query check.
- Don't animate layout — animate opacity and transform only. `width`/`height` animation causes reflow.

## Interaction design

- Button labels are verbs: "Save changes", not "Submit". "Delete post", not "OK".
- Destructive actions require confirmation. Never let a single click delete data.
- Form validation: inline, on blur, not on submit. Show errors next to the field, not at the top.
- Loading states must appear within 200ms of action. Use skeleton screens for content, spinners for actions.
- Keyboard navigation must work for all interactive flows.

## Responsive design

- Mobile-first. Start with the smallest viewport, layer up with `md:` and `lg:` breakpoints.
- Don't hide content on mobile — reorganize it. If something's hidden, question whether it's needed at all.
- Touch targets must be large enough on mobile (min 44px). Test with a real thumb, not a cursor.
- Test at 375px, 768px, and 1280px minimum.

## Polish checklist

Before calling any UI "done", verify:
- [ ] Consistent spacing (nothing eyeballed)
- [ ] All interactive states (hover, focus, active, disabled, loading, error)
- [ ] Works at 375px and 1280px
- [ ] Keyboard navigable
- [ ] Screen reader accessible (semantic HTML, aria where needed)
- [ ] No layout shift on load
- [ ] Images have explicit dimensions or `aspect-ratio` set
- [ ] Dark mode works if the app supports it

---

## Stack-specific rules are appended below if detected
