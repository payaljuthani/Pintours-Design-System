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

## Entry 6 · 2026-04-14 · PST

### Work Completed Since Entry 5

---

### Super Icon Component — Interactive Playground ✅

**Source:** Figma node 707:1883

**What was done:**
- Added `<section id="components-super-icon">` to `docs/index.html` with `#superIconPlayground` shell populated by JS
- Added "Super Icon" nav link to sidebar under Components
- Built `buildSuperIconPlayground()` in `docs/main.js`:
  - **Size control:** 12 / 16 / 20 / 24 / 32px — updates all rows simultaneously
  - **Icon picker:** Always-visible searchable grid (120 icons on load, filters to full set on search). Current icon name shown in header. Click any tile to swap — preview and all snippets update live
  - **Five preview rows:** Default / Square Fill / Circle Fill / Selected Square / Selected Circle — all update on size or icon change
  - **Per-row snippet panel** (`▸ {}`) with Web / iOS / Android tabs using the same updater registry pattern as Button

**Token decisions from Figma:**
- Container is always larger than icon: 12→20px, 16→24px, 20→32px, 24→40px, 32→56px (mapped to `--pt-scale-5/6/8/10/14`)
- Square corner radius per size: 2/3/4/6/8px (`scale-half/3quat/1/1half/2`)
- Circle variant uses 999px pill (64px in Figma, CSS equivalent is 999px)
- Background opacity: Default=0 (transparent), Fill variants=0.85, Selected=1.0
- Icon color: headings token for Default/Fill, `on_action` (white) for Selected
- Background: `card_primary` for fill variants, `action` for selected variants

**Platform snippets:**
- **Web:** Container size via `--pt-scale-N`, background via semantic token with opacity note, icon color via semantic icon token
- **iOS:** `UIView` container with `PT.Scale` tokens, `UIImageView` with template rendering mode, `PT.Semantic.Icon.*` tint
- **Android:** Compose `Box` with `PTDimens` size, `Modifier.background()` with `RoundedCornerShape` or `CircleShape`, `Icon` composable with `ptColors.*` tint

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Same as button — CSS/UIKit/Compose implementations exist only in docs |

---

## Entry 8 · 2026-04-27 · PST

### Work Completed Since Entry 7

---

### Gradients — Page Wash Pattern Added to Docs ✅

**Source:** Figma design screenshot showing an angular/conic gradient with 120px blur used as a page background.

**What was done:**
- Added a Gradients section to the sidebar nav under Foundations
- Added `<section id="gradients">` to `docs/index.html`
- Built the section in `docs/main.js` with:
  - Live CSS preview of the Page Wash gradient (conic-gradient + `filter: blur(120px)` via `::before` pseudo-element)
  - Token chips showing the four primitives used
  - Snippet panel (Web / iOS / Android tabs) with paste-ready implementation code
- Added gradient-specific CSS styles to `docs/index.html`

**Tokens used:**

| Color | Token | Value |
|---|---|---|
| Teal | `--pt-color-teal-100` | `#ccebf4` |
| Yellow | `--pt-color-yellow-100` | `#fdf1d9` |
| Green | `--pt-color-green-100` | `#dfebdb` |
| Fade to | `--pt-semantic-surface-card_primary` | `#ffffff` |

**Decision — no gradient token added:** The conic + blur technique is not representable as a Style Dictionary token value (no native gradient type, blur is a CSS filter not a color). Documented as a named pattern instead.

**Bug fixed — Netlify build failure:**
- Variable names `webSnippet`, `iosSnippet`, `androidSnippet` collided with an existing top-level function `androidSnippet()` (line 72)
- Renamed all three to `pageWashWebSnippet`, `pageWashIosSnippet`, `pageWashAndroidSnippet`
- Build confirmed passing locally (`npm run docs:build`) before push

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |

---

## Entry 7 · 2026-04-27 · PST

### Work Completed Since Entry 6

---

### Status Surface Tokens — Shade Update (50 → 100, Light Mode) ✅

**Source:** Updated Figma color variables (Success/100, Warning/100, Error/100, Information/100)

**Change:** The four status surface semantic tokens were updated in light mode to use the `/100` primitive shade instead of `/50`. Dark mode was already correctly referencing `/800` and was not changed.

