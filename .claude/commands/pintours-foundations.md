# PinTours Design System — Foundations

Use this skill whenever generating UI code, components, or styles for PinTours. Every token value flows from `tokens/tokens.json` through Style Dictionary into CSS, Swift, and Android outputs. Never hardcode values that have a token equivalent.

**Token files to import:**
- Web: `build/web/variables.css` + `build/web/text-styles.css`
- iOS: `build/ios/Tokens.swift` + `build/ios/TextStyles.swift`
- Android XML: `build/android/values/` + `build/android/values-night/`
- Android Compose: `build/android/compose/PTTheme.kt` — wrap every screen in `PTTheme {}`

---

## Token Architecture

Two layers:
- **Primitives** — raw values. Use only when no semantic token fits (rare).
- **Semantic tokens** — purpose-named, mapped to primitives. Always prefer in components.

Semantic tokens carry both light and dark values. Dark mode is automatic — CSS switches on `data-theme="dark"` on `<html>`, iOS uses `UIUserInterfaceStyle`, Android uses `values-night/`. No extra logic needed in components.

---

## 1. Color Primitives

Use only to define semantic tokens or as a last resort when no semantic token applies.

**CSS:** `--pt-color-{palette}-{shade}` | **Swift:** `PT.Color.{Palette}.c{shade}` | **Android:** `@color/pt_color_{palette}_{shade}`

### Green
`.50`→#eff5ed | `.100`→#dfebdb | `.200`→#bed7b8 | `.300`→#9ec494 | `.400`→#7db071
`.500`→#5d9c4d | `.600`→#4a7d3e | `.700`→#385e2e | `.800`→#253e1f | `.900`→#131f0f | `.1000`→#091008

### Teal
`.50`→#e5f5f9 | `.100`→#ccebf4 | `.200`→#99d7e9 | `.300`→#66c3de | `.400`→#33afd3
`.500`→#009bc8 | `.600`→#007ca0 | `.700`→#005d78 | `.800`→#003e50 | `.900`→#001f28 | `.1000`→#001014

### Red
`.50`→#fbecec | `.100`→#f7dada | `.200`→#efb5b5 | `.300`→#e68f8f | `.400`→#de6a6a
`.500`→#d64545 | `.600`→#ab3737 | `.700`→#802929 | `.800`→#561c1c | `.900`→#2b0e0e | `.1000`→#150707

### Yellow
`.50`→#fef8ec | `.100`→#fdf1d9 | `.200`→#fbe2b3 | `.300`→#f8d48c | `.400`→#f6c566
`.500`→#f4b740 | `.600`→#c39233 | `.700`→#926e26 | `.800`→#62491a | `.900`→#31250d | `.1000`→#181206

### Grey
`.25`→#fbfcfc | `.50`→#f6f9f9 | `.75`→#f2f6f7 | `.100`→#eef2f4 | `.200`→#dce6e9 | `.300`→#cbd9dd
`.400`→#b9cdd2 | `.500`→#a8c0c7 | `.600`→#869a9f | `.700`→#657377 | `.800`→#434d50 | `.850`→#323a3c
`.900`→#222628 | `.1000`→#111314

---

## 2. Semantic — Typography & Icon Colors

**CSS:** `--pt-semantic-typography-{role}` / `--pt-semantic-icon-{role}`
**Swift:** `PT.Semantic.Typography.{camelRole}` / `PT.Semantic.Icon.{camelRole}`
**Android:** `@color/pt_semantic_typography_{role}` / `@color/pt_semantic_icon_{role}`
**Compose:** `MaterialTheme.ptColors.typography{Role}` / `MaterialTheme.ptColors.icon{Role}`

| Role | Light | Dark |
|---|---|---|
| headings | #222628 | #f2f6f7 |
| body | #222628 | #f2f6f7 |
| body_secondary | #869a9f | #a8c0c7 |
| body_caption | #869a9f | #a8c0c7 |
| action | #5d9c4d | #7db071 |
| action_hover | #4a7d3e | #5d9c4d |
| disabled | #eef2f4 | #434d50 |
| success | #385e2e | #9ec494 |
| warning | #62491a | #f8d48c |
| error | #802929 | #e68f8f |
| information | #005d78 | #66c3de |
| on_action | #ffffff | #000000 |
| on_hover | #ffffff | #000000 |
| on_disabled | #111314 | #f6f9f9 |

