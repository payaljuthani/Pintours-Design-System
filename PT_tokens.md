# PinTours Design System — Claude Code Context

This file teaches Claude Code how to generate components that use PinTours design tokens correctly.
Every value in this codebase flows from `tokens/tokens.json` through Style Dictionary into three platform outputs.

---

## 1. Token Naming Conventions

All tokens share the prefix `pt-` and follow a hierarchy based on their role.

### Primitive tokens (internal use only)

| Layer | CSS variable | Swift | Android |
|---|---|---|---|
| Color palette | `--pt-color-{palette}-{shade}` | `PT.Color.{Palette}.c{shade}` | `@color/pt_color_{palette}_{shade}` |
| Typography scale | `--pt-typography-{device}-{style}-{prop}` | n/a (use TextStyles) | `@dimen/pt_typography_{device}_{style}_{prop}` |
| Spacing scale | `--pt-scale-{step}` | `PT.Scale.s{step}` | `@dimen/pt_scale_{step}` |
| Shadow effect | `--pt-shadow-{group}-{size}` | `PT.Shadow.{group}{Size}` | n/a (CSS-only) |
| Breakpoint | `--pt-breakpoint-{name}` | n/a | n/a |

Palette names: `green`, `teal`, `red`, `yellow`, `grey`.
Device prefixes: `large` (desktop ≥ 768 px), `small` (mobile).
Spacing steps: `0`, `1`–`20` (= 0–80 px in 4 px increments), plus named fractions `quat` (1 px), `half` (2 px), `3quat` (3 px), `1half` (6 px).

### Semantic tokens (use these in all components)

Semantic tokens are the stable public API. They automatically switch between light and dark values when `data-theme="dark"` is set on `<html>`.

Pattern: `--pt-semantic-{category}-{role}`

Categories: `typography`, `icon`, `surface`, `border`, `shadow`.

---

## 2. Complete Semantic Token Reference

### Typography colors

| Role | CSS | Swift | Android |
|---|---|---|---|
| headings | `--pt-semantic-typography-headings` | `PT.Semantic.Typography.headings` | `@color/pt_semantic_typography_headings` |
| body | `--pt-semantic-typography-body` | `PT.Semantic.Typography.body` | `@color/pt_semantic_typography_body` |
| body_secondary | `--pt-semantic-typography-body_secondary` | `PT.Semantic.Typography.bodySecondary` | `@color/pt_semantic_typography_body_secondary` |
| body_caption | `--pt-semantic-typography-body_caption` | `PT.Semantic.Typography.bodyCaption` | `@color/pt_semantic_typography_body_caption` |
| action | `--pt-semantic-typography-action` | `PT.Semantic.Typography.action` | `@color/pt_semantic_typography_action` |
| action_hover | `--pt-semantic-typography-action_hover` | `PT.Semantic.Typography.actionHover` | `@color/pt_semantic_typography_action_hover` |
| disabled | `--pt-semantic-typography-disabled` | `PT.Semantic.Typography.disabled` | `@color/pt_semantic_typography_disabled` |
| success | `--pt-semantic-typography-success` | `PT.Semantic.Typography.success` | `@color/pt_semantic_typography_success` |
| warning | `--pt-semantic-typography-warning` | `PT.Semantic.Typography.warning` | `@color/pt_semantic_typography_warning` |
| error | `--pt-semantic-typography-error` | `PT.Semantic.Typography.error` | `@color/pt_semantic_typography_error` |
| information | `--pt-semantic-typography-information` | `PT.Semantic.Typography.information` | `@color/pt_semantic_typography_information` |
| on_action | `--pt-semantic-typography-on_action` | `PT.Semantic.Typography.onAction` | `@color/pt_semantic_typography_on_action` |
| on_hover | `--pt-semantic-typography-on_hover` | `PT.Semantic.Typography.onHover` | `@color/pt_semantic_typography_on_hover` |
| on_disabled | `--pt-semantic-typography-on_disabled` | `PT.Semantic.Typography.onDisabled` | `@color/pt_semantic_typography_on_disabled` |

### Icon colors

Same roles as Typography, with `icon` category:
`--pt-semantic-icon-{role}` / `PT.Semantic.Icon.{camelRole}` / `@color/pt_semantic_icon_{role}`

### Surface colors

| Role | CSS | Swift | Android |
|---|---|---|---|
| page | `--pt-semantic-surface-page` | `PT.Semantic.Surface.page` | `@color/pt_semantic_surface_page` |
| page_90 | `--pt-semantic-surface-page_90` | `PT.Semantic.Surface.page90` | `@color/pt_semantic_surface_page_90` |
| card_primary | `--pt-semantic-surface-card_primary` | `PT.Semantic.Surface.cardPrimary` | `@color/pt_semantic_surface_card_primary` |
| card_85 | `--pt-semantic-surface-card_85` | `PT.Semantic.Surface.card85` | `@color/pt_semantic_surface_card_85` |
| action | `--pt-semantic-surface-action` | `PT.Semantic.Surface.action` | `@color/pt_semantic_surface_action` |
| action_hover | `--pt-semantic-surface-action_hover` | `PT.Semantic.Surface.actionHover` | `@color/pt_semantic_surface_action_hover` |
| negative | `--pt-semantic-surface-negative` | `PT.Semantic.Surface.negative` | `@color/pt_semantic_surface_negative` |
| negative_hover | `--pt-semantic-surface-negative_hover` | `PT.Semantic.Surface.negativeHover` | `@color/pt_semantic_surface_negative_hover` |
| information_core | `--pt-semantic-surface-information_core` | `PT.Semantic.Surface.informationCore` | `@color/pt_semantic_surface_information_core` |
| warning_core | `--pt-semantic-surface-warning_core` | `PT.Semantic.Surface.warningCore` | `@color/pt_semantic_surface_warning_core` |
| success | `--pt-semantic-surface-success` | `PT.Semantic.Surface.success` | `@color/pt_semantic_surface_success` |
| warning | `--pt-semantic-surface-warning` | `PT.Semantic.Surface.warning` | `@color/pt_semantic_surface_warning` |
| error | `--pt-semantic-surface-error` | `PT.Semantic.Surface.error` | `@color/pt_semantic_surface_error` |
| information | `--pt-semantic-surface-information` | `PT.Semantic.Surface.information` | `@color/pt_semantic_surface_information` |
| disabled | `--pt-semantic-surface-disabled` | `PT.Semantic.Surface.disabled` | `@color/pt_semantic_surface_disabled` |

### Border colors

Same roles as Surface, with `border` category:
`--pt-semantic-border-{role}` / `PT.Semantic.Border.{camelRole}` / `@color/pt_semantic_border_{role}`

Border-specific roles: `page`, `default`, `divider`, `card_primary`, `action`, `action_hover`, `negative`, `negative_hover`, `information_core`, `warning_core`, `success`, `warning`, `error`, `information`, `disabled`.

### Shadow tokens

**Shadow color primitives** (use via the effect tokens below, not directly):

| CSS | Light value | Dark value |
|---|---|---|
| `--pt-semantic-shadow` | `#cbd9dd` | `rgba(17,19,20,0.5)` |
| `--pt-semantic-shadow-normal` | `#a8c0c7` | `#111314` |

