# design-agent-setup

Drop a frontend design vocabulary skill into your coding agent — Cursor, Claude Code, or Windsurf.

```bash
npx design-agent-setup
```

Adds a skill file that teaches your AI coding agent how to write UI code that actually looks designed: spacing scales, typography hierarchy, motion rules, accessible interaction patterns, and stack-specific rules for Tailwind, Next.js, shadcn/ui, and Framer Motion.

---

## What it does

1. **Detects your agent** — looks for `.cursor/`, `CLAUDE.md`, `AGENTS.md`
2. **Detects your stack** — reads `package.json` for tailwindcss, next, shadcn-ui, framer-motion
3. **Asks where to write** — choose one agent, all detected, or standalone `.md`
4. **Writes to the right location:**
   - Cursor → `.cursor/rules/design-agent-frontend.mdc`
   - Claude Code → appended to `CLAUDE.md`
   - Codex → appended to `AGENTS.md`
   - Standalone → `design-agent-frontend.md` in the project root

Stack-specific rule blocks are automatically appended based on what's in your `package.json`.

---

## What's in the skill file

- Spacing & layout (8pt grid, gap over margin, section breathing room)
- Typography (hierarchy, line-height, letter-spacing, contrast)
- Color (tokens over raw hex, state communication)
- Component patterns (touch targets, focus styles, empty/loading/error states)
- Motion & animation (duration, easing, `prefers-reduced-motion`)
- Interaction design (button labels, destructive confirmation, form validation)
- Responsive design (mobile-first, real touch testing)
- A polish checklist to run before shipping

---

## Stack-specific rules

Detected automatically from `package.json`:

| Dep | Rules added |
|-----|-------------|
| `tailwindcss` | Utility-first patterns, class ordering, no `@apply` |
| `next` | App Router, Server Components, `next/image`, `next/font` |
| `shadcn-ui` | `cn()`, `cva()` variants, extending not forking |
| `framer-motion` | Variants, AnimatePresence, layout animation, reduced motion |

---

## No dependencies

Uses only Node built-ins. Node 18+ required.

---

## License

MIT — by [Evangeline Ng](https://github.com/evangelineng)