---

## 3. Semantic — Surface

**CSS:** `--pt-semantic-surface-{role}` | **Swift:** `PT.Semantic.Surface.{camelRole}`
**Android:** `@color/pt_semantic_surface_{role}` | **Compose:** `MaterialTheme.ptColors.surface{Role}`

| Role | Light | Dark |
|---|---|---|
| page | #f6f9f9 | #222628 |
| page_90 | rgba(246,249,249,0.9) | rgba(34,38,40,0.9) |
| card_primary | #ffffff | #323a3c |
| card_85 | rgba(255,255,255,0.85) | rgba(50,58,60,0.85) |
| action | #5d9c4d | #7db071 |
| action_hover | #4a7d3e | #5d9c4d |
| negative | #d64545 | #d64545 |
| negative_hover | #ab3737 | #ab3737 |
| information_core | #009bc8 | #009bc8 |
| warning_core | #f4b740 | #f4b740 |
| success | #dfebdb | #253e1f |
| warning | #fdf1d9 | #62491a |
| error | #f7dada | #561c1c |
| information | #ccebf4 | #003e50 |
| disabled | #a8c0c7 | #657377 |

---

## 4. Semantic — Border

**CSS:** `--pt-semantic-border-{role}` | **Swift:** `PT.Semantic.Border.{camelRole}`
**Android:** `@color/pt_semantic_border_{role}` | **Compose:** `MaterialTheme.ptColors.border{Role}`

| Role | Light | Dark |
|---|---|---|
| page | #f6f9f9 | #222628 |
| default | #222628 | #f2f6f7 |
| divider | #a8c0c7 | #657377 |
| card_primary | #a8c0c7 | #657377 |
| action | #5d9c4d | #7db071 |
| action_hover | #4a7d3e | #5d9c4d |
| negative | #d64545 | #d64545 |
| negative_hover | #ab3737 | #ab3737 |
| success | #bed7b8 | #4a7d3e |
| warning | #fbe2b3 | #c39233 |
| error | #efb5b5 | #ab3737 |
| information | #99d7e9 | #007ca0 |
| disabled | #a8c0c7 | #657377 |

---

## 5. Semantic — Shadow Colors

**CSS:** `--pt-semantic-shadow` / `--pt-semantic-shadow-normal`
**Swift:** `PT.Semantic.Shadow.shadow` / `PT.Semantic.Shadow.shadowNormal`

| Token | Light | Dark |
|---|---|---|
| shadow (light) | #cbd9dd | rgba(17,19,20,0.5) |
| shadow-normal | #a8c0c7 | #111314 |

---

## 6. Typography

Font family: **Poppins** (all weights). CSS: `--pt-typography-font_family-primary`.

Font weights — CSS: `--pt-typography-font_weight-{name}`

| Name | Value | Class variant |
|---|---|---|
| extra_light | 300 | `thin` |
| light | 400 | — |
| regular | 500 | `regular` |
| medium | 600 | — |
| semibold | 700 | `emphasis` |
| bold | 800 | — |

### Large viewport (≥768px)

| Step | Size | Line height |
|---|---|---|
| display1 | 120px | 136px |
| display2 | 96px | 108px |
| display3 | 76px | 92px |
| h1 | 60px | 72px |
| h2 | 48px | 56px |
| h3 | 40px | 48px |
| h4 | 32px | 40px |
| h5 | 24px | 28px |
| h6 | 20px | 24px |

### Small viewport (<768px)

| Step | Size | Line height |
|---|---|---|
| display1 | 96px | 108px |
| display2 | 76px | 92px |
| display3 | 60px | 72px |
| h1 | 48px | 56px |
| h2 | 40px | 48px |
| h3 | 32px | 40px |
| h4 | 28px | 32px |
| h5 | 24px | 28px |
| h6 | 20px | 24px |

### Body (all viewports)

| Step | Size | Line height |
|---|---|---|
| body.xs | 12px | 16px |
| body.sm | 14px | 24px |
| body.default | 16px | 24px |
| body.lg | 20px | 28px |

