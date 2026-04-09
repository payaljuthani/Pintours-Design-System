# PinTours Design System — Progress Log

Entries are appended chronologically. Never overwrite existing entries.

---

## Entry 1 · 2026-03-06 · 23:15 PST

### Project: PinTours Design System — Token Pipeline + Docs Site

---

### Phase 1 — Token Export from Figma ✅

**Goal:** Export all design tokens from the PinTours Figma file into a structured JSON file.

**Deliverable:** `tokens/tokens.json`

**What was done:**
- Connected to Figma file via plugin/API and exported 256 design tokens
- Tokens organised into the following top-level categories:
  - `color` — 5 palettes: Green, Teal, Red, Yellow, Grey (11–14 shades each)
  - `typography` — desktop headings (H1–H6), mobile headings (H1–H6), body (XS/SM/Default/LG), font family, font weights
  - `scale` — spacing scale with numeric steps (0–20) and named fractions (quat, half, 3quat, 1half)
  - `shadow` — single large shadow effect (`shadow-lg`)
  - `semantic` — 60 semantic tokens in light + dark variants across Typography, Icon, Surface, Border, and Shadow roles

**Status:** Complete. No known issues.

---

### Phase 2 — Style Dictionary Build Pipeline ✅

**Goal:** Transform `tokens/tokens.json` into platform-ready output files using Style Dictionary.

**Deliverables:**
- `build/web/variables.css` — CSS custom properties
- `build/ios/Tokens.swift` — Swift enums under `PT` namespace
- `build/android/tokens.xml` — Android XML resource file

**What was done:**
- Wrote `build.js` using Style Dictionary 3.x
- CSS output structure:
  - `:root {}` block — all primitive tokens + light-mode semantic tokens as default
  - `[data-theme="dark"] {}` block — dark-mode semantic overrides (activated by JS toggle)
  - `@media (prefers-color-scheme: dark)` fallback for system preference
- Shadow token rendered as full `box-shadow` shorthand: `--pt-shadow-lg`
- Semantic tokens follow naming convention: `--pt-semantic-{category}-{role}`
- Swift output: `PT.Color.Green.c500`, `PT.Semantic.Typography.headings`, etc.
- Android output: `@color/pt_color_green_500`, `@dimen/pt_scale_4`, etc.
- `npm run build` triggers validation → Style Dictionary transform → all 3 output files

**Status:** Complete. No known issues.

---

### Phase 3 — Enhanced Token Reference Docs Site 🔄 In Progress

**Goal:** Build a polished, interactive token reference page in pure HTML/JS/CSS served by Vite.

**Stack:** `docs/index.html` + `docs/main.js` + Vite dev server (`npm run docs:dev`)

**What was done:**

#### Structure & Design
- Redesigned header: "PinTours Design System — Token Reference" with text-only Dark / Light toggle
- Sticky top nav with 5 anchor links: Colors · Semantic · Typography · Spacing · Shadows
- Dark mode toggle sets `data-theme="dark"` on `<html>`, which activates the CSS override block
- All colours reference actual CSS custom properties via `var()` so the entire page re-themes live

#### Color Primitives Section
- Renders all 5 palettes with correct shade counts (Green/Teal/Red/Yellow: 11 shades; Grey: 14 shades)
- Hover tooltip on each swatch shows token name + resolved hex value (read lazily on `mouseenter`)
- `▸ {}` button on each swatch opens a floating snippet panel

#### Semantic Tokens Section
- 58 colour semantic tokens rendered in 4 category groups: Typography, Icon, Surface, Border
- Each tile: category badge, live colour swatch, token name, resolved hex value, `▸ {}` snippet toggle
- On dark mode toggle, all `.sem-value` hex labels refresh via `getComputedStyle`

#### Snippet Panels (all sections)
- Three-tab panel: Web (`var(--pt-...)`) / iOS (`PT.Namespace.token`) / Android (`@color/` or `@dimen/` or `@style/`)
- Copy button shows "Copied!" for 1.5 s then resets
- Only one panel open at a time (clicking a second closes the first)
- Snippet derivation is pure logic — no hardcoding:
  - `cssSnippet(cssVar)` → wraps in `var()`
  - `swiftSnippet(cssVar)` → parses CSS var name into PT enum path
  - `androidSnippet(cssVar)` → prefixes `@color/`, `@dimen/`, or `@style/` by token type

