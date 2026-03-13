# PinTours Design System — Project Plan & PRD

## Context

PinTours is an AI-powered local tours product serving travelers, with a public-facing website and native iOS/Android apps. The engineering and design team is scaling, and multiple engineers currently generate component code by feeding Figma screens into Claude Code — with no shared token vocabulary, resulting in hardcoded color and type values across codebases.

This design system exists to create a **single source of truth for design tokens** that is:
- Consumed by web (CSS), iOS (Swift), and Android (XML) without duplication
- Understood by Claude Code so AI-generated components use real token names instead of hardcoded values
- Visually browsable by designers and engineers via a hosted docs site
- Governable by a small team with a clear process for proposing and shipping token changes

The token pipeline (280 tokens, Style Dictionary build, dark mode, validation, docs site) is already built locally but **has not been deployed or used in production**. v0.1 ships what exists and makes it Claude-aware and accessible.

---

## Current State

| Layer | Status |
|---|---|
| `tokens/tokens.json` (280 tokens) | ✅ Complete |
| Style Dictionary build pipeline | ✅ Complete |
| Web CSS (`variables.css`, `text-styles.css`) | ✅ Built |
| iOS Swift (`Tokens.swift`, `TextStyles.swift`) | ✅ Built |
| Android XML (colors, dimens, text appearances) | ✅ Built |
| Dark mode (100% semantic coverage) | ✅ Complete |
| Validation + diff-check scripts | ✅ Complete |
| Docs site (Vite, token gallery) | ✅ Built locally |
| Git repository | ✅ Initialized (v0.1) |
| Hosted docs site | ❌ Not deployed |
| Claude-aware context file | ✅ Created (CLAUDE.md) |
| Contribution guide / governance | ❌ Not defined (v0.2) |
| Production usage in any codebase | ❌ Not yet |

---

## v1.0 Success Definition

> **Claude Code can generate a component from a Figma screen and automatically use PinTours tokens** (e.g. `--pt-semantic-surface-action` instead of `#5d9c4d`), and the docs site is live for visual reference by designers and engineers.

---

## Roadmap

### v0.1 — Foundation & Visibility *(complete)*

**Goal:** What exists is accessible, versioned, and Claude-aware.

1. ✅ **Initialize Git repository** and push to GitHub (private)
2. ✅ **Create `CLAUDE.md`** — Claude-aware context file with token names, usage rules, Figma mapping, and component guidelines
3. ✅ **Create `plan.md`** — this document, committed to the repo
4. ❌ **Deploy docs site** to a publicly accessible URL — pending (GitHub Pages, Vercel, or Netlify)
5. ✅ **Fix snippet panel clipping** on narrow viewports

**v0.1 Verification Checklist:**
- [x] Git repo initialized
- [x] `npm run build` passes with zero errors
- [x] `CLAUDE.md` exists with all four context sections
- [x] Snippet panel clipping bug fixed (panels stay within viewport on narrow screens)
- [x] `plan.md` committed to project root
- [ ] `npm run docs:build` produces `docs/dist/` with no errors
- [ ] Docs site accessible at deployed URL
- [ ] README.md updated with deployed docs URL

---

### v0.2 — Governance & Contribution Process *(after engineer input)*

**Goal:** Every team member knows how to propose, review, and ship a token change.

1. **`CONTRIBUTING.md`** — step-by-step guide:
   - How to add a token (edit `tokens.json` → `npm run build` → open PR)
   - How to update a token value vs. rename (rename = major, value change = patch)
   - How to re-export from Figma (manual process + checklist until automation exists)
   - PR checklist (build passes, diff-check passes, docs screenshot attached)

2. **Deprecation alias pattern** for breaking changes:
   - When a token is renamed, keep old name as alias for 1 release: `--pt-old-name: var(--pt-new-name)`
   - Document in CHANGELOG.md with targeted removal version

3. **`CHANGELOG.md`** — initialized at v0.1.0, semver from here

4. **Figma sync documentation** — until API automation is built, document the manual export checklist in CONTRIBUTING.md

**Open items to confirm with engineering team before finalizing v0.2:**

| # | Question | Options |
|---|---|---|
| 1 | **Distribution model** — how should tokens be consumed in platform repos? | (a) Copy files manually, (b) npm package `@pintours/tokens`, (c) git submodule, (d) CI auto-sync |
| 2 | **Breaking change strategy** — is the deprecation alias approach acceptable? | Current default: keep old name as `var(--new-name)` alias for 1 release |
| 3 | **Token governance** — who approves token PRs? | Suggest: designer proposes → DS owner (Payal) approves for now |
| 4 | **Figma sync automation** — is a Figma API script worth building? | Depends on how often tokens change post v1.0 |
| 5 | **Docs site hosting** — does it need auth or is it open to the team? | GitHub Pages (public) vs Vercel with password |

---

### v0.3 — React Component Library *(sequentially after v0.2)*

**Goal:** Shared React components for the web product that consume PinTours tokens.

- Monorepo structure: `@pintours/tokens` + `@pintours/ui` packages
- Storybook for component preview
- Components reference tokens via CSS variables, not hardcoded values
- `CLAUDE.md` updated with component usage patterns

---

### v0.4 — Icon System *(after v0.3)*
- Tokenized icon set with consistent sizing and color
- Icons use semantic color tokens, not primitives

### v0.5 — Motion & Animation Tokens *(after v0.4)*
- Duration, easing, and transition tokens
- Added to all three platform outputs

---

## Technical Architecture (Current)

```
tokens/tokens.json          ← single source of truth (edit here)
    ↓ npm run build
build/web/variables.css     ← import in any web project
build/web/text-styles.css   ← utility classes for typography
build/ios/Tokens.swift      ← PT namespace with dynamic colors
build/ios/TextStyles.swift  ← PTTextStyle structs
build/android/values/       ← XML resources (light + typography)
build/android/values-night/ ← XML resources (dark overrides)
    ↓ npm run docs:dev / docs:build
docs/                       ← token reference gallery (Vite)
```

**Key constraints:**
- Node ≥ 18 required
- `build/` is committed to git (deterministic, no build step needed to use tokens)
- `npm run validate` enforces naming, references, circular deps, and dark coverage before any build
- `npm run diff` guards against stale builds in CI