**Shadow effect tokens** — three groups, five sizes each. Use the CSS variable as a `box-shadow` value.

Pattern: `--pt-shadow-{group}-{size}` where group = `gradient` | `solid` | `bottom_sheet`, size = `xs` | `sm` | `md` | `lg` | `xl`.

| Group | Purpose | Example token |
|---|---|---|
| `gradient` | Soft blurred elevation (cards, modals) | `--pt-shadow-gradient-lg` |
| `solid` | Crisp bottom-edge depth (buttons, inputs) | `--pt-shadow-solid-md` |
| `bottom_sheet` | Upward shadow for bottom sheets / drawers | `--pt-shadow-bottom_sheet-lg` |

Resolved light-mode values:

| Token | Value |
|---|---|
| `--pt-shadow-gradient-xs` | `0px 2px 4px 0px #a8c0c7` |
| `--pt-shadow-gradient-sm` | `0px 3px 6px 0px #a8c0c7` |
| `--pt-shadow-gradient-md` | `0px 6px 12px 0px #a8c0c7, 0px 6px 12px 0px #cbd9dd` |
| `--pt-shadow-gradient-lg` | `0px 12px 32px 0px #cbd9dd, 0px 8px 16px 0px #a8c0c7` |
| `--pt-shadow-gradient-xl` | `0px 32px 48px 0px #cbd9dd, 0px 16px 24px 0px #a8c0c7` |
| `--pt-shadow-solid-xs` | `0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` |
| `--pt-shadow-solid-sm` | `0px 4px 0px 0px #a8c0c7, 0px 0px 6px 0px #cbd9dd` |
| `--pt-shadow-solid-md` | `0px 6px 0px 0px #a8c0c7, 0px 0px 8px 0px #cbd9dd` |
| `--pt-shadow-solid-lg` | `0px 8px 0px 0px #a8c0c7, 0px 0px 12px 0px #cbd9dd` |
| `--pt-shadow-solid-xl` | `0px 12px 0px 0px #a8c0c7, 0px 0px 16px 0px #cbd9dd` |
| `--pt-shadow-bottom_sheet-xs` | `0px -2px 4px 0px #a8c0c7` |
| `--pt-shadow-bottom_sheet-sm` | `0px -3px 6px 0px #a8c0c7` |
| `--pt-shadow-bottom_sheet-md` | `0px -3px 20px 0px #a8c0c7, 0px -6px 12px 0px #cbd9dd` |
| `--pt-shadow-bottom_sheet-lg` | `0px -8px 24px 0px #a8c0c7, 0px -12px 40px 0px #cbd9dd` |
| `--pt-shadow-bottom_sheet-xl` | `0px -12px 32px 0px #a8c0c7, 0px -24px 48px 0px #cbd9dd` |

### Spacing scale

| Token | CSS | Swift | Android | Value |
|---|---|---|---|---|
| scale.0 | `--pt-scale-0` | `PT.Scale.s0` | `@dimen/pt_scale_0` | 0 px |
| scale.quat | `--pt-scale-quat` | `PT.Scale.squat` | `@dimen/pt_scale_quat` | 1 px |
| scale.half | `--pt-scale-half` | `PT.Scale.shalf` | `@dimen/pt_scale_half` | 2 px |
| scale.3quat | `--pt-scale-3quat` | `PT.Scale.s3quat` | `@dimen/pt_scale_3quat` | 3 px |
| scale.1 | `--pt-scale-1` | `PT.Scale.s1` | `@dimen/pt_scale_1` | 4 px |
| scale.1half | `--pt-scale-1half` | `PT.Scale.s1half` | `@dimen/pt_scale_1half` | 6 px |
| scale.2 | `--pt-scale-2` | `PT.Scale.s2` | `@dimen/pt_scale_2` | 8 px |
| scale.3 | `--pt-scale-3` | `PT.Scale.s3` | `@dimen/pt_scale_3` | 12 px |
| scale.4 | `--pt-scale-4` | `PT.Scale.s4` | `@dimen/pt_scale_4` | 16 px |
| scale.5 | `--pt-scale-5` | `PT.Scale.s5` | `@dimen/pt_scale_5` | 20 px |
| scale.6 | `--pt-scale-6` | `PT.Scale.s6` | `@dimen/pt_scale_6` | 24 px |
| scale.7 | `--pt-scale-7` | `PT.Scale.s7` | `@dimen/pt_scale_7` | 28 px |
| scale.8 | `--pt-scale-8` | `PT.Scale.s8` | `@dimen/pt_scale_8` | 32 px |
| scale.9 | `--pt-scale-9` | `PT.Scale.s9` | `@dimen/pt_scale_9` | 36 px |
| scale.10 | `--pt-scale-10` | `PT.Scale.s10` | `@dimen/pt_scale_10` | 40 px |
| scale.11 | `--pt-scale-11` | `PT.Scale.s11` | `@dimen/pt_scale_11` | 44 px |
| scale.12 | `--pt-scale-12` | `PT.Scale.s12` | `@dimen/pt_scale_12` | 48 px |
| scale.13–20 | `--pt-scale-{n}` | `PT.Scale.s{n}` | `@dimen/pt_scale_{n}` | 52–80 px |

### Typography primitive tokens (for custom text styling only)

Font family: `--pt-typography-font_family-primary` = `Poppins`

Font weights: `--pt-typography-font_weight-{name}` where name is `extra_light` (300), `light` (400), `regular` (500), `medium` (600), `semibold` (700), `bold` (800).

Heading sizes follow `--pt-typography-{device}-{style}-{prop}` where device = `large` or `small`, style = `display1`–`display3` or `h1`–`h6`, prop = `font_size` or `line_height`.

Body sizes follow `--pt-typography-body-{size}-{prop}` where size = `xs`, `sm`, `default`, `lg`.

---

## 3. Figma-to-Token Mapping

When reading a Figma design, map fill and style names to tokens as follows:

| Figma fill / style name | CSS token | Swift | Android |
|---|---|---|---|
| Surface/Page | `--pt-semantic-surface-page` | `PT.Semantic.Surface.page` | `@color/pt_semantic_surface_page` |
| Surface/Card Primary | `--pt-semantic-surface-card_primary` | `PT.Semantic.Surface.cardPrimary` | `@color/pt_semantic_surface_card_primary` |
| Surface/Action | `--pt-semantic-surface-action` | `PT.Semantic.Surface.action` | `@color/pt_semantic_surface_action` |
| Surface/Action Hover | `--pt-semantic-surface-action_hover` | `PT.Semantic.Surface.actionHover` | `@color/pt_semantic_surface_action_hover` |
| Surface/Negative | `--pt-semantic-surface-negative` | `PT.Semantic.Surface.negative` | `@color/pt_semantic_surface_negative` |
| Surface/Success | `--pt-semantic-surface-success` | `PT.Semantic.Surface.success` | `@color/pt_semantic_surface_success` |
| Surface/Warning | `--pt-semantic-surface-warning` | `PT.Semantic.Surface.warning` | `@color/pt_semantic_surface_warning` |
| Surface/Error | `--pt-semantic-surface-error` | `PT.Semantic.Surface.error` | `@color/pt_semantic_surface_error` |
| Surface/Information | `--pt-semantic-surface-information` | `PT.Semantic.Surface.information` | `@color/pt_semantic_surface_information` |
| Surface/Disabled | `--pt-semantic-surface-disabled` | `PT.Semantic.Surface.disabled` | `@color/pt_semantic_surface_disabled` |
| Typography/Headings | `--pt-semantic-typography-headings` | `PT.Semantic.Typography.headings` | `@color/pt_semantic_typography_headings` |
| Typography/Body | `--pt-semantic-typography-body` | `PT.Semantic.Typography.body` | `@color/pt_semantic_typography_body` |
| Typography/Body Secondary | `--pt-semantic-typography-body_secondary` | `PT.Semantic.Typography.bodySecondary` | `@color/pt_semantic_typography_body_secondary` |
| Typography/Action | `--pt-semantic-typography-action` | `PT.Semantic.Typography.action` | `@color/pt_semantic_typography_action` |
| Typography/On Action | `--pt-semantic-typography-on_action` | `PT.Semantic.Typography.onAction` | `@color/pt_semantic_typography_on_action` |
| Typography/Error | `--pt-semantic-typography-error` | `PT.Semantic.Typography.error` | `@color/pt_semantic_typography_error` |
| Border/Default | `--pt-semantic-border-default` | `PT.Semantic.Border.default` | `@color/pt_semantic_border_default` |
| Border/Divider | `--pt-semantic-border-divider` | `PT.Semantic.Border.divider` | `@color/pt_semantic_border_divider` |
| Border/Action | `--pt-semantic-border-action` | `PT.Semantic.Border.action` | `@color/pt_semantic_border_action` |
| Border/Error | `--pt-semantic-border-error` | `PT.Semantic.Border.error` | `@color/pt_semantic_border_error` |
| Icon/Action | `--pt-semantic-icon-action` | `PT.Semantic.Icon.action` | `@color/pt_semantic_icon_action` |
| Shadow/Gradient/Xs | `--pt-shadow-gradient-xs` | n/a | n/a |
| Shadow/Gradient/Sm | `--pt-shadow-gradient-sm` | n/a | n/a |
| Shadow/Gradient/Md | `--pt-shadow-gradient-md` | n/a | n/a |
| Shadow/Gradient/Lg | `--pt-shadow-gradient-lg` | n/a | n/a |
| Shadow/Gradient/Xl | `--pt-shadow-gradient-xl` | n/a | n/a |
| Shadow/Solid/Xs | `--pt-shadow-solid-xs` | n/a | n/a |
| Shadow/Solid/Md | `--pt-shadow-solid-md` | n/a | n/a |
| Shadow/Solid/Lg | `--pt-shadow-solid-lg` | n/a | n/a |
| Shadow/Bottom_sheet/Lg | `--pt-shadow-bottom_sheet-lg` | n/a | n/a |
| Green/500 | `--pt-color-green-500` | `PT.Color.Green.c500` | `@color/pt_color_green_500` |
| Teal/500 | `--pt-color-teal-500` | `PT.Color.Teal.c500` | `@color/pt_color_teal_500` |

**Rule:** If a Figma fill matches a semantic token name, always use the semantic token. Only use primitive `--pt-color-*` tokens if there is genuinely no semantic token that applies (rare).

---

## 4. Usage Rules & Anti-Patterns

### Colors

✅ Always use semantic tokens in component styles:
```css
.btn-primary {
  background: var(--pt-semantic-surface-action);
  color: var(--pt-semantic-typography-on_action);
  border: 1px solid var(--pt-semantic-border-action);
}
```

✅ Dark mode is automatic — no extra code needed in components:
```css
/* This already works in both modes — the CSS file handles it */
.card { background: var(--pt-semantic-surface-card_primary); }
```

❌ Never hardcode hex values:
```css
/* WRONG */
.btn { background: #5d9c4d; color: #ffffff; }
```

❌ Never use primitive tokens directly in components:
```css
/* WRONG — primitives are only for defining semantic tokens */
.btn { background: var(--pt-color-green-500); }
```

### Spacing

✅ Use scale tokens for all spacing:
```css
.card { padding: var(--pt-scale-6); gap: var(--pt-scale-4); }
```

❌ Never hardcode px values for spacing:
```css
/* WRONG */
.card { padding: 24px; gap: 16px; }
```

### Typography

✅ Use text-style utility classes (requires `text-styles.css`):
```html
<!-- Responsive — auto-switches at 768px breakpoint -->
<h1 class="pt-text-style-h1-regular">Heading</h1>

<!-- Explicit device size -->
<h1 class="pt-text-style-large-h1-regular">Desktop Heading</h1>
<h1 class="pt-text-style-small-h1-regular">Mobile Heading</h1>
```

Weight variants: `regular` (500), `emphasis` (700), `thin` (300).
Scale keys: `display1`, `display2`, `display3`, `h1`–`h6`, `body-lg`, `body-default`, `body-sm`, `body-xs`.

✅ iOS — use PTTextStyle structs:
```swift
// Adaptive (recommended for display/h1–h4 which differ between large and small)
let style: PTTextStyle = traitCollection.horizontalSizeClass == .regular
    ? PT.TextStyle.Large.h1Regular
    : PT.TextStyle.Small.h1Regular
label.attributedText = NSAttributedString(
    string: label.text ?? "",
    attributes: style.attributes()
)
```

✅ Android — use TextAppearance styles:
```xml
<TextView android:textAppearance="@style/PT.TextStyle.Large.H1.Regular" />
```

❌ Never hardcode font sizes or weights:
```css
/* WRONG */
.heading { font-size: 60px; font-weight: 700; }
```

### Icons