#### Typography Section
- Tabs: Desktop | Mobile (Body tab removed — body variants appear within both device tabs)
- Each tab shows H1–H6 headings followed by Body LG / Body / Body SM / Body XS
- Each row has a `▸ {}` snippet toggle; panel opens inline below the row (full width)
- Live font-size and line-height rendered via `var()` references

#### Spacing Section
- All 25 scale keys rendered with proportional green bars

#### Shadows Section
- Visual preview card with `box-shadow: var(--pt-shadow-lg)` applied
- Snippet panel for the shadow token
- Shadow colour token tiles (`--pt-semantic-shadow`, `--pt-semantic-shadow-normal`)

#### Bug Fixed During Phase 3
- **CSS not loading:** Vite with `root: 'docs'` maps URL `/build/...` to `docs/build/...` (doesn't exist).
  Fix: load CSS via `import '../build/web/variables.css'` inside `main.js` — Vite resolves JS imports
  relative to the source file on disk and rewrites to `/@fs/<absolute-path>`, bypassing the issue.

---

### Open Items / Decisions Needed

| # | Item | Status |
|---|------|--------|
| 1 | Display & Headline typography styles | ❌ Not in token set — not exported from Figma in Phase 1. Need to decide: re-export from Figma or add manually to `tokens/tokens.json` then re-run Phase 2 build. |
| 2 | Snippet panel clipping on small viewports | ⚠️ Floating panels on colour swatches use `position: absolute` — may clip near right edge on narrow screens. Low priority. |

---

## Entry 2 · 2026-03-09 · PST

### Work Completed Since Entry 1

---

### Typography Expansion ✅

**Added Display 1/2/3 tokens**
- Added `typography.desktop.display1/2/3` and `typography.mobile.display1/2/3` to `tokens/tokens.json` with `font_size`, `line_height`, and `paragraph_spacing` values for each
- Display tokens cover desktop sizes (120, 96, 76px) and mobile sizes (96, 76, 60px)
- Docs site updated: Display 1/2/3 rows now appear at the top of each device tab

**Expanded font weight scale**
- Replaced the previous 2-weight stub with a full 6-step scale in `typography.font_weight`:
  `extra_light: 300`, `light: 400`, `regular: 500`, `medium: 600`, `semibold: 700`, `bold: 800`
- Added weight sub-filter buttons to the docs Typography section: Regular (500) · Emphasis (700) · Light (300)
- Weight filter applies live to all type sample rows and all open snippet panels simultaneously

**Bug fix — `font_weight.light` misidentified as semantic theme variant**
- `build.js` predicates `isLight` / `isDark` / `isPrimitive` were matching on any token path containing the string `"light"`, incorrectly treating `typography.font_weight.light` as a light-mode semantic token
- Fix: scoped all three predicates to `semantic.*` tokens only (`const isSemantic = t => t.path[0] === 'semantic'`)
- Same fix applied to `stripMode()` — previously stripped the `light` path segment from all tokens; now only strips from semantic paths, preserving the correct CSS var name `--pt-typography-font_weight-light`

---

### Composite Text Style Tokens ✅

**Goal:** Bundle font-size + font-weight + line-height per platform into ready-to-use composite styles. Chose build-time composition (no new JSON tokens) to avoid token bloat.

**New build outputs added:**
- `build/web/text-styles.css` — CSS utility classes
- `build/ios/TextStyles.swift` — `PTTextStyle` struct + `PT.TextStyle` enums
- `build/android/values/text_appearances.xml` — `TextAppearance` XML styles

**Token count:** 66 composite styles (22 scale keys × 3 weight variants). Scale keys cover Display 1/2/3, H1–H6, and Body XS/SM/Default/LG for both device sizes. Body tokens are device-agnostic in `tokens.json` but are expanded into both `large-body-*` and `small-body-*` composite styles at build time.

**`PTTextStyle` struct (iOS):** bundles `font: UIFont`, `lineHeight: CGFloat`, `paragraphSpacing: CGFloat`, and an `.attributes()` method that returns a complete `NSAttributedString` attributes dictionary including `baselineOffset` correction for accurate line-height rendering.

**Android font setup checklist** embedded as XML comments in `text_appearances.xml`. iOS font setup checklist embedded in `TextStyles.swift` header comments. Both document the required Poppins font file embedding steps.

---

### Pipeline Rename — `desktop`/`mobile` → `large`/`small` ✅

**Rationale:** `desktop`/`mobile` are web-centric terms. `large`/`small` are platform-neutral and map directly to established conventions: `UIUserInterfaceSizeClass.regular/.compact` (iOS), `values-sw600dp/` (Android), CSS breakpoints (web).

**Files changed:**
- `tokens/tokens.json` — `typography.desktop` → `typography.large`, `typography.mobile` → `typography.small`
- `build.js` — updated `buildTextStyleGroups`, all `SECTIONS` arrays, Swift `deviceOrder` loop, and Android checklist comment
- `docs/index.html` — tab button labels and `data-group` attributes
- `docs/main.js` — `typeGroups` keys, `buildTypeGroup` active-state check

**Generated naming (post-rename):**
- CSS classes: `.pt-text-style-large-h1-regular`, `.pt-text-style-small-h1-regular`
- Swift: `PT.TextStyle.Large.h1Regular`, `PT.TextStyle.Small.h1Regular`
- Android: `PT.TextStyle.Large.H1.Regular`, `PT.TextStyle.Small.H1.Regular`

---

### Responsive Breakpoint Tokens + CSS ✅

**Context:** Figma variables showed `Device_size: Desktop = 1440, Mobile = 440`. These are design canvas/artboard sizes, not CSS breakpoints. The correct web breakpoint for switching typography is `768px` (de facto standard: Tailwind, Bootstrap, Material Design 3, Apple HIG all use this value as the compact→regular threshold).

**New tokens added to `tokens/tokens.json`:**
```
breakpoint.large        → 768   (actual CSS breakpoint — use in @media)
breakpoint.canvas_large → 1440  (Figma artboard reference only)
breakpoint.canvas_small → 440   (Figma artboard reference only)
```

**New CSS vars in `build/web/variables.css`:**
```css
--pt-breakpoint-large: 768px;
--pt-breakpoint-canvas_large: 1440px;
--pt-breakpoint-canvas_small: 440px;
```

**Responsive CSS utility classes in `build/web/text-styles.css`:**

Three tiers of classes are now generated:

| Class format | Use when |
|---|---|
| `pt-text-style-large-h1-regular` | Explicit desktop context |
| `pt-text-style-small-h1-regular` | Explicit mobile context |
| `pt-text-style-h1-regular` | Responsive — auto-switches at 768px |

The responsive tier is mobile-first: `small-*` values by default, `@media (min-width: 768px)` overrides with `large-*` values. The media query block only includes overrides for Display 1–3 and H1–H4 — H5, H6, and all Body tokens have identical values at both sizes and generate no override (no dead CSS).

The breakpoint value is read directly from the `breakpoint.large` token at build time, so changing the token automatically updates the media query.

---

### Platform Snippet Improvements ✅

All three platform snippet functions in `docs/main.js` were rewritten progressively for maximum "copy → paste → works" adoption.

**Web tab:**
- Was: bare attribute fragment `class="pt-text-style-large-h1-regular"`
- Now: complete HTML element with prereq comment
```html
<!-- Requires: text-styles.css -->
<p class="pt-text-style-large-h1-regular">Sample text</p>
```

**iOS tab:**
- Was: two-option snippet (font-only + attributedText)
- Interim: single `.attributes()` call with one resolved value in comment
- Final: **trait-adaptive pattern** — reads both Large and Small CSS vars at page-load time and emits the correct snippet based on whether the values actually differ:
  - When sizes differ (Display 1–3, H1–H4): shows `traitCollection.horizontalSizeClass == .regular` conditional with both token paths and both resolved sizes in the comment
  - When sizes are the same (H5, H6, Body): shows single-token form — no unnecessary conditional
```swift
// regular: 120pt · 500 · lh 136
// compact:  96pt · 500 · lh 108
let style: PTTextStyle = traitCollection.horizontalSizeClass == .regular
    ? PT.TextStyle.Large.display1Regular
    : PT.TextStyle.Small.display1Regular
label.attributedText = NSAttributedString(
    string: label.text ?? "",
    attributes: style.attributes()
)
```

**Android tab:**
- Was: bare style reference `@style/PT.TextStyle.Large.H1.Regular`
- Now: paste-ready XML element + Kotlin alternative + resolved values comment
```xml
<!-- 60sp · 500 · lh 72 -->
<TextView
    android:textAppearance="@style/PT.TextStyle.Large.H1.Regular" />

<!-- Kotlin -->
textView.setTextAppearance(R.style.PT_TextStyle_Large_H1_Regular)
```

**Architecture change enabling iOS adaptive snippets:**
- `buildTypeGroup` now reads CSS vars for both `large-*` and `small-*` variants for every token row (not just the current tab's values)
- All four values (`largeSize`, `largeLh`, `smallSize`, `smallLh`) are passed through `buildTypeStylePanel` to `typeStyleSwiftSnippet`
- Android snippet continues to use the current group's size (correct device context per tab)

---

### Token Count

| Version | Token count |
|---|---|
| Entry 1 (Phase 1 export) | 256 |
| After Display + font weight additions | 277 |
| After breakpoint tokens | 280 |

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Snippet panel clipping on small viewports | ⚠️ Low priority. Floating panels on colour swatches may clip near right edge on narrow screens. |
| 2 | `traitCollectionDidChange` guidance for iOS | ⚠️ The iOS snippet is correct for initial render. Docs/comments do not yet show how to re-apply styles on device rotation or iPad split-screen resize. |
| 3 | Android responsive guidance | ⚠️ Android snippet shows a single style name. No guidance yet on using `values-sw600dp/` configuration qualifiers to auto-switch between Large and Small styles. |

---

## Entry 3 · 2026-04-09 · PST

### Work Completed Since Entry 2

---

### Button Component — Interactive Playground ✅

**Goal:** Add a Button component page to the docs site with an interactive playground mirroring the Typography section pattern.

**What was done:**
- Added `<section id="components-button">` to `docs/index.html` with a `#btnPlayground` shell populated by JS
- Built `buildBtnPlayground()` in `docs/main.js`:
  - **Controls:** Size (Small / Default / Large), State (Default / Hover / Negative / Disabled / AI Default), Icon (None / Leading / Trailing)
  - **Three live preview rows:** Primary, Secondary, Tertiary — all update simultaneously on any control change
  - **Per-row snippet panel** (`▸ {}`) with Web / iOS / Android tabs using the updater registry pattern (`btnSnippetUpdaters[]`)
- Added full button CSS to `docs/index.html`:
  - Base `.pt-btn` styles; size variants `.pt-btn-sm/md/lg`
  - Type variants: Primary (filled action), Secondary (outlined), Tertiary (text-only)
  - State overrides: Hover, Negative (type-specific — Secondary gets red border+text, Tertiary gets red text only), Disabled, AI Default
  - **AI Default state:** `linear-gradient(to right, var(--pt-color-green-400), var(--pt-color-teal-500))` applied to all three button types via a single CSS rule
- Icon size scales with button size: 16px (sm) / 20px (md) / 24px (lg)

**Token snippet approach (developer-first):**
- Initial snippets output component class names — identified as unbuildable since those classes only exist in docs, not in any distributed stylesheet
- Rewrote all three snippet generators to output actual token usage:
  - **Web:** CSS property declarations with semantic tokens (`background`, `color`, `border`, `padding`, `font-size`, `border-radius`)
  - **iOS:** `UIButton` setup using `PT.Semantic.*` and `PT.Scale.*` tokens
  - **Android:** Jetpack Compose `Button()` with `MaterialTheme.ptColors` and `PTDimens`
- Every type × state × size × icon combination generates the correct token set

---

### Navigation — Sidebar Redesign ✅

**What was done:**
- Removed sticky top-nav, replaced with a fixed left sidebar (240px)
- Foundations section (expandable): Colors · Semantic · Typography · Spacing · Shadows · Icons
- Components section (expandable): Button
- IntersectionObserver tracks active section and highlights the corresponding sidebar link
- `scroll-padding-top` updated to 68px (header height only)

---

### Icon Tokens ✅

**Source:** Figma `Icons_Weights` variable collection

**Added to `tokens/tokens.json`:**

| Token group | Keys | Values |
|---|---|---|
| `icon.size` | 12, 16, 20, 24, 32 | 12–32px |
| `icon.stroke_weight` | 12, 16, 20, 24, 32 | 1, 1.5, 1.75, 2, 2.5 |

**CSS output (after `npm run build`):**
- `--pt-icon-size-{n}` and `--pt-icon-stroke_weight-{n}` in `build/web/variables.css`
- Equivalent tokens in Swift and Android outputs

**Token count:** 280 → 290

---

### Icons Page ✅

**Goal:** Full searchable icon gallery using Tabler Icons (MIT licensed, 5,039 outline icons).

**What was done:**
- Installed `@tabler/icons` npm package
- Imported `tabler-nodes-outline.json` (SVG path data) and `icons.json` (category metadata) — single JSON bundle, no per-file HTTP requests
- Built `buildIconGallery()` in `docs/main.js`:
  - **Search bar** — filters by icon name and tags in real time
  - **Size switcher** — 12 / 16 / 20 / **24** (default) / 32; icons re-render at correct size with stroke weight from tokens
  - **41 category chips** — pill buttons (All + 40 categories: Arrows, Brand, Communication, Map, etc.); category + search filters combine
  - **Icon count** label updates live
  - **Click to select** — snippet panel appears below grid with Web / iOS / Android tabs
- Snippet output references `--pt-icon-size-{n}` and `--pt-icon-stroke_weight-{n}` tokens; iOS and Android snippets document the asset import pattern (SVG → asset catalog / vector drawable)

**Button playground icon integration:**
- Removed hardcoded arrow SVG from button playground
- Button icons now rendered via `buildIconSvg('arrow-right', px)` — same function as the icon gallery
- `BTN_ICON_NAME = 'arrow-right'` is a single constant to change the default button icon

---

### Token Count

| Version | Token count |
|---|---|
| Entry 2 | 280 |
| After icon size + stroke tokens | 290 |

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Identified during Figma cross-check. Not yet resolved — user only approved fixing body.sm line-height. |
| 2 | iOS/Android icon delivery method | ⚠️ Not yet decided. Snippets document the pattern but the actual asset pipeline is TBD. |
| 3 | Button component stylesheet not distributed | ⚠️ Button CSS exists only in docs. No `build/web/components.css` or native component files yet. |
| 4 | Snippet panel clipping on small viewports | ⚠️ Low priority carry-over from Entry 2. |

---

## Entry 4 · 2026-04-09 · PST

### Work Completed Since Entry 3

---

### Button Component — Disabled State Fixes ✅

**Source:** Figma cross-check (nodes 699:1013, 699:1017)

**Secondary disabled** (was: filled grey like Primary)
- Background: `--pt-semantic-surface-page` (not disabled surface)
- Border: `--pt-semantic-border-disabled` (outline preserved)
- Text: `--pt-semantic-typography-body_caption` (#869a9f)

**Tertiary disabled** (was: invisible — no border, text too light)
- Background: transparent
- Border: transparent (no outline — matches Figma exactly)
- Text: `--pt-semantic-typography-body_caption` (#869a9f)

---

### Button Component — AI Default Scoped to Primary Only ✅

**Change:** AI Default gradient state removed from Secondary and Tertiary.

- CSS rule changed from `.pt-btn-ai, .pt-btn-secondary.pt-btn-ai, .pt-btn-tertiary.pt-btn-ai` → `.pt-btn-primary.pt-btn-ai`
- Secondary and Tertiary now fall back to their Default appearance when AI Default is selected
- All snippet token maps (Web CSS, Swift, Android Compose) updated to reflect default values for secondary/tertiary AI state

---
