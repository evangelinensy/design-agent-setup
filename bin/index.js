#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
};

function log(msg) { process.stdout.write(msg + '\n'); }
function bold(s) { return c.bold + s + c.reset; }
function dim(s) { return c.dim + s + c.reset; }
function green(s) { return c.green + s + c.reset; }
function cyan(s) { return c.cyan + s + c.reset; }
function yellow(s) { return c.yellow + s + c.reset; }
function gray(s) { return c.gray + s + c.reset; }

// ──────────────────────────────────────────────
// Detection helpers
// ──────────────────────────────────────────────

function detectAgents(cwd) {
  const detected = [];
  if (fs.existsSync(path.join(cwd, '.cursor'))) detected.push('cursor');
  if (fs.existsSync(path.join(cwd, 'CLAUDE.md'))) detected.push('claude');
  if (fs.existsSync(path.join(cwd, 'AGENTS.md'))) detected.push('codex');
  return detected;
}

function detectStack(cwd) {
  const detected = [];
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return detected;

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return detected;
  }

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (deps['tailwindcss']) detected.push('tailwind');
  if (deps['next']) detected.push('next');
  if (deps['shadcn-ui'] || deps['@shadcn/ui'] || deps['shadcn']) detected.push('shadcn');
  if (deps['framer-motion']) detected.push('framer-motion');

  return detected;
}

// ──────────────────────────────────────────────
// Stack-specific rule blocks
// ──────────────────────────────────────────────

const stackRules = {
  tailwind: `
## Tailwind CSS rules

- Use Tailwind utility classes directly in JSX — no custom CSS unless a utility genuinely can't express it.
- Extract repeated class groups into components or \`cn()\` helpers, not into @apply. Avoid @apply.
- Never use arbitrary values (\`w-[347px]\`) unless absolutely required. If you need it twice, it's a token.
- Use \`clsx\` or \`cn\` (from shadcn) for conditional class logic — never string concatenation.
- Responsive prefixes: \`sm:\`, \`md:\`, \`lg:\`, \`xl:\`. Mobile-first — unprefixed classes apply to all sizes.
- Dark mode: use \`dark:\` variant. Don't duplicate entire component trees for dark mode.
- Keep class order consistent: layout → sizing → spacing → typography → color → borders → effects → interactivity.
`,

  next: `
## Next.js rules

- Use the App Router (\`app/\` directory). Avoid Pages Router patterns in new code.
- Server Components by default. Add \`'use client'\` only when you need browser APIs, state, or event handlers.
- Images: always use \`next/image\`. Never raw \`<img>\` for content images. Set \`width\`, \`height\`, or \`fill\` + parent \`relative\`.
- Fonts: use \`next/font\` for zero-layout-shift font loading. Don't load fonts from \`<link>\` tags.
- Metadata: use the \`metadata\` export in \`layout.tsx\` or \`page.tsx\`, not \`<head>\` tags.
- Loading UI: colocate \`loading.tsx\` with \`page.tsx\` for Suspense-based loading states.
- Error boundaries: add \`error.tsx\` to any route that fetches data.
`,

  shadcn: `
## shadcn/ui rules

- Use shadcn components as the base layer. Don't rebuild what shadcn already provides (Dialog, Sheet, Toast, etc.).
- Extend shadcn components with className props — don't fork the component files unless you must.
- Use the \`cn()\` utility from \`@/lib/utils\` for all className merging.
- Variants: use the \`cva()\` pattern for component variants. Don't use conditional string concatenation for variants.
- Respect the design token structure shadcn sets up in \`globals.css\`. Map custom colors to CSS variables, not hardcoded values.
- Install new components with the CLI (\`npx shadcn@latest add <component>\`), don't copy-paste from docs.
`,

  'framer-motion': `
## Framer Motion rules

- Use \`motion.*\` components (motion.div, motion.button) instead of wrapping native elements.
- Define animation variants as constants outside the component to avoid re-renders.
- Use \`AnimatePresence\` for mount/unmount animations. Provide a \`key\` prop to the child.
- Page transitions: wrap route content in \`AnimatePresence\` at the layout level.
- Prefer \`layout\` prop for automatic layout animation over manually animating position.
- Always check \`useReducedMotion()\` and skip or simplify animations when it returns true.
- Keep spring configs consistent: \`{ type: 'spring', stiffness: 300, damping: 30 }\` is a safe default.
`,
};

// ──────────────────────────────────────────────
// Write helpers
// ──────────────────────────────────────────────

function buildContent(baseContent, stack) {
  let content = baseContent;
  for (const tech of stack) {
    if (stackRules[tech]) {
      content += stackRules[tech];
    }
  }
  return content;
}

function writeCursor(cwd, content) {
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  const dest = path.join(rulesDir, 'design-agent-frontend.mdc');
  const frontmatter = `---
description: Frontend design vocabulary and UI quality rules for this project
alwaysApply: true
---

`;
  fs.writeFileSync(dest, frontmatter + content, 'utf8');
  return dest;
}