### How to apply typography

**Web** — utility classes from `build/web/text-styles.css`:
```html
<!-- Responsive (auto-switches at 768px) -->
<h1 class="pt-text-style-h1-regular">Heading</h1>
<p class="pt-text-style-body-default-regular">Body</p>

<!-- Explicit device size -->
<h2 class="pt-text-style-large-h2-emphasis">Desktop H2 Bold</h2>
<h2 class="pt-text-style-small-h2-regular">Mobile H2</h2>
```
Class pattern: `pt-text-style-{scale}-{weight}` (responsive) or `pt-text-style-{device}-{scale}-{weight}` (explicit).
Weight variants: `regular`, `emphasis`, `thin`.

**iOS:**
```swift
let style = traitCollection.horizontalSizeClass == .regular
    ? PT.TextStyle.Large.h1Regular
    : PT.TextStyle.Small.h1Regular
label.attributedText = NSAttributedString(string: text, attributes: style.attributes())
```

**Android XML:**
```xml
<TextView android:textAppearance="@style/PT.TextStyle.Large.H1.Regular" />
<TextView android:textAppearance="@style/PT.TextStyle.Small.BodyDefault.Regular" />
```

**Android Compose:**
```kotlin
val colors = MaterialTheme.ptColors
Text(text = "Heading", style = PTTextStyles.largeH1Regular, color = colors.typographyHeadings)
Text(text = "Body", style = PTTextStyles.smallBodyDefaultRegular, color = colors.typographyBody)
```

---

## 7. Spacing Scale (base unit: 4px)

**CSS:** `--pt-scale-{step}` | **Swift:** `PT.Scale.s{step}` | **Android XML:** `@dimen/pt_scale_{step}` | **Compose:** `PTDimens.s{step}`

`0`=0 | `quat`=1px | `half`=2px | `3quat`=3px | `1`=4px | `1half`=6px | `2`=8px | `3`=12px | `4`=16px | `5`=20px | `6`=24px | `7`=28px | `8`=32px | `9`=36px | `10`=40px | `11`=44px | `12`=48px | `13`=52px | `14`=56px | `15`=60px | `16`=64px | `17`=68px | `18`=72px | `19`=76px | `20`=80px

---

## 8. Icons

Library: **Tabler Icons** (MIT, outline only). Always set `color: currentColor` — apply the semantic icon color to the parent element, not the SVG directly.

**CSS:** `--pt-icon-size-{n}` / `--pt-icon-stroke_weight-{n}`
**Android XML:** `@dimen/pt_icon_size_{n}` / `@dimen/pt_icon_stroke_weight_{n}`
**iOS:** use `PT.Scale.*` equivalent (no dedicated icon size constant in Tokens.swift)
**Compose:** use `PTDimens.s{step}` equivalent

| Size | px/dp | Stroke | iOS (PT.Scale) | Compose (PTDimens) |
|---|---|---|---|---|
| 12 | 12px | 1 | `PT.Scale.s3` | `PTDimens.s3` |
| 16 | 16px | 1.5 | `PT.Scale.s4` | `PTDimens.s4` |
| 20 | 20px | 1.75 | `PT.Scale.s5` | `PTDimens.s5` |
| 24 | 24px | 2 | `PT.Scale.s6` | `PTDimens.s6` |
| 32 | 32px | 2.5 | `PT.Scale.s8` | `PTDimens.s8` |

Always match the size and stroke weight. Never resize a 24px icon asset to 16px — use the correct asset. Stroke weight is baked into the vector at design time.

**Web:**
```css
.icon {
  width: var(--pt-icon-size-24);
  height: var(--pt-icon-size-24);
  stroke-width: var(--pt-icon-stroke_weight-24);
  color: var(--pt-semantic-icon-action); /* or set on parent */
}
```

**iOS:**
```swift
imageView.frame.size = CGSize(width: PT.Scale.s6, height: PT.Scale.s6) /* 24pt */
imageView.tintColor = PT.Semantic.Icon.action
```

