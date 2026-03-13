# PinTours Design System — Token Pipeline

Single source of truth for design tokens across **Web**, **iOS**, and **Android**.

> **For Claude Code:** See [`CLAUDE.md`](./CLAUDE.md) for the complete token vocabulary, usage rules, and Figma-to-token mapping. Claude Code reads this file automatically and will use token names instead of hardcoded values when generating components.

## Repo structure

```
pintours-design-system/
├── tokens/
│   └── tokens.json          ← edit this, nothing else
├── build/                   ← generated, committed to git
│   ├── web/variables.css
│   ├── ios/Tokens.swift
│   └── android/
│       ├── values/colors.xml
│       ├── values/dimens.xml
│       └── values-night/colors.xml
├── scripts/
│   ├── validate.js          ← naming, refs, dark-mode coverage
│   └── diff-check.js        ← determinism guard for CI
├── docs/                    ← Vite token preview (smoke test)
├── build.js                 ← Style Dictionary pipeline
├── vite.config.js
└── package.json
```

## Commands

```bash
npm install            # first-time setup

npm run validate       # check tokens.json for errors + coverage report
npm run build          # validate → generate all platform outputs
npm run diff           # CI: fail if build/ is stale

npm run docs:dev       # start Vite preview at http://localhost:3333
```

## How to toggle dark mode (Web)

Add/remove `data-theme="dark"` on the `<html>` element. The system preference
(`prefers-color-scheme`) is respected automatically as a fallback.

```js
// Toggle
const html = document.documentElement;
html.setAttribute('data-theme', 'dark');   // on
html.setAttribute('data-theme', 'light');  // off (also blocks media-query fallback)
html.removeAttribute('data-theme');        // revert to system preference

// React example
document.documentElement.setAttribute(
  'data-theme',
  isDark ? 'dark' : 'light'
);
```

The generated CSS handles both cases:

```css
/* Always active (default: light) */
:root { --pt-semantic-typography-headings: #222628; }

/* Explicit runtime toggle */
[data-theme="dark"] { --pt-semantic-typography-headings: #f2f6f7; }

/* System preference fallback — overridden by data-theme="light" */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --pt-semantic-typography-headings: #f2f6f7; }
}
```

## Using tokens

### Web
```html
<link rel="stylesheet" href="build/web/variables.css" />
```
```css
.heading { color: var(--pt-semantic-typography-headings); }
.card    { background: var(--pt-semantic-surface-card_primary); }
.cta     { background: var(--pt-semantic-surface-action); }
```

### iOS
Add `build/ios/Tokens.swift` to your Xcode project.
```swift
label.textColor       = PT.Semantic.Typography.headings   // auto light/dark
button.backgroundColor = PT.Semantic.Surface.action
view.layer.cornerRadius = PT.Scale.s3                     // 12px
titleLabel.font = .systemFont(ofSize: PT.Typography.desktopH1Font_size)
```

### Android
Copy files to your module's `res/` directory:
- `build/android/values/colors.xml`        → `res/values/colors.xml`
- `build/android/values/dimens.xml`        → `res/values/dimens.xml`
- `build/android/values-night/colors.xml`  → `res/values-night/colors.xml`

```xml
<TextView android:textColor="@color/pt_semantic_typography_headings" />
<View     android:background="@color/pt_semantic_surface_action" />
<Space    android:layout_height="@dimen/pt_scale_4" />
```
Android automatically uses `values-night/` when system dark mode is active.

## Token architecture

```
tokens/tokens.json
│
├── color.*          ← primitive palette (55 colors × 5 palettes)
├── typography.*     ← primitive type scale (desktop + mobile + body variants)
├── scale.*          ← spacing scale 0–80px
├── shadow.*         ← effect tokens
│
└── semantic.*       ← alias layer (references primitives)
    ├── typography.{light|dark}.*
    ├── icon.{light|dark}.*
    ├── surface.{light|dark}.*
    ├── border.{light|dark}.*
    └── shadow.{light|dark}.*
```

**Rule:** semantic tokens always reference primitives via `{color.green.500}` syntax.
Never use raw hex values in the semantic layer.

## Adding or changing tokens

1. Edit `tokens/tokens.json`
2. Run `npm run build`
3. Commit everything — `tokens/tokens.json`, `build/`, and `.build-hash`

The CI `npm run diff` step will fail if `build/` is not regenerated after a token change.

## Future: React component library

The pipeline is structured for monorepo extraction when ready:

```
packages/
├── tokens/          ← move tokens/ + build/ here, publish as @pintours/tokens
└── react/           ← import CSS vars + typed token constants
```

No changes to `build.js` or token structure needed.
