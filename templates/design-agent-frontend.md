# design-agent-frontend

A skill file for AI coding agents. Drop this into your project so your agent understands frontend vocabulary, layer diagnosis, and design-to-code translation without you having to re-explain every session.

**Compatible with:** Cursor, Claude Code, Windsurf, Cline, or any agent that reads project rules / system context.

---

## How to use this file

**Cursor:** Add to `.cursor/rules/design-agent-frontend.mdc`
**Claude Code:** Add to `CLAUDE.md` in your project root
**Windsurf:** Add to `.windsurfproject` rules section
**Any agent:** Paste at the top of your system prompt or context window

---

## Agent Instructions

You are working with a designer who understands frontend vocabulary and expects you to work at the same level. Follow these rules in every response.

### Core principle

When something looks wrong, diagnose the layer before fixing it. Do not add overrides, do not increase specificity blindly, do not add `!important`. Name the layer, name the cause, fix the source.

---

## Layer Diagnostic Model

When the designer says something feels off, identify which layer the problem lives in before touching code.

| Layer | Problems it covers | What to check |
|---|---|---|
| **Visual** | Hierarchy, contrast, spacing, density, rhythm | Does it look wrong, or does it behave wrong? |
| **CSS** | Box model, flex, grid, overflow, z-index, specificity, cascade | Which CSS rule is winning? Is this a layout or a paint issue? |
| **HTML** | Semantic structure, heading order, source order, labels | Is the element correct, or just styled to look correct? |
| **Component** | Props, state, variants, slots, re-renders | Is this a one-off or a reusable component problem? |
| **Accessibility** | Focus, keyboard nav, ARIA, contrast, target size | Does it work without a mouse? Does it work with a screen reader? |
| **Performance** | Layout shift, reflow, repaint, image sizing, hydration | Does it feel slow, janky, or does it shift on load? |
| **System** | Tokens, theme, component map, hardcoded values | Is this using the design system or bypassing it? |

Always name the layer in your diagnosis before writing any fix.

---

## CSS Rules

### Box model
- Every element is content + padding + border + margin
- When spacing looks wrong, check which part of the box is causing it before adjusting
- Prefer `padding` for internal space, `margin` for external space, `gap` for spacing between children in flex/grid
- Never use one-off margins between siblings — use `gap` on the parent

### Layout
- Use `flexbox` for one-dimensional layout (row OR column)
- Use `grid` for two-dimensional layout (rows AND columns)
- Prefer `gap` over individual margins for child spacing
- Set `max-width` on text containers — paragraphs should not stretch to full viewport width
- Use `min-width: 0` on flex children that contain text that should truncate

### Overflow and sizing
- When content escapes its container, check `overflow`, `min-width`, and `flex-shrink` before adding `width: 100%`
- Use `aspect-ratio` to reserve space for images and media before they load — prevents layout shift
- Use `object-fit: cover` for images that fill a fixed frame
- Use `min-width` / `max-width` to constrain, not hardcoded pixel widths

### Stacking and z-index
- Before increasing `z-index`, check whether a stacking context exists on a parent
- `z-index` only works within the same stacking context
- Do not solve stacking problems by adding higher z-index values — diagnose the stacking context first

### Cascade and specificity
- When a style change has no visible effect, check which rule is winning in the cascade
- Fix the source rule — do not add overrides or `!important`
- Check: component variant, utility class order, dark mode token, disabled state, parent theme

### Responsive
- Use `container queries` when a component appears in multiple layout contexts
- Use `clamp()` for fluid typography and spacing
- Define breakpoints in one place — do not scatter magic numbers
- Mobile-first: write base styles for mobile, layer up with `min-width` media queries

### Tokens
- Always use design tokens — never hardcode hex values, spacing numbers, or radius values
- Semantic tokens (`--color-foreground`, `--spacing-4`) are preferable to primitive tokens (`--gray-900`)
- If a token doesn't exist for something, flag it — do not invent an inline value

---

## HTML Rules

### Semantic elements
- Use the correct element for the job — not just something that looks right
- `<button>` for actions, `<a>` for navigation — never swap these
- Use landmark elements: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Use proper heading hierarchy: one `<h1>`, then `<h2>`, then `<h3>` — never skip levels

### Forms
- Every `<input>` must have a `<label>` — placeholder text is not a label
- Error messages must be associated with their input via `aria-describedby`
- Required fields must be marked both visually and with `required` attribute
- Helper text goes below the field, error text replaces or appears below helper text

### Source order
- Source order matters for keyboard and screen reader users
- Visual reordering with CSS (`order`, `flex-direction: row-reverse`) is fine, but source order must make sense sequentially

---

## Component Rules

### Props
- Before creating a new component, check if an existing one can accept a prop for the variation needed
- Expose only the props the designer needs: `variant`, `size`, `disabled`, `loading`, `icon`, `children`
- Do not create one-off components for one-off styles — extend existing components via props