**Android Compose:**
```kotlin
val colors = MaterialTheme.ptColors
Icon(
    imageVector = Icons.Default.Place,
    contentDescription = "Location",
    tint = colors.iconAction,
    modifier = Modifier.size(PTDimens.s6) // 24dp
)
```

---

## 9. Gradients

**CSS:** `--pt-gradient-{name}` | **iOS:** `PT.Gradient.{name}` | **Compose:** `PTGradients.{name}`

| Token | Purpose | CSS value |
|---|---|---|
| `default` | Brand CTA, interactive elements | `linear-gradient(to right, #7db071 0%, #009bc8 100%)` |
| `hover` | Brand CTA pressed/hover state | `linear-gradient(to right, #5d9c4d 0%, #007ca0 100%)` |
| `panel_wash` | Soft panel background — apply with `filter: blur(40px)` | `conic-gradient(from 90deg, #dfebdb 0%, #eff5ed 50%, #ccebf4 100%)` |
| `page_wash` | Full-page ambient wash — apply via `::before` with `inset: -120px; filter: blur(120px)` | `conic-gradient(from 0deg at 50% 50%, #fbe2b3 0%, #bed7b8 5%, #f6f9f9 30%, #f6f9f9 53%, #dfebdb 88%, #ccebf4 100%)` |

> `panel_wash` and `page_wash` are CSS-only (conic gradients). On iOS and Android use `PT.Semantic.Surface.page` / `colors.surfacePage` as fallback.

**Web — page_wash (full-page background):**
```css
/* Add to the root page element. The ::before sits behind all content. */
.page {
  position: relative;
}
.page::before {
  content: "";
  position: fixed;       /* stays put during scroll */
  inset: -120px;         /* overflows edges to prevent gradient clipping */
  background: var(--pt-gradient-page_wash);
  filter: blur(120px);
  z-index: -1;           /* behind all content */
  pointer-events: none;  /* never intercepts clicks */
}
```

**Web — panel_wash (section/card background):**
```css
/* Wrap in a position:relative container. The wash sits behind content. */
.panel {
  position: relative;
  overflow: hidden;
}
.panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--pt-gradient-panel_wash);
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}
.panel > * {
  position: relative;
  z-index: 1; /* keep content above the wash */
}
```

**Web — default/hover gradient (CTA button):**
```css
.btn-primary {
  background: var(--pt-gradient-default);
  color: var(--pt-semantic-typography-on_action);
}
.btn-primary:hover {
  background: var(--pt-gradient-hover);
}
```

**iOS — applying a gradient:**
```swift
let grad = CAGradientLayer()
let def = PT.Gradient.default
grad.colors     = def.colors.map { $0.cgColor }
grad.startPoint = def.startPoint // CGPoint(x: 0, y: 0.5)
grad.endPoint   = def.endPoint   // CGPoint(x: 1, y: 0.5)
grad.frame      = view.bounds
view.layer.insertSublayer(grad, at: 0)
```

**Android Compose:**
```kotlin
val colors = MaterialTheme.ptColors
val gradient = if (isPressed) PTGradients.hover else PTGradients.default
Box(modifier = Modifier.background(brush = gradient).padding(PTDimens.s4)) {
    Text("Book Now", color = colors.typographyOnAction)
}
```

---

## 10. Shadows

Pattern: `--pt-shadow-{group}-{size}` | group = `gradient` | `solid` | `bottom_sheet` | size = `xs` `sm` `md` `lg` `xl`

| Group | Use case |
|---|---|
| `gradient` | Soft blurred elevation — cards, modals, dropdowns |
| `solid` | Crisp bottom-edge depth — buttons, inputs |
| `bottom_sheet` | Upward shadow — bottom sheets, drawers |

**Resolved light-mode values:**

Gradient: `xs`→`0px 2px 4px 0px #a8c0c7` | `sm`→`0px 3px 6px 0px #a8c0c7` | `md`→`0px 6px 12px 0px #a8c0c7, 0px 6px 12px 0px #cbd9dd` | `lg`→`0px 12px 32px 0px #cbd9dd, 0px 8px 16px 0px #a8c0c7` | `xl`→`0px 32px 48px 0px #cbd9dd, 0px 16px 24px 0px #a8c0c7`