**Library: [Tabler Icons](https://tabler-icons.io)** (MIT-licensed, 6,000+ icons, outline + filled variants). This is the icon set for all PinTours components — Figma's own icon slots are currently placeholders (a generic "diamond" shape, see each component's Tokens/Icon notes in `PT_components.md`) and are not themselves Tabler icons. This section exists so that once a real icon is chosen, the codegen agent can resolve it to the correct import without guessing.

**Package:** `@tabler/icons-react` — `npm install @tabler/icons-react` (tree-shakable, each icon is its own component).

✅ Do — import by exact component name:
```tsx
import { IconChevronLeft } from '@tabler/icons-react';

<IconChevronLeft size={20} stroke={1.75} style={{ color: 'var(--pt-semantic-icon-action)' }} />
```

❌ Don't — guess an icon name, invent a plausible-sounding one, or import from a different icon package (e.g. `lucide-react`, `react-icons`) even if the shape looks similar. If the exact Tabler name isn't known, treat the icon as a required `ReactNode` prop the consumer supplies (this is already how every component in `PT_components.md` documents its icon slot) rather than hardcoding a guess.

**Naming convention — how to go from a Tabler icon to its React import:** Tabler's own site (tabler-icons.io) lists icons in kebab-case (e.g. `chevron-left`, `alert-triangle`). The React import name is always `Icon` + PascalCase of that slug (`chevron-left` → `IconChevronLeft`). A filled variant, where one exists, adds a `Filled` suffix (`IconChevronLeftFilled`) — outline is the default with no suffix. This transform is mechanical; do not deviate from it.

**Bridging Figma → Tabler (process for future components):** when a real icon replaces a Figma placeholder, name the Figma instance-swap layer with the exact Tabler slug in kebab-case (e.g. rename the swap instance to `chevron-left`, not "diamond" or a free-text description). That way, a future `get_design_context`/`get_metadata` pull surfaces the real slug directly, the import name is derived mechanically per the rule above, and nothing needs to be guessed or re-confirmed later. Until a component's Figma layer is renamed this way, its icon stays documented as an unresolved `ReactNode` slot, same as today.

**Props (from Tabler's own docs):**

| Prop | Type | Default | PinTours usage |
|---|---|---|---|
| `size` | `number` | `24` | Always pass explicitly — map from the component's size using the table below. Never rely on Tabler's default. |
| `stroke` | `number` | `2` | Always pass explicitly — Tabler's default (`2`) only matches the PinTours scale at the `24` size step; every other size needs a different stroke value (see below). Never rely on Tabler's default. |
| `color` | `string` | `currentColor` | Leave at the Tabler default and set actual color via a wrapping element's `color`/CSS, using the component's `--pt-semantic-icon-*` token (per each component's own Tokens table in `PT_components.md`) — do not pass a raw hex to `color`. |

**`size`/`stroke` mapping to the existing icon scale (§7.3 above — these tokens already exist, this just maps them onto Tabler's prop API):**

| PinTours icon size | `size` prop | `stroke` prop (from `--pt-icon-stroke_weight-*`) |
|---|---|---|
| `--pt-icon-size-12` | `12` | `1` |
| `--pt-icon-size-16` | `16` | `1.5` |
| `--pt-icon-size-20` | `20` | `1.75` |
| `--pt-icon-size-24` | `24` | `2` (= Tabler's own default, the one size where omitting `stroke` would coincidentally match — still pass it explicitly for consistency) |
| `--pt-icon-size-32` | `32` | `2.5` |

⚠️ **CONFIRM with tech lead:** the exact mechanism for applying `color` (inline `style`, a CSS class, `currentColor` inheritance from a parent with `color` already set, or a styled-component/Tailwind wrapper) — this depends on the codebase's styling approach and isn't a Tabler or Figma question.

### iOS (UIKit) — layout and color usage

Use `PT` tokens everywhere in UIKit layout code. Never use hardcoded hex values, `.systemBackground`, or raw pixel constants.

```swift
// ✅ Correct — floating card with PT tokens
private func setupFloatingCard() {
    floatingCardContainer = UIView()
    floatingCardContainer.translatesAutoresizingMaskIntoConstraints = false
    floatingCardContainer.backgroundColor     = PT.Semantic.Surface.cardPrimary
    floatingCardContainer.layer.cornerRadius  = PT.Scale.s4          // 16px
    floatingCardContainer.layer.shadowColor   = PT.Semantic.Shadow.shadow.cgColor
    floatingCardContainer.layer.shadowOffset  = CGSize(width: 0, height: PT.Scale.s1)  // 4px
    floatingCardContainer.layer.shadowOpacity = 0.15
    floatingCardContainer.layer.shadowRadius  = PT.Scale.s3          // 12px
    view.addSubview(floatingCardContainer)

    NSLayoutConstraint.activate([
        floatingCardContainer.leadingAnchor.constraint(
            equalTo: view.leadingAnchor, constant: PT.Scale.s5),     // 20px
        floatingCardContainer.trailingAnchor.constraint(
            equalTo: view.trailingAnchor, constant: -PT.Scale.s5),
        floatingCardContainer.bottomAnchor.constraint(
            equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -PT.Scale.s5),
    ])
}

// ✅ Correct — text and icon colors
label.textColor       = PT.Semantic.Typography.headings
captionLabel.textColor = PT.Semantic.Typography.bodyCaption
button.backgroundColor = PT.Semantic.Surface.action
button.tintColor       = PT.Semantic.Icon.onAction
divider.backgroundColor = PT.Semantic.Border.divider
```

```swift
// ❌ Wrong — hardcoded values
view.backgroundColor     = .systemBackground      // use PT.Semantic.Surface.page
layer.cornerRadius       = 16                     // use PT.Scale.s4
layer.shadowColor        = UIColor.black.cgColor  // use PT.Semantic.Shadow.shadow.cgColor
label.textColor          = UIColor(hex: "#222628") // use PT.Semantic.Typography.headings
```

### Android (Jetpack Compose) — PTTheme and token usage

Import `PTTheme.kt` from `build/android/compose/`. Wrap every screen in `PTTheme` and access colors through `MaterialTheme.ptColors`.

```kotlin
// ✅ Correct — app root wraps in PTTheme
setContent {
    PTTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color    = MaterialTheme.colorScheme.background  // resolves to surfacePage
        ) {
            // screen content
        }
    }
}

// ✅ Correct — composable using PT tokens for color, spacing, and text
@Composable
private fun FloatingCard(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = MaterialTheme.ptColors

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(
                color  = colors.surfaceCardPrimary,
                shape  = RoundedCornerShape(PTDimens.s4)  // 16.dp
            )
            .shadow(elevation = PTDimens.s2)              // 8.dp
    ) {
        Column(modifier = Modifier.padding(PTDimens.s4)) {
            Text(
                text  = "Heading",
                style = PTTextStyles.smallH1Regular,
                color = colors.typographyHeadings,
            )
            Text(
                text  = "Body copy",
                style = PTTextStyles.smallBodyDefaultRegular,
                color = colors.typographyBody,
            )
        }
        IconButton(
            onClick   = onDismiss,
            modifier  = Modifier.align(Alignment.TopStart).padding(PTDimens.s4)
        ) {
            Icon(
                imageVector        = Icons.Default.Close,
                contentDescription = "Close",
                tint               = colors.iconHeadings,
            )
        }
    }
}
```

```kotlin
// ❌ Wrong — hardcoded values
Box(modifier = Modifier.background(Color.White))     // use colors.surfaceCardPrimary
RoundedCornerShape(16.dp)                            // use PTDimens.s4
Text(color = Color(0xFF222628))                      // use colors.typographyHeadings
```

### Android (XML) — color and dimen token usage

Always reference token resources — never hardcode `dp` values or hex colors inline.

```xml
<!-- ✅ Correct — CardView using token resources -->
<androidx.cardview.widget.CardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:cardCornerRadius="@dimen/pt_scale_4"
    app:cardElevation="@dimen/pt_scale_2"
    app:cardBackgroundColor="@color/pt_semantic_surface_card_primary">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="@dimen/pt_scale_4">

        <TextView
            android:id="@+id/tvNavDistance"
            android:layout_width="wrap_content"
            android:textColor="@color/pt_semantic_typography_headings"
            android:textAppearance="@style/PT.TextStyle.Small.H2.Emphasis" />

        <TextView
            android:id="@+id/tvNavInstruction"
            android:layout_width="0dp"
            android:layout_weight="1"
            android:textColor="@color/pt_semantic_typography_body"
            android:textAppearance="@style/PT.TextStyle.Small.BodyDefault.Regular" />
    </LinearLayout>
</androidx.cardview.widget.CardView>
```

```xml
<!-- ❌ Wrong — hardcoded values -->
<View app:cardCornerRadius="16dp"           />  <!-- use @dimen/pt_scale_4 -->
<View android:background="#ffffff"         />  <!-- use @color/pt_semantic_surface_card_primary -->
<TextView android:textColor="#1C1C1E"      />  <!-- use @color/pt_semantic_typography_headings -->
<TextView android:textSize="26sp"          />  <!-- use @style/PT.TextStyle.* -->
```

---

## 5. Build Commands & Workflow

```bash
npm install            # first-time setup (Node ≥ 18 required)

npm run validate       # check tokens.json for naming, refs, and dark coverage
npm run build          # validate → regenerate all platform output files
npm run diff           # CI guard: fails if build/ is stale after a token edit

npm run docs:dev       # start Vite token reference at http://localhost:3333
npm run docs:build     # build static docs site → docs/dist/
```

### Adding or changing a token

1. Edit `tokens/tokens.json` (single source of truth — never edit `build/` files directly)
2. Run `npm run build`
3. Commit `tokens/tokens.json`, all files in `build/`, and `.build-hash`

### File structure

```
tokens/tokens.json              ← edit here only
build/web/variables.css         ← import in any web project
build/web/text-styles.css       ← utility classes for typography
build/ios/Tokens.swift          ← PT namespace with dynamic colors
build/ios/TextStyles.swift      ← PTTextStyle structs
build/android/values/           ← XML resources (light + typography)
build/android/values-night/     ← XML resources (dark overrides)
build/android/compose/PTTheme.kt ← Jetpack Compose theme, palette, dimens, text styles
docs/                           ← token reference gallery (Vite)
```

---

## 6. Resolved Token Values (Light Mode Reference)

> This section is a **curated, button-relevant quick reference**. For the **complete, exhaustive list of every token** (all 60 colors, full type scale, breakpoints, icon sizes, and all 139 semantic tokens with light + dark resolved values), see **Section 7** below — it is generated directly from `primitives.json` + `semantic.json` and is the authoritative in-document source.

Primitive palette values:

| Token | Value |
|---|---|
| `--pt-color-green-500` | `#5d9c4d` |
| `--pt-color-green-400` | `#7db071` |
| `--pt-color-green-600` | `#4a7d3e` |
| `--pt-color-teal-500` | `#009bc8` |
| `--pt-color-red-500` | `#d64545` |
| `--pt-color-yellow-500` | `#f4b740` |
| `--pt-color-grey-25` | `#fbfcfc` |
| `--pt-color-grey-50` | `#f6f9f9` |
| `--pt-color-grey-75` | `#f2f6f7` |
| `--pt-color-grey-100` | `#eef2f4` |
| `--pt-color-grey-200` | `#dce6e9` |
| `--pt-color-grey-300` | `#cbd9dd` |
| `--pt-color-grey-400` | `#b9cdd2` |
| `--pt-color-grey-500` | `#a8c0c7` |
| `--pt-color-grey-600` | `#869a9f` |
| `--pt-color-grey-700` | `#657377` |
| `--pt-color-grey-800` | `#434d50` |
| `--pt-color-grey-850` | `#323a3c` |
| `--pt-color-grey-900` | `#222628` |
| `--pt-color-grey-1000` | `#111314` |
| `--pt-color-teal-600` | `#007ca0` |

> **Complete palette:** the full primitive scales — `green`, `teal`, `red`, `yellow`, `grey` (60 values, ~11–14 shades each) — are defined in `tokens/primitives.json`, which is the actual source Style Dictionary builds from. The table above is a curated, button-relevant subset. When in doubt, read `primitives.json`. Note `#a8c0c7` = `grey-500` (disabled surface/border, divider, shadow-normal) and `#869a9f` = `grey-600` (body-caption / disabled label).

### Figma palette-name mapping

Figma names its primitive color families semantically; the code tokens rename them. When reading a Figma variable like `Primary/400`, translate the family before looking up the `--pt-color-*` token:

| Figma family | Code primitive prefix | Notes |
|---|---|---|
| `Primary` | `green` | e.g. `Primary/400` → `--pt-color-green-400` (`#7db071`), `Primary/500 (Core)` → `--pt-color-green-500` (`#5d9c4d`), `Primary/600` → `--pt-color-green-600` (`#4a7d3e`) |
| `Secondary` | `teal` | `Secondary/500 (Core)` → `--pt-color-teal-500` (`#009bc8`) |
| `Error` | `red` | `Error/500 (Core)` → `--pt-color-red-500` (`#d64545`) |
| `Warning` | `yellow` | `Warning/500 (Core)` → `--pt-color-yellow-500` (`#f4b740`) |
| `Neutral` | `grey` | `Neutral/75` → `--pt-color-grey-75` (`#f2f6f7`), `Neutral/900` → `--pt-color-grey-900` |
| `Success` | `green` | Shares the brand green — `Success/500 (Core)` = `Primary/500 (Core)` = `#5d9c4d` |
| `Information` | `teal` | `Information/500 (Core)` = `Secondary/500 (Core)` = `#009bc8`; `Information/600` → `--pt-color-teal-600` (`#007ca0`) |

### Gradient tokens (Figma `Gradient` collection)

The Figma `Gradient` collection holds six named gradient tokens: `Default`, `Hover`, `Card_top shadow`, `Card_bottom shadow`, `Background_Layer1`, `Background_Layer2`. Each stop references a primitive that already exists in `primitives.json` — nothing is untokenized. The Button uses `Default` and `Hover`:

| Gradient token | Direction | Stop 1 (Figma → code) | Stop 2 (Figma → code) |
|---|---|---|---|
| `Gradient/Default` | left → right | `Primary/400` → `--pt-color-green-400` (`#7db071`) | `Secondary/500 (Core)` → `--pt-color-teal-500` (`#009bc8`) |
| `Gradient/Hover` | left → right | `Success/500 (Core)` → `--pt-color-green-500` (`#5d9c4d`) | `Information/600` → `--pt-color-teal-600` (`#007ca0`) |

`Card_top shadow`, `Card_bottom shadow`, `Background_Layer1`, `Background_Layer2` are not used by Button (stop values not documented here). Gradient **direction/angle** is not exposed as a token — treat as horizontal (`linear-gradient(to right, …)`). Because these gradients reference primitives, `§4` (no primitives in components) is satisfied only if the component consumes the **gradient token** (`Gradient/Default` / `Gradient/Hover`), not the individual stop primitives.

Key semantic values (light mode):

| Token | Light | Dark |
|---|---|---|
| `--pt-semantic-surface-action` | `#5d9c4d` | `#7db071` |
| `--pt-semantic-surface-page` | `#f2f6f7` | `#222628` |
| `--pt-semantic-surface-card_primary` | `#ffffff` | `#323a3c` |
| `--pt-semantic-surface-negative` | `#d64545` | `#d64545` |
| `--pt-semantic-typography-headings` | `#222628` | `#f2f6f7` |
| `--pt-semantic-typography-body` | `#222628` | `#f2f6f7` |
| `--pt-semantic-typography-action` | `#5d9c4d` | `#7db071` |
| `--pt-semantic-typography-on_action` | `#ffffff` | `#000000` |
| `--pt-semantic-border-default` | `#222628` | `#f2f6f7` |
| `--pt-semantic-border-divider` | `#a8c0c7` | `#657377` |
| `--pt-shadow-gradient-lg` | `0px 12px 32px 0px #cbd9dd, 0px 8px 16px 0px #a8c0c7` | same |

---

## 7. Complete Token Reference (every token — verified)

This section is the **exhaustive, self-contained** token list. It is generated from the two source files (`tokens/primitives.json`, `tokens/semantic.json`) and every value has been cross-checked against the Figma design system file. It exists so this Markdown file + `PT_components.md` are a complete handover with **no dependency on the JSON**.

Coverage: **178 primitive tokens + 139 semantic tokens = 317 total.** Every semantic token shows its primitive reference and the resolved hex for both light and dark themes.

> **2026-07-20 update:** 4 primitives added — `Overlay/Shadow_0`, `Overlay/Shadow_100` (§7.10) and `Opacity/50`, `Opacity/85` (§7.11) — formalized per your confirmation while documenting the Card family and Super Icon. Previously flagged as undocumented/unconfirmed token gaps in `PT_components.md`; now real, named tokens. Count updated from 310 → 314 (171→175 primitives) throughout this file.
>
> **2026-07-21 update:** 3 more primitives resolved and added — `Opacity/65` (§7.11) and `Gradient/Background_Layer1`/`Background_Layer2`'s stop compositions (§7.9), surfaced while documenting Top Anchor Nav's `AI Mode` preset. `Background_Layer1`/`Background_Layer2` were previously *named* in this file's Gradient tokens section but marked "not used, stops not documented" — now resolved for the first time. Count updated from 314 → 317 (175→178 primitives).

### ⚠️ Source discrepancy (JSON vs Figma) — one item to reconcile

- `typography/body/sm/line_height`: **Figma = 20**, but `primitives.json` = **24**. Confirmed twice against Figma — the Button's Small variant renders a 20px label line-height, and the Figma **Text styles** panel lists `Body Regular / Small · 14/20`. **Figma is the source of truth → use 20px.** The JSON's `24` is stale and should be fixed at source. Every other value sampled against Figma matches exactly, including the full Body scale (Default 16/24, Large 20/28, XSmall 12/16) and the Heading scale (H1 60/72 … H6 20/24 = the `large` device scale).

### 7.1 Primitive colors (all 60)

| Token | Value |
|---|---|
| `--pt-color-white` | `#ffffff` |
| `--pt-color-black` | `#000000` |
| `--pt-color-green-50` | `#eff5ed` |
| `--pt-color-green-100` | `#dfebdb` |
| `--pt-color-green-200` | `#bed7b8` |
| `--pt-color-green-300` | `#9ec494` |
| `--pt-color-green-400` | `#7db071` |
| `--pt-color-green-500` | `#5d9c4d` |
| `--pt-color-green-600` | `#4a7d3e` |
| `--pt-color-green-700` | `#385e2e` |
| `--pt-color-green-800` | `#253e1f` |
| `--pt-color-green-900` | `#131f0f` |
| `--pt-color-green-1000` | `#091008` |
| `--pt-color-teal-50` | `#e5f5f9` |
| `--pt-color-teal-100` | `#ccebf4` |
| `--pt-color-teal-200` | `#99d7e9` |
| `--pt-color-teal-300` | `#66c3de` |
| `--pt-color-teal-400` | `#33afd3` |
| `--pt-color-teal-500` | `#009bc8` |
| `--pt-color-teal-600` | `#007ca0` |
| `--pt-color-teal-700` | `#005d78` |
| `--pt-color-teal-800` | `#003e50` |
| `--pt-color-teal-900` | `#001f28` |
| `--pt-color-teal-1000` | `#001014` |
| `--pt-color-red-50` | `#fbecec` |
| `--pt-color-red-100` | `#f7dada` |
| `--pt-color-red-200` | `#efb5b5` |
| `--pt-color-red-300` | `#e68f8f` |
| `--pt-color-red-400` | `#de6a6a` |
| `--pt-color-red-500` | `#d64545` |
| `--pt-color-red-600` | `#ab3737` |
| `--pt-color-red-700` | `#802929` |
| `--pt-color-red-800` | `#561c1c` |
| `--pt-color-red-900` | `#2b0e0e` |
| `--pt-color-red-1000` | `#150707` |
| `--pt-color-yellow-50` | `#fef8ec` |
| `--pt-color-yellow-100` | `#fdf1d9` |
| `--pt-color-yellow-200` | `#fbe2b3` |
| `--pt-color-yellow-300` | `#f8d48c` |
| `--pt-color-yellow-400` | `#f6c566` |
| `--pt-color-yellow-500` | `#f4b740` |
| `--pt-color-yellow-600` | `#c39233` |
| `--pt-color-yellow-700` | `#926e26` |
| `--pt-color-yellow-800` | `#62491a` |
| `--pt-color-yellow-900` | `#31250d` |
| `--pt-color-yellow-1000` | `#181206` |
| `--pt-color-grey-25` | `#fbfcfc` |
| `--pt-color-grey-50` | `#f6f9f9` |
| `--pt-color-grey-75` | `#f2f6f7` |
| `--pt-color-grey-100` | `#eef2f4` |
| `--pt-color-grey-200` | `#dce6e9` |
| `--pt-color-grey-300` | `#cbd9dd` |
| `--pt-color-grey-400` | `#b9cdd2` |
| `--pt-color-grey-500` | `#a8c0c7` |
| `--pt-color-grey-600` | `#869a9f` |
| `--pt-color-grey-700` | `#657377` |
| `--pt-color-grey-800` | `#434d50` |
| `--pt-color-grey-850` | `#323a3c` |
| `--pt-color-grey-900` | `#222628` |
| `--pt-color-grey-1000` | `#111314` |

### 7.2 Typography primitives

Font family: `--pt-typography-font_family-primary` = `Poppins`

| Weight token | Value |
|---|---|
| `--pt-typography-font_weight-extra_light` | `300` |
| `--pt-typography-font_weight-light` | `400` |
| `--pt-typography-font_weight-regular` | `500` |
| `--pt-typography-font_weight-medium` | `600` |
| `--pt-typography-font_weight-semibold` | `700` |
| `--pt-typography-font_weight-bold` | `800` |

**Large type scale** — `--pt-typography-large-{style}-{prop}`

| Style | font_size | line_height | paragraph_spacing |
|---|---|---|---|
| display1 | 120 | 136 | 84 |
| display2 | 96 | 108 | 72 |
| display3 | 76 | 92 | 60 |
| h1 | 60 | 72 | 48 |
| h2 | 48 | 56 | 40 |
| h3 | 40 | 48 | 36 |
| h4 | 32 | 40 | 28 |
| h5 | 24 | 28 | 20 |
| h6 | 20 | 24 | 16 |

**Small type scale** — `--pt-typography-small-{style}-{prop}`

| Style | font_size | line_height | paragraph_spacing |
|---|---|---|---|
| display1 | 96 | 108 | 72 |
| display2 | 76 | 92 | 60 |
| display3 | 60 | 72 | 48 |
| h1 | 48 | 56 | 40 |
| h2 | 40 | 48 | 36 |
| h3 | 32 | 40 | 28 |
| h4 | 28 | 32 | 24 |
| h5 | 24 | 28 | 20 |
| h6 | 20 | 24 | 16 |

**Body type scale** — `--pt-typography-body-{size}-{prop}`

| Size | font_size | line_height | paragraph_spacing |
|---|---|---|---|
| xs | 12 | 16 | 12 |
| sm | 14 | **20** ✅ (Figma-correct; `primitives.json` has a stale `24` to fix at source) | 14 |
| default | 16 | 24 | 16 |
| lg | 20 | 28 | 20 |

### 7.3 Breakpoints, icon size & stroke weight

| Token | Value |
|---|---|
| `--pt-breakpoint-large` | `768` |
| `--pt-breakpoint-canvas_large` | `1440` |
| `--pt-breakpoint-canvas_small` | `440` |
| `--pt-icon-size-12` | `12` |
| `--pt-icon-size-16` | `16` |
| `--pt-icon-size-20` | `20` |
| `--pt-icon-size-24` | `24` |
| `--pt-icon-size-32` | `32` |
| `--pt-icon-stroke_weight-12` | `1` |
| `--pt-icon-stroke_weight-16` | `1.5` |
| `--pt-icon-stroke_weight-20` | `1.75` |
| `--pt-icon-stroke_weight-24` | `2` |
| `--pt-icon-stroke_weight-32` | `2.5` |

### 7.4 Semantic typography (light + dark)

| Role | Light → primitive | Light value | Dark → primitive | Dark value |
|---|---|---|---|---|
| `--pt-semantic-typography-headings` | grey-900 | `#222628` | grey-75 | `#f2f6f7` |
| `--pt-semantic-typography-body` | grey-900 | `#222628` | grey-75 | `#f2f6f7` |
| `--pt-semantic-typography-body_secondary` | grey-600 | `#869a9f` | grey-500 | `#a8c0c7` |
| `--pt-semantic-typography-body_caption` | grey-600 | `#869a9f` | grey-500 | `#a8c0c7` |
| `--pt-semantic-typography-action` | green-500 | `#5d9c4d` | green-400 | `#7db071` |
| `--pt-semantic-typography-action_hover` | green-600 | `#4a7d3e` | green-500 | `#5d9c4d` |
| `--pt-semantic-typography-disabled` | grey-100 | `#eef2f4` | grey-800 | `#434d50` |
| `--pt-semantic-typography-success` | green-700 | `#385e2e` | green-300 | `#9ec494` |
| `--pt-semantic-typography-warning` | yellow-800 | `#62491a` | yellow-300 | `#f8d48c` |
| `--pt-semantic-typography-error` | red-700 | `#802929` | red-300 | `#e68f8f` |
| `--pt-semantic-typography-information` | teal-700 | `#005d78` | teal-300 | `#66c3de` |
| `--pt-semantic-typography-on_action` | white | `#ffffff` | black | `#000000` |
| `--pt-semantic-typography-on_hover` | white | `#ffffff` | black | `#000000` |
| `--pt-semantic-typography-on_disabled` | grey-1000 | `#111314` | grey-50 | `#f6f9f9` |

### 7.5 Semantic icon (light + dark)

| Role | Light → primitive | Light value | Dark → primitive | Dark value |
|---|---|---|---|---|
| `--pt-semantic-icon-headings` | grey-900 | `#222628` | grey-75 | `#f2f6f7` |
| `--pt-semantic-icon-body` | grey-900 | `#222628` | grey-75 | `#f2f6f7` |
| `--pt-semantic-icon-body_secondary` | grey-600 | `#869a9f` | grey-500 | `#a8c0c7` |
| `--pt-semantic-icon-body_caption` | grey-600 | `#869a9f` | grey-500 | `#a8c0c7` |
| `--pt-semantic-icon-action` | green-500 | `#5d9c4d` | green-400 | `#7db071` |
| `--pt-semantic-icon-action_hover` | green-600 | `#4a7d3e` | green-500 | `#5d9c4d` |
| `--pt-semantic-icon-disabled` | grey-100 | `#eef2f4` | grey-800 | `#434d50` |
| `--pt-semantic-icon-success` | green-700 | `#385e2e` | green-300 | `#9ec494` |
| `--pt-semantic-icon-warning` | yellow-800 | `#62491a` | yellow-300 | `#f8d48c` |
| `--pt-semantic-icon-error` | red-700 | `#802929` | red-300 | `#e68f8f` |
| `--pt-semantic-icon-information` | teal-700 | `#005d78` | teal-300 | `#66c3de` |
| `--pt-semantic-icon-on_action` | white | `#ffffff` | black | `#000000` |
| `--pt-semantic-icon-on_hover` | white | `#ffffff` | black | `#000000` |
| `--pt-semantic-icon-on_disabled` | grey-1000 | `#111314` | grey-50 | `#f6f9f9` |

### 7.6 Semantic surface (light + dark)

| Role | Light → primitive | Light value | Dark → primitive | Dark value |
|---|---|---|---|---|
| `--pt-semantic-surface-page` | grey-75 | `#f2f6f7` | grey-900 | `#222628` |
| `--pt-semantic-surface-page_90` | rgba(242,246,247,0.9) | `rgba(242,246,247,0.9)` | rgba(34,38,40,0.9) | `rgba(34,38,40,0.9)` |
| `--pt-semantic-surface-card_primary` | white | `#ffffff` | grey-850 | `#323a3c` |
| `--pt-semantic-surface-card_85` | rgba(255,255,255,0.85) | `rgba(255,255,255,0.85)` | rgba(50,58,60,0.85) | `rgba(50,58,60,0.85)` |
| `--pt-semantic-surface-card_deep` | grey-200 | `#dce6e9` | grey-700 | `#657377` |
| `--pt-semantic-surface-action` | green-500 | `#5d9c4d` | green-400 | `#7db071` |
| `--pt-semantic-surface-action_hover` | green-600 | `#4a7d3e` | green-500 | `#5d9c4d` |
| `--pt-semantic-surface-negative` | red-500 | `#d64545` | red-500 | `#d64545` |
| `--pt-semantic-surface-negative_hover` | red-600 | `#ab3737` | red-600 | `#ab3737` |
| `--pt-semantic-surface-information_core` | teal-500 | `#009bc8` | teal-500 | `#009bc8` |
| `--pt-semantic-surface-warning_core` | yellow-500 | `#f4b740` | yellow-500 | `#f4b740` |
| `--pt-semantic-surface-success` | green-100 | `#dfebdb` | green-800 | `#253e1f` |
| `--pt-semantic-surface-warning` | yellow-100 | `#fdf1d9` | yellow-800 | `#62491a` |
| `--pt-semantic-surface-error` | red-100 | `#f7dada` | red-800 | `#561c1c` |
| `--pt-semantic-surface-information` | teal-100 | `#ccebf4` | teal-800 | `#003e50` |
| `--pt-semantic-surface-disabled` | grey-500 | `#a8c0c7` | grey-700 | `#657377` |

### 7.7 Semantic border (light + dark)

| Role | Light → primitive | Light value | Dark → primitive | Dark value |
|---|---|---|---|---|
| `--pt-semantic-border-page` | grey-50 | `#f6f9f9` | grey-900 | `#222628` |
| `--pt-semantic-border-default` | grey-900 | `#222628` | grey-75 | `#f2f6f7` |
| `--pt-semantic-border-divider` | grey-500 | `#a8c0c7` | grey-700 | `#657377` |
| `--pt-semantic-border-card_primary` | grey-500 | `#a8c0c7` | grey-700 | `#657377` |
| `--pt-semantic-border-action` | green-500 | `#5d9c4d` | green-400 | `#7db071` |
| `--pt-semantic-border-action_hover` | green-600 | `#4a7d3e` | green-500 | `#5d9c4d` |
| `--pt-semantic-border-negative` | red-500 | `#d64545` | red-500 | `#d64545` |
| `--pt-semantic-border-negative_hover` | red-600 | `#ab3737` | red-600 | `#ab3737` |
| `--pt-semantic-border-information_core` | teal-500 | `#009bc8` | teal-500 | `#009bc8` |
| `--pt-semantic-border-warning_core` | yellow-500 | `#f4b740` | yellow-500 | `#f4b740` |
| `--pt-semantic-border-success` | green-200 | `#bed7b8` | green-600 | `#4a7d3e` |
| `--pt-semantic-border-warning` | yellow-200 | `#fbe2b3` | yellow-600 | `#c39233` |
| `--pt-semantic-border-error` | red-200 | `#efb5b5` | red-600 | `#ab3737` |
| `--pt-semantic-border-information` | teal-200 | `#99d7e9` | teal-600 | `#007ca0` |
| `--pt-semantic-border-disabled` | grey-500 | `#a8c0c7` | grey-700 | `#657377` |

### 7.8 Semantic shadow colors

| Token | Light | Dark |
|---|---|---|
| `--pt-semantic-shadow-light` | `#cbd9dd` | `rgba(17,19,20,0.5)` |
| `--pt-semantic-shadow-normal` | `#a8c0c7` | `#111314` |

### 7.9 Gradient tokens

| Token | Stop 1 | Stop 2 |
|---|---|---|
| `--pt-gradient-default` | green-400 `#7db071` @ 0% | teal-500 `#009bc8` @ 100% |
| `--pt-gradient-hover` | green-500 `#5d9c4d` @ 0% | teal-600 `#007ca0` @ 100% |

**New 2026-07-21 — `Background_Layer1`/`Background_Layer2` resolved for the first time.** Section 6 originally listed these (plus `Card_top shadow`/`Card_bottom shadow`) as existing in Figma's `Gradient` collection but unused, with stops undocumented. Top Anchor Nav's `AI Mode` preset (see `PT_components.md`) is the first component to actually use them — background glow behind the "Ask anything" input pill. Unlike `Default`/`Hover` (linear, left→right), both are **conic gradients** (`from 90deg`), a new gradient shape for this token family. Attribution of which layer is `Background_Layer1` vs. `Background_Layer2` is inferred from generated-code layer order, not 100% pixel-confirmed against Figma's Fill panel — flagged with the same confidence caveat used elsewhere in this doc set (e.g. Card's divider).

| Token | Shape | Stops |
|---|---|---|
| `--pt-gradient-background-layer1` | Conic, from 90° | `Warning/200` (`#fbe2b3`) @ 0% → `Primary/200` (`#bed7b8`) @ 5.29% → `Neutral/75`/`Surface/Page` (`#f2f6f7`) @ 30.29% → same @ 53.37% → `Primary/100` (`#dfebdb`) @ 87.5% → `Secondary/100` (`#ccebf4`) @ 100% |
| `--pt-gradient-background-layer2` | Conic, from 90° | `Primary/100` (`#dfebdb`) @ 0% → `Primary/50` (`#eff5ed`) @ 50% → `Secondary/100` (`#ccebf4`) @ 100% |

`Card_top shadow`/`Card_bottom shadow` remain unused and undocumented — still open if a future component surfaces them.

> **Also confirmed 2026-07-21, directly against Figma's Fill/Stroke panel:** `--pt-gradient-default` isn't only used as a fill (Button, Progress bar) — it's also applied as a **1px inside stroke** on the `Background_Layer2` glow layer above. A generated-code artifact (Tailwind can't render a gradient border natively) had approximated this as a flat single-stop color, which initially looked like an unattributed/stray reference in `PT_components.md` until checked directly in Figma. Both glow layers' blur is a uniform **40px** (also confirmed directly in Figma — generated code had approximated this as two different values, `20px`/`30px`).

### 7.10 Overlay tokens

**New 2026-07-20** — formalized from Figma's `Overlay` variable collection, first surfaced on Card_image's gradient/flat photo-overlay treatments (`Shadow_top`/`Shadow_bottom`/`Shadow_overlay`). Fixed values, not theme-dependent (no dark-mode variant surfaced via MCP, same treatment as the Gradient tokens above).

| Token | Value | Notes |
|---|---|---|
| `--pt-overlay-shadow-0` | `#ffffff` (white) | The "clear"/light end of Card_image's gradient overlays. |
| `--pt-overlay-shadow-100` | `#657377` | The "dark"/tinted end of Card_image's gradient and flat overlays. Same hex as `grey-700`, but bound as its own distinct Figma variable (`Overlay/Shadow_100`), not an alias — kept as a separate token rather than merged into the grey scale. |

### 7.11 Opacity tokens

**New 2026-07-20** — formalized from Figma's `Opacity` variable collection. First seen on Super Icon (`Opacity/85`), confirmed a second value on Card_image's `Shadow_overlay` (`Opacity/50`). Both are percentage values applied directly to a layer's opacity, not a color.

> **2026-07-21 update:** a third value, `Opacity/65`, confirmed on Top Anchor Nav's `AI Mode` preset (see `PT_components.md`). Added below, per your direction.

| Token | Value | Used by |
|---|---|---|
| `--pt-opacity-50` | `50%` | Card_image's `Shadow_overlay` flat tint; also Top Anchor Nav's `Progress bar` base track. |
| `--pt-opacity-65` | `65%` | **New 2026-07-21.** Top Anchor Nav's `AI Mode` glow — the inner blur/glow layer's opacity, and the base mask rectangle behind both glow layers. |
| `--pt-opacity-85` | `85%` | Super Icon's `Default_square fill`/`Default_circle fill` background (also expressible via `--pt-semantic-surface-card_85`, which already bakes in the same 85% — see Super Icon's own token notes for that overlap). Also Top Anchor Nav's `AI Mode` back-button circle, which consumes `--pt-semantic-surface-card_85` the same way. |