function writeClaude(cwd, content) {
  const dest = path.join(cwd, 'CLAUDE.md');
  const block = `\n\n<!-- design-agent-frontend -->\n${content}\n<!-- /design-agent-frontend -->`;
  if (fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest, 'utf8');
    if (existing.includes('<!-- design-agent-frontend -->')) {
      log(yellow('  CLAUDE.md already contains design-agent-frontend rules — skipping.'));
      return dest;
    }
    fs.appendFileSync(dest, block, 'utf8');
  } else {
    fs.writeFileSync(dest, content, 'utf8');
  }
  return dest;
}

function writeCodex(cwd, content) {
  const dest = path.join(cwd, 'AGENTS.md');
  const block = `\n\n<!-- design-agent-frontend -->\n${content}\n<!-- /design-agent-frontend -->`;
  if (fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest, 'utf8');
    if (existing.includes('<!-- design-agent-frontend -->')) {
      log(yellow('  AGENTS.md already contains design-agent-frontend rules — skipping.'));
      return dest;
    }
    fs.appendFileSync(dest, block, 'utf8');
  } else {
    fs.writeFileSync(dest, content, 'utf8');
  }
  return dest;
}

function writeStandalone(cwd, content) {
  const dest = path.join(cwd, 'design-agent-frontend.md');
  fs.writeFileSync(dest, content, 'utf8');
  return dest;
}

// ──────────────────────────────────────────────
// Prompt helper
// ──────────────────────────────────────────────

function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const cwd = process.cwd();

  log('');
  log(bold('  design-agent-setup'));
  log(dim('  Drop a frontend design vocabulary skill into your coding agent'));
  log('');

  // Detect agents
  const agents = detectAgents(cwd);
  const stack = detectStack(cwd);

  // Report what we found
  if (agents.length > 0) {
    log(cyan('  Agents detected: ') + agents.join(', '));
  } else {
    log(gray('  No agents detected (no .cursor/, CLAUDE.md, or AGENTS.md found)'));
  }

  if (stack.length > 0) {
    log(cyan('  Stack detected:  ') + stack.join(', '));
    log(dim(`  Stack-specific rules will be appended for: ${stack.join(', ')}`));
  } else {
    log(gray('  No stack detected (no package.json or no recognised deps)'));
  }

  log('');

  // Read template
  const templatePath = path.join(__dirname, '..', 'templates', 'design-agent-frontend.md');
  let baseContent;
  try {
    baseContent = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    log(`  Error: could not read template at ${templatePath}`);
    log(`  ${err.message}`);
    process.exit(1);
  }

  const content = buildContent(baseContent, stack);

  // Build choices
  const choices = [];
  if (agents.includes('cursor')) choices.push({ label: 'Cursor  → .cursor/rules/design-agent-frontend.mdc', key: 'cursor' });
  if (agents.includes('claude')) choices.push({ label: 'Claude Code  → CLAUDE.md (append)', key: 'claude' });
  if (agents.includes('codex')) choices.push({ label: 'Codex  → AGENTS.md (append)', key: 'codex' });
  choices.push({ label: 'All detected agents', key: 'all' });
  choices.push({ label: 'Standalone .md in this directory', key: 'standalone' });

  log(bold('  Where should I write the skill file?'));
  log('');
  choices.forEach((c, i) => {
    log(`  ${bold(String(i + 1))}  ${c.label}`);
  });
  log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let answer;
  while (true) {
    answer = await prompt(rl, `  Enter number (1–${choices.length}): `);
    const n = parseInt(answer.trim(), 10);
    if (n >= 1 && n <= choices.length) {
      answer = choices[n - 1].key;
      break;
    }
    log(yellow(`  Please enter a number between 1 and ${choices.length}.`));
  }

  rl.close();
  log('');

  const written = [];

  if (answer === 'all') {
    if (agents.includes('cursor')) written.push(writeCursor(cwd, content));
    if (agents.includes('claude')) written.push(writeClaude(cwd, content));
    if (agents.includes('codex')) written.push(writeCodex(cwd, content));
    if (agents.length === 0) {
      log(yellow('  No agents detected — writing standalone .md instead.'));
      written.push(writeStandalone(cwd, content));
    }
  } else if (answer === 'cursor') {
    written.push(writeCursor(cwd, content));
  } else if (answer === 'claude') {
    written.push(writeClaude(cwd, content));
  } else if (answer === 'codex') {
    written.push(writeCodex(cwd, content));
  } else if (answer === 'standalone') {
    written.push(writeStandalone(cwd, content));
  }

  log('');
  for (const dest of written) {
    if (dest) log(green('  ✓ ') + bold(path.relative(cwd, dest)));
  }
  log('');
  log(dim('  Your coding agent now has frontend design vocabulary.'));
  log(dim('  It knows about spacing scales, typography, motion, and component polish.'));
  if (stack.length > 0) {
    log(dim(`  Stack-specific rules for ${stack.join(', ')} were included.`));
  }
  log('');
}

main().catch(err => {
  process.stderr.write(`\nError: ${err.message}\n`);
  process.exit(1);
});