Solid: `xs`→`0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` | `sm`→`0px 4px 0px 0px #a8c0c7, 0px 0px 6px 0px #cbd9dd` | `md`→`0px 6px 0px 0px #a8c0c7, 0px 0px 8px 0px #cbd9dd` | `lg`→`0px 8px 0px 0px #a8c0c7, 0px 0px 12px 0px #cbd9dd` | `xl`→`0px 12px 0px 0px #a8c0c7, 0px 0px 16px 0px #cbd9dd`

Bottom sheet: `xs`→`0px -2px 4px 0px #a8c0c7` | `sm`→`0px -3px 6px 0px #a8c0c7` | `md`→`0px -3px 20px 0px #a8c0c7, 0px -6px 12px 0px #cbd9dd` | `lg`→`0px -8px 24px 0px #a8c0c7, 0px -12px 40px 0px #cbd9dd` | `xl`→`0px -12px 32px 0px #a8c0c7, 0px -24px 48px 0px #cbd9dd`

**Web:**
```css
.card   { box-shadow: var(--pt-shadow-gradient-lg); }
.button { box-shadow: var(--pt-shadow-solid-md); }
.sheet  { box-shadow: var(--pt-shadow-bottom_sheet-lg); }
```

**iOS** — shadows are not tokenised as CALayer presets; compose from semantic shadow colors:
```swift
layer.shadowColor   = PT.Semantic.Shadow.shadowNormal.cgColor // #a8c0c7
layer.shadowOffset  = CGSize(width: 0, height: 8)             // match the group's Y offset
layer.shadowRadius  = 16                                       // match the group's blur
layer.shadowOpacity = 1.0
```

**Android** — use `elevation` with scale tokens; the system generates shadows automatically:
```xml
<androidx.cardview.widget.CardView app:cardElevation="@dimen/pt_scale_2" /> <!-- 8dp -->
```

---

## 11. Breakpoints

`breakpoint.large` = **768px** → activates large type scale, `@media (min-width: 768px)`
`canvas_large` = 1440px → Figma reference frame only
`canvas_small` = 440px → Figma reference frame only

---

## 12. App Layout Grid

The PinTours app screen is divided into five fixed zones. Every screen must respect these zones without exception.

```
┌─────────────────────────────────┐
│         STATUS BAR              │  ← System-owned. No app content.
├─────────────────────────────────┤
│         NAVIGATION BAR          │  ← Always present. Can be empty.
├─────────────────────────────────┤
│                                 │
│         PAGE CONTENT            │  ← All app content lives here.
│                                 │
├─────────────────────────────────┤
│          TAB BAR                │  ← Always present on main screens.
├─────────────────────────────────┤
│        HOME INDICATOR           │  ← System-owned. No app content.
└─────────────────────────────────┘
```

---

### Zone 1 — Status Bar (System-owned)

**iOS:** The status bar is managed entirely by the system. It displays the time, Dynamic Island (or notch), and system indicators (cellular, Wi-Fi, battery). Height varies by device — on Face ID iPhones with Dynamic Island it is approximately 59pt; the safe area top inset accounts for this automatically. **Never place app content in this zone.** Extend the screen background colour or a surface into it, but no interactive elements.

Always constrain your layout to `safeAreaLayoutGuide`, not the raw `view` bounds:
```swift
NSLayoutConstraint.activate([
    navBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
])
```

**Android:** The status bar is system-owned. Use `WindowInsets` to push your layout below it:
```kotlin
// Compose — apply to the root scaffold
Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = { PTNavigationBar(...) }
) { innerPadding ->
    Content(modifier = Modifier.padding(innerPadding))
}
```
```xml
<!-- XML — on the root layout -->
android:fitsSystemWindows="true"
```

---

### Zone 2 — Navigation Bar

The navigation bar appears at the **top of every screen**, immediately below the safe area. It is always present and always occupies its full height — even when the screen has no title or actions, the space is held and content does not move up to fill it.