### State — always build all states
When building any interactive component, always include:
- Default
- Hover
- Focus (visible, keyboard accessible)
- Active / pressed
- Disabled
- Loading (if async)
- Empty (if data-driven)
- Error (if can fail)
- Success (if has completion)

Never ship only the default state.

### Controlled vs uncontrolled
- If the designer needs to control the value externally, use a controlled component
- If the designer needs self-contained behaviour, use uncontrolled with a sensible default

---

## Accessibility Rules

- Visible focus states are required — never `outline: none` without a replacement
- Keyboard navigation must work in logical tab order
- Color alone must never be the only way information is communicated
- Contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Interactive target size: minimum 44×44px
- Modals and dialogs must trap focus when open, restore focus when closed
- Respect `prefers-reduced-motion` — wrap animations in a media query

---

## Motion Rules

- Animate `opacity` and `transform` — not `width`, `height`, `top`, `left`
- `ease-out` for elements entering, `ease-in` for elements leaving
- Keep durations under 300ms for micro-interactions, 500ms for transitions
- Stagger child animations when revealing lists or groups
- Always wrap animations in `@media (prefers-reduced-motion: reduce)` with a fallback

---

## Performance Rules

- Reserve image space with `aspect-ratio` before images load
- Use `width` and `height` attributes on `<img>` elements
- Do not render client-only values (window size, localStorage, dates) during server render — guard with `useEffect` or client component boundaries
- Hydration mismatches: check for server/client differences in dates, IDs, theme, window APIs
- Lazy-load content below the fold
- Animate on the compositor layer — use `will-change: transform` sparingly and only when needed

---

## Instruction Patterns

These are the instruction patterns the designer will use. Recognize them and respond precisely.

### CSS layer diagnosis
> "Inspect the cascade for this element. Identify which rule is winning."
→ Trace specificity chain. Report what's winning and why. Fix the source.

> "Check for horizontal overflow at mobile widths."
→ Look for elements wider than viewport. Check `min-width`, flex children without `min-width: 0`, images without `max-width: 100%`.

> "Do not increase z-index. Inspect the stacking context."
→ Find what creates the stacking context. Fix positioning or isolation, not the z-index value.

> "Use min-width: 0 so long text can truncate inside a flex row."
→ Add `min-width: 0` to the flex child containing the text. Add `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` to the text element.

> "Reserve image space with aspect-ratio to prevent layout shift."
→ Add `aspect-ratio` to the image container. Match the intrinsic ratio of the image.

> "Use container queries because this component appears in different layout contexts."
→ Replace viewport-based media queries with `@container` queries. Define a containment context on the parent.

### Component layer
> "Use the existing [Component]. Do not create a one-off."
→ Import and use the existing component. Pass props for the variation needed. Do not duplicate styles inline.

> "Match the Figma instance. Use existing tokens."
→ Map Figma component properties to code props. Map Figma styles to existing design tokens. Flag anything that doesn't have a token.

### State layer
> "Build all states, not just default."
→ Implement: default, hover, focus, active, disabled, loading, empty, error, success.

### Performance layer
> "Check for hydration mismatch."
→ Look for `window`, `localStorage`, `Date.now()`, `Math.random()` used during server render. Move to `useEffect` or client component boundary.

---

## What to never do

- Never add `!important` without diagnosing why the cascade is being lost
- Never create a new component when a prop on an existing component will do
- Never use placeholder text as a substitute for a label
- Never style a `<div>` to look like a button — use `<button>`
- Never access `window` or `document` during server render
- Never hardcode hex values, px spacing, or radius values — use tokens
- Never ship only the default state of an interactive component
- Never increase z-index without diagnosing the stacking context
- Never use one-off margins between siblings — use `gap` on the parent
- Never animate `width`, `height`, `top`, or `left` — animate `transform` and `opacity`

---

## Quick reference: vocabulary → layer

| You say | Layer | Agent should check |
|---|---|---|
| "Layout feels off" | CSS | flex alignment, grid collapse, breakpoint, max-width |
| "Text is getting squeezed" | CSS | flex-shrink, min-width: 0, overflow |
| "Images jump on load" | Performance | aspect-ratio, width/height attrs, skeleton state |
| "Button isn't keyboard accessible" | Accessibility | Is it a `<button>`? Does it have focus state? |
| "Dark mode flashes wrong color" | Performance | Hydration mismatch, localStorage read on server |
| "z-index isn't working" | CSS | Stacking context on parent |
| "Style change has no effect" | CSS | Cascade, specificity, which rule is winning |
| "Component renders differently each load" | Performance | Client-only value in server render |
| "Form input has no label" | HTML + A11y | Add `<label>`, associate with `for`/`id` |
| "Animation feels janky" | Performance | Animating layout properties instead of transform/opacity |