| Token | Before | After |
|---|---|---|
| `semantic.surface.light.success` | `{color.green.50}` → `#eff5ed` | `{color.green.100}` → `#dfebdb` |
| `semantic.surface.light.warning` | `{color.yellow.50}` → `#fef8ec` | `{color.yellow.100}` → `#fdf1d9` |
| `semantic.surface.light.error` | `{color.red.50}` → `#fbecec` | `{color.red.100}` → `#f7dada` |
| `semantic.surface.light.information` | `{color.teal.50}` → `#e5f5f9` | `{color.teal.100}` → `#ccebf4` |

**Files changed:** `tokens/tokens.json`, all platform build outputs (`build/web/variables.css`, `build/ios/Tokens.swift`, `build/android/values/colors.xml`, `build/android/compose/PTTheme.kt`), docs site.

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |

---

## Entry 5 · 2026-04-09 · PST

### Work Completed Since Entry 4

---

### Semantic Colour Token Cross-Check — Figma vs tokens.json ✅

Compared all semantic colour categories against Figma variable screenshots.

**Fixes applied:**

| Token | Was | Now |
|---|---|---|
| `surface.page` light | `grey.50` (#f6f9f9) | `grey.75` (#f2f6f7) |
| `surface.page_90` light | `rgba(246,249,249,0.9)` | `rgba(242,246,247,0.9)` |
| `surface.card_deep` | Missing | Added: light=`grey.200`, dark=`grey.700` |
| `shadow.light` light | `grey.200` (#dce6e9) | `grey.300` (#cbd9dd) |
| `shadow.normal` light | `grey.400` (#b9cdd2) | `grey.500` (#a8c0c7) |

**Everything else matched:** Typography, Icon, Border, all dark-mode surface values.

---

### Open Issue — Success Palette ⚠️

**Finding:** Action green and Success green are intentionally different colours in PinTours — they serve different functions (action buttons vs success states on filter chips and other components).

**Current state:** All `success` roles in tokens.json (`typography.success`, `icon.success`, `surface.success`, `border.success`) incorrectly reference `color.green.*` (the Primary/action palette).

**Next step:** Add a separate `color.success` primitive palette to `tokens/tokens.json` and update all `success` semantic token references. Figma Success palette hex values needed to do this — to be pulled in next session.

---

### Netlify Deployment ✅

- Site connected to `github.com/payaljuthani/Pintours-Design-System`
- Build command: `npm run docs:build`, publish directory: `docs/dist`
- Auto-deploys on every push to `main`

---

## Entry 9 · 2026-05-02 · PST

### Work Completed Since Entry 8

---

### Map Pin Component — Interactive Playground ✅

**Source:** Figma node 743:843 (`PinTours-Design-System` → Map Pin component)

**What was done:**
- Added Map Pin playground to the docs site with a number picker (increment / decrement / free-type), live preview of all three states, and per-state snippet panels (Web / iOS / Android)
- Playground built via `buildMapPinPlayground()` in `docs/main.js`

---

### Map Pin — Figma Alignment Fixes ✅

Several rounds of corrections were made to align the component with the Figma design.

#### Round 1 — Icon library switch (reverted)
- Initial attempt replaced the custom SVG with the Tabler `map-pin` stroke icon via `buildIconSvg('map-pin', 36)`
- **Problem:** Tabler icons are stroke/outline; the Figma design uses bold filled shapes. The visual difference was unacceptable.
- **Reverted** in the same session.

#### Round 2 — Filled SVG restored with correct geometry ✅

**Root causes identified from Figma cross-check:**

| Issue | Detail |
|---|---|
| Stroke vs fill | Tabler icon is outline; Figma uses a solid filled teardrop body |
| Selected state colors inverted | Body was teal, ring was dark — Figma shows the opposite |
| Inner circle too small | Previous `r=9`; Figma measures `r≈10` (default/visited), `r≈11` (selected) |
| Number not centred | Circle `cy` was 14px; corrected to 16px; number insets updated to `top: 6px; bottom: 10px` |

**Fixes applied:**
- Restored custom filled SVG: `<path class="pin-body">` teardrop + `<circle class="pin-ring">`
- Updated SVG path to `M18 3A13 13 0 0 0 5 16Q5 24 18 33Q31 24 31 16A13 13 0 0 0 18 3Z` (circle head at cy=16)
- Ring radii: `r=10` (Default/Visited), `r=11` (Selected), `cy=16` for all states
- Selected body: `--pt-semantic-typography-headings` (#222628) — was incorrectly `information_core` (teal)
- Selected ring: SVG `linearGradient` (`#pt-mp-sel-ring`) — was incorrectly `rgba(0,0,0,0.12)`
- Shared gradient defs SVG injected once by `buildMapPinPlayground()` before any pin elements are rendered

#### Round 3 — Token corrections per Figma palette ✅

| Pin | Property | Before | After |
|---|---|---|---|
| Default | Ring fill | `surface/page` | `surface/success` (#dfebdb) |
| Selected | Ring fill | — | `Gradient/Default` (unchanged) |
| Visited | Ring fill | `surface/page` | `surface/success` (#dfebdb) |
| Visited | Body fill | `border/divider` (#a8c0c7) | `icon/body_secondary` (#869a9f) |

#### Round 4 — Gradient corrected to Gradient/Default spec ✅

- **Before:** Two teal tones (`#5ad4e4` → `#009bc8`), diagonal direction (top-right to bottom-left)
- **After:** `linear-gradient(to right, var(--pt-color-green-400), var(--pt-color-teal-500))` — `#7db071` → `#009bc8`, left to right
- SVG `linearGradient` updated: `x1="0" y1="0" x2="1" y2="0"` to match CSS `to right`
- iOS snippet updated to use `PT.Color.Green.c400` and `PT.Color.Teal.c500` in `CAGradientLayer`
- Android snippet updated to use `Brush.horizontalGradient` with `PTColors.colorGreen400` and `PTColors.colorTeal500`

#### Bug fix — invalid CSS comment inside property value ✅

- `PIN_RING_CSS.selected` previously embedded a CSS comment inside the value string: `url(#pt-mp-sel-ring) /* … */`
- This produced invalid CSS in the generated snippet: `.pin-ring { fill: url(#pt-mp-sel-ring) /* … */; }`
- Fix: removed comment from the value; emitted as a standalone `/* Inner ring — Gradient/Default: … */` comment line above the rule in the snippet output

---

### Commits This Session

| Hash | Description |
|---|---|
| `854281c` | fix: replace custom map pin SVG with tabler map-pin icon (subsequently corrected) |
| `f7c14f5` | fix: restore filled map pin — correct shape, colours and ring gradient |
| `7fba302` | fix: update map pin ring and visited body token assignments |
| `3aba81f` | fix: correct selected ring gradient to green-400 → teal-500 (left to right) |

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |
| 5 | Map Pin component stylesheet not distributed | ⚠️ Map Pin CSS/UIKit/Compose implementations exist only in docs |

---

## Entry 10 · 2026-05-03 · PST

### Work Completed Since Entry 9

---

### Shadow Component — Token Pipeline + Docs Preview ✅

**Source:** Figma node 707:3485 (`PinTours-Design-System` → Shadow section)

**Token pipeline:**
- Replaced the single legacy `shadow.lg` token in `tokens/tokens.json` with a full 3-group × 5-size structure (15 tokens total)
- Groups: `gradient` (soft blurred elevation), `solid` (crisp bottom-edge depth), `bottom_sheet` (upward shadow)
- Sizes: `xs`, `sm`, `md`, `lg`, `xl`
- Token type: DTCG `boxShadow` — array of shadow layers, each with `color`, `offsetX`, `offsetY`, `blur`, `spread`
- Bottom-sheet negative offsetY values hardcoded as string literals (`"-2"`, `"-3"`, etc.) — DTCG refs cannot be negative
- Ran `npm run build` → 15 new CSS custom properties generated in `build/web/variables.css`:
  - Pattern: `--pt-shadow-{group}-{size}`
  - Example: `--pt-shadow-solid-xs: 0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd`
- `CLAUDE.md` shadow token table updated to reflect new 15-token structure and Figma mapping

**Docs site — Shadow section:**
- Shadow section repositioned: HTML section order corrected to match nav (after Icons, before Button)
- Shadow color semantic tokens (`--pt-semantic-shadow`, `--pt-semantic-shadow-normal`) moved out of the Shadow section and into the Semantic Tokens section as a "Shadow" group — consistent with Typography / Icon / Surface / Border groups
- Shadow preview: 3 groups, 5 cards each — white box on page-colour background demonstrating each effect
- Token name removed from cards; size label (XS–XL) and snippet button only
- **Code snippets:** Each card shows a full-width shared panel below the grid (not inside the narrow card). Panel contains:
  - Web: `.element { box-shadow: var(--pt-shadow-...); /* resolves to: ... */ }`
  - iOS: `view.layer.shadowColor/shadowOffset/shadowOpacity/shadowRadius` with parsed values
  - Android: `Modifier.shadow(elevation = N.dp)` with token reference
- Active state UX: clicking `▸ {}` flips arrow to `▾`, turns button green (`--pt-semantic-border-action`), opens shared panel; clicking again closes it
- `cssSnippet()` updated to return `box-shadow: var(...)` for `--pt-shadow-*` vars
- `swiftSnippet()` shadow match fixed to camelCase the key (`gradientXs` not `gradient-xs`)

**Nav:**
- Visual divider (`1px`, `--pt-semantic-border-divider`) added between Foundations and Components nav groups

---

### Button Component — Hover States + Shadows ✅

**New hover states built:**

| State | Class | Behaviour |
|---|---|---|
| `Default__Gradient_Hover` | `.pt-btn-primary.pt-btn-ai.pt-btn-is-hover` | Darker gradient (`green-500` → `teal-600`), gradient border via `padding-box / border-box` background-clip |
| `Negative_hover` | `.pt-btn-negative.pt-btn-is-hover` | `surface-negative_hover` fill, `border-negative_hover` stroke |

**Shadow tokens applied to hover states:**
- `shadow/solid/xs` → small (`.pt-btn-sm`) hover buttons, all types except tertiary
- `shadow/solid/sm` → default (`.pt-btn-md`) and large (`.pt-btn-lg`) hover buttons, all types except tertiary
- Shadows apply **only** on hover states (`hover`, `ai_hover`, `negative_hover`) — not on default, negative, ai, or disabled states

**Border fixes — all hover states:**
- Removed `border-bottom-width: 4px` from all hover state CSS rules (primary, negative, ai, gradient)
- All hover states now use consistent 1px border all around

**Cascade bug fixes:**
- Secondary `Negative_hover`: `.pt-btn-secondary.pt-btn-is-hover` was overriding error text colour with green action hover → fixed by explicitly setting `color: --pt-semantic-typography-error` in the secondary negative hover rule
- Tertiary `Negative_hover`: `.pt-btn-negative.pt-btn-is-hover` was applying dark red background to tertiary → fixed by explicitly resetting `background: transparent`, `border-color: transparent`, `color: --pt-semantic-typography-error` in the tertiary negative hover rule

**AI gradient border:**
- Changed from `border-color: --pt-color-green-400` to `border: 1px solid transparent` + `background: gradient padding-box, gradient border-box`
- Gradient border matches fill visually; CSS snippet updated to show the background-clip technique

**Snippet generator updates (`docs/main.js`):**
- State label renamed: `Neg. Hover` → `Negative_hover`
- `getBtnClasses()`: recognises `ai_hover` and `negative_hover` as hover-type states (adds `.pt-btn-is-hover`, `.pt-btn-negative`, `.pt-btn-ai` correctly)
- `getBtnShadowWeb()`: updated to treat `hover`, `ai_hover`, `negative_hover` as hover states for shadow output
- `buildBtnIOSSnippet()` and `buildBtnAndroidSnippet()`: shadow logic updated to cover all three hover-state variants
- Android Compose token maps (`BTN_BG_COMPOSE`, `BTN_COLOR_COMPOSE`, `BTN_BORDER_COMPOSE`): extended with `negative_hover` and `ai_hover` keys for all three button types
- `buildBtnWebSnippet()`: gradient border states (`primary ai` / `primary ai_hover`) emit `background: gradient padding-box, gradient border-box` + `border: 1px solid transparent` instead of the standard `border: 1px solid` line

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |
| 5 | Map Pin component stylesheet not distributed | ⚠️ Carry-over from Entry 9 |

---

## Entry 11 · 2026-05-03 · PST

### Work Completed Since Entry 10

---

### Button Icon Only Component — Interactive Playground ✅

**Source:** Figma nodes 679:1063 (Small), 679:1087 (Default), 679:1111 (Large)

**What was done:**
- Added `<section id="components-button-icon">` to `docs/index.html` with `#btnIconPlayground` shell populated by JS
- Added "Button Icon Only" nav link to sidebar under Components (between Button and Filter Chip)
- Built `buildBtnIconPlayground()` in `docs/main.js`:
  - **Controls:** Size (Small / Default / Large), State (Default / Hover / Negative / Negative_hover / Disabled / AI Default / AI Hover) — same 7 states as Button
  - **Three live preview rows:** Primary, Secondary, Tertiary — all update simultaneously on any control change
  - **Per-row snippet panel** (`▸ {}`) with Web / iOS / Android tabs using the updater registry pattern (`btnIconSnippetUpdaters[]`)
  - **Icon picker integration:** Picking an icon in the Icons gallery updates the Button Icon Only previews and snippets in sync with Button and all other playgrounds

**Sizes confirmed from Figma:**

| Size label | Dimensions | Border-radius | Icon |
|---|---|---|---|
| Small | 36×36px (`--pt-scale-9`) | 6px (`--pt-scale-1half`) | 16px |
| Default | 44×44px (`--pt-scale-11`) | 8px (`--pt-scale-2`) | 20px |
| Large | 52×52px (`--pt-scale-13`) | 8px (`--pt-scale-2`) | 24px |

**CSS added to `docs/index.html`:**
- Base `.pt-btn-icon`: `inline-flex`, centered, `border: 1px solid transparent`, transition
- Size variants `.pt-btn-icon-sm/md/lg`: fixed `width` and `height` via scale tokens, border-radius per Figma
- Hover shadow rules mirroring Button: `pt-shadow-solid-xs` for sm, `pt-shadow-solid-sm` for md/lg, tertiary excluded
- Type/state classes (`.pt-btn-primary`, `.pt-btn-ai`, `.pt-btn-negative`, etc.) shared with Button — no duplication

**Snippet generators (all three platforms):**
- Reuse Button token maps (`BTN_BG`, `BTN_BG_SWIFT`, `BTN_BG_COMPOSE`, etc.) — all states covered including AI gradient and Negative variants
- Output uses fixed `width: N / height: N` (scale tokens) instead of padding — the key difference from the regular Button snippet
- Icon referenced by name in all three snippets for copy-paste readiness

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |
| 5 | Map Pin component stylesheet not distributed | ⚠️ Carry-over from Entry 9 |
| 6 | Button Icon Only component stylesheet not distributed | ⚠️ CSS/UIKit/Compose implementations exist only in docs |

---

## Entry 13 · 2026-05-03 · PST

### Work Completed Since Entry 12

---

### Selection Component Category — Interactive Playground ✅

**Source:** Figma node 707:3114 (`PinTours-Design-System` → Selection section)

**What was done:**
- Added a "Selection" collapsible sub-section inside the Components sidebar group (nested below Map Pin, indented to 44px) — not a separate top-level nav section
- Added three sub-component sections to `docs/index.html`: `#components-selection-checkbox`, `#components-selection-radio`, `#components-selection-toggle`
- All three playgrounds use a shared horizontal card grid layout (`buildSelectionPlayground()`) identical to the Shadow section: states shown side-by-side as cards, a single shared snippet panel opens below the grid when any card's `▸ {}` is clicked
- Added CSS to `docs/index.html` for `.pt-checkbox`, `.pt-radio`, `.pt-toggle`, `.sel-grid`, `.sel-card`, `.nav-sub-section`, `.nav-sub-link`

---

#### Checkbox

**States (7):** Unselected · Unselected Neutral · Selected Color · Selected Neutral · Indeterminate · Indeterminate Neutral · Disabled

**Sizes:** 16 / 20 / 24px (size control updates all card previews and open snippet simultaneously)

**Token decisions from Figma:**

| State | Background | Border | Icon |
|---|---|---|---|
| Unselected | transparent | `--pt-semantic-border-divider` | — |
| Unselected Neutral | transparent | `--pt-semantic-border-default` | — |
| Selected Color | `--pt-semantic-surface-action` | `--pt-semantic-border-action` | White checkmark SVG |
| Selected Neutral | `--pt-semantic-typography-headings` | `--pt-semantic-border-default` | White checkmark SVG |
| Indeterminate | `--pt-semantic-surface-action` | `--pt-semantic-border-action` | White minus SVG |
| Indeterminate Neutral | `--pt-semantic-typography-headings` | `--pt-semantic-border-default` | White minus SVG |
| Disabled | `--pt-semantic-surface-page` | `--pt-semantic-border-disabled` | — |

**Implementation:** Pure CSS (`border: 1.5px solid`, `border-radius: 2–3px`). Checkmark and minus rendered as inline SVG (`viewBox="0 0 16 16"`, scaled via `width/height` attribute per size).

---

#### Radio Button

**States (5):** Unselected · Unselected Hover · Selected Color · Selected Neutral · Disabled

**Sizes:** 16 / 20 / 24px

**Token decisions from Figma:**

| State | Border | Inner dot |
|---|---|---|
| Unselected | `--pt-semantic-border-divider` | none |
| Unselected Hover | `--pt-semantic-border-default` | none |
| Selected Color | `--pt-semantic-border-action` | `--pt-semantic-surface-action` |
| Selected Neutral | `--pt-semantic-border-default` | `--pt-semantic-typography-headings` |
| Disabled | `--pt-semantic-border-disabled` | none |

**Implementation:** `border: 2px solid`, `border-radius: 50%`. Inner dot is a child `div` (`border-radius: 50%`) sized at 7/9/11px for 16/20/24px containers.

---

#### Toggle

**States (3):** False · True · Disabled

**Sizes:** Small (32×16px) · Medium (40×20px) · Large (48×24px) — mapped to `--pt-scale-8/4`, `--pt-scale-10/5`, `--pt-scale-12/6`

**Token decisions from Figma:**

| State | Track background | Track border | Knob |
|---|---|---|---|
| False | `--pt-semantic-surface-disabled` | `--pt-semantic-border-disabled` | White (#fff) |
| True | `--pt-semantic-surface-action` | `--pt-semantic-border-action` | White (#fff), right-aligned |
| Disabled | `--pt-semantic-surface-page` | `--pt-semantic-border-disabled` | `--pt-semantic-surface-disabled` |

**Implementation:** Track is `border-radius: 999px`, knob is an absolutely positioned child circle (20/16/12px). True state positions knob via `left: calc(100% - 2px); transform: translateX(-100%)`. Disabled knob uses `--pt-semantic-surface-disabled` (not white with opacity) — matches Figma's distinct visual treatment.

---

### Shared Playground Architecture

Replaced the previous per-component boilerplate (separate `buildSnippetPanel`, `updatePreviews`, and `buildPlayground` functions per component) with a single `buildSelectionPlayground({ containerId, states, controls, stateObj, buildElement, buildSnippets })` helper. Each component now registers via a thin 7-line wrapper. Reduces ~300 lines of duplicated JS to ~110 lines.

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |
| 5 | Map Pin component stylesheet not distributed | ⚠️ Carry-over from Entry 9 |
| 6 | Button Icon Only component stylesheet not distributed | ⚠️ Carry-over from Entry 12 |
| 7 | Selection components stylesheet not distributed | ⚠️ Checkbox/Radio/Toggle CSS and native implementations exist only in docs |

---

## Entry 14 · 2026-05-19 · PST

### Work Completed Since Entry 13

---

### Gradients — Page Wash & Panel Wash Overhaul ✅

**Source:** Figma nodes 1338-2541 (Page Wash), 795-917 (Panel Wash)

---

#### Page Wash — Corrected Token Stops ✅

**Problem identified:** Original Page Wash gradient used only `-100` shade primitives (teal-100, yellow-100, green-100) which are near-white pastels — producing an invisible preview. Figma uses **Warning/200 (yellow-200)** and **Primary/200 (green-200)** as the saturated anchor stops to create the visible green/yellow bloom.

**Corrected gradient stops (from Figma angular gradient panel):**

| Stop | Token | Value |
|---|---|---|
| 0% | `--pt-color-yellow-200` | `#fbe2b3` |
| 5% | `--pt-color-green-200` | `#bed7b8` |
| 30% | `--pt-semantic-surface-page` | `#f6f9f9` |
| 53% | `--pt-semantic-surface-page` | `#f6f9f9` |
| 88% | `--pt-color-green-100` | `#dfebdb` |
| 100% | `--pt-color-teal-100` | `#ccebf4` |

**Gradient parameters confirmed from Figma:** Angular type, center at 50% 50% (dead center of frame), sweep from 0deg (top, clockwise), Layer Blur radius = 120.

---

#### Page Wash — Added as Design Token ✅

**Decision:** Moved from inline conic-gradient in code snippet to a named token `--pt-gradient-page_wash`, making it consistent with `--pt-gradient-panel_wash`.

**Changes:**
- Added `gradient.page_wash` to `tokens/semantic.json` with all 6 stops referencing primitive tokens
- Updated `build.js` to support optional `center` parameter in conic-gradient output: `conic-gradient(from Xdeg at X% Y%, ...)`
- Ran `npm run build` — token resolves to `--pt-gradient-page_wash: conic-gradient(from 0deg at 50% 50%, #fbe2b3 0%, #bed7b8 5%, #f6f9f9 30%, #f6f9f9 53%, #dfebdb 88%, #ccebf4 100%)`

**All three code snippets updated to token-reference pattern:**
- **Web:** `background: var(--pt-gradient-page_wash); filter: blur(120px);` with resolved value as comment
- **iOS:** `PT.Gradient.pageWash` token reference
- **Android:** `PTGradients.pageWash` token reference

---

#### Panel Wash — Blur Updated ✅

- Blur updated from 20px → 40px to match Figma Layer Blur value
- `opacity: 0.65` removed from preview (not specified in Figma effects panel)
- Code snippet updated: `inset: -40px; filter: blur(40px);`

---

#### Gradient Preview — Rendering Fix ✅

**Problem:** Applying `filter: blur(Xpx)` directly on the preview div caused edge fade within the container bounds (blur clips at overflow boundary), making gradients appear invisible at high blur radii.

**Fix:** Replaced direct `filter` on preview div with an inner absolutely-positioned child div using `position: absolute; inset: -Xpx; filter: blur(Xpx)`. The oversized inner div extends beyond the container; `overflow: hidden` on the parent clips it cleanly. Gradient fills the full container without edge fade.

---

### Token Count

| Version | Token count |
|---|---|
| Entry 13 | 312 |
| After page_wash addition | 313 |

---

### Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Success palette — `success` semantic tokens incorrectly reference `color.green.*` | ⚠️ Carry-over from Entry 5/6 |
| 2 | Font weight discrepancies (Thin: tokens=300, Figma=400; Regular: tokens=500, Figma=600) | ⚠️ Carry-over from Entry 3 |
| 3 | Button component stylesheet not distributed | ⚠️ Carry-over from Entry 3 |
| 4 | Super Icon component stylesheet not distributed | ⚠️ Carry-over from Entry 6 |
| 5 | Map Pin component stylesheet not distributed | ⚠️ Carry-over from Entry 9 |
| 6 | Button Icon Only component stylesheet not distributed | ⚠️ Carry-over from Entry 12 |
| 7 | Selection components stylesheet not distributed | ⚠️ Carry-over from Entry 13 |

---

## Entry 12 · 2026-05-03 · PST

### Bug Fix — Button Icon Only Secondary border missing in Default and AI Default states ✅

**Root cause:** `.pt-btn-icon` used the `border` shorthand (`border: 1px solid transparent`). Because `.pt-btn-icon` is declared *after* `.pt-btn-secondary` in the stylesheet, the shorthand's `border-color: transparent` overrode the action border-color set by `.pt-btn-secondary` — same cascade order issue that would affect any type class defined earlier in the file.

**Fix:** Replaced `border: 1px solid transparent` in `.pt-btn-icon` with longhand `border-width: 1px; border-style: solid;` — no `border-color` in the base class. Border color is now owned entirely by the type classes (`.pt-btn-primary`, `.pt-btn-secondary`, `.pt-btn-tertiary`), which already set it correctly via their own `border-color` rules.

**File changed:** `docs/index.html`

---