#### iOS dimensions
| Property | Value | Token |
|---|---|---|
| Height | 40pt | — |
| Left action touch target | 40×40pt | `PT.Scale.s10` |
| Right action touch target | 40×40pt | `PT.Scale.s10` |
| Touch target corner radius | 6pt | `PT.Scale.s1half` |
| Icon size | 24pt | `PT.Scale.s6` |
| Icon stroke weight | 2 | — |
| Left icon inset from edge | 8pt | `PT.Scale.s2` |
| Right icon inset from edge | 8pt | `PT.Scale.s2` |
| Title horizontal position | Centred between icons | — |

#### Navigation bar title style
| Property | Value | Token |
|---|---|---|
| Font | Poppins | `--pt-typography-font_family-primary` |
| Size | 16pt | `--pt-typography-body-default-font_size` |
| Weight | SemiBold (700) | `--pt-typography-font_weight-semibold` |
| Colour | Headings | `PT.Semantic.Typography.headings` |
| Alignment | Centre | — |
| Line height | 24pt | `--pt-typography-body-default-line_height` |

This corresponds to the **Body Default / Emphasis** text style.

#### Navigation icon style
- Library: Tabler Icons, outline only
- Size: 24pt (`PT.Scale.s6`)
- Stroke weight: 2 (matches the 24pt icon rule)
- Colour: `PT.Semantic.Icon.headings` (inherits from parent tintColor)
- Touch target: 40×40pt with 6pt corner radius — never shrink the touch target to the icon bounds

#### Empty state rule
If a screen has no back action, close action, or title, the navigation bar remains at its full 40pt height. Do not collapse it, remove it, or allow content to slide up into that space. The bar is structurally part of every screen.

#### iOS implementation
```swift
// Navigation bar sits directly below the safe area top inset.
// Do not use UINavigationController's default nav bar —
// use the custom PTNavigationBar component which enforces the 40pt height.

navBar.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(navBar)

NSLayoutConstraint.activate([
    navBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
    navBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    navBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    navBar.heightAnchor.constraint(equalToConstant: PT.Scale.s10), // 40pt
])

// Icon button touch targets
iconButton.layer.cornerRadius = PT.Scale.s1half // 6pt
NSLayoutConstraint.activate([
    iconButton.widthAnchor.constraint(equalToConstant: PT.Scale.s10),  // 40pt
    iconButton.heightAnchor.constraint(equalToConstant: PT.Scale.s10),
    iconButton.leadingAnchor.constraint(equalTo: navBar.leadingAnchor,
                                        constant: PT.Scale.s2),        // 8pt
])

// Title label
titleLabel.font = UIFont(name: "Poppins-SemiBold", size: 16)
titleLabel.textColor = PT.Semantic.Typography.headings
titleLabel.textAlignment = .center
```

#### Android dimensions
The Android equivalent is a custom `TopAppBar`. Use Material 3's `TopAppBar` as the base but override height to match the 40dp spec. Android system status bar is handled by `WindowInsets`.

| Property | Value | Token |
|---|---|---|
| Height | 40dp | `@dimen/pt_scale_10` |
| Icon touch target | 40×40dp | `@dimen/pt_scale_10` |
| Icon size | 24dp | `@dimen/pt_icon_size_24` |
| Icon corner radius | 6dp | `@dimen/pt_scale_1half` |
| Icon inset from edge | 8dp | `@dimen/pt_scale_2` |

```kotlin
// Compose
@Composable
fun PTNavigationBar(
    title: String = "",
    onNavigateUp: (() -> Unit)? = null,
    onDismiss: (() -> Unit)? = null,
) {
    val colors = MaterialTheme.ptColors
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(PTDimens.s10) // 40dp
            .background(colors.surfacePage)
    ) {
        onNavigateUp?.let {
            IconButton(
                onClick = it,
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .padding(start = PTDimens.s2)  // 8dp
                    .size(PTDimens.s10)             // 40dp touch target
            ) {
                Icon(
                    imageVector = Icons.Default.ChevronLeft,
                    contentDescription = "Back",
                    tint = colors.iconHeadings,
                    modifier = Modifier.size(PTDimens.s6) // 24dp icon
                )
            }
        }
        if (title.isNotEmpty()) {
            Text(
                text = title,
                style = PTTextStyles.smallBodyDefaultRegular.copy(fontWeight = FontWeight.SemiBold),
                color = colors.typographyHeadings,
                textAlign = TextAlign.Center,
                modifier = Modifier.align(Alignment.Center)
            )
        }
        onDismiss?.let {
            IconButton(
                onClick = it,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = PTDimens.s2)   // 8dp
                    .size(PTDimens.s10)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = colors.iconHeadings,
                    modifier = Modifier.size(PTDimens.s6)
                )
            }
        }
    }
}
```

