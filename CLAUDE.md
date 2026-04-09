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
| Shadow effect | `--pt-shadow-lg` | `PT.Shadow.lg` | `@style/pt_shadow_lg` |
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

| CSS | Swift | Android | Light value | Dark value |
|---|---|---|---|---|
| `--pt-semantic-shadow` | `PT.Semantic.Shadow.shadow` | `@color/pt_semantic_shadow` | `#dce6e9` | `rgba(17,19,20,0.5)` |
| `--pt-semantic-shadow-normal` | `PT.Semantic.Shadow.normal` | `@color/pt_semantic_shadow_normal` | `#b9cdd2` | `#111314` |
| `--pt-shadow-lg` | `PT.Shadow.lg` | `@style/pt_shadow_lg` | `0px 12px 32px 0px #dce6e9, 0px 8px 16px 0px #b9cdd2` | same |

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
| Elevation/Large | `--pt-shadow-lg` | `PT.Shadow.lg` | `@style/pt_shadow_lg` |
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

Primitive palette values:

| Token | Value |
|---|---|
| `--pt-color-green-500` | `#5d9c4d` |
| `--pt-color-green-400` | `#7db071` |
| `--pt-color-green-600` | `#4a7d3e` |
| `--pt-color-teal-500` | `#009bc8` |
| `--pt-color-red-500` | `#d64545` |
| `--pt-color-yellow-500` | `#f4b740` |
| `--pt-color-grey-50` | `#f6f9f9` |
| `--pt-color-grey-75` | `#f2f6f7` |
| `--pt-color-grey-900` | `#222628` |
| `--pt-color-grey-1000` | `#111314` |

Key semantic values (light mode):

| Token | Light | Dark |
|---|---|---|
| `--pt-semantic-surface-action` | `#5d9c4d` | `#7db071` |
| `--pt-semantic-surface-page` | `#f6f9f9` | `#222628` |
| `--pt-semantic-surface-card_primary` | `#ffffff` | `#323a3c` |
| `--pt-semantic-surface-negative` | `#d64545` | `#d64545` |
| `--pt-semantic-typography-headings` | `#222628` | `#f2f6f7` |
| `--pt-semantic-typography-body` | `#222628` | `#f2f6f7` |
| `--pt-semantic-typography-action` | `#5d9c4d` | `#7db071` |
| `--pt-semantic-typography-on_action` | `#ffffff` | `#000000` |
| `--pt-semantic-border-default` | `#222628` | `#f2f6f7` |
| `--pt-semantic-border-divider` | `#a8c0c7` | `#657377` |
| `--pt-shadow-lg` | `0px 12px 32px 0px #dce6e9, 0px 8px 16px 0px #b9cdd2` | same |