---

### Zone 3 — Page Content

All screen content lives in this zone. It begins immediately below the navigation bar.

#### Margins
| Property | Value | Token |
|---|---|---|
| Left margin | 16pt / 16dp | `PT.Scale.s4` / `@dimen/pt_scale_4` |
| Right margin | 16pt / 16dp | `PT.Scale.s4` / `@dimen/pt_scale_4` |

**Margin rule:** Typography and CTA content must not extend into the 16pt margins. The one exception is **carousels** — full-bleed or peek carousels may extend to the screen edges.

#### Page headline
Where a screen has a page headline it appears after a **12pt gap** from the top of the content zone, inset by the standard 16pt margins.

| Property | Value | Token |
|---|---|---|
| Top gap | 12pt | `PT.Scale.s3` |
| Horizontal inset | 16pt | `PT.Scale.s4` |
| Font | Poppins | `--pt-typography-font_family-primary` |
| Size | 32pt | `--pt-typography-small-h3-font_size` |
| Line height | 40pt | `--pt-typography-small-h3-line_height` |
| Weight | Regular (500) | `--pt-typography-font_weight-regular` |
| Colour | Headings | `PT.Semantic.Typography.headings` |

This is the **H3 Regular (small scale)** text style — 32pt/40pt line height. Always use the small-scale H3 for page headlines on native screens.

**iOS:**
```swift
headlineLabel.font = UIFont(name: "Poppins-Medium", size: 32) // H3 Regular = weight 500 = Medium
headlineLabel.textColor = PT.Semantic.Typography.headings

NSLayoutConstraint.activate([
    headlineLabel.topAnchor.constraint(equalTo: contentArea.topAnchor,
                                       constant: PT.Scale.s3),  // 12pt gap
    headlineLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor,
                                           constant: PT.Scale.s4), // 16pt margin
    headlineLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor,
                                            constant: -PT.Scale.s4),
])
```

**Android Compose:**
```kotlin
val colors = MaterialTheme.ptColors
Text(
    text = pageHeadline,
    style = PTTextStyles.smallH3Regular,
    color = colors.typographyHeadings,
    modifier = Modifier.padding(
        top   = PTDimens.s3,  // 12dp gap
        start = PTDimens.s4,  // 16dp margin
        end   = PTDimens.s4
    )
)
```

**Android XML:**
```xml
<TextView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginTop="@dimen/pt_scale_3"
    android:paddingStart="@dimen/pt_scale_4"
    android:paddingEnd="@dimen/pt_scale_4"
    android:textAppearance="@style/PT.TextStyle.Small.H3.Regular"
    android:textColor="@color/pt_semantic_typography_headings" />
```

---

### Zone 4 — Tab Bar

The tab bar appears at the **bottom of every main app screen**, immediately above the Home Indicator safe area. It is always present on main screens and never disappears during scroll.

The PinTours tab bar has five items: **Home, Lumo, Explore, Saved, Profile**.

#### iOS dimensions
| Property | Value | Token |
|---|---|---|
| Top padding | 12pt | `PT.Scale.s3` |
| Bottom padding | 8pt | `PT.Scale.s2` |
| Horizontal padding | 16pt | `PT.Scale.s4` |
| Icon size | 24pt | `PT.Scale.s6` |
| Icon stroke weight | 2 | — |
| Gap: icon to label | 2pt | `PT.Scale.half` |
| Label size | 12pt / 16pt lh | `--pt-typography-body-xs-font_size` |
| Label weight | Regular (500) | `--pt-typography-font_weight-regular` |
| Label colour | Typography / Body | `PT.Semantic.Typography.body` |
| Label bottom padding | 2pt | `PT.Scale.half` |

#### iOS safe area rule
The tab bar sits above the Home Indicator. On Face ID iPhones the Home Indicator safe area is **34pt**. Pin the tab bar bottom to `safeAreaLayoutGuide.bottomAnchor` — the system will position it correctly above the Home Indicator across all device sizes.

```swift
tabBar.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(tabBar)

NSLayoutConstraint.activate([
    tabBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    tabBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    tabBar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
])

// Tab item label style
label.font = UIFont(name: "Poppins-Medium", size: 12) // body-xs, Regular (500)
label.textColor = PT.Semantic.Typography.body
```

#### Android dimensions
Use Material 3 `NavigationBar`. Height is managed by the component. Apply `navigationBarsPadding()` so the bar sits above the Android gesture navigation bar.

| Property | Value | Token |
|---|---|---|
| Icon size | 24dp | `@dimen/pt_icon_size_24` |
| Label size | 12sp | body-xs |
| Label colour | Typography / Body | `colors.typographyBody` |

```kotlin
// Compose — icon and label colours follow the Figma-defined tab bar component style
NavigationBar(
    modifier = Modifier.navigationBarsPadding(),
    containerColor = MaterialTheme.ptColors.surfacePage,
    tonalElevation = 0.dp
) {
    val colors = MaterialTheme.ptColors
    tabs.forEach { tab ->
        NavigationBarItem(
            selected = currentTab == tab,
            onClick = { /* navigate */ },
            icon = {
                Icon(
                    imageVector = tab.icon,
                    contentDescription = null,
                    modifier = Modifier.size(PTDimens.s6), // 24dp
                    tint = colors.iconBody
                )
            },
            label = {
                Text(
                    text = tab.label,
                    style = PTTextStyles.smallBodyXsRegular,
                    color = colors.typographyBody
                )
            }
        )
    }
}
```

---

### Zone 5 — Home Indicator / System Navigation (System-owned)

**iOS:** The Home Indicator area (34pt on Face ID iPhones) is system-owned. The swipe-up gesture bar is rendered by the system. Do not place any app content in this zone. Extend the tab bar background colour into it visually, but pin interactive elements above `safeAreaLayoutGuide.bottomAnchor`.

**Android:** Android devices use either gesture navigation (no visible bar, but a system inset applies) or 3-button navigation (48dp bar). Always apply `navigationBarsPadding()` in Compose or `fitsSystemWindows="true"` in XML — never hardcode a fixed bottom inset.

---

### Layout quick reference

| Zone | iOS | Android |
|---|---|---|
| Status bar | `safeAreaLayoutGuide.topAnchor` | `statusBarsPadding()` / `fitsSystemWindows` |
| Navigation bar | 40pt, below safe area top | 40dp custom `TopAppBar` |
| Content start | 12pt below nav bar | 12dp below `TopAppBar` |
| Page headline | H3 Regular (small), 32pt, 16pt margins | `PT.TextStyle.Small.H3.Regular`, 16dp margins |
| Margin rule | 16pt — no text/CTA (carousels exempt) | 16dp — no text/CTA (carousels exempt) |
| Tab bar bottom | `safeAreaLayoutGuide.bottomAnchor` | `navigationBarsPadding()` |
| Home indicator | System-owned, 34pt reserved | System-owned, use window insets |

---

## 13. Usage Rules

1. Always use semantic tokens in components. Never hardcode hex values or raw px/dp constants.
2. Always implement light and dark mode together — do not handle them separately in component code.
3. Typography is responsive — switch the type scale at `min-width: 768px` (large) vs below (small).
4. Spacing comes from the scale only. No arbitrary pixel values.
5. Text and icons on `surface.action` must use `on_action` color tokens, not `body` or `headings`.
6. Icons always use `currentColor` on web — set the semantic icon color on the parent, not the SVG.
7. Match icon size and stroke weight exactly from the table — never scale an asset to a different size.
8. Shadow choice: `gradient` for floating cards/modals, `solid` for buttons/inputs, `bottom_sheet` for drawers.
9. `panel_wash` and `page_wash` gradients are CSS-only — use `surface.page` as fallback on native.
10. In Android Compose, always declare `val colors = MaterialTheme.ptColors` at the top of each composable that references PT color tokens.
