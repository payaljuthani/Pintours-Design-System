# PinTours Component Specs

Single source of truth for PinTours components, for AI-assisted development (Cursor + Claude generating code from Figma). One component per top-level section; append new components below.

> **Token source of truth:** [`PT_tokens.md`](./PT_tokens.md). Every token named in this file is a canonical `--pt-*` token defined in `PT_tokens.md`. Never invent a token name. Where a Figma value has no matching token in `PT_tokens.md`, it is flagged `⚠️ HARDCODED — no token bound in Figma`.
> **Design system Figma file:** PinTours Design System (`oUL21btTntSZLQCpLAEAe5`).
> **Convention:** all values here are read from Figma via MCP (`get_metadata` + `get_variable_defs` + `get_design_context` + screenshot). Nothing is inferred. `⚠️ NEEDS DESIGNER INPUT` marks genuine unknowns.

## Contents

**Actions & indicators**
- [Button](#button)
- [Button (Icon only)](#button-icon-only)
- [Filter Chip](#filter-chip)
- [Eyebrow Highlight](#eyebrow-highlight)
- [Tags](#tags)
- [Super Icon](#super-icon)
- [Map_pin](#map_pin)

**Form controls**
- [Checkbox](#checkbox)
- [Radio Button](#radio-button)
- [Toggle](#toggle)

**Menus**
- [Menu_item](#menu_item)
- [Menu_sub-item](#menu_sub-item)

**Cards**
- [Card_image](#card_image)
- [Card_hero-image](#card_hero-image)
- [Card_carousel](#card_carousel)

**Content**
- [Text Block](#text-block)
- [Ratings](#ratings)

**Navigation**
- [Tab Navigation](#tab-navigation)
- [Bottom Nav](#bottom-nav)
- [Top Anchor Nav](#top-anchor-nav)

**Input & Form**
- [Label](#label)
- [Footnote](#footnote)
- [Form field](#form-field)
- [Search](#search)

**Layout system**
- [Fixed Grid (Mobile)](#fixed-grid-mobile)

---

# Button

> Figma component set: `Button` — node `699:924`
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=699-924
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Button.tsx]`
> Last updated: 2026-07-18
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

Buttons trigger an action. Use for form submission, confirming a dialog, opening a modal, or any operation that changes state.

**Not for navigation.** If the interaction moves the user to a new URL, use `Link` instead — it renders an `<a>` and preserves browser behaviors (open in new tab, copy link, middle-click).

## Variant axes

The Figma component set contains **117 variants** (enumerated directly from the component set — not estimated).

Figma exposes **four** properties. Names below are the exact strings from Figma's property panel; the code prop names should mirror them (mapping in Props, since several can't be literal props).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Button Type` | `Primary` · `Secondary` · `Tertiary` | 3 |
| `Button Size` | `Small` · `Default` · `Large` | 3 |
| `State` | `Default__Gradient` · `Default_Gradient_Hover` · `Default` · `Hover` · `Negative` · `Negative_hover` · `Disabled` | 7 |
| `Icon` | `None` · `Leading` · `Trailing` | 3 |

> ⚠️ Do not carry the earlier draft's inference into code. There is **no** `success`/`danger`/`neutral`/`outline`/`ghost` type and **no** `sm`/`md`/`lg` value in Figma. "Danger" is not a type — it lives on `State` as `Negative`/`Negative_hover`, and only for `Primary`. There is **no `icon-only`** variant and **no `active`/`pressed` or `focus`** state anywhere in the set.

### Variant math (axes multiplied vs. actual)

```
3 (Type) × 3 (Size) × 7 (State) × 3 (Icon) = 189 theoretical
Actual component count                      = 117
Excluded                                    =  72
```

**Why 72 are excluded — a hard rule, not a guess.** Four `State` values exist **only** for `Button Type = Primary`:
`Default__Gradient`, `Default_Gradient_Hover`, `Negative`, `Negative_hover`.
`Secondary` and `Tertiary` support only `Default`, `Hover`, `Disabled`.

```
Excluded = 2 types (Secondary, Tertiary) × 4 Primary-only states × 3 sizes × 3 icons = 72
189 − 72 = 117 ✓
```

### Valid combinations (everything not listed is unsupported — do not generate it)

```
Primary   × {Default__Gradient, Default_Gradient_Hover, Default, Hover, Negative, Negative_hover, Disabled} × {Small, Default, Large} × {None, Leading, Trailing}  = 63
Secondary × {Default, Hover, Disabled}                                                                       × {Small, Default, Large} × {None, Leading, Trailing}  = 27
Tertiary  × {Default, Hover, Disabled}                                                                       × {Small, Default, Large} × {None, Leading, Trailing}  = 27
                                                                                                                                                              total = 117
```

Invalid examples the agent must **never** emit: `Secondary` + `Negative`, `Tertiary` + `Default__Gradient`, any type + `Active`/`Focus`.

## Props (code API)

⚠️ CONFIRM with tech lead — the codebase may already name these differently. The Figma `State` axis is **not** a single runtime prop; it collapses interaction states, a destructive intent, and a gradient treatment into one grid axis. Mapping it 1:1 to a `state` string prop would let the agent generate invalid HTML/props. Recommended decomposition:

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Button Type` | `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Direct rename `Button Type → variant`. Values lowercase. |
| `Button Size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Value mapping required: `Small→sm`, `Default→md`, `Large→lg`. |
| `Icon` | `iconLeading` / `iconTrailing` | `ReactNode` | — | `Icon=Leading`→`iconLeading`, `Icon=Trailing`→`iconTrailing`, `Icon=None`→neither. Figma models one slot at a time. ⚠️ CONFIRM whether both may be set at once in code. |
| `State` → `Disabled` | `disabled` | `boolean` | `false` | Renders `Disabled` tokens + native `disabled`. |
| `State` → `Hover` / `Default` | *(none — CSS `:hover`)* | — | — | Not props. `Default`=resting, `Hover`=`:hover`. |
| `State` → `Negative` / `Negative_hover` | `intent` (Primary only) | `'default' \| 'negative'` | `'default'` | `intent='negative'` selects the red tokens; `Negative_hover` is its `:hover`. ⚠️ CONFIRM name. Valid only when `variant='primary'`. |
| `State` → `Default__Gradient` / `Default_Gradient_Hover` | `gradient` (Primary only) | `boolean` | `false` | Selects the gradient fill; `Default_Gradient_Hover` is its `:hover`. ⚠️ CONFIRM name + whether gradient and negative combine (Figma has no gradient+negative variant → treat as mutually exclusive). Valid only when `variant='primary'`. |

Props with **no basis in Figma** (present in the earlier draft — confirm before implementing): `loading`, `fullWidth`. Neither exists in the set. See Edge cases / Open questions.

Non-visual props the code needs regardless of Figma: `onClick`, `type` (`'button' \| 'submit' \| 'reset'`, default `'button'`), `aria-label` (icon-only — but Figma has no icon-only variant).

## Figma-vs-code divergences (logic tree for the codegen LLM)

You will be reading **both** this spec and the Figma file. Where the two disagree, this table is authoritative and explains *why* the code shape departs from the raw Figma structure. Do not "correct" the code back to a literal mirror of Figma's property panel — these divergences are deliberate. Anything not listed here should map 1:1.

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | Single `State` property with 7 enum values (`Default`, `Hover`, `Negative`, `Negative_hover`, `Default__Gradient`, `Default_Gradient_Hover`, `Disabled`) | Split into `disabled` (bool) + `intent` (`'default'\|'negative'`, Primary only) + `gradient` (bool, Primary only); `Hover` becomes CSS `:hover`, `Active`/`Focus` become CSS pseudo-classes | Figma flattens three different layers into one enum: interaction states, a destructive color intent, and a visual treatment. In code they live in different places — `:hover` is browser-driven (not a prop), `disabled` is an HTML attribute, `negative`/`gradient` are style modifiers. A literal `state="Negative_hover"` prop would (a) let callers set a *hover* look as the resting state, and (b) stop the browser from driving real hover. Splitting keeps runtime semantics correct and blocks invalid combos. |
| 2 | `Button Size` = `Small` / `Default` / `Large` | `size='sm' \| 'md' \| 'lg'` (`Default`→`md`) | Naming convention on the code side; `md` is the ergonomic default. Pure rename, no visual change. If your codebase prefers Figma's verbatim strings, keep them and note it — but then the codegen must not also emit `sm/md/lg`. |
| 3 | `Button Type` = `Primary` / `Secondary` / `Tertiary` | `variant='primary' \| 'secondary' \| 'tertiary'` | `variant` is the conventional prop name; values are just lowercased. Meaning unchanged. |
| 4 | `Icon` = `None` / `Leading` / `Trailing` (one swappable slot) | Two optional `ReactNode` slots: `iconLeading`, `iconTrailing` | Figma encodes icon presence + position as one enum over a single slot. Code needs a real node and somewhere to render it. Two optional slots reproduce all three Figma states (neither set = `None`) and additionally allow both icons — a case Figma can't express. ⚠️ Confirm whether both-at-once is permitted. |
| 5 | Gradient states apply `Gradient/Default` / `Gradient/Hover` tokens | Reference the **gradient token**, not the individual stop primitives (`green-400`, `teal-500`, …) | `PT_tokens.md §4` forbids primitives in component styles. Consuming the named gradient token keeps that rule intact and survives token re-theming. |
| 6 | Each variant bakes in its own hover shadow (Small carries `Solid/Xs`, Default/Large carry `Solid/Sm`) | Derive the hover shadow from `size` (`sm`→`--pt-shadow-solid-xs`, `md`/`lg`→`--pt-shadow-solid-sm`) | Avoids a redundant prop; the shadow is a pure function of size, so bind it to `size` rather than duplicating it as state. |

**Intentional additions (in code, absent from Figma) — not hallucinations:**

- **Focus ring** — required for keyboard accessibility (WCAG 2.4.7). Figma models no focus state; the code must add one. ⚠️ The token (color/width/offset) is still undefined — see Accessibility. Flag rather than invent silently.
- **`type` attribute** — always set explicitly (`'button'` default) to prevent implicit form submission. Not a design concern, but required for correct HTML.

## Tokens used

All values below are the **actual bound variables** read from Figma, resolved to the canonical token in [`PT_tokens.md`](./PT_tokens.md). The middle column is what the coding agent should emit.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | |
| `Colors/Border/Action` | `--pt-semantic-border-action` | `#5d9c4d` | |
| `Colors/Surface/Action_hover` | `--pt-semantic-surface-action_hover` | `#4a7d3e` | |
| `Colors/Border/Action_hover 2` | `--pt-semantic-border-action_hover` | `#4a7d3e` | ⚠️ Figma variable name has a trailing ` 2` (renders as `--colors/border/action_hover-2`). Naming gap — see Design-system gaps. |
| `Colors/Surface/Negative` | `--pt-semantic-surface-negative` | `#d64545` | |
| `Colors/Border/Negative` | `--pt-semantic-border-negative` | `#d64545` | |
| `Colors/Surface/Negative_hover` | `--pt-semantic-surface-negative_hover` | `#ab3737` | |
| `Colors/Border/Negative_hover` | `--pt-semantic-border-negative_hover` | `#ab3737` | |
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` | |
| `Colors/Border/Disabled` | `--pt-semantic-border-disabled` | `#a8c0c7` | |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | Resolved — `PT_tokens.md` corrected to `#f2f6f7` (= `--pt-color-grey-75` / Figma `Neutral/75`). |
| `Colors/Typography/On_action` | `--pt-semantic-typography-on_action` | `#ffffff` | |
| `Colors/Typography/Action` | `--pt-semantic-typography-action` | `#5d9c4d` | |
| `Colors/Typography/Action_hover` | `--pt-semantic-typography-action_hover` | `#4a7d3e` | |
| `Colors/Typography/Body_caption` | `--pt-semantic-typography-body_caption` | `#869a9f` (= `--pt-color-grey-600`) | Disabled label on Secondary/Tertiary. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | Per-state icon binding (see Icons). |
| `Colors/Icon/Action_hover` | `--pt-semantic-icon-action_hover` | `#4a7d3e` | |
| `Colors/Icon/On_action` | `--pt-semantic-icon-on_action` | `#ffffff` | ✅ RESOLVED (2026-07-18, per design confirmation; **Figma binding re-verified via MCP same day**) — white icon on filled Primary for all **non-hover** states (`Default`, `Negative`, `Default__Gradient`, `Disabled`). `get_variable_defs` on this node now returns `On_action` bound (it did not before the fix). |
| `Colors/Icon/On_hover` | `--pt-semantic-icon-on_hover` | `#ffffff` | ✅ RESOLVED — applies **only** to the three `_hover` states (`Hover`, `Negative_hover`, `Default_Gradient_Hover`). The earlier flag (name implies hover but appeared to be used at rest) is corrected: it's genuinely hover-only now; resting states use `Icon/On_action` instead. Both tokens now confirmed bound on this node via a fresh MCP pull (2026-07-18). |
| `Colors/Icon/Body_caption` | `--pt-semantic-icon-body_caption` | `#869a9f` | |
| `Shadow/Solid/Sm` | `--pt-shadow-solid-sm` | `0px 4px 0px 0px #a8c0c7, 0px 0px 6px 0px #cbd9dd` | Matches `PT_tokens.md` exactly. |
| `Shadow/Solid/Xs` | `--pt-shadow-solid-xs` | `0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` | Applied to the **Small** hover state (all types). Default & Large hover use `--pt-shadow-solid-sm`. |
| `Scale/Quat` | `--pt-scale-quat` | `1px` | Border width. |
| `Scale/1` | `--pt-scale-1` | `4px` | |
| `Scale/1Half` | `--pt-scale-1half` | `6px` | |
| `Scale/2` | `--pt-scale-2` | `8px` | |
| `Scale/3` | `--pt-scale-3` | `12px` | |
| `Scale/4` | `--pt-scale-4` | `16px` | |
| `Scale/5` | `--pt-scale-5` | `20px` | |
| `Scale/6` | `--pt-scale-6` | `24px` | Also serves as Default-size label `line-height`. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | Figma renders the face as "Poppins Medium" but the bound weight token is `Regular (500)`. |
| `Body_sm/Font_size` · `Body_sm/Line_height` | `--pt-typography-body-sm-font_size` · `--pt-typography-body-sm-line_height` | `14px` · `20px` | |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | line-height bound to `Scale/6` (24px), not a `body-default-line_height` token. |
| `Body_lg/Font_size` · `Body_lg/Line_height` | `--pt-typography-body-lg-font_size` · `--pt-typography-body-lg-line_height` | `20px` · `28px` | |

### Gradient stops (Primary gradient states only)

Both gradient states map to **named gradient tokens** in Figma's `Gradient` collection — `Gradient/Default` and `Gradient/Hover`. Their stops are real primitives (all present in `tokens/primitives.json`). The agent should consume the **gradient token**, not the individual stop primitives (per `PT_tokens.md §4`).

| State | Gradient token | Stop 1 | Stop 2 | Border |
|---|---|---|---|---|
| `Default__Gradient` | `Gradient/Default` | `Primary/400` → `--pt-color-green-400` (`#7db071`) | `Secondary/500 (Core)` → `--pt-color-teal-500` (`#009bc8`) | `--pt-color-green-400` |
| `Default_Gradient_Hover` | `Gradient/Hover` | `Success/500 (Core)` → `--pt-color-green-500` (`#5d9c4d`) | `Information/600` → `--pt-color-teal-600` (`#007ca0`) | `--pt-color-green-500` |

Direction is left → right (`linear-gradient(to right, …)`); the angle is not exposed as a token. All stop primitives exist in `primitives.json`, so there is **no** untokenized/HARDCODED color here.

### Per-variant token map (background / border / label — Default size shown; sizing table below)

**Primary**

| State | Background | Border (`1px` = `--pt-scale-quat`) | Label color | Icon color | Shadow |
|---|---|---|---|---|---|
| `Default` | `--pt-semantic-surface-action` | `--pt-semantic-border-action` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ✅ | none |
| `Hover` | `--pt-semantic-surface-action_hover` | `--pt-semantic-border-action_hover` ⚠️(`" 2"`) | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_hover` ✅ | `--pt-shadow-solid-sm` (Small: `--pt-shadow-solid-xs`) |
| `Negative` | `--pt-semantic-surface-negative` | `--pt-semantic-border-negative` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ✅ | none |
| `Negative_hover` | `--pt-semantic-surface-negative_hover` | `--pt-semantic-border-negative_hover` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_hover` ✅ | `--pt-shadow-solid-sm` (Small: `--pt-shadow-solid-xs`) |
| `Default__Gradient` | `Gradient/Default` (green-400 → teal-500) | `--pt-color-green-400` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ✅ | none |
| `Default_Gradient_Hover` | `Gradient/Hover` (green-500 → teal-600) | `--pt-color-green-500` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_hover` ✅ | `--pt-shadow-solid-sm` (Small: `--pt-shadow-solid-xs`) |
| `Disabled` | `--pt-semantic-surface-disabled` | `--pt-semantic-border-disabled` | `--pt-semantic-typography-on_action` (white — ⚠️ contrast, see A11y) | `--pt-semantic-icon-on_action` ✅ (matches label, same contrast caveat) | none |

✅ Icon column resolved 2026-07-18 per design confirmation, and **re-verified against live Figma via MCP the same day**: `on_action` for every non-hover state, `on_hover` only on the three `_hover` states. Confirmed on this component (Button); Button (Icon only) has **not** received the same fix yet — see that component's Tokens section.

**Secondary** (page-colored fill + action border)

| State | Background | Border | Label color | Shadow |
|---|---|---|---|---|
| `Default` | `--pt-semantic-surface-page` | `--pt-semantic-border-action` | `--pt-semantic-typography-action` | none |
| `Hover` | `--pt-semantic-surface-page` | `--pt-semantic-border-action_hover` ⚠️(`" 2"`) | `--pt-semantic-typography-action_hover` | `--pt-shadow-solid-sm` (Small: `--pt-shadow-solid-xs`) |
| `Disabled` | `--pt-semantic-surface-page` | `--pt-semantic-border-disabled` | `--pt-semantic-typography-body_caption` | none |

**Tertiary** (text-only: no background, no border)

| State | Background | Border | Label color | Shadow |
|---|---|---|---|---|
| `Default` | none | none | `--pt-semantic-typography-action` | none |
| `Hover` | none | none | `--pt-semantic-typography-action_hover` | none |
| `Disabled` | none | none | `--pt-semantic-typography-body_caption` | none |

### Sizing (measured per size from Figma; all bound to scale/type tokens)

| Size (Figma → code) | Padding V | Padding H | Radius | Gap (icon↔label) | Font size | Line-height | Icon size | Frame height |
|---|---|---|---|---|---|---|---|---|
| `Small` → `sm` | `--pt-scale-2` (8px) | `--pt-scale-4` (16px) | `--pt-scale-1half` (6px) | `--pt-scale-1` (4px) | `--pt-typography-body-sm-font_size` (14px) | `--pt-typography-body-sm-line_height` (20px) | 16px | 36px |
| `Default` → `md` | `--pt-scale-3` (12px) | `--pt-scale-5` (20px) | `--pt-scale-2` (8px) | `--pt-scale-2` (8px) | `--pt-typography-body-default-font_size` (16px) | `--pt-scale-6` (24px) | 20px | 48px |
| `Large` → `lg` | `--pt-scale-3` (12px) | `--pt-scale-6` (24px) | `--pt-scale-2` (8px) | `--pt-scale-2` (8px) | `--pt-typography-body-lg-font_size` (20px) | `--pt-typography-body-lg-line_height` (28px) | 24px | 52px |

Notes: `Large` and `Default` share vertical padding (12px) and radius (8px); height differs via font/line-height only. Only `Small` uses the 6px radius and 8px vertical padding. Frame heights are the natural node heights from `get_metadata`; there is **no bound min-height token** — height is content-driven. Icon size is **not** bound to a variable (raw `16/20/24px` per size) → `⚠️ HARDCODED — no token bound in Figma`. **Hover shadow scales by size:** `Small` → `--pt-shadow-solid-xs`, `Default` & `Large` → `--pt-shadow-solid-sm` (Tertiary has no shadow at any size).

### Icons

**Icon library: [Tabler Icons](https://tabler-icons.io) (`@tabler/icons-react`)** — see `PT_tokens.md` §4 "Icons" for the install/import convention, size/stroke prop mapping, and the Figma-naming convention for bridging a placeholder to a real icon. Note: this placeholder's Figma layer name, `settings-2`, already happens to match Tabler's own kebab-case naming pattern (`IconSettings2`) — a useful coincidence, not a confirmed final choice; treat `icon` as a consumer-supplied `ReactNode` slot until the Figma layer is explicitly confirmed or renamed per that convention.

Icon nodes render as SVG assets (`settings-2` placeholder in the file), so `get_design_context` returns them as `<img>` and does **not** expose the bound fill variable in code. The icon **color** tokens used in the set are `Colors/Icon/Action`, `Colors/Icon/Action_hover`, `Colors/Icon/On_action`, `Colors/Icon/On_hover`, `Colors/Icon/Body_caption`. ✅ RESOLVED pairing (per design confirmation, 2026-07-18; **Figma binding re-verified via MCP same day**): Primary icon = `--pt-semantic-icon-on_action` (white) on **non-hover** states (`Default`, `Negative`, `Default__Gradient`, `Disabled`); `--pt-semantic-icon-on_hover` (white) on the three **hover** states only (`Hover`, `Negative_hover`, `Default_Gradient_Hover`). Secondary/Tertiary icon = `--pt-semantic-icon-action` / `-action_hover`, disabled = `--pt-semantic-icon-body_caption`. `get_variable_defs` on this node now returns both `Icon/On_action` and `Icon/On_hover` bound (previously only `On_hover`) — confirms the fix landed on **Button**. ⚠️ Does **not** yet apply to Button (Icon only) — see that component's own Tokens section, its `get_variable_defs` still returns only `On_hover`.

## States

Figma models only `Default`, `Hover`, and `Disabled` as interaction states (plus Primary-only `Negative`/`Negative_hover` intent and `Default__Gradient`/`Default_Gradient_Hover` treatment). **No `focus` and no `active`/`pressed` state exists in the file.**

| State | Visual (from Figma) | Behaviour |
|---|---|---|
| Default | Base tokens per variant table | Interactive |
| Hover | Background/label step to `_hover` tokens; Primary & Secondary gain a solid shadow (`--pt-shadow-solid-xs` at `Small`, `--pt-shadow-solid-sm` at `Default`/`Large`); Tertiary changes label color only | Cursor `pointer`. ✅ **RESOLVED via industry default (2026-07-18):** no motion token exists in Figma, so use `150ms ease-in-out` for the hover transition (`transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out, color 150ms ease-in-out`) — this is the common default across mainstream design systems (Bootstrap and Tailwind both default to ~150ms; Material Design uses 100–300ms depending on the property). Not a designer-confirmed value — flag to design if a different timing is preferred, but safe to ship with this as a placeholder. |
| Focus (keyboard) | **Absent in Figma** | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). No focus ring token, width, color, or offset is defined yet. Do not ship without one when it's addressed; do not invent one silently in the meantime. See Accessibility. |
| Active / pressed | **Absent in Figma** | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Is pressed identical to hover, or a distinct token? Not blocking initial implementation — treat as identical to hover until specified. |
| Negative (Primary only) | Red surface/border tokens | A destructive intent, not a hover state. |
| Disabled | `disabled` surface/border tokens; label white (Primary) or `body_caption` (Secondary/Tertiary) | `disabled` attribute; remove from tab order; `pointer-events: none`. |
| Loading | **Absent in Figma** | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Does a loading state exist? If so, define spinner token, placement, and whether width is preserved. Not blocking initial implementation — omit `loading` prop until specified. |

## Accessibility

Required section — Figma encodes no accessibility metadata, so most of this is a design gap to close, not a fact read from the file.

- Renders a native `<button>`, never a `<div>`/`<span>` with a click handler.
- `type` is always set explicitly to avoid implicit `submit` inside forms.
- ⚠️ **Focus ring is a design gap.** No focus state exists in the component set. A visible keyboard focus indicator meeting **3:1** contrast against adjacent colors must be added by design and tokenized in `PT_tokens.md` before implementation. The browser default is not acceptable as documented behavior.
- ⚠️ **Contrast to verify** (not encoded in Figma):
  - Primary `Disabled`: white label (`--pt-semantic-typography-on_action`) on `--pt-semantic-surface-disabled` `#a8c0c7` (= `--pt-color-grey-500`) → ≈ **1.9:1**, far below 4.5:1. Darkening the disabled surface one step to `grey-600` (`#869a9f`) only reaches ≈ **2.9:1** — still failing; a white label needs roughly `grey-800` to clear 4.5:1. Fix by darkening the surface **and/or** moving the label off pure white.
  - Tertiary `Default`/`Hover` label `--pt-semantic-typography-action` (green) on the page surface — audit against real backgrounds.
  - Secondary/Tertiary `Disabled` label `#869a9f` on `#f2f6f7` ≈ **2.3:1** — below 4.5:1; confirm.
- `Small` height is **36px** and `Default` is **48px**; `Small` is **below the 44×44px** minimum touch target. ⚠️ CONFIRM `Small` is desktop-only or add touch padding.
- Icon-only buttons are **not** a Figma variant; if code adds one, it requires `aria-label`.
- Disabled buttons are removed from tab order; convey *why* with visible helper text, not a tooltip alone.
- If a `loading` state is added, set `aria-busy="true"` and keep the label in the accessibility tree.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| One `primary` button per view section | Stack multiple `primary` buttons side by side |
| Use the `negative` intent only for destructive, hard-to-undo actions | Use `negative` for ordinary form submission |
| Start labels with a verb ("Save changes", "Delete trip") | Use vague labels ("OK", "Submit", "Click here") |
| Use `Link` for navigation | Style a Button to look like a link |
| Keep the gradient treatment for hero/marketing CTAs (Primary only) | Apply gradient to Secondary/Tertiary (no such variant exists) |
| Keep labels under ~3 words | Write sentence-length labels |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long labels:** Every variant uses `whitespace-nowrap` in Figma (no wrap modeled). Confirm: truncate with ellipsis, or allow growth? Wrapping would break the content-driven height.
- **`fullWidth`:** No full-width variant in Figma (all hug content). If added, confirm the label stays centered.
- **Icon + long label at `Small`:** Gap is a fixed `--pt-scale-1` (4px); confirm it holds under truncation.
- **Both icons at once:** Figma models one icon slot at a time (`Leading` XOR `Trailing`). Confirm whether code may render both.
- **RTL:** Not modeled. ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Do leading/trailing icons mirror in RTL? Not blocking for LTR-only launch.
- **Gradient + negative:** No combined variant exists — treat as mutually exclusive.
- **Nested in a link/button:** Not supported — invalid HTML.
- **Rapid double-click:** Debounce is not a design concern; confirm it's the consumer's responsibility.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Button } from '@/components/Button';

// Primary / Default / md
<Button variant="primary" size="md" onClick={handleSave}>
  Save changes
</Button>

// Secondary / sm / leading icon
<Button variant="secondary" size="sm" iconLeading={<PlusIcon />}>
  Add stop
</Button>

// Primary destructive (Figma: State=Negative)
<Button variant="primary" intent="negative" size="md" onClick={handleDelete}>
  Delete trip
</Button>

// Primary gradient CTA (Figma: State=Default__Gradient) — Primary only
<Button variant="primary" gradient size="lg" onClick={handleStart}>
  Start planning
</Button>
```

## Design-system gaps surfaced by this component

Raised for design/token cleanup — not smoothed over in code:

1. **`Colors/Border/Action_hover 2`** — bound border variable literally has a trailing ` 2`. Likely a duplicate/renamed variable; canonical target is `--pt-semantic-border-action_hover`.
2. ~~`Colors/Surface/Page` value mismatch~~ — **RESOLVED.** `PT_tokens.md` corrected to `#f2f6f7` (`--pt-color-grey-75` / Figma `Neutral/75`).
3. ~~Gradient gap~~ — **RESOLVED.** Both fills are named tokens (`Gradient/Default`, `Gradient/Hover`); all stop primitives (incl. `teal-600` `#007ca0`) exist in `primitives.json`; the Figma→code palette mapping is documented in `PT_tokens.md`. Only stylistic note left: consume the gradient token, not the raw stops.
4. **`State` naming inconsistency** — `Default__Gradient` (double underscore) vs `Default_Gradient_Hover` (single).
5. ~~`Colors/Icon/On_hover` used at rest~~ — **RESOLVED and re-verified via MCP** (2026-07-18). It's genuinely hover-only; resting Primary icon states now use `Colors/Icon/On_action` instead. `get_variable_defs` confirms both tokens are now bound on this node.
6. ~~`Shadow/Solid/Xs` unlocated~~ — **RESOLVED.** It's the `Small`-size hover shadow (all types); `Default`/`Large` hover use `Solid/Sm`.
7. **No `focus` and no `active` state** across all 117 variants — interaction/accessibility gap.

## Open questions — what needs your confirmation

1. **Prop decomposition of the `State` axis.** OK to split into `disabled` (bool), `intent='negative'` (Primary only), `gradient` (bool, Primary only), with `Hover` as CSS `:hover`? Or does the codebase model this differently?
2. **Size value mapping.** Confirm `Small→sm`, `Default→md`, `Large→lg` — or keep Figma's `Small/Default/Large` verbatim?
3. ~~Surface/Page mismatch~~ — **RESOLVED:** `#f2f6f7` confirmed; `PT_tokens.md` corrected.
4. **`Colors/Border/Action_hover 2`** — clean up the variable and target `--pt-semantic-border-action_hover`?
5. ~~Gradient tokens~~ — **RESOLVED:** `Gradient/Default` and `Gradient/Hover` are named tokens; all primitives exist. (Optional cleanup: have components consume the gradient token rather than the stops.)
6. ~~`Shadow/Solid/Xs` location~~ — **RESOLVED:** `Small` hover state.
7. ⏳ **Focus state — added to the design system roadmap.** Define a focus-ring token (color, width, offset). Required for accessibility.
8. ⏳ **`active`/`pressed` — added to the design system roadmap.** Same as hover, or distinct? Treat as identical to hover until specified.
9. ⏳ **`loading` and `fullWidth` — added to the design system roadmap.** Neither exists in Figma; omit from the code API until specified.
10. **Disabled contrast (Primary):** white label on `#a8c0c7` is ~1.7:1. Intentional, or fix the token?
11. ~~Per-state icon color~~ — **RESOLVED and re-verified via MCP 2026-07-18**: Primary = white via `icon-on_action` (non-hover states) / `icon-on_hover` (hover states only); Secondary/Tertiary = `icon-action`/`-action_hover`; disabled = `icon-body_caption`. Figma binding confirmed switched on **Button**.
12. **Component code path + export name** for the header block.

---

# Button (Icon only)

> Figma component set: `Button_Icon only` — node `679:1062`
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=679-1062
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/ButtonIconOnly.tsx]` (Figma generates the name `ButtonIconOnly`)
> Last updated: 2026-07-18
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A square, label-less button containing a single icon. Same visual language and tokens as [Button](#button) — this is the icon-only sibling, not a separate system. Use when space is tight and the action is unambiguous from the icon alone (e.g. a back chevron, close, overflow menu).

**Accessibility-critical:** because there is no visible label, an icon-only button **must** carry an accessible name (`aria-label`). See Accessibility.

## Variant axes

**39 variants** (enumerated from the component set). Three properties — **no `Icon` axis** (the icon is always present and single) and **no label**.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Button Type` | `Primary` · `Secondary` · `Tertiary` | 3 |
| `Button Size` | `Small` · `Default` · `Large` | 3 |
| `State` ✅ (confirmed correctly named, re-verified 2026-07-18) | `Default__Gradient` · `Default_Gradient_Hover` · `Default` · `Hover` · `Negative` · `Negative_hover` · `Disabled` | 7 (Primary) / 3 (others) |

> ✅ **RESOLVED (re-verified via MCP, 2026-07-18):** the state axis is now named **`State`** in Figma's property panel, matching the labeled [Button](#button). The earlier accidental rename to `Default_Gradient_Hover` has been fixed at the source — `get_metadata` now returns `State=Default__Gradient`, `State=Default_Gradient_Hover`, etc. Primary supports all **7** states, matching Button.

### Variant math (axes multiplied vs. actual)

```
3 (Type) × 3 (Size) × 7 (State) = 63 theoretical
Actual component count          = 39
Excluded                        = 24
```

State support per type (now identical to Button):

```
Primary   : Default__Gradient, Default_Gradient_Hover, Default, Hover, Negative, Negative_hover, Disabled  (7 states)
Secondary : Default, Hover, Disabled                                                                       (3 states)
Tertiary  : Default, Hover, Disabled                                                                       (3 states)
```

Exclusions (24): Primary drops none; Secondary & Tertiary each drop `Default__Gradient`, `Default_Gradient_Hover`, `Negative`, `Negative_hover` (4 × 3 sizes = 12 each). `12 + 12 = 24`. Valid: Primary 21 + Secondary 9 + Tertiary 9 = **39** ✓. (Same state-support rule as [Button](#button).)

## Props (code API)

Same decomposition as [Button](#button) (see its Figma-vs-code divergence table — identical logic applies), with two changes: there is **no `iconLeading`/`iconTrailing`** (one required `icon`), and `aria-label` is **required**, not optional.

| Figma property | Recommended code prop | Type | Default | Notes |
|---|---|---|---|---|
| `Button Type` | `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Same as Button. |
| `Button Size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `Small→sm`, `Default→md`, `Large→lg`. |
| (icon glyph) | `icon` | `ReactNode` | — (**required**) | The single centered icon. Figma placeholder is `chevron-left` — this already matches a real Tabler icon slug (`IconChevronLeft` in `@tabler/icons-react`, see `PT_tokens.md` §4 "Icons"), a useful signal but not a confirmed final choice; treat as a consumer-supplied `ReactNode` until confirmed. |
| — | `aria-label` | `string` | — (**required**) | No visible text → an accessible name is mandatory. |
| `State`→`Disabled` | `disabled` | `boolean` | `false` | |
| `State`→`Negative`/`Negative_hover` | `intent` (Primary only) | `'default' \| 'negative'` | `'default'` | |
| `State`→`Default__Gradient` / `Default_Gradient_Hover` | `gradient` (Primary only) | `boolean` | `false` | Now has a hover variant (matches Button); `Default_Gradient_Hover` = its `:hover`. |
| `State`→`Hover`/`Default` | — (CSS `:hover`) | — | — | |

Plus `onClick`, `type` (default `'button'`).

## Tokens used

Colors/borders/icon tokens are **identical to [Button](#button)** — same `--pt-semantic-*` mappings per type/state. Refer to Button's "Tokens used" for the full per-variant color table. Only the **geometry** differs (square, smaller footprint):

### Sizing (square; measured from Figma)

| Size (Figma → code) | Box (W×H) | Padding V | Padding H | Radius | Icon size | Hover shadow |
|---|---|---|---|---|---|---|
| `Small` → `sm` | 36 × 36 | `--pt-scale-1` (4px) | `--pt-scale-2` (8px) | `--pt-scale-1half` (6px) | 16px | `--pt-shadow-solid-xs` |
| `Default` → `md` | 48 × 48 | `--pt-scale-2` (8px) | `--pt-scale-3` (12px) | `--pt-scale-2` (8px) | 20px | `--pt-shadow-solid-sm` |
| `Large` → `lg` | 52 × 52 | `--pt-scale-2` (8px) | `--pt-scale-3` (12px) | `--pt-scale-2` (8px) | 24px | `--pt-shadow-solid-sm` |

Notes: the box is a **fixed square** (`size-[36/44/52px]`) with the icon centered; the padding tokens above are also applied but the fixed size governs. Icon sizes (16/20/24) are **not** bound to a variable → `⚠️ HARDCODED — no token bound in Figma` (same as Button). Radius: `Small` 6px, `Default`/`Large` 8px. Hover shadow scales by size exactly like Button (`Small`→xs, `Default`/`Large`→sm); Tertiary has no shadow. **The Default box is now 48×48, matching the labeled Button's Default height** (updated in Figma). `Small` (36) and `Large` (52) are unchanged.

### Per-variant colors (Default size; same tokens as Button)

**Primary** — `Default`: `surface-action`/`border-action`, icon `--pt-semantic-icon-on_action`; `Hover`: `surface-action_hover`/`border-action_hover` ⚠️(`" 2"`) + shadow, icon `--pt-semantic-icon-on_hover`; `Negative`: `surface-negative`/`border-negative`, icon `--pt-semantic-icon-on_action`; `Negative_hover`: `surface-negative_hover`/`border-negative_hover` + shadow, icon `--pt-semantic-icon-on_hover`; `Default__Gradient`: `Gradient/Default` (green-400→teal-500), border `--pt-color-green-400`, icon `--pt-semantic-icon-on_action`; `Default_Gradient_Hover`: `Gradient/Hover` (green-500→teal-600), border `--pt-color-green-500`, shadow `--pt-shadow-solid-sm` (Small: `--pt-shadow-solid-xs`), icon `--pt-semantic-icon-on_hover`; `Disabled`: `surface-disabled`/`border-disabled`, icon `--pt-semantic-icon-on_action` (white — matches the Disabled **label**, which is also `on_action`/white; see A11y contrast note).

✅ **RESOLVED AND CONFIRMED IN FIGMA — re-verified via MCP 2026-07-18.** `get_variable_defs` on this node now returns both `Colors/Icon/On_action` and `Colors/Icon/On_hover` bound (previously only `On_hover`). This component now matches Button's binding.

**Secondary** — bg `--pt-semantic-surface-page` (all states); border `border-action` (Default) / `border-action_hover` (Hover, + shadow) / `border-disabled` (Disabled). Icon `--pt-semantic-icon-action` / `-action_hover` / `-body_caption`. (Unaffected by the above — the `on_action`/`on_hover` swap only concerns Primary's white icon.)

**Tertiary** — no background, no border. Icon `--pt-semantic-icon-action` (Default) / `-action_hover` (Hover, no shadow) / `-body_caption` (Disabled). (Unaffected.)

Per-state icon color pairing is now confirmed both by decision and by Figma binding — matches Button. Still not literally traceable through the exported SVG asset fill (same limitation as Button), but the bound-variable list confirms both tokens are in use on this node.

## States

Same as [Button](#button) — `Default`, `Hover` (Primary/Secondary gain the size-scaled solid shadow; Tertiary label-color-only), `Negative`/`Negative_hover` (Primary), `Default__Gradient` (Primary), `Disabled`. **No `focus` and no `active` state** (design gap). 

The `Default_Gradient_Hover` state uses `Gradient/Hover` (green-500 → teal-600) and carries the same size-scaled solid shadow as the other hover states — `--pt-shadow-solid-xs` at `Small`, `--pt-shadow-solid-sm` at `Default`/`Large`. Fully consistent with Button.

## Accessibility

- ⚠️ **Accessible name is mandatory.** With no visible label, every instance requires `aria-label` (or `aria-labelledby`). A codegen LLM must not emit an icon-only button without one. This is the single most important rule for this component.
- Renders a native `<button>`; `type` set explicitly.
- ⚠️ **Focus ring** — absent in Figma (same gap as Button); must be added and tokenized. Required.
- **Touch target:** `Small` = **36×36** and `Default` = **48×48** (Default now matches Button). `Small` is **below** the 44×44 minimum — icon-only controls are common tap targets, so this matters more here than for the labeled Button. Confirm `Small` is pointer-only, or add a transparent hit area to reach 44×44.
- Disabled removed from tab order; convey *why* via adjacent context, not a tooltip alone.
- Contrast: the icon-vs-background ratios mirror Button's label ratios — audit the Primary disabled (white icon on `grey-500` ≈ 1.9:1) and Tertiary/Secondary disabled icon (`grey-600` on `grey-75`/page ≈ 2.3:1).

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Always pass an `aria-label` describing the action ("Go back") | Ship an icon-only button with no accessible name |
| Use for universally-understood icons (back, close, more) | Use an ambiguous icon that needs a label to decode |
| Prefer `Default`/`Large` for touch UIs (≥44px) | Use `Small` (36px) as a primary touch target |
| Keep the same `variant` semantics as Button | Invent an icon-only-only color treatment |

## Edge cases

- **Gradient hover** — fully defined: `Gradient/Hover` + size-scaled solid shadow, matching the solid hover states.
- **Icon size** — fixed per size (16/20/24); confirm behavior if a consumer passes an oversized icon (clip vs. overflow).
- **RTL** — directional icons (e.g. `chevron-left`) should mirror in RTL. ⚠️ Confirm the icon set handles this.
- **Loading** — no loading variant in Figma; if added, swap icon for a spinner and set `aria-busy`.

## Open questions — what needs your confirmation

1. ~~State axis property name~~ — **RESOLVED, re-verified via MCP 2026-07-18.** Figma property is now named `State`, matching Button.
2. **`Small` touch target** (36×36 < 44) — pointer-only, or add hit area?
3. ~~Per-state icon color pairings~~ — **RESOLVED and confirmed in Figma, re-verified via MCP 2026-07-18**: `on_action` (non-hover states) / `on_hover` (hover states only) — matches Button. Both tokens now bound on this node.
4. **Focus state** — define the shared focus-ring token (applies to both Button and this).
5. **Component path + export name** (`ButtonIconOnly`?).
6. Same `State`-axis prop-split confirmation as Button (shared decision).

_Resolved this round: gradient-hover state added (7 states, matches Button); Default height 48; gradient-hover shadow added (`solid-sm`/`solid-xs` by size)._

---

# Filter Chip

> Figma component set: `Filter Chip` — node `707:1656`
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1656
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/FilterChip.tsx]`
> Last updated: 2026-07-18
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A small pill-shaped control used to filter or tag a list of results (e.g. trip categories, date ranges). Shows a leading icon and a short text label. **Multi-select** — more than one chip can be active at once within a group (confirmed by design, 2026-07-18); this is not a single-select/radio pattern.

Unlike [Button](#button), Figma models **no interaction states in the conventional sense** (no `Hover`, no `Disabled`) — instead it exposes four named visual variants. Per design confirmation (2026-07-18): `Outline` = unselected, `Default` = selected, `Highlighted` = highlighted, `Active` = the filter-active state. **No hover state has been designed yet** — this is a gap to fill before implementation, not a state hiding under a different name.

## Variant axes

The Figma component set contains **12 variants** (enumerated directly via `get_metadata` — not estimated).

Figma exposes **two** variant properties. Names below are the exact strings from Figma's property panel.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `Default` · `Highlighted` · `Active` · `Outline` | 4 |
| `Size` | `Small` · `Regular` · `Large` | 3 |

✅ `State` meaning confirmed (2026-07-18, per design): `Outline`→**unselected**, `Default`→**selected**, `Highlighted`→**highlighted**, `Active`→**filter-active**. No hover state exists yet — see States and Open questions for the remaining nuance (how `selected` and `filter-active` relate).

In addition to the two variant properties, `get_design_context` surfaces **three component-level (non-variant) properties** layered on top of every variant — these don't multiply the count, they're independently toggleable on any of the 12:

| Component property | Type | Default | Notes |
|---|---|---|---|
| `showIcon` | boolean | `true` | Toggles the leading icon on/off. |
| `iconSwap` | instance-swap | diamond placeholder | Icon glyph override (same pattern as Button's icon slot — the file placeholder icon isn't a confirmed final choice; see `PT_tokens.md` §4 "Icons" for the Tabler Icons import/naming convention. Note: `diamond` is itself a real Tabler icon — `IconDiamond` in `@tabler/icons-react`, confirmed live at tabler.io — a useful signal, not a confirmed final choice). ✅ **RESOLVED (2026-07-19):** this property was originally named `swapIcon`; renamed in Figma to `iconSwap` to match Eyebrow Highlight's identical property — confirmed live via `get_design_context`, both components now consistent. |
| `title` | text | `"Filter text"` | The label content. |

> ⚠️ There is **no `Icon` variant axis** here (unlike Button, where `Icon` is a full variant property). Icon presence/swap is a component property instead. There is also **no `Disabled` state** anywhere in the set — a gap Button/Button (Icon only) do not have (both include `Disabled` on every type).

### Variant math (axes multiplied vs. actual)

```
4 (State) × 3 (Size) = 12 theoretical
Actual component count = 12
Excluded                = 0
```

**No exclusions.** Every `State` value is available at every `Size` — the full matrix exists. This is notably different from Button/Button (Icon only), where several `State` values are Primary-only and excluded elsewhere. Flag this as a genuine structural difference, not an oversight: Filter Chip's state axis is type-independent (there's no `Filter Chip Type` axis at all — no Primary/Secondary/Tertiary equivalent).

### Valid combinations

```
{Default, Highlighted, Active, Outline} × {Small, Regular, Large} = 12, all valid.
```

## Props (code API)

⚠️ CONFIRM with tech lead. `State` semantics are now confirmed (2026-07-18, per design): `Outline`=unselected, `Default`=selected, `Highlighted`=highlighted, `Active`=filter-active. Kept as a single enum rather than split into booleans (like Button's `State`) because Figma still models these as **four mutually exclusive variants** — no combined states (e.g. "selected + hover") exist in the file to justify decomposing into independent flags yet.

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `state` | `'unselected' \| 'selected' \| 'highlighted' \| 'active'` | `'unselected'` | Renamed from Figma's raw strings for clarity: `Outline→unselected`, `Default→selected`, `Highlighted→highlighted`, `Active→active`. Default is `'unselected'` (the natural resting state) — this **diverges from Figma's own component default**, which is the `Default`/`selected` variant; see Figma-vs-code divergences. ⚠️ `selected` and `active` both read as "on" states — confirm whether `active` is a sub-state of `selected` (selected, then applied/active) or an independent alternate representation; see Open questions. |
| `Size` | `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Value mapping: `Small→sm`, `Regular→md`, `Large→lg`. ⚠️ Figma's middle value is named **`Regular`**, not `Default` (Button's middle value). See Cross-component consistency check — flagged as naming drift. |
| `showIcon` + `iconSwap` | `icon` | `ReactNode` (optional) | — | Recommend collapsing Figma's two properties into one optional slot: passing `icon` renders it (replaces `iconSwap`'s asset), omitting it is equivalent to `showIcon=false`. Mirrors Button's `iconLeading` pattern. ⚠️ CONFIRM. |
| `title` | `children` | `ReactNode` | — | Renamed for consistency with Button, which takes label content as `children` rather than a `title` prop. ⚠️ CONFIRM — or keep a literal `label: string` prop if the codebase prefers explicit text props over `children`. |

Non-visual props the code needs regardless of Figma, **none of which exist in the file** — flagged, not invented:

- `onToggle: (state: 'unselected' | 'selected') => void` — required; this is a **multi-select** toggle control (confirmed 2026-07-18), so each chip toggles independently — no `FilterChipGroup`-enforced mutual exclusivity needed for the toggle itself, though a wrapper may still be useful for layout/query-state aggregation.
- `aria-pressed` — derive from `state`: recommend `true` for `selected`/`active`, `false` for `unselected`/`highlighted`. ⚠️ CONFIRM `highlighted`'s interactivity — is it independently clickable/togglable, or a read-only/computed indicator (e.g. auto-applied based on search match)? That determines whether it needs `aria-pressed` at all, or a different role entirely (e.g. `aria-live` region badge).
- `disabled` — **no Figma basis.** Button and Button (Icon only) both model `Disabled`; Filter Chip does not. Confirm whether this component can ever be disabled before adding the prop.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `Default`/`Highlighted`/`Active`/`Outline`; Figma's own component default is `Default` | Renamed enum `'unselected'\|'selected'\|'highlighted'\|'active'` (`Outline→unselected`, `Default→selected`, `Highlighted→highlighted`, `Active→active`); **code default is `'unselected'`**, not `'selected'` | Meaning confirmed 2026-07-18: `Outline`=unselected, `Default`=selected, `Highlighted`=highlighted, `Active`=filter-active. Kept as one enum (not booleans) since Figma models no combined states. Code default deliberately diverges from Figma's raw component default — a freshly-rendered, not-yet-interacted chip should read as unselected, regardless of which variant Figma happens to mark as its own default. |
| 2 | `Size` = `Small`/`Regular`/`Large` | `size='sm'\|'md'\|'lg'` (`Regular→md`) | Same sm/md/lg convention as Button, for cross-component consistency in the code API — even though Figma's raw string (`Regular`) differs from Button's (`Default`). Purely a code-side normalization; the underlying Figma value is preserved in the mapping note. |
| 3 | `showIcon` (bool) + `iconSwap` (instance swap) | Single optional `icon: ReactNode` slot | Two Figma properties model one concern (icon presence + glyph). Collapsing to one optional prop matches Button's `iconLeading`/`iconTrailing` pattern and removes a redundant boolean (icon presence is implied by whether `icon` is passed). |
| 4 | `title` (text property) | `children` | Consistency with Button's prop shape (label passed as JSX children, not a string prop). |

**Not carried over from Button — do not assume these apply:** `variant` (Primary/Secondary/Tertiary) has no equivalent here; there is no `Filter Chip Type` axis. Do not invent one.

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on node `707:1656`), resolved to the canonical token in [`PT_tokens.md`](./PT_tokens.md).

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | Same token Button/Icon-only do **not** use — first appearance in this doc set. |
| `Colors/Border/Card_primary` | `--pt-semantic-border-card_primary` | `#a8c0c7` | First appearance in this doc set. |
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | `Default`/`Outline` label color. |
| `Colors/Icon/Body` | `--pt-semantic-icon-body` | `#222628` | `Default`/`Outline` icon color. ✅ **RESOLVED AND CONFIRMED IN FIGMA — re-verified via MCP 2026-07-18.** `get_variable_defs` now returns `Icon/Body` bound; `Icon/Headings` is **no longer present** on this node at all (a clean swap, not a partial one — it was still lingering as of the prior check). Matches the label's `Typography/Body` role, as intended. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Highlighted` background. |
| `Colors/Border/Action` | `--pt-semantic-border-action` | `#5d9c4d` | `Highlighted` **and** `Active` border. Same token/value Button uses for its `Default`/`Hover` border family — no drift. |
| `Colors/Typography/Success` | `--pt-semantic-typography-success` | `#385e2e` | `Highlighted` label. |
| `Colors/Icon/Success` | `--pt-semantic-icon-success` | `#385e2e` | `Highlighted` icon. Role matches its label (`success`/`success`) — consistent, unlike the `Default`/`Outline` pairing above. |
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | `Active` background. Same token/value as Button's `Default` (Primary) background — no drift. |
| `Colors/Typography/On_action` | `--pt-semantic-typography-on_action` | `#ffffff` | `Active` label. Same token Button uses for its Primary label — no drift. |
| `Colors/Icon/On_action` | `--pt-semantic-icon-on_action` | `#ffffff` | `Active` icon. ⚠️ **Drift vs. Button** — Button's equivalent (white icon on filled Primary) is bound to `Colors/Icon/On_hover` (`--pt-semantic-icon-on_hover`), not `Icon/On_action`. Both tokens resolve to the same value (`#ffffff` light / `#000000` dark), but they are **two different Figma variables** used for what should be the same semantic role. See Cross-component consistency check — this is the clearest drift finding on this component. |
| `Colors/Border/Default` | `--pt-semantic-border-default` | `#222628` | `Outline` border. First appearance in this doc set (Button never uses `border-default`). |
| `Scale/Quat` | `--pt-scale-quat` | `1px` | Border width. ⚠️ Only the `Highlighted` state's generated code explicitly binds `border-[length:var(--scale/quat,1px)]`; `Default`, `Active`, and `Outline` render a bare `border` (Tailwind's implicit 1px) with no explicit length token in the generated code. Functionally identical (1px either way, and `Scale/Quat`=1px is the only token that value could be), but only `Highlighted` proves the binding — flagged for verification rather than assumed. |
| `Scale/1` | `--pt-scale-1` | `4px` | `Small` vertical padding; icon↔label gap (all sizes). |
| `Scale/2` | `--pt-scale-2` | `8px` | `Small` radius; `Regular`/`Large` vertical padding. |
| `Scale/3` | `--pt-scale-3` | `12px` | `Small` horizontal padding. |
| `Scale/4` | `--pt-scale-4` | `16px` | `Regular`/`Large` horizontal padding **and** radius. |
| `Scale/6` | `--pt-scale-6` | `24px` | `Large` label line-height — bound to `Scale/6`, not a `body-default-line_height` token. Same reuse pattern already documented on Button (§ Tokens used, Default size). No drift. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | Same "renders as Medium, bound as Regular" naming quirk already documented on Button. |
| `Body_xs/Font_size`, `Body_xs/Line_height` | `--pt-typography-body-xs-font_size`, `-line_height` | `12px`, `16px` | `Small` size label. First use of the `xs` body step in this doc set. |
| `Body_sm/Font_size`, `Body_sm/Line_height` | `--pt-typography-body-sm-font_size`, `-line_height` | `14px`, `20px` | `Regular` size label. Matches Button's `Small`-size values exactly — same tokens, no drift. |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | `Large` size label; line-height bound to `Scale/6` (see above), not `body-default-line_height`. |
| icon-size `12` → stroke weight `1` | `--pt-icon-stroke_weight-12` | `1` | Confirms `PT_tokens.md` §7.3 exactly — no drift. |
| icon-size `16` → stroke weight `1.5` | `--pt-icon-stroke_weight-16` | `1.5` | Confirms `PT_tokens.md` §7.3 exactly — no drift. |

**No HARDCODED colors, spacing, or typography values found.** Every color, spacing, and type value is bound to a canonical token. The one soft gap is icon **size** itself (12px / 16px containers) — like Button, the icon's pixel dimensions aren't bound to a named size token in Figma, only the stroke weight is → `⚠️ HARDCODED — no token bound in Figma` (same systemic gap already flagged on Button; this confirms it's file-wide, not a one-off).

### Per-variant token map

| State | Background | Border (`1px` = `--pt-scale-quat`) | Label color | Icon color |
|---|---|---|---|---|
| `Default` | `--pt-semantic-surface-card_primary` | `--pt-semantic-border-card_primary` | `--pt-semantic-typography-body` | `--pt-semantic-icon-body` ✅ (confirmed, `Icon/Headings` fully removed from the node) |
| `Highlighted` | `--pt-semantic-surface-success` | `--pt-semantic-border-action` | `--pt-semantic-typography-success` | `--pt-semantic-icon-success` |
| `Active` | `--pt-semantic-surface-action` | `--pt-semantic-border-action` | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ✅ (confirmed bound, re-verified via MCP 2026-07-18) |
| `Outline` | none (transparent) | `--pt-semantic-border-default` | `--pt-semantic-typography-body` | `--pt-semantic-icon-body` ✅ (same as `Default`, confirmed) |

`Default`/`Outline` icon pairing is now fully resolved and confirmed via a fresh MCP pull (2026-07-18): `Icon/Body` is bound, `Icon/Headings` is gone from the node entirely — a clean swap. `Highlighted`/`Active` pairing is still ⚠️ inferred from `get_variable_defs`' bound-variable list plus the matching label color per state (icon nodes render as `<img>` SVG assets in `get_design_context`, same limitation already documented on Button — the fill isn't literally traceable through the generated code); `Active`'s `On_action` binding is at least confirmed present on the node.

### Sizing (measured per size from Figma; all bound to scale/type tokens)

| Size (Figma → code) | Padding V | Padding H | Radius | Gap (icon↔label) | Font size | Line-height | Icon size | Frame height |
|---|---|---|---|---|---|---|---|---|
| `Small` → `sm` | `--pt-scale-1` (4px) | `--pt-scale-3` (12px) | `--pt-scale-2` (8px) | `--pt-scale-1` (4px) | `--pt-typography-body-xs-font_size` (12px) | `--pt-typography-body-xs-line_height` (16px) | 12px | 24px |
| `Regular` → `md` | `--pt-scale-2` (8px) | `--pt-scale-4` (16px) | `--pt-scale-4` (16px) | `--pt-scale-1` (4px) | `--pt-typography-body-sm-font_size` (14px) | `--pt-typography-body-sm-line_height` (20px) | 16px | 36px |
| `Large` → `lg` | `--pt-scale-2` (8px) | `--pt-scale-4` (16px) | `--pt-scale-4` (16px) | `--pt-scale-1` (4px) | `--pt-typography-body-default-font_size` (16px) | `--pt-scale-6` (24px) | 16px | 40px |

Notes:

- `Regular` and `Large` share **identical** padding and radius (8px vertical / 16px horizontal / 16px radius) — they differ only by font size/line-height, exactly like Button's `Default`/`Large` sharing padding+radius and differing by type. No drift, consistent design pattern across components.
- **Gap does not scale by size** here — all three sizes use the same `--pt-scale-1` (4px) icon↔label gap. This **differs from Button**, where gap scales with size (`Small`=4px, `Default`/`Large`=8px). Flagged as a genuine design difference, not an error — see Cross-component consistency check.
- **Icon does not scale between `Regular` and `Large`** — both use the 16px icon; only `Small` gets the smaller 12px icon. This differs from Button, where icon size scales at every step (16/20/24px across Small/Default/Large). Flagged — see Cross-component consistency check.
- Frame heights are content-driven (padding×2 + line-height), matching Button's approach: `Small` 4×2+16=24px ✓, `Regular` 8×2+20=36px ✓, `Large` 8×2+24=40px ✓. No bound min-height token, same as Button.
- Radius values (`Scale/2`=8px `Small`, `Scale/4`=16px `Regular`/`Large`) are **larger and use different scale steps** than Button's radius (`Scale/1half`=6px `Small`, `Scale/2`=8px `Default`/`Large`). This is expected — Filter Chip is a fully-rounded pill, Button is not — and both draw from the canonical scale, so no HARDCODED flag.

## States

✅ Semantics confirmed 2026-07-18 (per design). The `selected`/`active` relationship is now resolved too — see below the table.

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Outline` | Transparent background, dark (`border-default`) border, dark label/icon | **Unselected** — the resting state before any interaction. |
| `Default` | White card background, `card_primary` border, dark label/icon | **Selected.** ⚠️ Note the naming inversion: Figma's own "Default" variant is the code's *non-default* (`selected`) state — see Figma-vs-code divergences #1. |
| `Highlighted` | Light green (`success`) background, green (`action`) border, green label/icon | **Highlighted** — a distinct state from selection. ⚠️ Still open: is this user-triggered (clickable/togglable) or system-computed (e.g. a search match or recommendation)? Determines whether it needs its own `aria-pressed` handling — see Props/Accessibility. |
| `Active` | Solid green (`action`) background, white label/icon | **Filter-active** — the filter is currently being applied. ✅ Resolved (2026-07-18): the transition from `selected` to `active` happens **automatically** — see note below. |
| Hover | **Absent in Figma — confirmed, not hiding under `Highlighted`.** No hover state has been designed yet (per design, 2026-07-18). | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Until it's designed, use a minimal CSS-only placeholder (e.g. a subtle background/border shift using existing `_hover` tokens) rather than shipping with no hover feedback at all — flag it as a placeholder, not a final design. |
| Focus (keyboard) | **Absent in Figma.** | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Same gap as Button. Must be added before launch; no token exists yet. |
| Disabled | **Absent in Figma.** Confirmed absence — Button and Button (Icon only) both model `Disabled`; this component doesn't. | ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Not blocking initial implementation — omit the `disabled` prop until specified. |

**`selected`→`active` transition — RESOLVED (2026-07-18): automatic.** Clicking a chip drives it straight to `active` — there's no separate "apply" step waiting on the consumer to confirm the filtered results loaded. In practice this means the component's own `onToggle` handler can set `active` directly on click; a distinct `selected`-but-not-yet-`active` moment isn't part of the interaction (the `Default`/`selected` visual exists as a state in Figma, but the transition through it happens automatically, not as a separate user-facing step).

## Accessibility

Required section — Figma encodes no accessibility metadata, so most of this is a design gap to close, not a fact read from the file.

- ✅ **Interaction model confirmed (2026-07-18): multi-select toggle.** Renders a real `<button aria-pressed={selected}>`, not a static `<div>`. Each chip toggles independently — no radio-group mutual exclusivity. `aria-pressed` should be `true` for `selected`/`active`, `false` for `unselected`/`highlighted` — pending confirmation of whether `highlighted` is itself interactive (see Props).
- ⏸️ **Touch target — acknowledged, deferred (2026-07-18, per your direction).** Frame heights are `Small`=24px, `Regular`=36px, `Large`=40px — all three below the 44×44px minimum, including `Large`. Not being addressed right now; revisit later if it becomes a real usability issue.
- ⏳ **Focus ring — added to the design system roadmap** (see `MD_progress.md`): same gap as Button, absent from Figma, must be added and tokenized before implementation.
- ⚠️ **Contrast to verify** (not encoded in Figma): `Highlighted` label `--pt-semantic-typography-success` (`#385e2e`) on `--pt-semantic-surface-success` (`#dfebdb`) — looks safe (dark-on-light) but not measured here; confirm ≥4.5:1. `Active` white label on `--pt-semantic-surface-action` (`#5d9c4d`) — same pairing Button already uses for Primary; if Button's ratio was accepted, this one is equivalent.
- If `showIcon=false`, confirm the label alone still conveys the filter's meaning (icon-only chips would need the same `aria-label` treatment as Button (Icon only), but that's not this component's default shape).

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use for filtering/tagging a list of results, multiple chips selectable at once | Use as a substitute for Button — this is a toggle, not a submit/navigate action |
| Keep labels short (design shows "Filter text" — a 2-word placeholder) | Use sentence-length labels; frame height is content-driven and will grow unpredictably |
| Reuse the same `icon` slot pattern as Button | Invent a `disabled` treatment — no Figma basis exists |
| Toggle `unselected`↔`selected` on click | Assume `active` always fires on click — confirm whether it's a separate "applied" step first |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long labels:** Same `whitespace-nowrap` pattern as Button (no wrap modeled) — confirm truncation behavior.
- **`showIcon=false`:** Does the gap token collapse to 0, or does the label just shift left with a dead 4px gap? Not modeled in Figma (icon is present in all 12 sampled variants).
- **Multiple chips in a row:** No wrapping/overflow container is part of this component — confirm the row-level layout (horizontal scroll vs. wrap) lives elsewhere.
- **RTL:** Not modeled. ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Not blocking for LTR-only launch.
- ~~Selection model~~ — **RESOLVED**: multi-select (confirmed 2026-07-18). No mutual-exclusivity logic needed between chips; each toggles independently.
- ~~`selected` → `active` transition~~ — **RESOLVED**: automatic on click, see States section above.
- **Disabled:** No variant exists. ⏳ **DEFERRED — added to the design system roadmap** (see `MD_progress.md`). Not blocking initial implementation — omit the `disabled` prop until specified.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation. `state` values reflect the confirmed semantics, and the `selected`→`active` transition is automatic (see States).

```tsx
import { FilterChip } from '@/components/FilterChip';

// Unselected (resting) — Figma: State=Outline
<FilterChip size="md" icon={<DiamondIcon />} onToggle={handleToggle}>
  Trip type
</FilterChip>

// Selected — Figma: State=Default
<FilterChip state="selected" size="md" icon={<DiamondIcon />} onToggle={handleToggle}>
  Trip type
</FilterChip>

// Filter-active — Figma: State=Active
<FilterChip state="active" size="sm" icon={<DiamondIcon />} onToggle={handleToggle}>
  Beach
</FilterChip>

// Highlighted — Figma: State=Highlighted. ⚠️ Interactivity unconfirmed (see Props).
<FilterChip state="highlighted" size="lg" icon={<DiamondIcon />}>
  Duration
</FilterChip>
```

## Cross-component consistency check

Comparing Filter Chip's tokens, naming, and structure against the already-documented Button and Button (Icon only). Findings below — not smoothed over.

1. ~~Icon-on-filled-surface token drift~~ — **FULLY RESOLVED, confirmed in Figma via MCP 2026-07-18.** `Icon/On_action` for all non-hover filled states, `Icon/On_hover` for hover states only. Confirmed bound on **all three** components now: Button, Button (Icon only), and Filter Chip's `Active` state. No remaining drift.
2. ~~Label/icon semantic-role mismatch on `Default`/`Outline`~~ — **FULLY RESOLVED, confirmed in Figma via MCP 2026-07-18.** `Icon/Body` is bound on both `Default` and `Outline`; `Icon/Headings` is gone from the node entirely (clean swap, not partial).
3. **⚠️ Size-axis value naming diverges.** Button's middle size value is `Default`; Filter Chip's is `Regular`. Both mean the same thing (the middle of three steps, mapped to code `md`), but the Figma strings differ across components. Not a defect, but codegen must not assume the string is always `Default` — confirm this is intentional variation or should be unified in Figma.
4. **No drift in shared color tokens.** `Colors/Border/Action` (`#5d9c4d`) and `Colors/Surface/Action` (`#5d9c4d`) resolve identically here and on Button — reused correctly, no divergence.
5. **No drift in the `Body_sm` type step.** Filter Chip's `Regular` size uses the exact same `Body_sm` tokens (14px/20px) as Button's `Small` size — consistent, confirms `PT_tokens.md`'s corrected `20px` line-height value (not the stale JSON `24px`) is being applied correctly system-wide.
6. **Property-naming convention (axis names) is consistent within Filter Chip but diverges from Button's convention.** Button prefixes its variant properties with the component name (`Button Type`, `Button Size`); Filter Chip does not (`State`, `Size` — unprefixed). Both are internally consistent (no accidental-rename issue like Button (Icon only)'s `Default_Gradient_Hover` mismatch), but the file-wide convention isn't uniform. Flag for a design-system naming standard, not an error in this component.
7. **Structural difference, not drift:** Filter Chip has no `Type` axis (no Primary/Secondary/Tertiary equivalent) and no `Icon` variant axis (icon is a component property, not a variant). Confirmed intentional differences in how this component is built, not a documentation gap.
8. **Gap and icon-size do not scale with `Size`** the way they do on Button (see Sizing notes above) — a real design difference between the two components, not a token error, since every value used is still a canonical scale step.
9. **No `Disabled` state** — the first component in this doc set to omit it. Confirmed via full enumeration (12/12 variants), not an oversight in reading.

**Summary (final check 2026-07-18, all confirmed live in Figma via MCP): both #1 icon-on-filled token and #2 label/icon role mismatch are now fully resolved across all three components — Button, Button (Icon only), and Filter Chip all match. Plus several intentional structural differences that are fine as-is but now documented so the codegen agent doesn't assume Filter Chip mirrors Button's shape.**

## Open questions — what needs your confirmation

1. ~~What do `Default`/`Highlighted`/`Active`/`Outline` actually mean?~~ — **RESOLVED 2026-07-18**: `Outline`=unselected, `Default`=selected, `Highlighted`=highlighted, `Active`=filter-active. `selected`→`active` transition is automatic on click (resolved, see States). **Still genuinely open:** is `highlighted` user-triggered or system-computed? See Props/Accessibility for where this affects the implementation.
2. ~~Interaction model~~ — **RESOLVED 2026-07-18**: multi-select toggle (`aria-pressed`), not a radio group. No `FilterChipGroup` mutual-exclusivity logic required.
3. ⏸️ **Touch target — acknowledged, deferred (2026-07-18, per your direction).** Not being addressed right now.
4. ⏳ **`Disabled` — added to the design system roadmap** (see `MD_progress.md`). Not blocking initial implementation.
5. ~~Icon-on-filled token~~ — **RESOLVED**: Button, Button (Icon only), and Filter Chip's `Active` state all confirmed on `Icon/On_action`/`Icon/On_hover`, re-verified via MCP 2026-07-18.
6. ~~Label/icon role mismatch~~ — **RESOLVED**: icon token confirmed as `Icon/Body` on both `Default` and `Outline`, `Icon/Headings` fully removed from the node.
7. **`Regular` vs. Button's `Default`** — same size-tier, different Figma string. Standardize naming across components, or accept the variance (code-side `md` mapping already absorbs it)?
8. **Border-width binding on `Default`/`Active`/`Outline`** — only `Highlighted`'s 1px border came through as an explicit `Scale/Quat` token in the generated code; the other three render an implicit Tailwind default. Worth confirming all four are genuinely bound the same way in Figma.
9. ⏳ **Focus ring — added to the design system roadmap.** Same shared open item as Button (token still doesn't exist anywhere in the file).
10. ⏳ **RTL — added to the design system roadmap.** Does the icon mirror to trailing in RTL, same open question as Button?
11. **`showIcon=false` layout** — does the gap collapse, or stay reserved?
12. **Component code path + export name** for the header block.

---

# Eyebrow Highlight

> Figma node: `Eyebrow highlights` — node `707:1669` (a wrapper frame containing 10 variant instances of a single underlying component — not itself a component-set node, unlike Button/Button (Icon only)/Filter Chip. Functionally equivalent: `get_design_context` on every instance resolves to the same `EyebrowHighlights` component signature with `state`/`type`/`showIcon`/`iconSwap`/`text` props, confirming one underlying component with 10 variant instances.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1669
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/EyebrowHighlight.tsx]` (Figma generates the plural export name `EyebrowHighlights` — ⚠️ CONFIRM singular vs. plural for the code component name; the frame/instance name is plural, but every other component in this doc set is named in the singular)
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A small pill-shaped inline label used to call out a status or category next to other content (e.g. flagging a trip highlight as positive, informational, a warning, an error, or neutral). Shows an optional leading icon and a short text label.

✅ **RESOLVED (2026-07-19, per your confirmation): this component is not interactive.** It's a static, decorative status label — no click handler, no `onClick`/`onToggle`, no hover/focus/disabled states needed. Render it as a non-interactive `<span>`, never a `<button>` or `<a>`. See States and Accessibility.

## Variant axes

The Figma node contains **10 variants** (enumerated directly via `get_metadata` — not estimated).

Figma exposes **two** variant properties. Names below are the exact strings from Figma's property panel.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `Positive` · `Information` · `Warning` · `Error` · `Neutral` | 5 |
| `Type` | `Soft` · `Solid` | 2 |

✅ **RESOLVED (2026-07-19).** This was originally named `Light`/`Dark` in Figma, flagged here as a likely source of confusion with the app's actual theme mode (it's really a soft-vs-solid fill-weight axis, not a theme axis — every one of these semantic color tokens already carries its own separate light-theme/dark-theme resolved value in `PT_tokens.md` §7.4–7.8, and that swap happens independently of this property). **You renamed it directly in Figma to `Soft`/`Solid`, confirmed live via `get_metadata` on 2026-07-19** — the property now reads exactly as it should, no code-side rename or divergence needed. `Soft` = a soft/pastel background + a matching border, dark-on-light label. `Solid` = a solid/saturated background, no border, (almost always) white label.

There is **no `Size` axis at all** — a structural difference from Button (3 sizes) and Filter Chip (3 sizes). Every variant renders at one fixed geometry. Confirmed via `get_metadata`'s 10-symbol enumeration and consistent geometry across all 10 sampled `get_design_context` calls.

In addition to the two variant properties, `get_design_context` surfaces **three component-level (non-variant) properties** on every variant — these don't multiply the count, they're independently toggleable on any of the 10:

| Component property | Type | Default | Notes |
|---|---|---|---|
| `showIcon` | boolean | `true` | Toggles the leading icon on/off. |
| `iconSwap` | instance-swap | `null` → diamond placeholder | Icon glyph override — see `PT_tokens.md` §4 "Icons" for the Tabler Icons import/naming convention. Note: `diamond` is itself a real Tabler icon (`IconDiamond`, confirmed live at tabler.io) — a useful signal, not a confirmed final choice. ✅ **RESOLVED (2026-07-19):** Filter Chip's equivalent property was renamed from `swapIcon` to `iconSwap` in Figma to match — confirmed live via `get_design_context` on node `707:1656`, which now returns `iconSwap` in its prop signature. Both components use the same name. |
| `text` | text | `"Important"` | The label content. |

### Variant math (axes multiplied vs. actual)

```
5 (State) × 2 (Type) = 10 theoretical
Actual component count = 10
Excluded                = 0
```

**No exclusions.** Every `State` value is available at every `Type` — the full matrix exists, same pattern as Filter Chip (and unlike Button, where several `State` values are Primary-only).

### Valid combinations

```
{Positive, Information, Warning, Error, Neutral} × {Soft, Solid} = 10, all valid.
```

## Props (code API)

⚠️ CONFIRM with tech lead. Two renames are recommended here, both flagged rather than applied silently:

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `status` | `'positive' \| 'information' \| 'warning' \| 'error' \| 'neutral'` | `'positive'` (Figma's spatial/enumeration-order default — first symbol in `get_metadata`, not confirmed via an explicit master-component default read) | Renamed `State→status` (lowercased values) to avoid a naming collision: `State` is already used by Button (interaction/intent/treatment) and by Filter Chip (selection) for two *different* meanings. This component's `State` is a semantic status category, a third distinct meaning behind the same Figma property name across the system. See Cross-component consistency check. ⚠️ CONFIRM the rename. |
| `Type` | `emphasis` | `'soft' \| 'solid'` | `'soft'` (mirrors Figma's `Soft`) | ✅ **RESOLVED (2026-07-19):** Figma's property is now itself named `Soft`/`Solid` (you renamed it directly in Figma — confirmed via MCP), so this is a straight 1:1 lowercase mapping, not a divergence. `emphasis: 'soft' \| 'solid'` still recommended as the code prop name to keep it distinct from `status`, since "type" is a generic/overloaded word — ⚠️ CONFIRM the prop name itself, the underlying values are no longer in question. |
| `showIcon` | `showIcon` | `boolean` | `true` | Direct match, no rename needed. |
| `iconSwap` | `icon` | `ReactNode` | — | Collapse `showIcon` + `iconSwap` into one optional slot (icon renders if passed, `showIcon=false` equivalent to omitting it) — same collapsing pattern recommended for Filter Chip's `showIcon`+`iconSwap` (now matching names on both components, see Cross-component consistency check). |
| `text` | `children` | `ReactNode` | `"Important"` (Figma placeholder) | Renamed for consistency with Button's content pattern (children over a string prop). ⚠️ CONFIRM — or keep a literal `text: string` prop; note this would be a *third* different content-prop name across the doc set alongside Filter Chip's recommended `children` and its raw Figma `title` — see Cross-component consistency check. |

Non-visual props the code needs regardless of Figma, **none of which exist in the file** — flagged, not invented:

- ✅ **RESOLVED (2026-07-19): confirmed not interactive.** No `onClick`/`onToggle` — this component never needs them.
- ✅ **RESOLVED:** semantic element is a non-interactive `<span>` (not a `<button>`). Use `role="status"` only if a given instance's label content changes dynamically and should be announced to assistive tech; plain `<span>` is sufficient otherwise. See Accessibility.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `Positive`/`Information`/`Warning`/`Error`/`Neutral` | `status='positive'\|'information'\|'warning'\|'error'\|'neutral'` | Pure rename to avoid the cross-component `State`-name collision (see Props). Meaning unchanged — this is a direct 1:1 value mapping, just relocated to a differently-named prop. |
| 2 | `Type` = `Soft`/`Solid` (renamed in Figma 2026-07-19 from the original `Light`/`Dark`) | `emphasis='soft'\|'solid'` | Figma's value naming now already matches the intended meaning — this row is now a plain rename of the *property*, not the *values*. Kept as `emphasis` rather than `type` purely to avoid the generic/overloaded word "type" in code. |
| 3 | `showIcon` (bool) + `iconSwap` (instance swap) | Single optional `icon: ReactNode` slot | Same collapsing pattern as Filter Chip's `showIcon`+`iconSwap` (now a matching name on both components) — two Figma properties model one concern (icon presence + glyph). |
| 4 | `text` (text property) | `children` | Consistency with Button's prop shape. ⚠️ Confirm — Filter Chip's equivalent (`title`) was *also* recommended to become `children`; if that recommendation isn't taken there, don't apply it here either, to avoid a third inconsistent pattern. |
| 5 | `Warning`/`Solid`'s label bound to `Warning/800` — a real, named Figma variable (confirmed via screenshot of the Fill panel, 2026-07-19: it's a proper token reference, not an unbound/typed-in hex), but it's a **primitive**-tier variable, not one of the semantic `Colors/Typography/*` variables every other state uses | Consume `--pt-color-yellow-800` (its correct canonical mapping) as-is — this is a legitimate bound token, not a placeholder | Not a HARDCODED value — corrected framing from the previous draft. It's real and intentional in Figma. The only open question is a system-design one, not a data-accuracy one: should `PT_tokens.md` grow a semantic `on_warning` role so this (and any future solid-yellow-on-white-text case) auto-adjusts for theme the way the other four `Solid` states' labels do? See Open questions #4. |

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on node `707:1669`, cross-checked per-variant via `get_design_context` on all 10 instances — not estimated from a subset), resolved to the canonical token in [`PT_tokens.md`](./PT_tokens.md).

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Light | Dark | Flag |
|---|---|---|---|---|
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `#253e1f` | `Positive`/`Soft` background. |
| `Colors/Border/Success` | `--pt-semantic-border-success` | `#bed7b8` | `#4a7d3e` | `Positive`/`Soft` border. |
| `Colors/Typography/Success` | `--pt-semantic-typography-success` | `#385e2e` | `#9ec494` | `Positive`/`Soft` label. |
| `Colors/Icon/Success` | `--pt-semantic-icon-success` | `#385e2e` | `#9ec494` | `Positive`/`Soft` icon — ⚠️ inferred (icon renders as an `<img>` SVG asset in `get_design_context`; fill isn't literally traceable through the generated code, same limitation already documented on Button/Filter Chip). |
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | `#7db071` | `Positive`/`Solid` background. Same token/value as Button's Primary `Default` background — no drift. |
| `Colors/Typography/On_action` | `--pt-semantic-typography-on_action` | `#ffffff` | `#000000` | Label on **4 of the 5** `Solid`-type states (`Positive`, `Information`, `Error`, `Neutral`). |
| `Colors/Icon/On_action` | `--pt-semantic-icon-on_action` | `#ffffff` | `#000000` | Icon on the same 4 `Solid`-type states — ⚠️ inferred, same SVG-asset limitation. |
| `Colors/Surface/Information` | `--pt-semantic-surface-information` | `#ccebf4` | `#003e50` | `Information`/`Soft` background. |
| `Colors/Border/Information` | `--pt-semantic-border-information` | `#99d7e9` | `#007ca0` | `Information`/`Soft` border. |
| `Colors/Typography/Information` | `--pt-semantic-typography-information` | `#005d78` | `#66c3de` | `Information`/`Soft` label. |
| `Colors/Icon/Information` | `--pt-semantic-icon-information` | `#005d78` | `#66c3de` | `Information`/`Soft` icon — ⚠️ inferred. |
| `Colors/Surface/Information_core` | `--pt-semantic-surface-information_core` | `#009bc8` | `#009bc8` | `Information`/`Solid` background. Same value both themes (matches `PT_tokens.md` §7.6 exactly). |
| `Colors/Surface/Warning` | `--pt-semantic-surface-warning` | `#fdf1d9` | `#62491a` | `Warning`/`Soft` background. |
| `Colors/Border/Warning` | `--pt-semantic-border-warning` | `#fbe2b3` | `#c39233` | `Warning`/`Soft` border. |
| `Colors/Typography/Warning` | `--pt-semantic-typography-warning` | `#62491a` | `#f8d48c` | `Warning`/`Soft` label. |
| `Colors/Icon/Warning` | `--pt-semantic-icon-warning` | `#62491a` | `#f8d48c` | `Warning`/`Soft` icon — ⚠️ inferred. |
| `Colors/Surface/Warning_core` | `--pt-semantic-surface-warning_core` | `#f4b740` | `#f4b740` | `Warning`/`Solid` background. Same value both themes. |
| `Warning/800` — a real, named primitive variable (confirmed via Figma's Fill panel screenshot, 2026-07-19) | `--pt-color-yellow-800` | `#62491a` | n/a (primitive, no theme swap) | ⚠️ **Bound to a primitive-tier token, not a semantic one** — the only such case in this doc set, but a legitimate bound value, not an unbound/hardcoded one. `Warning`/`Solid`'s label breaks the pattern every other `Solid`-type state follows (`Colors/Typography/On_action`) and instead binds straight to the primitive `Warning/800`, which resolves correctly (`#62491a`, matches `--pt-color-yellow-800` exactly). Open question is purely about design-system structure: should a semantic `on_warning` role be added to `PT_tokens.md` so this (and any future case) auto-adjusts for theme like its four sibling `Solid` labels do? See Open questions #4. |
| `Colors/Surface/Error` | `--pt-semantic-surface-error` | `#f7dada` | `#561c1c` | `Error`/`Soft` background. |
| `Colors/Border/Error` | `--pt-semantic-border-error` | `#efb5b5` | `#ab3737` | `Error`/`Soft` border. |
| `Colors/Typography/Error` | `--pt-semantic-typography-error` | `#802929` | `#e68f8f` | `Error`/`Soft` label. |
| `Colors/Icon/Error` | `--pt-semantic-icon-error` | `#802929` | `#e68f8f` | `Error`/`Soft` icon — ⚠️ inferred. |
| `Colors/Surface/Negative` | `--pt-semantic-surface-negative` | `#d64545` | `#d64545` | `Error`/`Solid` background. Same token/value Button uses for its `Negative` state — no drift. |
| `Colors/Shadow/Normal` | `--pt-semantic-shadow-normal` | `#a8c0c7` | `#111314` | `Neutral`/`Soft` **border**. ⚠️ **Semantic-role mismatch** — this token's documented purpose in `PT_tokens.md` §7.8 is a shadow-effect color primitive, not a border color. It resolves fine visually (`#a8c0c7` = `grey-500`, a plausible neutral border tone) but nothing else in this doc set uses a shadow-role token for a border. Flagged, not smoothed over — see Cross-component consistency check. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `#a8c0c7` | `Neutral`/`Soft` label. |
| `Colors/Icon/Body_Secondary` | `--pt-semantic-icon-body_secondary` | `#869a9f` | `#a8c0c7` | `Neutral`/`Soft` icon — ⚠️ inferred. (Note: Figma's own variable name capitalizes `_Secondary`; `PT_tokens.md`'s canonical token lowercases it, consistent with the rest of the icon-role naming.) |
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` | `#657377` | `Neutral`/`Solid` background. ⚠️ **Semantic-role mismatch** — this is the same "disabled" token Button/Button (Icon only) use for their actual `Disabled` state. Here it's reused for `Neutral`, which is not a disabled/inactive state, just the neutral status color. This also imports a **known contrast failure**: Button's own docs already computed white label on `#a8c0c7` ≈ **1.9:1** (fails 4.5:1). `Neutral`/`Solid` uses the identical background+white-label pairing (`Colors/Surface/Disabled` + `Colors/Typography/On_action`) — the same failing ratio applies here, not a new audit, a confirmed reuse of an already-flagged bad pairing. See Accessibility. |
| `Scale/1` | `--pt-scale-1` | `4px` | | Padding-X, gap (icon↔label), **and** radius — all three bound to the same token. |
| `Scale/Half` | `--pt-scale-half` | `2px` | | Padding-Y. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | | Same "renders as Medium, bound as Regular" naming quirk already documented on Button/Filter Chip. |
| `Body_xs/Font_size`, `Body_xs/Line_height` | `--pt-typography-body-xs-font_size`, `-line_height` | `12px`, `16px` | | Matches `PT_tokens.md` §7.2 exactly — no drift (this is the *xs* step, not the *sm* step that had the stale-JSON line-height issue). |
| icon-size `12` → stroke weight `1` | `--pt-icon-stroke_weight-12` | `1` | | Confirms `PT_tokens.md` §7.3 exactly, via the `"12":"1"` pairing in `get_variable_defs` — no drift. Not literally visible in the generated code (icon is a rendered SVG asset), same limitation as elsewhere. |

**No fully-unbound colors, spacing, or typography values found** — everything resolves to a token, though two of those bindings are flagged above as using the *wrong* token (semantic-role mismatches) and one binds a primitive instead of a semantic token. The one soft gap matching the rest of the doc set: **icon pixel size** (12px) is written as a literal `size-[12px]` in the generated code, not a `var(--pt-icon-size-12,...)` reference → `⚠️ HARDCODED — no token bound in Figma` for the size itself (the stroke-weight *is* bound, per above). This is now the **third** component to show this exact gap (Button, Filter Chip, Eyebrow Highlight) — confirms it's file-wide, not a one-off.

### Per-variant token map

| State | Type | Background | Border | Label color | Icon color |
|---|---|---|---|---|---|
| `Positive` | `Soft` | `--pt-semantic-surface-success` | `--pt-semantic-border-success` | `--pt-semantic-typography-success` | `--pt-semantic-icon-success` ⚠️(inferred) |
| `Positive` | `Solid` | `--pt-semantic-surface-action` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ⚠️(inferred) |
| `Information` | `Soft` | `--pt-semantic-surface-information` | `--pt-semantic-border-information` | `--pt-semantic-typography-information` | `--pt-semantic-icon-information` ⚠️(inferred) |
| `Information` | `Solid` | `--pt-semantic-surface-information_core` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ⚠️(inferred) |
| `Warning` | `Soft` | `--pt-semantic-surface-warning` | `--pt-semantic-border-warning` | `--pt-semantic-typography-warning` | `--pt-semantic-icon-warning` ⚠️(inferred) |
| `Warning` | `Solid` | `--pt-semantic-surface-warning_core` | none | `--pt-color-yellow-800` (primitive-tier, real bound token — see Tokens used) | ⚠️ **unconfirmed** — no matching icon variable appears in `get_variable_defs` for this state; the SVG-asset limitation means the icon fill can't be inferred here the way it can for the other 9 variants (their icon color mirrors their label's semantic role, but this label isn't on a semantic role to mirror). Needs a manual check in Figma. |
| `Error` | `Soft` | `--pt-semantic-surface-error` | `--pt-semantic-border-error` | `--pt-semantic-typography-error` | `--pt-semantic-icon-error` ⚠️(inferred) |
| `Error` | `Solid` | `--pt-semantic-surface-negative` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ⚠️(inferred) |
| `Neutral` | `Soft` | none (transparent) | `--pt-semantic-shadow-normal` ⚠️(role mismatch) | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body_secondary` ⚠️(inferred) |
| `Neutral` | `Solid` | `--pt-semantic-surface-disabled` ⚠️(role mismatch + known contrast failure) | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` ⚠️(inferred) |

General pattern (7 of 10 variants): `Soft` = soft background + matching border + dark-on-light label/icon; `Solid` = solid background + no border + white label/icon. **Two confirmed exceptions to hold onto, not average away:** `Neutral`/`Soft` has no background at all (border-only, transparent fill — the only `Soft` state without one), and `Warning`/`Solid` has a dark label instead of white (the only `Solid` state without `On_action`/`On_hover` white text — correct for contrast against the bright yellow fill, bound to a real primitive token rather than a semantic one).

### Geometry (single size — no `Size` axis)

| Property | Value | Token |
|---|---|---|
| Padding-Y | `2px` | `--pt-scale-half` |
| Padding-X | `4px` | `--pt-scale-1` |
| Gap (icon↔label) | `4px` | `--pt-scale-1` |
| Radius | `4px` | `--pt-scale-1` |
| Icon size | `12px` | ⚠️ `HARDCODED` — no token bound in Figma (see Tokens used) |
| Font size / line-height | `12px` / `16px` | `--pt-typography-body-xs-font_size` / `-line_height` |
| Frame height (content-driven) | `20px` (= 2×2px padding + 16px line-height) | No bound min-height token — same content-driven-height pattern as Button/Filter Chip. |
| Frame width | Content-driven (measured `85px` for the `"Important"` demo string) | No bound min/max-width token. |
| Border width (`Soft` states only) | `1px` (Tailwind implicit default in generated code) | ⚠️ Not explicitly bound to `Scale/Quat` in the generated code for any of the 5 `Soft` variants sampled — same ambiguity already flagged on Filter Chip's `Default`/`Active`/`Outline` states. Value is almost certainly `--pt-scale-quat` (1px), but unconfirmed via MCP. |

Radius (`4px`) is noticeably smaller than Filter Chip's (`8px`/`16px`) relative to this component's own height (`20px`) — this renders as a rounded rectangle, not a full pill, unlike Filter Chip. Confirmed intentional via screenshot (all 10 variants render as soft rounded rectangles, not stadium shapes) — a genuine design difference, not a missed token.

## States

✅ **RESOLVED (2026-07-19): this component is confirmed non-interactive**, and that's correct as-designed, not a gap. No `Hover`, `Focus`, `Active`/`Pressed`, `Disabled` variant or property exists anywhere in the 10-variant enumeration, and you've confirmed it should stay that way — a genuine structural difference from every other component in this doc set (Button and Button (Icon only) both have `Hover`+`Disabled` on every type; Filter Chip models 4 selection-driven visual states). Eyebrow Highlight has **zero** interaction-driven states — only the `status` (State) × `emphasis` (Type) content axes covered above.

| State | Status |
|---|---|
| Hover | Not applicable — confirmed non-interactive. Do not add a hover treatment. |
| Focus (keyboard) | Not applicable — confirmed non-interactive, never receives keyboard focus. |
| Disabled | Not applicable — confirmed non-interactive. |

Unlike Button's/Filter Chip's genuinely-missing focus ring (both real design-system-roadmap gaps), these are correctly absent here — do not add them, and do not route this to the roadmap.

## Accessibility

Required section — Figma encodes no accessibility metadata, so most of this is a design gap to close, not a fact read from the file.

- ✅ **RESOLVED:** renders as a non-interactive `<span>` (confirmed not clickable, 2026-07-19). No `<button>`/`<a>`, no focus ring needed, no `onClick`. Use `role="status"` only for instances whose label content changes dynamically and should be announced to assistive tech.
- ✅ **Good existing practice, not a gap:** the design pairs an icon with every status color by default (`showIcon` defaults to `true`), so status is not conveyed by color alone — this already satisfies WCAG 1.4.1 (Use of Color) as designed, as long as implementations don't disable the icon.
- ⏳ **Contrast — moved to the design system roadmap (2026-07-19), not blocking.** `Neutral`/`Solid` binds `Colors/Surface/Disabled` (`#a8c0c7` = `grey-500`) with a white label (`Colors/Typography/On_action`). Button's own docs already computed this exact pairing at ≈**1.9:1**, far below the 4.5:1 minimum — Eyebrow Highlight reuses the identical token pair, so the same failure applies here. **You asked whether swapping to `grey-600` (`#869a9f`) resolves it — computed via the WCAG relative-luminance formula: white-on-`grey-600` ≈ 2.94:1. Still fails 4.5:1.** `grey-700` (`#657377`) computes to ≈ **4.91:1**, which clears the bar — documented as the fallback fix for whenever this is addressed. See `MD_progress.md` roadmap and Open questions #5.
- ⚠️ **Contrast to verify** (not encoded in Figma, not yet computed): `Warning`/`Solid` — `--pt-color-yellow-800` (`#62491a`) label on `--pt-semantic-surface-warning_core` (`#f4b740`). Visually looks like it should pass (dark text on a mid-bright yellow) but hasn't been measured yet.
- `Neutral`/`Soft`'s label (`body_secondary`, `#869a9f`) sits on whatever surface the badge is placed against (the variant itself has no background) — same "audit against real backgrounds" caveat already flagged for Button's Tertiary label.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `status` to match the semantic meaning of the surrounding content (e.g. `error` for a validation issue) | Use `status` purely for visual variety unrelated to meaning |
| Keep the icon visible (`showIcon=true`) so status isn't conveyed by color alone | Set `showIcon=false` for anything but purely decorative, non-semantic uses |
| Keep labels short (Figma placeholder is a single word, `"Important"`) | Write sentence-length labels — the frame has no wrap modeled |
| Use `emphasis='solid'` sparingly, for the highest-priority callouts | Default everything to `solid` — it's a visually heavier treatment than `soft` |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long labels:** `whitespace-nowrap` is present in the generated code for all 10 sampled variants (no wrap modeled, same pattern as Button/Filter Chip) — confirm truncation vs. growth behavior.
- **`showIcon=false`:** does the `--pt-scale-1` (4px) gap collapse to 0, or stay reserved? Not modeled in Figma (icon is present in all 10 sampled variants). Same open question already flagged on Filter Chip.
- ~~Is this ever interactive?~~ — **RESOLVED (2026-07-19): no.** Confirmed non-interactive; renders as a `<span>`, no `onClick`/`aria-pressed`, no hover/focus states to design.
- **Multiple highlights in a row/inline with text:** no wrapping/layout container is part of this component — confirm where row-level or inline-flow layout logic lives.
- **RTL:** not modeled. Lower priority than Button/Filter Chip's RTL question since there's no directional icon here (diamond placeholder is symmetric) — likely a non-issue, but flag for confirmation once a real icon set replaces the placeholder.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { EyebrowHighlight } from '@/components/EyebrowHighlight';

// Positive, soft (Figma: State=Positive, Type=Soft)
<EyebrowHighlight status="positive" emphasis="soft">
  On track
</EyebrowHighlight>

// Error, solid (Figma: State=Error, Type=Solid)
<EyebrowHighlight status="error" emphasis="solid">
  Booking failed
</EyebrowHighlight>

// Neutral, soft, no icon (Figma: State=Neutral, Type=Soft, showIcon=false)
<EyebrowHighlight status="neutral" emphasis="soft" showIcon={false}>
  Draft
</EyebrowHighlight>
```

## Cross-component consistency check

Comparing Eyebrow Highlight's tokens, naming, and structure against the already-documented Button, Button (Icon only), and Filter Chip. Findings below — not smoothed over, even the ones that are "fine as-is but worth knowing."

1. **⚠️ Still open: `State` means a *third* different thing across the system.** Button's `State` = interaction + intent + treatment (7 values). Filter Chip's `State` = selection status (4 values). Eyebrow Highlight's `State` = a semantic status category (5 values: Positive/Information/Warning/Error/Neutral) — structurally closer to a "variant/tone" axis than either prior use. Same Figma property name, three unrelated meanings. This is why the code-side rename to `status` is recommended here rather than reusing `state` a third time — see Props. Not addressed by this round's Figma changes.
2. **✅ RESOLVED (2026-07-19): `Type` renamed in Figma from `Light`/`Dark` to `Soft`/`Solid`, confirmed live via `get_metadata`.** This was the most consequential finding on this component — the original naming risked being misread as the app's theme mode, when it's really a soft-vs-solid fill-weight axis. Figma's own property now says exactly what it means; the code prop (`emphasis: 'soft'|'solid'`) is now a direct, uncontroversial mapping rather than a confusion-avoidance rename.
3. **✅ RESOLVED (2026-07-19): icon-prop naming unified.** Filter Chip's icon-swap property was `swapIcon`; you renamed it to `iconSwap` in Figma to match Eyebrow Highlight — confirmed live via `get_design_context` on node `707:1656`. Both components now use the identical property name.
4. **⚠️ Content-prop naming has now diverged three ways.** Button takes label content as `children` (recommended). Filter Chip's raw Figma property is `title` (recommended rename to `children`, unconfirmed). Eyebrow Highlight's raw Figma property is `text` (recommended rename to `children` here too, for the same reason). If the `children` recommendation isn't adopted for Filter Chip, it shouldn't be adopted here either — otherwise the system ends up with a third inconsistent pattern instead of resolving the first one.
5. **⚠️ Semantic-role mismatch: `Neutral`/`Soft`'s border uses a shadow-purpose token.** `Colors/Shadow/Normal` is documented in `PT_tokens.md` §7.8 as a shadow-effect color primitive, not a border-family token — yet it's the bound border color here. Resolves to a plausible neutral-grey value (`#a8c0c7`), so nothing looks visually wrong, but it's a role mismatch worth flagging to design, in the same spirit as the previously-resolved Filter Chip icon-role mismatch (`Icon/Headings` vs. `Icon/Body`).
6. **⚠️ Semantic-role mismatch + imported contrast failure: `Neutral`/`Solid` reuses the `Disabled` token family.** `Colors/Surface/Disabled` is the same token Button/Button (Icon only) use for their actual `Disabled` state — reused here for a `Neutral` status that has nothing to do with disabled/inactive. This also silently imports Button's already-documented ≈1.9:1 contrast failure (white label on `grey-500`) into a component that isn't even disabled. See Accessibility.
7. **⚠️ `Warning`/`Solid` binds a primitive directly, not a semantic token — the only such case in this doc set.** All 9 other variants bind semantic tokens throughout. This one label binds `Warning/800` (a raw primitive) because no semantic `on_warning` role currently exists in `PT_tokens.md`. This is a genuine token-system gap, not a Figma mistake to route around in code — recommend adding a semantic token (e.g. `--pt-semantic-typography-on_warning`) rather than perpetuating a primitive-in-component binding. See Open questions.
8. **No drift in shared color tokens.** `Colors/Surface/Action` (`#5d9c4d`), `Colors/Surface/Negative` (`#d64545`), `Colors/Typography/On_action`/`Colors/Icon/On_action` (white) all resolve identically to their use on Button/Filter Chip — reused correctly.
9. **No drift in the `Body_xs` type step.** First use of `Body_xs` (12px/16px) outside `PT_tokens.md`'s own reference tables in this doc set — confirms §7.2's `xs` row is accurate, no stale-JSON-style surprise like the `sm` line-height issue.
10. **Axis-prefixing convention: consistent with Filter Chip, not Button.** `State`/`Type` are unprefixed (no "Eyebrow" prefix), matching Filter Chip's unprefixed `State`/`Size` and diverging from Button's prefixed `Button Type`/`Button Size`. This is now 2 of 3 non-Button components using the unprefixed style — reinforces this isn't an isolated Filter Chip choice, but the file-wide convention still isn't uniform.
11. **Icon-fill-not-traceable-via-code gap — confirmed file-wide, not component-specific.** Same limitation already documented on Button and Filter Chip: icon nodes render as `<img>` SVG assets in `get_design_context`, so the bound fill variable isn't visible in the generated code. All icon-color mappings above are inferred from the matching label token per state, except `Warning`/`Solid`, where no clean inference is possible (see Per-variant token map).
12. **Structural difference, not drift, now confirmed intentional:** no `Size` axis at all (Button/Filter Chip both have 3), and no interaction states at all (Button/Filter Chip both have at least `Hover`+`Disabled` or a selection-state equivalent). Confirmed via full 10/10 enumeration, and confirmed by you (2026-07-19) that this component is genuinely non-interactive — the first component in the doc set that isn't a control.

**Summary (updated 2026-07-19):** two of this component's three flagged findings are now resolved directly in Figma — `Type` renamed `Light`/`Dark` → `Soft`/`Solid`, and the `iconSwap`/`swapIcon` naming drift is gone (both components now say `iconSwap`), both re-verified live via MCP. Remaining open: `State` is still a third overloaded meaning system-wide (naming decision, not a data issue), and `Warning`/`Solid`'s label is still bound to a primitive rather than a semantic token (confirmed to be a real, intentional binding, not a hardcoded gap — the open question is whether the token system should grow a semantic role for it). No drift found in the shared color/typography primitives themselves — every resolved hex still matches its `PT_tokens.md` entry exactly.

## Open questions — what needs your confirmation

1. ~~Is this component ever interactive?~~ — **RESOLVED 2026-07-19: no.** Static, non-interactive `<span>`. No hover/focus/disabled states, no `onClick`.
2. ~~`Type` naming~~ — **RESOLVED 2026-07-19.** You renamed the Figma property itself from `Light`/`Dark` to `Soft`/`Solid` — confirmed via MCP. Code prop `emphasis: 'soft'|'solid'` now maps directly.
3. **`State`→`status` rename** — still open. Confirm, given `State` already means two other things elsewhere in the system.
4. **`Warning`/`Solid` label token** — clarified (2026-07-19, per your screenshot): `Warning/800` is a real, intentionally bound Figma variable, not an unbound/hardcoded value — the earlier flag overstated it as a gap. The only remaining question is whether `PT_tokens.md` should grow a semantic `on_warning` role so this case (and any future one like it) auto-adjusts for theme the way its four sibling `Solid` labels do, or whether binding the primitive directly is fine to keep doing. Your call.
5. ⏳ **`Neutral`/`Solid` background/contrast — moved to the design system roadmap** (see `MD_progress.md`), 2026-07-19. Not blocking initial implementation. You asked whether swapping `grey-500`→`grey-600` fixes the white-text contrast. **Computed: no.** `grey-600` (`#869a9f`) with white text ≈ **2.94:1**, still below the 4.5:1 minimum. `grey-700` (`#657377`) computes to ≈ **4.91:1**, which does clear it. Documented fallback for whenever this is addressed: (a) use `grey-700` instead of `grey-600`, (b) keep the current background and switch the label to a dark color instead. Also still open at that point: is reusing `Colors/Surface/Disabled` for a non-disabled `Neutral` status intentional, or should `Neutral` get its own semantic surface token?
6. **`Neutral`/`Soft` border token** — confirm whether `Colors/Shadow/Normal` is the intended border color, or whether this should move to a border-family token (e.g. `Colors/Border/Default` or a new neutral-border role).
7. **`Warning`/`Solid` icon color** — needs a manual check in the Figma UI; couldn't be inferred or confirmed via MCP (see Per-variant token map).
8. **Content prop naming (`text`/`title`/`children`)** — resolve once, system-wide, rather than case-by-case per component (see Cross-component consistency check #4).
9. ~~`iconSwap`/`swapIcon` naming order~~ — **RESOLVED 2026-07-19.** Filter Chip's property renamed to `iconSwap` in Figma to match — confirmed via MCP. Both components now consistent.
10. **Border-width binding** — same open item already flagged on Filter Chip: is the implicit 1px Tailwind border on the 5 `Soft` states genuinely bound to `Scale/Quat` in Figma, or an unbound default?
11. **Singular vs. plural code export name** (`EyebrowHighlight` vs. Figma's generated `EyebrowHighlights`) — confirm which the codebase should use.
12. **Component code path + export name** for the header block.

---

# Tags

> Figma node: `Tags` — node `788:2055` (a wrapper frame containing 10 variant instances of a single underlying component — not itself a component-set node, same pattern as Eyebrow Highlight. `get_design_context` on every instance resolves to the same `Tags` component signature with `state`/`type`/`icon`/`iconSwap`/`text` props.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=788-2055
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Tag.tsx]` (Figma's own name is `Tags`, plural — ⚠️ CONFIRM singular `Tag` vs. plural `Tags` for the code component name, same open question already flagged on Eyebrow Highlight)
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A small pill-shaped inline label used to tag or categorize content (e.g. a trip status, a category label). Structurally near-identical to [Eyebrow Highlight](#eyebrow-highlight) — same `State`×`Type` axes, same token families, same per-state exceptions — but a distinct component in Figma with its own sizing, its own icon-visibility default, and larger text. See Cross-component consistency check for the full comparison; it's the most useful lens for reading this section.

✅ **RESOLVED (2026-07-19): icon default is `false`.** You confirmed this directly. The `true` reading that appeared briefly after the `icon`→`showIcon` rename was a side effect of Figma resetting the property's default when it was recreated, not an intentional change — the earlier flag is now closed.

✅ **RESOLVED (2026-07-19): confirmed not removable/dismissible.** Like Eyebrow Highlight, Figma models no interaction states here (no `Hover`, `Disabled`, or `Focus` anywhere in the 10 variants), and you've now confirmed that's correct as-designed — Tags cannot be removed or dismissed. Renders as a non-interactive `<span>`, same resolution as Eyebrow Highlight, arrived at independently rather than assumed by analogy.

## Variant axes

The Figma node contains **10 variants** (enumerated directly via `get_metadata` — not estimated).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `Positive` · `Information` · `Warning` · `Error` · `Neutral` | 5 |
| `Type` | `Soft` · `Solid` | 2 |

✅ Unlike Eyebrow Highlight's original `Type` property (which was `Light`/`Dark` before you renamed it), Tags' `Type` **was already named `Soft`/`Solid`** when read via MCP — no rename needed here, no risk of it being misread as the app's theme mode. Same underlying meaning as Eyebrow Highlight: `Soft` = pastel background + border, `Solid` = saturated background, no border.

No `Size` axis — one fixed geometry, same structural pattern as Eyebrow Highlight.

Three component-level (non-variant) properties, present on every variant:

| Component property | Type | Default | Notes |
|---|---|---|---|
| `showIcon` | boolean | ✅ **`false`, confirmed 2026-07-19** | Toggles the leading icon on/off. ✅ **Renamed 2026-07-19:** you renamed this from `icon` to `Show_icon` in Figma — `get_design_context` now returns `showIcon` in the prop signature, matching Filter Chip/Eyebrow Highlight's naming exactly. Naming drift fully resolved. ✅ **Default confirmed `false`.** The `true` reading seen briefly right after the rename (checked across `Positive`/`Soft`, `Information`/`Solid`, `Neutral`/`Solid`) was Figma resetting the boolean's default when the property was recreated, not an intentional change — you've now confirmed `false` is correct. |
| `iconSwap` | instance-swap | `null` → diamond placeholder | Icon glyph override. Same property name as Filter Chip and Eyebrow Highlight (post-2026-07-19 rename) — consistent here. `diamond` is a real Tabler icon (`IconDiamond`) — see `PT_tokens.md` §4 "Icons"; useful signal, not a confirmed final choice. |
| `text` | text | `"Important"` | The label content. Same naming as Eyebrow Highlight (raw Figma property `text`, not `title` like Filter Chip or `children`) — see Cross-component consistency check. |

### Variant math (axes multiplied vs. actual)

```
5 (State) × 2 (Type) = 10 theoretical
Actual component count = 10
Excluded                = 0
```

**No exclusions** — full matrix, same pattern as Eyebrow Highlight and Filter Chip.

### Valid combinations

```
{Positive, Information, Warning, Error, Neutral} × {Soft, Solid} = 10, all valid.
```

## Props (code API)

⚠️ CONFIRM with tech lead.

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `status` | `'positive' \| 'information' \| 'warning' \| 'error' \| 'neutral'` | `'positive'` (Figma's spatial/enumeration-order default, same caveat as Eyebrow Highlight — not confirmed via an explicit master-component default read) | Same rationale as Eyebrow Highlight: avoids the cross-component `State`-name collision. ⚠️ CONFIRM — ideally resolved once, system-wide, alongside Eyebrow Highlight's identical open question. |
| `Type` | `emphasis` | `'soft' \| 'solid'` | `'soft'` | Direct 1:1 mapping — Figma's values are already `Soft`/`Solid`, no confusion-avoidance rename needed (unlike Eyebrow Highlight's history). Named `emphasis` to stay consistent with Eyebrow Highlight's resolved prop name. |
| `showIcon` | `showIcon` | `boolean` | ✅ **`false`, confirmed 2026-07-19** | ✅ **Naming resolved 2026-07-19:** Figma property renamed to `showIcon` (from `icon`), no rename needed in code — direct match, same as Filter Chip/Eyebrow Highlight. ✅ **Default resolved:** `false`, confirmed directly — the `true` reading seen right after the rename was a Figma default-reset artifact, not the intended behavior. |
| `iconSwap` | `icon` | `ReactNode` | — | Same collapsing pattern as Filter Chip/Eyebrow Highlight: passing `icon` renders it, omitting it is equivalent to `showIcon=false`. |
| `text` | `children` | `ReactNode` | `"Important"` (Figma placeholder) | Same recommendation and same caveat as Eyebrow Highlight — resolve the `children`/`title`/`text` question once, system-wide, not per component. |

Non-visual props, none of which exist in Figma — flagged, not invented:

- ✅ **RESOLVED (2026-07-19): no `onClick`/`onRemove`.** Confirmed not dismissible — these never need to exist on this component.
- ✅ **RESOLVED:** semantic element is a non-interactive `<span>`, same as Eyebrow Highlight.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `Positive`/`Information`/`Warning`/`Error`/`Neutral` | `status='positive'\|'information'\|'warning'\|'error'\|'neutral'` | Same rationale as Eyebrow Highlight — avoid the cross-component `State`-name collision. |
| 2 | `Type` = `Soft`/`Solid` | `emphasis='soft'\|'solid'` | Direct rename of the *property* only (for cross-component consistency with Eyebrow Highlight's resolved prop name); the *values* need no correction here. |
| 3 | `icon` (bool, default `false`) + `iconSwap` (instance swap) | Single optional `icon: ReactNode` slot, still defaulting to hidden | Same collapsing pattern as Filter Chip/Eyebrow Highlight. The prop *name* `icon` is recommended to become `showIcon` for cross-component consistency, but the underlying default (hidden) must be preserved — don't let the rename accidentally flip the default to shown. |
| 4 | `text` (text property) | `children` | Same recommendation as Eyebrow Highlight, same caveat about resolving it once system-wide. |
| 5 | `Warning`/`Solid`'s label bound to `Warning/800` — a real primitive-tier token (same pattern as Eyebrow Highlight, verified the same way) | Consume `--pt-color-yellow-800` as-is | Identical situation to Eyebrow Highlight's already-clarified finding — see Tokens used. Not a new issue, the same one recurring in a sibling component. |

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on node `788:2055`, cross-checked per-variant via `get_design_context` on all 10 instances).

**This token set is identical to Eyebrow Highlight's, value-for-value** — same five `State` families, same `Soft`/`Solid` pattern, same two exceptions (`Neutral`/`Soft` has no background, `Warning`/`Solid` has a dark label). Rather than re-list all 10 rows with resolved hex again (see Eyebrow Highlight's Tokens table for the full light/dark breakdown — every value there applies here unchanged), this section focuses on what's **different**.

### Figma variable → `PT_tokens.md` token reference (deltas from Eyebrow Highlight only)

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Scale/3` | `--pt-scale-3` | `12px` | Padding-X. Eyebrow Highlight uses `Scale/1` (4px) here instead — Tags is a wider, less compact tag. New token in this doc set's icon/label-row components. |
| `Body_sm/Font_size`, `Body_sm/Line_height` | `--pt-typography-body-sm-font_size`, `-line_height` | `14px`, `20px` | Eyebrow Highlight uses `Body_xs` (12px/16px) — Tags renders at the next step up in the type scale. Matches `PT_tokens.md` §7.2 exactly, including the corrected `20px` line-height (not the stale JSON `24px`) — consistent with Filter Chip's `Regular` size, which uses the same `Body_sm` step. |
| icon size `16px` | ⚠️ `HARDCODED` — no token bound in Figma | `16px` | Same file-wide gap as Button/Filter Chip/Eyebrow Highlight (icon pixel size isn't bound to `--pt-icon-size-16`). ✅ **Stroke-weight now confirmed (2026-07-19):** you toggled `icon=true` in Figma so this could be captured — a fresh `get_variable_defs` pull now returns a `"16":"1.5"` pairing, confirming `--pt-icon-stroke_weight-16` (`1.5`) exactly, matching `PT_tokens.md` §7.3. This was unconfirmable in the initial pass because the icon is hidden by default in every sampled variant; now resolved. See the Icon color table below. |
| `Colors/Border/Card_primary` | `--pt-semantic-border-card_primary` | `#a8c0c7` | ⚠️ **Present in `get_variable_defs` but not used in any of the 10 sampled variants' generated code.** Possibly a leftover reference from this component being duplicated from Filter Chip (which does use `Card_primary` background+border on its `Default` state) — Tags' own `Neutral`/`Soft` uses `Colors/Shadow/Normal` instead (see below), not `Card_primary`. Flagged as an unused/stray binding, not a rendering bug — doesn't affect any visible variant. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | Same as above — present in the bound-variable list, not used in any of the 10 sampled variants. Likely another stray reference. |

Everything else (five color families × two `Type` treatments, `Scale/1` gap, `Scale/Half` padding-Y, `Scale/1` radius, font-family/weight tokens) resolves identically to Eyebrow Highlight — see that section's Tokens table for the full per-value breakdown, all independently re-verified here via the 10 `get_design_context` samples.

### Per-variant token map

| State | Type | Background | Border | Label color | Icon color (confirmed 2026-07-19) |
|---|---|---|---|---|---|
| `Positive` | `Soft` | `--pt-semantic-surface-success` | `--pt-semantic-border-success` | `--pt-semantic-typography-success` | `--pt-semantic-icon-success` |
| `Positive` | `Solid` | `--pt-semantic-surface-action` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` |
| `Information` | `Soft` | `--pt-semantic-surface-information` | `--pt-semantic-border-information` | `--pt-semantic-typography-information` | `--pt-semantic-icon-information` |
| `Information` | `Solid` | `--pt-semantic-surface-information_core` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` |
| `Warning` | `Soft` | `--pt-semantic-surface-warning` | `--pt-semantic-border-warning` | `--pt-semantic-typography-warning` | `--pt-semantic-icon-warning` |
| `Warning` | `Solid` | `--pt-semantic-surface-warning_core` | none | `--pt-color-yellow-800` (primitive-tier, real bound token — same as Eyebrow Highlight) | ⚠️ ambiguous — `Colors/Icon/Warning` and `Warning/800` resolve to the same value (`#62491a`); can't tell which is bound without a per-instance check |
| `Error` | `Soft` | `--pt-semantic-surface-error` | `--pt-semantic-border-error` | `--pt-semantic-typography-error` | `--pt-semantic-icon-error` |
| `Error` | `Solid` | `--pt-semantic-surface-negative` | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` |
| `Neutral` | `Soft` | none (transparent) | `--pt-semantic-shadow-normal` ⚠️(role mismatch, same as Eyebrow Highlight) | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body_secondary` |
| `Neutral` | `Solid` | `--pt-semantic-surface-disabled` ⚠️(role mismatch + known contrast failure, same as Eyebrow Highlight) | none | `--pt-semantic-typography-on_action` | `--pt-semantic-icon-on_action` |

✅ **RESOLVED (2026-07-19): icon color and size now confirmed.** You toggled `icon=true` in Figma so this could be captured — `get_variable_defs` on the now-visible icons returns the full icon-color set (`Colors/Icon/Success`, `-Information`, `-Warning`, `-Error`, `-Body_Secondary`, `-On_action`) plus a `"16":"1.5"` size→stroke-weight pairing, confirming `--pt-icon-size-16`/`--pt-icon-stroke_weight-16` (`16`/`1.5`) exactly per `PT_tokens.md` §7.3 — no drift. **Icon color per state mirrors the label color's semantic role**, same pattern as Eyebrow Highlight, now confirmed present rather than inferred:

| State | Type | Icon color |
|---|---|---|
| `Positive` | `Soft` | `--pt-semantic-icon-success` |
| `Positive` | `Solid` | `--pt-semantic-icon-on_action` |
| `Information` | `Soft` | `--pt-semantic-icon-information` |
| `Information` | `Solid` | `--pt-semantic-icon-on_action` |
| `Warning` | `Soft` | `--pt-semantic-icon-warning` |
| `Warning` | `Solid` | ⚠️ **still ambiguous** — no separate icon-specific primitive token appears in `get_variable_defs` distinct from `Colors/Icon/Warning` (`#62491a`), which is the same resolved value as `Warning/800`. Can't tell from aggregate variable data alone whether this state's icon binds the semantic `Colors/Icon/Warning` or the raw primitive `Warning/800` (same limitation that left the label's exact binding needing a screenshot check) — needs the same manual per-instance check if it matters for theming. |
| `Error` | `Soft` | `--pt-semantic-icon-error` |
| `Error` | `Solid` | `--pt-semantic-icon-on_action` |
| `Neutral` | `Soft` | `--pt-semantic-icon-body_secondary` |
| `Neutral` | `Solid` | `--pt-semantic-icon-on_action` |

⚠️ **Default stays `icon=false`/`showIcon=false`, per your direction** — this was a temporary Figma toggle purely so these tokens could be captured, not a change to the confirmed hidden-by-default behavior. You may want to switch the Figma property back off now that this is documented; the code default documented in Props above is unaffected either way.

### Geometry (single size — no `Size` axis)

| Property | Value | Token |
|---|---|---|
| Padding-Y | `2px` | `--pt-scale-half` |
| Padding-X | `12px` | `--pt-scale-3` |
| Gap (icon↔label) | `4px` | `--pt-scale-1` |
| Radius | `4px` | `--pt-scale-1` |
| Icon size (when shown) | `16px`, stroke `1.5` | Size itself: ⚠️ `HARDCODED` — no token bound in Figma. Stroke-weight: ✅ confirmed `--pt-icon-stroke_weight-16` (`1.5`) via `get_variable_defs` with `icon=true` toggled on, 2026-07-19. |
| Font size / line-height | `14px` / `20px` | `--pt-typography-body-sm-font_size` / `-line_height` |
| Frame height (content-driven) | `24px` (= 2×2px padding + 20px line-height) | No bound min-height token, same pattern as every other component. |
| Frame width | Content-driven (measured `96px` for the `"Important"` demo string) | No bound min/max-width token. |
| Border width (`Soft` states only) | `1px` (Tailwind implicit default in generated code) | ⚠️ Same unconfirmed-binding ambiguity already flagged on Filter Chip and Eyebrow Highlight. |

Radius (`4px`) and general shape match Eyebrow Highlight's rounded-rectangle treatment (not a full pill) — same design language, larger footprint (96×24 vs. 85×20) driven by the bigger padding and type step.

## States

✅ **RESOLVED (2026-07-19): confirmed non-interactive, same conclusion as Eyebrow Highlight but arrived at independently.** No `Hover`, `Focus`, `Active`, or `Disabled` variant/property exists in any of the 10 variants, and you've confirmed Tags cannot be removed or dismissed — so their absence is correct as-designed, not a gap.

| State | Status |
|---|---|
| Hover | Not applicable — confirmed non-interactive. Do not add a hover treatment. |
| Focus (keyboard) | Not applicable — confirmed non-interactive, never receives keyboard focus. |
| Disabled | Not applicable — confirmed non-interactive. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **RESOLVED:** renders as a non-interactive `<span>` (confirmed not removable/dismissible, 2026-07-19). No `<button>`, no dismiss control, no focus ring needed.
- ✅ **Icon-as-redundant-signal caveat differs from Eyebrow Highlight:** because `icon` defaults to `false`, most Tags instances will convey status by color and text alone, not color-plus-icon. This is less of a WCAG 1.4.1 concern than Eyebrow Highlight (text is already present as a redundant signal to color), but confirm the text label itself is always meaningful on its own (e.g. not just a color name).
- ⏳ **Contrast — same known issue as Eyebrow Highlight, proactively flagged rather than re-derived.** `Neutral`/`Solid` uses the identical `Colors/Surface/Disabled` + white-label pairing already computed at ≈1.9:1 (fails 4.5:1) on Button and Eyebrow Highlight, with `grey-600` computed at ≈2.94:1 (still fails) and `grey-700` at ≈4.91:1 (passes). Recommend deferring this to the same design-system roadmap entry as Eyebrow Highlight's identical issue, rather than tracking it separately — see `MD_progress.md`.
- ⚠️ **Contrast to verify** (not yet computed): `Warning`/`Solid` — `--pt-color-yellow-800` (`#62491a`) label on `--pt-semantic-surface-warning_core` (`#f4b740`). Same pairing as Eyebrow Highlight, same "looks safe, not measured" status.
- Touch target: at `24px` tall, well under 44×44 — not applicable, since the component is confirmed non-interactive.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `status` to match the semantic meaning of the content being tagged | Use `status` purely for visual variety |
| Leave the icon off unless it adds real information (default is `false`) | Flip `showIcon` to `true` by default — hidden-by-default is confirmed intentional |
| Keep labels short (Figma placeholder is a single word) | Write sentence-length labels — no wrap modeled |
| Use `emphasis='solid'` sparingly, for the highest-priority tags | Default everything to `solid` |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ~~Is this ever interactive or removable?~~ — **RESOLVED (2026-07-19): no.** Confirmed not dismissible; renders as a `<span>`, no dismiss affordance to design.
- **Long labels:** `whitespace-nowrap` present in the generated code for all 10 sampled variants — confirm truncation vs. growth.
- **`icon=true` with no `iconSwap`:** falls back to the `diamond` placeholder, same as every other component — confirm this is acceptable in dev/staging or should render nothing until a real icon is wired up.
- **Multiple tags in a row:** no wrapping/layout container is part of this component — confirm where row-level layout logic (wrap vs. horizontal scroll) lives, likely shared with Filter Chip's identical open question.
- **RTL:** not modeled. Same low-priority status as Eyebrow Highlight (symmetric placeholder icon, off by default here besides).

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Tag } from '@/components/Tag';

// Positive, soft, no icon — showIcon defaults to false, shown here for clarity
<Tag status="positive" emphasis="soft" showIcon={false}>
  Confirmed
</Tag>

// Error, solid, with icon
<Tag status="error" emphasis="solid" showIcon icon={<IconAlertTriangle size={16} stroke={1.5} />}>
  Cancelled
</Tag>
```

## Cross-component consistency check

Comparing Tags against Button, Button (Icon only), Filter Chip, and — most relevantly — Eyebrow Highlight, its structural twin.

1. **✅ No naming drift on `Type` — a positive signal.** Tags' `Type` property was already `Soft`/`Solid` when read via MCP, unlike Eyebrow Highlight's original `Light`/`Dark`. Suggests the naming fix on Eyebrow Highlight may have been applied system-wide going forward, or this component was simply built after that convention was already settled. Either way, no risk of theme-mode confusion here.
2. **✅ RESOLVED (2026-07-19): naming and default both settled.** Tags' icon-visibility property is now named `showIcon`, matching Filter Chip and Eyebrow Highlight exactly. Default is confirmed `false` — the `true` reading seen right after the Figma rename was a default-reset artifact, not the intended value. Tags remains intentionally *different* from Filter Chip/Eyebrow Highlight's `true` default — a real design difference, not drift.
3. **✅ `iconSwap` naming is consistent.** Tags already uses `iconSwap`, matching the post-2026-07-19 convention on Filter Chip and Eyebrow Highlight. No drift.
4. **⚠️ Same `Warning`/`Solid` primitive-binding pattern recurs.** Identical to Eyebrow Highlight: the label binds `Warning/800` directly rather than a semantic token. Reinforces that this is a token-system gap (missing `on_warning` semantic role), not a one-off Figma mistake — now seen in two components.
5. **⚠️ Same `Neutral`/`Soft` border role-mismatch recurs.** `Colors/Shadow/Normal` used as a border color again, identical to Eyebrow Highlight. Same recommendation: resolve once at the token level, not per component.
6. **⚠️ Same `Neutral`/`Solid` contrast failure recurs.** Identical token pair (`Colors/Surface/Disabled` + white label) as Eyebrow Highlight and Button's Primary Disabled — now the **third** confirmed instance of this exact pairing. Strengthens the case that this is a token-level fix (see Accessibility), not three separate bugs.
7. **✅ RESOLVED (2026-07-19): structural sibling, confirmed intentional, not drift.** Tags and Eyebrow Highlight share the exact same `State`×`Type` = 5×2 matrix, the same lack of a `Size` axis, and the same lack of interaction states — and both are now independently confirmed non-interactive (Tags cannot be removed/dismissed).
8. **Content-prop naming — same three-way divergence.** Tags uses `text` (matches Eyebrow Highlight's raw Figma property, both recommended → `children`); Filter Chip uses `title`. No new drift, same unresolved system-wide question.
9. **Two stray/unused variable references found** (`Colors/Border/Card_primary`, `Colors/Surface/Page`) — present in `get_variable_defs` but not bound in any of the 10 sampled variants. Not seen on Eyebrow Highlight. Possibly leftover from duplicating Filter Chip's component structure. Flagged, not treated as a rendering issue.
10. **✅ RESOLVED (2026-07-19): icon color and stroke-weight now confirmed.** You toggled `icon=true` in Figma specifically so this could be captured — `get_variable_defs` now returns the full icon-color set and a `"16":"1.5"` stroke-weight pairing, matching `PT_tokens.md` §7.3 exactly. Icon color mirrors the label's semantic role per state, same pattern as Eyebrow Highlight — see the Tokens used table above. One narrow ambiguity remains on `Warning`/`Solid` specifically (semantic token vs. primitive, indistinguishable by value alone).

**Summary (updated 2026-07-19):** two of Tags' three biggest unknowns are now resolved, both independently rather than by analogy — confirmed non-interactive, and icon color/stroke-weight confirmed via a temporary Figma toggle. The recurring token issues (`Warning`/`Solid` primitive binding, `Neutral`/`Soft` border role, `Neutral`/`Solid` contrast) remain open, but they're the same underlying token-level issues already tracked for Eyebrow Highlight — fixing them once should resolve both components. Still open: the `icon`/`showIcon` naming (with a confirmed-different default to preserve), the two stray unused variable references, and the `Warning`/`Solid` icon-token ambiguity.

## Open questions — what needs your confirmation

1. ~~Is this component ever interactive or removable/dismissible?~~ — **RESOLVED 2026-07-19: no.** Confirmed not dismissible.
2. ~~`icon` → `showIcon` rename~~ — **RESOLVED 2026-07-19.** Renamed directly in Figma, confirmed via MCP. ~~Default conflict~~ — **RESOLVED 2026-07-19: `false`.** Confirmed directly; the `true` reading seen right after the rename was a Figma default-reset artifact, not the intended value.
3. **`State`→`status` rename** — same system-wide question as Eyebrow Highlight; ideally resolved once for both.
4. ~~Icon color per state~~ — **RESOLVED 2026-07-19**, confirmed via MCP with `icon=true` toggled on. See Tokens used. One narrow exception: `Warning`/`Solid`'s icon token (semantic vs. primitive) is still ambiguous.
5. ~~Icon size/stroke-weight binding~~ — **RESOLVED 2026-07-19**: `16px`/`1.5` confirmed, matches `PT_tokens.md` §7.3.
6. **Two stray variable references** (`Colors/Border/Card_primary`, `Colors/Surface/Page`) — confirm these are unused leftovers from duplicating Filter Chip, not evidence of a hidden/undocumented state.
7. **Content prop naming (`text`/`title`/`children`)** — same system-wide question as Filter Chip and Eyebrow Highlight.
8. **Border-width binding** — same open item already flagged on Filter Chip and Eyebrow Highlight.
9. **Singular vs. plural code export name** (`Tag` vs. Figma's `Tags`) — same category of question already open on Eyebrow Highlight.
10. **Component code path + export name** for the header block.

---

# Super Icon

> Figma node: `Super_icon` — node `707:1883` (a wrapper frame containing 25 variant instances of a single underlying component — not itself a component-set node, same pattern as Eyebrow Highlight/Tags. `get_design_context` on every sampled instance resolves to the same `SuperIcon` component signature with `fill`/`size`/`iconSwap` props.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1883
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/SuperIcon.tsx]`
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. All design questions resolved (2026-07-19) — only the code path/export name remains, for the tech lead.

## Description

A fixed-size icon container that renders a single icon with an optional background treatment: no background at all, a semi-transparent white square, a solid green square, a semi-transparent white circle, or a solid green circle. Structurally unlike every other component documented so far — it carries **no text/label content at all** (no `text`/`title`/`children` prop of any kind) and **no icon-visibility toggle** (the icon is mandatory, always rendered, not optional). This is a pure icon-container primitive, likely used for things like map-pin glyphs, avatar-style icon badges, or an icon that visually reflects the current selection made elsewhere in the UI (e.g. a map pin styled `active` because its corresponding list item is selected).

⚠️ **Correction, 2026-07-19 — NOT interactive/clickable.** You renamed the Figma property values from `Selected_square`/`Selected_circle` to `Active_square`/`Active_circle` specifically to match Filter Chip's *naming* — but you've now clarified this component is not clickable. **Naming parity with Filter Chip does not mean behavior parity**: Filter Chip's `active` state is reached by the user clicking the chip itself; Super Icon's `active` boolean is a plain visual variant, set by whatever renders it (e.g. reflecting some other selection elsewhere in the UI), not by a click on Super Icon. This is worth flagging explicitly for the codegen agent — reading the `Active_*` name alone and assuming a `<button aria-pressed>` pattern (as this doc did in the prior round) would be wrong. Renders as a plain, non-interactive element with an `active` prop, same rendering family as Eyebrow Highlight/Tags, just with a shape/fill treatment instead of a color treatment.

## Variant axes

The Figma node contains **25 variants** (enumerated directly via `get_metadata` — not estimated; re-confirmed 2026-07-19 after the `Active_*` rename).

Figma exposes **two** variant properties. Names below are the exact strings from Figma's property panel.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Fill` | `Default` · `Default_square fill` · `Active_square` · `Active_circle` · `Default_circle fill` | 5 |
| `Size` | `32` · `24` · `20` · `16` · `12` | 5 |

⚠️ **`Fill` value naming is internally inconsistent** — verbatim from Figma: `Default_square fill` and `Default_circle fill` both have a literal space before "fill" (`Default_square<SPACE>fill`), while `Active_square` and `Active_circle` have no "fill" suffix at all, and plain `Default` has neither a shape nor a "fill" word. Three different naming shapes for what is structurally a 2-dimensional concept (shape × active-ness) flattened into one 5-value enum. See Props for the recommended decomposition and Cross-component consistency check for how this compares to other axis-naming choices in the file.

**`Size` uses the full 5-step icon-size scale** (`12`/`16`/`20`/`24`/`32`) for the first time in this doc set — every prior component used a single fixed size or a 3-step subset. Confirms `PT_tokens.md` §7.3's icon-size scale is used to its full extent somewhere in the system.

### Variant math (axes multiplied vs. actual)

```
5 (Fill) × 5 (Size) = 25 theoretical
Actual component count = 25
Excluded                = 0
```

**No exclusions** — full matrix, confirmed by counting all 25 symbols in `get_metadata`. Note this is mathematically a coincidence of the flat 5-value `Fill` enum, not evidence that `shape`×`active` is a true independent 2-axis grid — see the Props decomposition note for why `shape=none` genuinely has no `Active_none` counterpart in Figma (1 + 2 + 2 = 5, not a clean 3×2 = 6).

### Valid combinations

```
{Default, Default_square fill, Active_square, Active_circle, Default_circle fill} × {32, 24, 20, 16, 12} = 25, all valid.
```

## Props (code API)

✅ **Decomposition adopted, 2026-07-19 (no designer blocker — tech lead may still rename for their own API conventions).** `Fill`'s five values conflate two concerns — shape and an active/inactive treatment — and the math supports decomposing cleanly (see Variant math), following the same reasoning already applied to Button's `State` axis:

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Fill` | `shape` | `'none' \| 'square' \| 'circle'` | `'none'` | `Default`→`none`, `Default_square fill`/`Active_square`→`square`, `Default_circle fill`/`Active_circle`→`circle`. |
| `Fill` (active-ness) | `active` | `boolean` | `false` | `Default_square fill`/`Default_circle fill`→`false`, `Active_square`/`Active_circle`→`true`. **Only meaningful when `shape !== 'none'`** — there is no `Active` treatment for the no-background state in Figma; `shape='none'` should ignore `active` entirely rather than trying to render an "active but no background" look that doesn't exist. **Not click-driven** — the consumer sets this from whatever external state it should reflect (see States). |
| `Size` | `size` | `12 \| 16 \| 20 \| 24 \| 32` | `32` (Figma's spatial/enumeration-order default) | ⚠️ **Deliberately NOT mapped to `sm`/`md`/`lg`** like Button/Filter Chip/Tags. These five values are literally the `PT_tokens.md` §7.3 icon-size scale steps, not a layout-size scale — keeping the numeric values preserves a direct, unambiguous mapping to `--pt-icon-size-{12,16,20,24,32}` and `--pt-icon-stroke_weight-{12,16,20,24,32}`. A `sm`/`md`/`lg` rename here would need a 5-way naming scheme with no established precedent and would obscure the token mapping for no benefit. |
| `iconSwap` | `icon` | `ReactNode` | — (**required**, no default) | Unlike every other component's icon slot, there's no boolean to hide it and no variant renders without one — the icon is this component's entire content. Recommend making it a required prop, not optional. |

**No `text`/`title`/`children` prop exists or is recommended** — this is the first component in the doc set with no label content at all.

Non-visual props the code needs, none of which exist in Figma — flagged, not invented:

- ~~`onClick` / `aria-pressed`~~ — **RESOLVED 2026-07-19: not needed.** Confirmed not clickable — no click handler, no pressed-state semantics. The `Active_*` naming parity with Filter Chip is cosmetic, not behavioral.
- `aria-label` — ✅ **Resolved via industry-standard default, 2026-07-19 (no designer blocker).** Optional prop, `undefined` by default. When omitted, render `aria-hidden="true"` — the safe default for an icon used inline without guaranteed context (same pattern most icon-component libraries use, e.g. Radix/MUI icon primitives). Consumers who need the instance to convey real meaning to assistive tech pass `aria-label` explicitly, which drops the `aria-hidden`. See Accessibility.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | Single `Fill` property with 5 enum values (`Default`, `Default_square fill`, `Active_square`, `Active_circle`, `Default_circle fill`) | Split into `shape` (`'none'\|'square'\|'circle'`) + `active` (`boolean`, ignored when `shape='none'`) | Figma flattens two concerns (container shape, and an active/inactive treatment) into one enum with inconsistent value naming (see Variant axes). Splitting mirrors Button's `State`-axis precedent and Filter Chip's `state` rename — both cases where a flat Figma enum encoded more than one real concept. |
| 2 | `Size` = `32`/`24`/`20`/`16`/`12` | `size: 12\|16\|20\|24\|32` (numeric, no rename) | Kept as-is deliberately — these are icon-scale steps, not layout sizes; renaming to `sm`/`md`/`lg` would break the direct token-name mapping for no benefit. The "divergence" here is *choosing not to* apply the sm/md/lg convention used elsewhere. |
| 3 | `iconSwap` (instance swap, always present) | `icon: ReactNode` (required, not optional) | Every other component's icon slot is optional (`showIcon`/`icon` boolean + fallback). This component has no such boolean — the icon is the component's entire visual content, so making it required (rather than optional with a placeholder fallback) is a more honest prop contract. |

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on node `707:1883`, cross-checked via `get_design_context` on 15 of the 25 instances — every `Fill` value at both size extremes, plus the full size range for `Default_square fill` — not a single sample).

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | `Active_square`/`Active_circle` background. Same token/value Button/Filter Chip/Tags use for their solid-green treatments — no drift. |
| `Colors/Surface/Card_85` | `--pt-semantic-surface-card_85` | `#ffffffd9` (= white at 85% alpha, `rgba(255,255,255,0.85)` light / `rgba(50,58,60,0.85)` dark) | ✅ **RESOLVED, 2026-07-19 — the two-variable pattern is gone.** You updated the Figma binding directly: `Default_square fill`/`Default_circle fill`'s background now consumes this single existing semantic token instead of `Colors/Surface/Card_primary` + a separate `Opacity/85` layer effect. Re-confirmed live via `get_variable_defs` on node `707:1883` — `Colors/Surface/Card_primary` and `Opacity/85` are both **gone** from the variable list entirely, replaced by `Colors/Surface/Card_85` and a plain `Opacity/100` (i.e. the layer's own opacity is back to 100%, with the 85%-white effect now baked into the color itself). This is exactly the simplification I'd flagged as a recommendation in the prior round — no new `Opacity` token category needed after all, and no drift: `--pt-semantic-surface-card_85` already existed in `PT_tokens.md` and its light-mode hex (`#ffffffd9`) matches exactly. |
| `Colors/Icon/Headings` / `Colors/Icon/On_action` | — | — | ✅ **Resolved, 2026-07-19 — not a token binding at all, by design.** You confirmed the icon's color is deliberately **not** systematized: you place/color the icon manually per placement in the design, and it isn't meant to be interactive/state-driven. This explains why neither variable was traceable to any visible property in the generated code — they were never meant to be the icon's color source in the first place. **Recommendation:** the `icon` prop should carry its own color via whatever icon library is used (e.g. Tabler's own `color` prop on the `<Icon…>` element the consumer passes in) rather than Super Icon defining a fixed icon-color token internally. No `⚠️ HARDCODED` flag needed — this is intentional design freedom, not a missed binding. |
| `Scale/14`, `Scale/10`, `Scale/8`, `Scale/6`, `Scale/5` | `--pt-scale-14` (`56px`), `--pt-scale-10` (`40px`), `--pt-scale-8` (`32px`), `--pt-scale-6` (`24px`), `--pt-scale-5` (`20px`) | see Geometry | Container size per `Size` step — confirmed via both `get_metadata`'s symbol dimensions and every sampled variant's generated code. |
| `Scale/2`, `Scale/1Half`, `Scale/1`, `Scale/3Quat`, `Scale/Half` | `--pt-scale-2` (`8px`), `--pt-scale-1half` (`6px`), `--pt-scale-1` (`4px`), `--pt-scale-3quat` (`3px`), `--pt-scale-half` (`2px`) | see Geometry | Square-corner radius per `Size` step — confirmed via `get_design_context` on `Default_square fill` at all 5 sizes. Every one of these five values already exists in `PT_tokens.md`'s spacing scale — no new tokens needed, no drift. |
| `Scale/16` | `--pt-scale-16` | `64px` | Circle radius — the **same value at every `Size` step** (`64px` always exceeds the largest container, `56px`, so it renders as a perfect circle/pill regardless of size). This resolves a token that initially looked like a stray/unused reference in the raw `get_variable_defs` output — it's real and load-bearing, just not obviously tied to any single `Size` value the way the square radii are. |
| icon-size `12`/`16`/`20`/`24`/`32` → stroke weight `1`/`1.5`/`1.75`/`2`/`2.5` | `--pt-icon-stroke_weight-{12,16,20,24,32}` | see Geometry | Confirms `PT_tokens.md` §7.3 exactly at **all five** size steps (via the `"12":"1"`, `"16":"1.5"`, `"20":"1.75"`, `"24":"2"`, `"32":"2.5"` pairings in `get_variable_defs`) — no drift. First component to exercise the full stroke-weight scale. |

**Icon pixel size itself is inconsistently bound, continuing a file-wide gap — now confirmed a fifth time.** At `Size=32`, the icon wrapper's width is bound to `--pt-scale-8` (`32px`) but its height is a bare `32px` literal — only one axis is tokenized even though both resolve to the same value. At `Size=12`, neither axis is bound (`size-[12px]`, fully literal). No variant references a dedicated `--pt-icon-size-*` token directly on the icon element itself (the icon-size↔stroke-weight *pairing* is confirmed via `get_variable_defs`'s aggregate list, but isn't literally applied as a token to the icon markup) → `⚠️ HARDCODED — no consistent token binding for icon pixel size`, same gap already seen on Button, Filter Chip, Eyebrow Highlight, and Tags.

~~**Architecture question on the opacity+solid-color pattern**~~ — **RESOLVED 2026-07-19.** You applied exactly the simplification flagged here: `Default_square fill`/`Default_circle fill` now bind `Colors/Surface/Card_85` directly instead of `Card_primary` + a separate `Opacity/85` layer effect. No remaining open item on this.

### Per-variant token map

| Fill | Background | Icon color |
|---|---|---|
| `Default` | none (fully transparent, `opacity-0` overlay div present but invisible) | ✅ consumer-supplied, not a token — see below |
| `Default_square fill` | `--pt-semantic-surface-card_85` | ✅ consumer-supplied |
| `Active_square` | `--pt-semantic-surface-action` | ✅ consumer-supplied |
| `Default_circle fill` | `--pt-semantic-surface-card_85` | ✅ consumer-supplied |
| `Active_circle` | `--pt-semantic-surface-action` | ✅ consumer-supplied |

✅ **Icon color resolved 2026-07-19: intentionally not a fixed token.** You confirmed the icon's color is manually placed/chosen per usage in the design, not driven by a state or bound to a fixed semantic token — this is why it wasn't traceable through MCP for any variant (the icon is always a flat SVG `<img>` asset in the generated code, no color class). Recommend the `icon` prop simply carry whatever color the consumer's icon element specifies (e.g. Tabler's `color` prop) rather than Super Icon enforcing one internally.

### Geometry (all 5 sizes — confirmed via `get_metadata` + 15 sampled `get_design_context` calls)

| `Size` | Container (W×H) | Icon size | Stroke weight | Square radius | Circle radius |
|---|---|---|---|---|---|
| `32` | `56px` (`--pt-scale-14`) | `32px` | `2.5` (`--pt-icon-stroke_weight-32`) | `8px` (`--pt-scale-2`) | `64px` (`--pt-scale-16`, exceeds container → perfect circle) |
| `24` | `40px` (`--pt-scale-10`) | `24px` | `2` (`--pt-icon-stroke_weight-24`) | `6px` (`--pt-scale-1half`) | `64px` (same token, same effect) |
| `20` | `32px` (`--pt-scale-8`) | `20px` | `1.75` (`--pt-icon-stroke_weight-20`) | `4px` (`--pt-scale-1`) | `64px` |
| `16` | `24px` (`--pt-scale-6`) | `16px` | `1.5` (`--pt-icon-stroke_weight-16`) | `3px` (`--pt-scale-3quat`) | `64px` |
| `12` | `20px` (`--pt-scale-5`) | `12px` | `1` (`--pt-icon-stroke_weight-12`) | `2px` (`--pt-scale-half`) | `64px` |

Container is always larger than the icon (icon is inset/centered, not edge-to-edge) — the padding between icon and container edge is not itself a separately-named token; it's simply `(container − icon) / 2` at every step and isn't spent from the spacing scale directly in the generated code (both container and icon sizes are independently bound, and the gap falls out of the difference).

## States

✅ **Confirmed non-interactive, 2026-07-19.** Despite the `Selected_*`→`Active_*` rename matching Filter Chip's naming, you've confirmed Super Icon is not clickable — `active` is a plain display variant set by whatever renders the component, not a state the component manages itself. No `Hover`/`Focus`/`Disabled` needed, same category as Eyebrow Highlight/Tags.

| State | Status |
|---|---|
| Hover | Not applicable — confirmed non-interactive. Do not add a hover treatment. |
| Focus (keyboard) | Not applicable — confirmed non-interactive, never receives keyboard focus. |
| Active / Inactive | **Modeled**, via the `Fill` axis (`Active_square`/`Active_circle` vs. their `Default_*` counterparts) — a display variant only, driven by an `active` prop the consumer sets, not by user interaction on this component. See Props. |
| Disabled | Not applicable — confirmed non-interactive. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- **Semantic element resolved:** a plain non-interactive element (`<div>`/`<span>`), never a `<button>` — confirmed not clickable, 2026-07-19. No `aria-pressed`, no focus ring, no `onClick`.
- ✅ **Accessible name resolved via industry-standard default, 2026-07-19.** No text content anywhere on this component. Default to `aria-hidden="true"` (safe assumption for an icon rendered inline without guaranteed context — same convention most icon-component libraries use). When an instance conveys real information on its own (e.g. reflecting the current selection elsewhere in the UI), the consumer passes an explicit `aria-label`, which overrides the `aria-hidden` default. No component-level default forces one interpretation over the other.
- Touch target note no longer applies — not a tappable control.
- Contrast: since icon color is consumer-supplied per placement rather than a fixed component token (confirmed 2026-07-19, see Tokens used), contrast can't be audited at the component level — it's the responsibility of whoever places the icon to pick a color with sufficient contrast against the chosen `shape`/background combination. Worth a line in implementation guidance/Storybook docs rather than a component-level fix.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `shape='none'` for icons that sit inline with other content and need no visual container | Add a background to every icon by default |
| Set `active` from external app state (e.g. "this is the current selection") | Wire up `onClick`/`aria-pressed` — this component isn't clickable |
| Match `size` to the icon-scale step already used nearby (e.g. `16` next to body text, `32` for a prominent standalone icon) | Pick an arbitrary size unrelated to the type/icon scale it sits next to |
| Always pass a real icon via the required `icon` prop | Ship this component with no icon — Figma never shows an empty state |
| Render as a plain non-interactive element (`<div>`/`<span>`) | Render as a `<button>` — confirmed not clickable, despite the `Active_*` naming |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ✅ **`shape='none'` + `active=true`** — **RESOLVED via the documented Props behavior:** `active` is ignored whenever `shape='none'`, since Figma has no "active but no background" treatment to render. Codegen should treat this as a no-op, not invent a visual.
- ✅ **Icon aspect ratio / non-square icons — resolved, mostly moot in practice.** Tabler icons (the confirmed icon source, see `PT_tokens.md` §4 "Icons") always render within a square SVG viewBox regardless of the glyph's own shape — passing the same `size` value for width and height (as documented in Tokens used/Geometry) is sufficient, and no special aspect-ratio handling is needed for any Tabler-sourced icon. This would only become a real question again if a non-square-viewBox icon source were introduced later, which isn't the case today.
- ~~Icon color~~ — **RESOLVED 2026-07-19: intentionally consumer-supplied, not a fixed token.** You place/color the icon manually per usage; the component shouldn't enforce one internally.
- ~~Click/toggle mechanics~~ — **RESOLVED 2026-07-19: not applicable, not clickable.** Unlike Filter Chip, there's no click at all — `active` is purely a prop set by whoever renders the component.
- ~~Accessible name~~ — **RESOLVED via industry-standard default, 2026-07-19.** Optional `aria-label` prop; `aria-hidden="true"` when omitted. See Accessibility.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { SuperIcon } from '@/components/SuperIcon';
import { IconTextResize } from '@tabler/icons-react';

// No background, 24px — decorative, inline with already-labeled body text
<SuperIcon shape="none" size={24} icon={<IconTextResize size={24} stroke={2} />} />

// Active, square, 32px — active reflects external state, e.g. the current selection elsewhere in the UI
<SuperIcon shape="square" active={isCurrentSelection} size={32} icon={<IconTextResize size={32} stroke={2.5} />} aria-label="Text resize" />

// Inactive, circle, 16px
<SuperIcon shape="circle" active={false} size={16} icon={<IconTextResize size={16} stroke={1.5} />} />
```

## Cross-component consistency check

Comparing Super Icon against Button, Button (Icon only), Filter Chip, Eyebrow Highlight, and Tags.

1. **⚠️ Important correction, 2026-07-19 — naming parity with Filter Chip does NOT mean behavioral parity.** You renamed `Selected_square`/`Selected_circle` to `Active_square`/`Active_circle` in Figma to match Filter Chip's *naming*, confirmed live via `get_metadata`. The prior round of this doc read that rename as evidence of a shared interaction model (clickable, `<button aria-pressed>`) — you've since clarified Super Icon is **not** clickable at all. Filter Chip's `active` is reached by clicking the chip; Super Icon's `active` is a plain prop set by whatever renders it. **Worth flagging system-wide:** the same Figma word (`Active`) is now confirmed to mean "user-reached via click" on one component and "externally-set display variant" on another — a naming-implies-behavior trap the codegen agent should not fall into on future components either. Corrected throughout this section.
2. **✅ RESOLVED 2026-07-19 — icon color is intentionally not a token.** You confirmed the icon's color is manually placed per usage in the design, not interactive or systematized. This explains why `Icon/Headings`/`Icon/On_action` were never traceable to any visible property in the generated code (`Default`, `Default_square fill`, `Active_square` all checked directly) — they were the wrong lead entirely, not a missed binding. Closed; no longer flagged as unconfirmed.
3. **✅ RESOLVED 2026-07-19 — no new token category needed after all.** You updated the Figma binding directly: `Default_square fill`/`Default_circle fill` now consume the existing `Colors/Surface/Card_85` semantic token instead of `Colors/Surface/Card_primary` + a separate `Opacity/85` layer effect. Re-confirmed via a fresh `get_variable_defs` on node `707:1883` — `Opacity/85` and `Colors/Surface/Card_primary` are both gone from the variable list entirely. `--pt-semantic-surface-card_85` already existed in `PT_tokens.md` and matches exactly (`#ffffffd9`). What looked like a brand-new token-architecture gap in the prior round is now just a clean, correct binding — no doc or token changes needed on the `PT_tokens.md` side.
4. **✅ Icon-size/stroke-weight scale confirmed at all 5 steps for the first time.** Every prior component only exercised a subset. No drift found — `PT_tokens.md` §7.3 is accurate across the board now, not just for the steps previously spot-checked.
5. **`Fill` naming — no longer a fourth unrelated vocabulary, but a direct alignment with Filter Chip.** Your `Active_*` rename means Super Icon's `active` concept now uses the *same* word Filter Chip uses for its own filter-applied state — a genuinely good sign for consistency, even though the Figma property is still called `Fill` rather than `State`. Worth noting `Fill` itself is still a distinct property name from Button/Filter Chip's `State`, so the system-wide `State`→`status` naming question (Eyebrow Highlight/Tags) is unaffected by this.
6. **`iconSwap` naming is consistent.** Matches the unified convention from Filter Chip/Eyebrow Highlight/Tags. No drift.
7. **Structural outlier, not drift:** first component with no text/label prop at all, and first with no icon-visibility toggle (icon is mandatory here, optional everywhere else). Both confirmed via full enumeration, not an oversight in reading.
8. **Icon pixel-size-not-consistently-bound gap confirmed a fifth time** (Button, Filter Chip, Eyebrow Highlight, Tags, Super Icon) — and here it's *especially* inconsistent, since even the two axes of a single icon at a single size don't bind identically (width tokenized, height literal, at `Size=32`). Strengthens the case this is a systemic Figma-binding habit, not per-component carelessness.
9. **`text-resize` placeholder matches a real Tabler icon — the fourth time in a row.** `IconTextResize` exists in `@tabler/icons-react`, confirmed live. Combined with Button's `settings-2`, Button (Icon only)'s `chevron-left`, and Filter Chip/Eyebrow Highlight/Tags's `diamond` all matching real Tabler icons, this is no longer a coincidence worth hedging heavily — the placeholder icons in this file are very likely sourced directly from Tabler. Still not treating any of them as a *confirmed final choice* without your sign-off, per the established convention, but the pattern itself is now strong enough to state plainly.
10. **Axis math is a flat enum, not a true grid — same pattern as Filter Chip's `State`, different resolution recommended.** Filter Chip's four-value `State` was kept as one enum because no combined states existed to justify a split. Super Icon's five-value `Fill` **is** recommended for a split (`shape`×`active`) because the math cleanly explains itself (1 + 2 + 2 = 5, with `shape='none'` structurally excluding an `active` axis) rather than reading as four arbitrary buckets. Documented so the codegen agent doesn't treat "flatten vs. decompose" as a fixed system-wide rule — it depends on whether the underlying axes genuinely factor apart.

**Summary:** no drift in the shared color primitives used for backgrounds (`Surface/Action`, `Surface/Card_85`, both confirmed matching prior components/`PT_tokens.md` exactly) or in the icon-size/stroke-weight scale (confirmed accurate at all 5 steps for the first time). Icon color is confirmed intentionally consumer-placed per usage, and the opacity pattern is simplified to a single existing semantic token with no new token category needed. The interactivity question resolved in the *opposite* direction from the prior round: Super Icon is **not** clickable, despite the `Active_*` naming matching Filter Chip — a naming-vs-behavior trap worth flagging for future components too. Every remaining item that had a safe industry-standard default (`shape`/`active` decomposition, accessible name, icon aspect ratio) is now resolved that way, per your confirmation that no further design input was needed. Only the code path/export name — always a tech-lead task, not a design decision — remains genuinely open.

## Open questions — what needs your confirmation

All design-facing questions are resolved (2026-07-19, either by your direct confirmation or an applied industry-standard default — see Cross-component consistency check and the ✅ items throughout this section). One item remains, but it's an engineering task rather than a design decision:

1. **Component code path + export name** for the header block — for the tech lead to fill in once the file exists in the codebase.

---

# Map_pin

> Figma node: `Map_pin` — node `743:843` (a wrapper frame containing 3 variant instances of a single underlying component — not itself a component-set node, same pattern as Eyebrow Highlight/Tags/Super Icon. `get_design_context` on each instance resolves to the same `MapPin` component signature with `number`/`visited` props; the recommended code API adds `status` (renamed from `visited`), `onClick`, `editable`, and `onNumberChange` — none of which exist in Figma's own property panel, all confirmed as real requirements via your direct input.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=743-843
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/MapPin.tsx]` (Figma's own generated function name is already `MapPin` — no singular/plural ambiguity to resolve, unlike Tags.)
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Interactivity, full lifecycle, naming rename, token-role questions, and map-wide `Selected` exclusivity all resolved via your direct confirmation. One open item remains: the editable-number edit-trigger UX. Code path/export name remains for the tech lead.

## Description

A fixed-size (36×36px) numbered map-pin marker, used to represent a tour stop on a map. Structurally a two-layer graphic — an outer teardrop pin silhouette (Figma layer `Vector`) and an inner circular badge (Figma layer `Ellipse10`) — with a short, editable number label centered on top. Three visual states along a single `Visited` axis: `Default` (not yet visited), `Selected` (the pin the user has tapped — its content is currently playing), and `Visited` (the pin's content has finished playing, or the user has visited the physical place).

⚠️ **Naming risk, flagged before any other finding.** The Figma property is literally named `Visited`, but its three values are `Default`/`Selected`/`Visited` — the axis name is also one of its own values. A codegen agent reading a prop signature like `visited?: "Default" | "Selected" | "Visited"` could easily misread this as a boolean `visited: boolean` toggle that happens to also accept `"Selected"`, rather than a true 3-way enum. This is the same category of risk as Eyebrow Highlight's original `Type: Light/Dark` (misreadable as the app's theme mode) and Super Icon's flat `Fill` axis (conflating two concerns) — both of which were corrected via a rename. ✅ **RESOLVED (2026-07-19): rename to `status` confirmed** — see Props.

✅ **RESOLVED (2026-07-19): interactive, confirmed directly.** Unlike Super Icon (where the `Active_*` naming turned out to be cosmetic, not behavioral), Map_pin's state names *do* reflect real interaction here. Renders as a real control: tapping a pin drives it to `Selected`, the same "naming matches behavior" outcome the Super Icon correction warned this doc set not to assume by default.

✅ **RESOLVED (2026-07-19): full lifecycle confirmed, and it's one-directional and app-mediated, not just a click toggle.** Every pin starts at `Default`. A user tap drives it to `Selected` — this is the one state transition that's a direct click. From `Selected`, the pin advances to `Visited` **automatically**, driven by one of two app-level triggers: the pin's associated content finishing playback, or the user having visited the physical place. **Critically, `Visited` is not reached by a second click on the pin itself** — the component doesn't manage this transition; the consumer sets `status="visited"` in response to a playback-end event or a visit-confirmation signal from elsewhere in the app (geolocation, itinerary tracking, etc.). This resolves the interaction-model question definitively: `MapPin` is a fully consumer-controlled display (same controlled pattern as Filter Chip), not a self-contained toggle.

✅ **RESOLVED (2026-07-19): `Selected` is exclusive across the whole map — only one pin selected at a time, confirmed directly.** Not just an inference from the "content playing" framing anymore. This is a **collection-level** constraint, not something `MapPin` enforces on itself — an individual `MapPin` instance has no visibility into its siblings, so the consuming app/map component is responsible for ensuring only one pin's `status` is ever `'selected'` at once (e.g. deselecting the previous pin when a new one is tapped). See Props and Accessibility for what this confirms.

## Variant axes

The Figma node contains **3 variants** (enumerated directly via `get_metadata` — not estimated).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Visited` | `Default` · `Selected` · `Visited` | 3 |

No `Size` axis (third component in this doc set without one, after Eyebrow Highlight and Tags) and no `Type` axis. One component-level (non-variant) property, present on every variant:

| Component property | Type | Default | Notes |
|---|---|---|---|
| `number` | text | `"00"` | The pin's numeric label. First component whose content prop is neither `children`/`title`/`text` — see Cross-component consistency check for why this wasn't unified with those. ✅ **Confirmed (2026-07-19): hard-capped at 99** — no 3-digit handling needed, resolving the earlier open edge case outright rather than requiring truncation/reflow logic. ✅ **Confirmed (2026-07-19): must be editable** — see Props for the recommended `editable`/`onNumberChange` shape; exact edit-trigger UX still needs a follow-up, see Open questions. |

**No `iconSwap` / icon-visibility toggle exists on this component at all** — first component in the doc set with neither an optional icon slot nor a mandatory one (unlike Filter Chip/Eyebrow Highlight/Tags' optional icon, or Super Icon's mandatory one). The pin's visual differentiation is carried entirely by color/gradient and size, not iconography.

### Variant math (axes multiplied vs. actual)

```
3 (Visited) = 3 theoretical
Actual component count = 3
Excluded                = 0
```

**No exclusions** — single axis, full set, same pattern as Eyebrow Highlight/Tags/Super Icon's flat enumerations.

### Valid combinations

```
{Default, Selected, Visited} = 3, all valid.
```

## Props (code API)

✅ **`status` rename adopted (2026-07-19), per your confirmation.**

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Visited` | `status` | `'default' \| 'selected' \| 'visited'` | `'default'` (Figma's spatial/enumeration-order default, and also the confirmed real starting state — every pin starts at `Default`, see Description) | Renamed to avoid the self-referential collision described in Description — `visited` as a prop name reads as boolean-shaped even though it isn't. Same category of fix as Eyebrow Highlight's `Type`→`emphasis` and Super Icon's `Fill` decomposition. **Fully consumer-controlled** — `MapPin` never transitions its own `status`; the consumer advances it on click (`Default`→`Selected`) and on a separate app-level trigger (`Selected`→`Visited`, see `onClick` below and Description). ✅ **RESOLVED (2026-07-19): `'selected'` is exclusive across the map — only one pin at a time.** `MapPin` itself has no way to enforce this (each instance is unaware of its siblings) — the consuming map/list component owns deselecting the previously-selected pin when a new one is tapped, typically by deriving each pin's `status` from a single `selectedStopId` in the parent's state rather than independent per-pin state. |
| `number` | `number` | `number` (1–99) | `1` (recommend defaulting to a real starting number rather than Figma's `"00"` placeholder, since 0 isn't a valid stop) | ⚠️ **Type recommendation revised from the previous round.** Originally recommended `string` to preserve the Figma placeholder's leading zero (`"00"`). Now that (a) the value is confirmed hard-capped at 99 and (b) the value is confirmed editable, a numeric type with range validation (`1–99`) is the more defensible choice — it's easier to validate/clamp a number than a free-text string, and the leading-zero *display* (`"03"` instead of `"3"`) can still be produced at render time (e.g. `String(number).padStart(2, '0')`) without storing it that way. **Deliberately not unified** with the `children`/`title`/`text` convention used elsewhere — this content is structurally always a short numeric label, not arbitrary text. |

Non-visual props, none of which exist in Figma's own property panel — added because interactivity is now confirmed, not invented speculatively:

- ✅ **`onClick: () => void`** — **RESOLVED (2026-07-19): required.** Fires when the pin is tapped, driving `Default`→`Selected`. The consumer owns the `status` transition — this component doesn't manage its own state (same controlled pattern as Filter Chip). Does **not** fire the `Selected`→`Visited` transition — see below.
- ✅ **`status` is set by the consumer for the `Selected`→`Visited` transition too** — driven by a playback-end event or a visit-confirmation signal, both of which live outside this component (an audio/content player, geolocation, itinerary tracking). `MapPin` has no `onContentEnd`/`onVisited` callback of its own; it only ever reflects whatever `status` the consumer passes in.
- ✅ **`editable?: boolean` (default `false`) + `onNumberChange?: (value: number) => void`** — **new requirement, 2026-07-19: numbers must be editable.** Recommended shape: when `editable` is `true`, the number label becomes an editable field (exact interaction — tap-to-edit, a pencil affordance, double-click, etc. — is genuinely unconfirmed, see Open questions) and `onNumberChange` fires with the new value, clamped to `1–99`. Not modeled in Figma at all (no edit-mode variant exists) — this is a pure code-side addition based on your direct requirement, not inferred from the design file.
- ✅ `aria-label` — recommended. See Accessibility for the recommended composition (number + status).

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Visited` = `Default`/`Selected`/`Visited` | `status='default'\|'selected'\|'visited'` | The property name is also one of its own enum values, reading as boolean-shaped to a codegen agent. See Description/Props. ✅ Confirmed. |
| 2 | `number` (text property, default `"00"`) | `number: number` (range `1–99`) | Kept distinct from `children`/`title`/`text` — see Props mapping notes and Cross-component consistency check item 6. Type changed from an earlier `string` recommendation now that the value is confirmed hard-capped and editable — see Props. |
| 3 | No edit affordance modeled in Figma at all | `editable?: boolean` + `onNumberChange?: (value: number) => void` | New requirement, not inferable from the design file — the number must be editable in code even though Figma shows no edit-mode variant. See Props and Open questions for the unconfirmed exact edit UX. |
| 4 | No transition/prototype logic in Figma | `status` fully consumer-controlled: `onClick` drives `Default`→`Selected`; a separate, external app trigger (playback end or visit confirmation) drives `Selected`→`Visited` | Figma has no way to model a two-source state transition — this is entirely a code-side behavior confirmed via your description of the lifecycle, not something read from the file. See Description. |

## Tokens used

All values below are the **actual bound variables** read from Figma — `get_variable_defs` was run both on the whole node (`743:843`, aggregate) **and individually on each layer inside each variant** (`Vector` and `Ellipse10` sub-nodes: `743:821`/`743:822` for `Default`, `743:825`/`743:826` for `Selected`, `743:833`/`743:834` for `Visited`), the same per-node-scoped technique used to pin down Super Icon's `Opacity/85` sourcing — not inferred from the aggregate list alone.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Colors/Icon/Headings` | `--pt-semantic-icon-headings` | `#222628` | Pin outline (`Vector`) color on **both** `Default` and `Selected` — confirmed via per-node `get_variable_defs`, not assumed. See the role-mismatch note under Per-variant token map. |
| `Colors/Icon/Body_Secondary` | `--pt-semantic-icon-body_secondary` | `#869a9f` | Pin outline (`Vector`) color on `Visited` only. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | Inner badge (`Ellipse10`) color on `Default` **and** `Visited` — confirmed real and load-bearing via per-node `get_variable_defs` on both, not a stray reference. ✅ **RESOLVED (2026-07-19): off-label reuse confirmed intentional.** Same recurring pattern as `Icon/On_hover` being used for Button's resting icon color, or `Colors/Surface/Disabled` being reused on Eyebrow Highlight/Tags' non-disabled `Neutral`/`Solid` state — but unlike those (still open), you've confirmed this one is fine as-is. No new token needed; consume `--pt-semantic-surface-success` directly. |
| `Default_fill/Stop1` / `Default_fill/Stop2` (+ `Gradient/Default`) | `--pt-gradient-default` | Stop1 `#7db071` (green-400) → Stop2 `#009bc8` (teal-500) | Inner badge (`Ellipse10`) color on `Selected` only. **Matches `PT_tokens.md` §7.9's `--pt-gradient-default` exactly, stop-for-stop** — same gradient already used on Button/Button (Icon only)'s hover-adjacent treatments. No new token, no drift; confirms the gradient family is being reused consistently rather than redefined per component. |
| `Colors/Typography/Headings` | `--pt-semantic-typography-headings` | `#222628` | Number label color, `Default`. |
| `Colors/Typography/Body_caption` | `--pt-semantic-typography-body_caption` | `#869a9f` | Number label color, `Visited`. |
| `Colors/Typography/On_action` | `--pt-semantic-typography-on_action` | `#ffffff` (light) / `#000000` (dark) | Number label color, `Selected`. |
| `Typography/Body Regular/Default` (composite text style) | `pt-text-style-body-default-regular` (per `PT_tokens.md` §4) | font-size `16px` (`--pt-typography-body-default-font_size`), line-height `24px` | Number label style, `Default` + `Visited`. **First component in this doc set to bind a full named Figma text style rather than raw font-size/line-height primitives** — positive confirmation that `PT_tokens.md` §4's text-style utility classes are real, Figma-backed styles, not just a documented convention with no design-side evidence yet. ⚠️ **Line-height is bound to `Scale/6` (`--pt-scale-6`, 24px), not a `body-default-line_height` token** — confirmed directly in the composite style's own definition (`lineHeight: Scale/6`). Same pattern already documented for Button's `Default`/`Large` size and Filter Chip's `Large` size — not a new gap, a recurring one. |
| `Typography/Body Emphasis/Default` (composite text style) | `pt-text-style-body-default-emphasis` | font-size `16px`, line-height `24px` | Number label style, `Selected`. Same `Scale/6` line-height binding as above. |

### Per-variant token map

| `Visited` value | Pin outline (`Vector`) | Inner badge (`Ellipse10`) | Number label color | Number label weight |
|---|---|---|---|---|
| `Default` | `--pt-semantic-icon-headings` (`#222628`) | `--pt-semantic-surface-success` (`#dfebdb`) | `--pt-semantic-typography-headings` (`#222628`) | Regular (500) — `Body Regular/Default` |
| `Selected` | `--pt-semantic-icon-headings` (`#222628`) ⚠️ see note | `--pt-gradient-default` (green-400 → teal-500) | `--pt-semantic-typography-on_action` (`#ffffff`) | SemiBold (700) — `Body Emphasis/Default` |
| `Visited` | `--pt-semantic-icon-body_secondary` (`#869a9f`) | `--pt-semantic-surface-success` (`#dfebdb`, same as `Default`) | `--pt-semantic-typography-body_caption` (`#869a9f`) | Regular (500) — `Body Regular/Default` |

✅ **Internal role-"mismatch" on `Selected` — confirmed intentional, 2026-07-19, not a bug to fix.** On `Default` and `Visited`, the pin outline and number label are drawn from paired token families of the same resolved value (`Headings`/`Headings`, `Body_caption`/`Body_secondary` — the same label↔icon pairing convention already established on Eyebrow Highlight/Tags). On `Selected`, that pairing breaks: the label switches to the action family (`Typography/On_action`, white) but the outline **stays** on `Icon/Headings` (dark, headings family) instead of a paired `Icon/On_action`. You've confirmed this is intentional — keep `Icon/Headings` on the `Selected` outline as-is; do not "correct" it to a paired `Icon/On_action` token.

### Geometry

| Property | Value | Token |
|---|---|---|
| Frame size (all 3 states) | `36×36px` | ⚠️ `HARDCODED` — no `Scale/*` variable bound to the frame in any of the 3 samples. Numerically equals `--pt-scale-9` (36px) — recommend that token if the codegen wants a token-backed value, but this is a recommendation, not a confirmed Figma binding (contrast with Super Icon, whose container sizes *were* directly bound to `Scale/*` tokens — an inconsistency across the two components worth noting, not resolving here). |
| Pin outline (`Vector`), `Default`/`Visited` | ≈26×30px (from insets: top 9.34%, sides 13.93%, bottom 7.32% of the 36px frame) | Percentage insets baked into the exported vector asset, not a spacing-scale token — not something to reproduce as CSS padding/margin (see Code example note). |
| Pin outline (`Vector`), `Selected` | ≈29×34px (insets: top 3.79%, sides 9.13%/9.12%, bottom 1.77%) — visibly larger footprint within the same 36px frame, consistent with `Selected` reading as "emphasized." | Same as above. |
| Inner badge (`Ellipse10`), `Default`/`Visited` | ≈19×19px circle (insets: top 18.36%, sides 22.95%, bottom 27.54%) | Same as above. |
| Inner badge (`Ellipse10`), `Selected` | ≈22×22px circle (insets: top 14.01%, sides 19.34%, bottom 24.68%) | Same as above. |
| Number label width | `22px` | ⚠️ `HARDCODED` — no token bound. |
| Number font size / line-height | `16px` / `24px` | `--pt-typography-body-default-font_size` / **`--pt-scale-6`** (not a `body-default-line_height` token — see Tokens used) |
| Number font weight | Regular (500) `Default`/`Visited`; SemiBold (700) `Selected` | `--pt-typography-font_weight-regular` / `-semibold` |

## States

✅ **RESOLVED (2026-07-19): confirmed interactive** — the naming-suggests-behavior read turned out correct here (opposite of Super Icon). Figma still models no `Hover`/`Focus`/`Disabled` variant anywhere in the 3 instances, so those remain undesigned gaps rather than confirmed non-applicable states — same category of gap as Filter Chip's missing hover (moved to the roadmap, not blocking).

| State | Status |
|---|---|
| Hover | ⚠️ Not modeled in Figma. Confirmed the component needs one (it's interactive) but no visual is designed yet — recommend a CSS-only placeholder (e.g. a slight scale/elevation bump) pending a real design, same treatment as Filter Chip's identical gap. **Moved to Design system roadmap** — not a blocker. |
| Focus (keyboard) | ⚠️ Not modeled in Figma. Same gap as every other interactive component in this doc set (Button, Filter Chip) — needs a visible focus ring meeting 3:1 contrast. **Moved to Design system roadmap.** |
| `Default` / `Selected` / `Visited` | Modeled via the `Visited` axis — see Variant axes. ✅ **RESOLVED (2026-07-19): full lifecycle confirmed.** `Default`→`Selected` is a direct tap (`onClick`). `Selected`→`Visited` is **not** a second tap — it's driven by an external app trigger (the pin's content finishing playback, or the user visiting the physical place) that the consumer detects and reflects by updating `status`. One-directional; no path back to `Default` was described. |
| Disabled | Not modeled — no evidence either way. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **RESOLVED (2026-07-19): semantic element is `<button>`.** Confirmed interactive — render as a real `<button type="button">`, not a `<div>` with a click handler bolted on, so keyboard focusability and activation (Enter/Space) come for free.
- ✅ **Recommended accessible name, now that interactivity is confirmed:** `aria-label` combining the stop number and its status (e.g. `aria-label="Stop 3, visited"` / `"Stop 7, selected"` / `"Stop 12"` for `default`, where the bare number alone is ambiguous) — don't rely on the visible number text alone, since `aria-current` (see below) communicates selection but not the visited/not-visited distinction.
- ✅ **RESOLVED (2026-07-19): `aria-current="location"` confirmed as the right pattern, not `aria-pressed`.** `aria-pressed` implies an independent toggle each control manages for itself; `Selected` is confirmed exclusive across the whole map (only one pin at a time — see Description/Props), which is exactly the single-current-item semantic `aria-current="location"` is designed for. Apply `aria-current="location"` when `status === 'selected'`, omitted otherwise.
- ⚠️ **Color-only state differentiation — still a real WCAG 1.4.1 concern even though interactivity is now confirmed.** `Default`/`Selected`/`Visited` are distinguished entirely by pin color/gradient and size; nothing in the visible number communicates which state a given pin is in without the `aria-label` addition above. Don't skip the label just because the component is now confirmed clickable — the state itself is still color-only without it.
- If this component is rendered as a custom marker inside a JS map library (Mapbox GL, Google Maps, etc. — a reasonable assumption given the name and content, though not confirmed by Figma): flag for the tech lead that DOM-based markers positioned over a canvas/WebGL map layer have their own known keyboard-navigation and focus-order pitfalls, independent of anything in this spec.
- Contrast not yet computed for any of the 3 label/background pairings — flagged for a future pass, not computed here since the pairings differ from every previously-audited component (`Headings`-on-transparent, `On_action`-on-gradient, `Body_caption`-on-transparent all need their own check against whatever surface the pin sits on, which varies by map background).
- ⚠️ **New: editable-number accessibility, not modeled in Figma at all.** Whatever triggers edit mode (see Props/Open questions) needs its own accessible affordance — if it's a separate control (e.g. a pencil icon), it needs its own `aria-label` distinct from the pin's own (e.g. `"Edit stop number"`); if editing happens inline on the pin itself, the pin's role would need to change from `<button>` to something that supports both activation (select the stop) and editing (change the number) without overloading a single control's semantics ambiguously. Flagged as a real, unresolved accessibility design question, not just an interaction one.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Reserve `status='selected'` for the pin whose content is currently playing | Use `selected` styling for a merely-hovered pin — no hover state is designed yet |
| Render as a real `<button>` and wire up `onClick` — confirmed interactive | Render as a non-interactive `<div>`/`<span>` — this was the right call for Super Icon, not for Map_pin |
| Drive `Selected`→`Visited` from a playback-end or visit-confirmation event, not a second tap on the pin | Wire the pin's own `onClick` to advance it straight from `Selected` to `Visited` |
| Pass a real `number` for every instance — Figma never shows an empty/iconless state | Omit `number` — this component has no fallback content |
| Treat `visited` as trip-progress information that also needs a non-visual signal (see Accessibility) | Rely on pin color alone to convey visited/not-visited state |
| Clamp/validate edited numbers to `1–99` | Allow a number above 99 or below 1 through `onNumberChange` — confirmed hard stop |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ✅ **RESOLVED (2026-07-19): hard stop at 99.** No 3-digit handling needed — `number` is validated/clamped to `1–99` in code (see Props), so the `22px` label width and `36px` frame never need to accommodate a 3rd digit. Simplest possible resolution of this edge case.
- **`Selected` + `Visited` simultaneously:** the confirmed lifecycle (`Default`→`Selected`→`Visited`, one-directional, `Visited` triggered by playback-end or visit-confirmation) implies these are naturally sequential, not simultaneous — by the time a pin is `Visited`, it's no longer the actively-`Selected` one. Effectively resolved by the lifecycle description, though not explicitly stated as "these are mutually exclusive" in so many words — see Open questions for the one remaining nuance (map-wide `Selected` exclusivity).
- **RTL:** not modeled. Lower priority than most components here — a map is spatially, not text-directionally, oriented — but the number label's text alignment/positioning should still be sanity-checked, same low-priority status already given to this concern elsewhere.
- ✅ **RESOLVED (2026-07-19): tapping a pin is a real interaction, and only drives `Default`→`Selected`.** The `Selected`→`Visited` transition is confirmed **not** to be a second tap — it's driven by content playback finishing or a visit being confirmed elsewhere in the app. `onClick`'s downstream effect beyond setting `status` (e.g. whether it also pans/zooms the map, opens a detail card, starts playback) lives outside this component and isn't specified here.
- ⚠️ **New: exact edit-trigger UX for the number field is unconfirmed.** Tap-to-edit, a dedicated edit affordance (pencil icon), double-click, long-press, or an admin/CMS-only edit mode separate from the traveler-facing map — genuinely unspecified. See Open questions.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation. `status` is fully consumer-controlled: `onClick` only ever requests `Default`→`Selected`; the `Selected`→`Visited` transition below is shown driven by a content-player callback, illustrating the confirmed lifecycle rather than a second click on the pin. Single-selection across the map (confirmed 2026-07-19) is enforced by the parent deriving each pin's `status` from one shared `selectedStopId`, not by each `MapPin` independently. `aria-current="location"` is applied whenever `status === 'selected'`. The `editable` example shows the recommended shape only — the actual edit-trigger UX is still unconfirmed (see Open questions).

```tsx
import { MapPin } from '@/components/MapPin';

// Parent owns which single stop is selected — MapPin instances don't coordinate with each other
const [selectedStopId, setSelectedStopId] = useState<number | null>(null);

function statusFor(stopId: number, visitedIds: Set<number>) {
  if (visitedIds.has(stopId)) return 'visited';
  if (stopId === selectedStopId) return 'selected';
  return 'default';
}

// Not yet visited, not selected — number is not editable in the traveler-facing map
<MapPin
  number={3}
  status={statusFor(3, visitedIds)}
  onClick={() => setSelectedStopId(3)}
  aria-label="Stop 3"
/>

// Currently selected — its content is playing. Tapping a different pin (or the content
// player finishing) is what moves this one along, not a second tap on the pin itself.
<MapPin
  number={7}
  status={statusFor(7, visitedIds)}
  onClick={() => setSelectedStopId(7)}
  aria-current={statusFor(7, visitedIds) === 'selected' ? 'location' : undefined}
  aria-label="Stop 7, selected"
/>

// Already visited — reached automatically, e.g. from the content player's onEnded callback:
// contentPlayer.onEnded(() => setVisitedIds(prev => new Set(prev).add(7)))
// or a geolocation/visit-confirmation signal elsewhere in the app — never from MapPin's own onClick.
<MapPin
  number={12}
  status={statusFor(12, visitedIds)}
  onClick={() => setSelectedStopId(12)}
  aria-label="Stop 12, visited"
/>

// Admin/CMS context — editable number (exact edit-trigger UX still unconfirmed, see Open questions)
<MapPin
  number={5}
  status={statusFor(5, visitedIds)}
  editable
  onNumberChange={(newNumber) => updateStopNumber(5, newNumber)}
  onClick={() => setSelectedStopId(5)}
  aria-label="Stop 5"
/>
```

## Cross-component consistency check

Comparing Map_pin against Button, Button (Icon only), Filter Chip, Eyebrow Highlight, Tags, and Super Icon.

1. **✅ RESOLVED (2026-07-19) — axis rename confirmed.** Eyebrow Highlight's original `Type: Light/Dark` risked being misread as the app's theme mode (resolved via rename to `emphasis`); here, the axis was literally named `Visited` with `"Visited"` as one of its own values — a stronger version of the same trap. You confirmed the `status` rename. Closed.
2. **✅ RESOLVED (2026-07-19) — off-label token reuse confirmed intentional.** `Colors/Surface/Success` used as a decorative pale-green badge fill with no success/positive meaning — same pattern as `Icon/On_hover` (Button's resting icon), `Colors/Surface/Disabled` (Eyebrow Highlight/Tags' non-disabled `Neutral`/`Solid`, still open on those two). You've confirmed this instance is fine as-is — no new token needed. Strengthens the broader observation that this is a systemic (and apparently acceptable) labeling gap in the token set, not a series of bugs.
3. **✅ `Gradient/Default` reused correctly, no drift.** Stop-for-stop match against `PT_tokens.md` §7.9 and Button's already-documented usage — first component after Button itself to consume this gradient token, and it lines up exactly.
4. **✅ RESOLVED (2026-07-19) — confirmed intentional, not a defect.** `Default` and `Visited` both pair the label and pin-outline tokens from the same semantic family (`Headings`/`Headings`, `Body_caption`/`Body_secondary`) — consistent with the established Eyebrow Highlight/Tags pairing convention. `Selected` breaks this (label `On_action`, outline stays `Icon/Headings`) — you've confirmed that's deliberate. First confirmed case in this doc set of a within-component, cross-variant token-pairing "inconsistency" that's actually by design.
5. **✅ First component to bind full Figma text styles rather than raw font-size/line-height primitives.** Confirms `PT_tokens.md` §4's `pt-text-style-body-default-regular`/`-emphasis` utility classes are real, design-backed styles — useful positive signal, not just a documented convention with no evidence behind it yet.
6. **Content-prop naming — a reasoned fourth name, not overlooked drift.** `number` joins `children`(Button)/`title`(Filter Chip)/`text`(Eyebrow Highlight, Tags) as a fourth distinct name — but unlike those three (all interchangeable generic-content names, flagged as needing one system-wide decision), `number` is deliberately kept separate because the content here is structurally constrained (always a short numeric label, now also editable and range-validated), not arbitrary text. Not folded into the open `children`/`title`/`text` question.
7. **No icon-visibility toggle at all — structurally different from every icon-bearing component, not a gap.** Filter Chip/Eyebrow Highlight/Tags have an optional icon (`showIcon`/`icon` + fallback); Super Icon has a mandatory one. Map_pin has neither — there is no icon slot of any kind, since the number *is* the content. Noted as a structural first, same treatment given to Super Icon's own structural firsts.
8. **Third component with no `Size` axis**, after Eyebrow Highlight and Tags — reinforces that a size scale isn't a universal expectation across this system.
9. **Frame-size token-binding inconsistency, newly visible by contrast with Super Icon.** Super Icon's 5 container sizes were directly bound to `Scale/*` tokens in Figma; Map_pin's single 36px frame is not bound to any `Scale/*` variable at all, despite numerically matching `--pt-scale-9`. Not a new *type* of gap (icon/frame sizing not being token-bound is already a file-wide pattern — see Button/Filter Chip/Eyebrow Highlight/Tags/Super Icon's icon-size gaps), but this is the first time the same category of value (a component's outer frame size) is bound in one sibling component and not in another.
10. **✅ RESOLVED (2026-07-19) — interactive, confirmed directly, in the *opposite* direction from Super Icon.** Eyebrow Highlight, Tags, and Super Icon all initially looked potentially interactive from naming alone and each resolved to non-interactive. Map_pin breaks that streak: you confirmed it's clickable, exactly as the `Default`/`Selected`/`Visited` naming suggested. **Worth stating plainly for future components:** the Super Icon lesson was "don't assume interactivity from naming alone," not "assume non-interactivity" — this component is the proof that suggestive naming sometimes is the correct signal, and both outcomes have now happened in this doc set. Neither should be treated as the default going forward; each component still needs its own confirmation.
11. **New: this is the first component in the doc set with an editable content prop.** Every prior editable-looking prop (label text, icon swap) was still a fixed, pre-set value per instance; `number` on Map_pin is explicitly confirmed end-user/admin-editable at runtime, with its own `onNumberChange` callback and validation range. No precedent elsewhere in `PT_components.md` for this pattern — worth watching for whether it recurs.
12. **New: this is the first component with a confirmed cross-source state transition** — `Selected`→`Visited` is driven by *either* a content-playback-end event *or* a visit-confirmation signal, not a single deterministic trigger. Filter Chip's `selected`→`active` was confirmed automatic-on-click (a single, simple trigger); Map_pin's second transition is genuinely two possible sources feeding one prop update. Noted as a new pattern shape, not assumed to generalize to other components.
13. **New: `Selected` is the first confirmed collection-level constraint in this doc set.** Filter Chip's multi-select is explicitly *not* mutually exclusive across chips (independent toggles, confirmed in its own spec). Map_pin's `Selected` is the opposite: confirmed single-select across the whole map (2026-07-19). The component itself can't enforce this — it's a consuming-app responsibility — but it's the first case in this doc set where getting the accessible pattern right (`aria-current` vs. `aria-pressed`) depends on a cross-instance constraint no single `MapPin` instance can see on its own.

**Summary:** the token system holds up well here — every color and typography value resolves cleanly to an existing `PT_tokens.md` token (including a clean, exact-match reuse of `Gradient/Default`), and this is the first component to confirm Figma text styles are actually wired up as named styles rather than raw values. **All naming, token-role, and interaction-model questions raised across both rounds are now resolved** — the `status` rename, the `Surface/Success` reuse, the `Selected` outline/label pairing, the full click/app-driven lifecycle, and map-wide single-selection (confirmed 2026-07-19, `aria-current="location"` is the correct accessible pattern) are all closed out. Only one item remains open on this component: the exact edit-trigger UX for the newly-required editable `number`.

## Open questions — what needs your confirmation

1. ~~Is Map_pin interactive?~~ — **RESOLVED 2026-07-19: yes.** Confirmed directly, as the state naming suggested. Renders as a `<button>` with `onClick`; see Props, States, Accessibility, Code example.
2. ~~Are `Selected` and `Visited` mutually exclusive?~~ — **RESOLVED 2026-07-19: yes, fully.** Full lifecycle confirmed: `Default`→(click)→`Selected`→(content finishes playing, or user visits the place — app-driven, not a second click)→`Visited`. Sequential and one-directional, so a pin is never both at once. **Map-wide exclusivity also confirmed**: only one pin across the entire map can be `selected` at a time — a collection-level constraint the consuming app enforces (`MapPin` itself has no visibility into sibling pins). See Description, Props, Accessibility, Code example.
3. ~~Is `Visited` reached via the same click interaction as `Selected`, or set by other app logic?~~ — **RESOLVED 2026-07-19: app logic**, specifically content-playback completion or a visit-confirmation signal — not a second tap on the pin. See Description, States, Props.
4. ~~`Visited`→`status` rename~~ — **RESOLVED 2026-07-19: confirmed.** Adopted throughout — `status: 'default' | 'selected' | 'visited'`.
5. ~~`Colors/Surface/Success` reused for a decorative badge unrelated to "success"~~ — **RESOLVED 2026-07-19: intentional, confirmed fine as-is.** No new token needed.
6. ~~`Selected`'s pin outline staying on `Icon/Headings` instead of a paired `Icon/On_action`~~ — **RESOLVED 2026-07-19: intentional.** Do not "correct" this binding.
7. ~~3-digit+ number handling~~ — **RESOLVED 2026-07-19: hard stop at 99.** `number` is validated/clamped to `1–99`; no 3-digit case to design for.
8. **Component code path + export name** for the header block — engineering task for the tech lead, acknowledged.
9. ~~Is `Selected` exclusive across the whole map?~~ — **RESOLVED 2026-07-19: yes, one pin at a time.** `aria-current="location"` confirmed as the correct accessible pattern; single-selection is enforced by the consuming app, not by `MapPin` itself. See Description, Props, Accessibility, Code example.
10. **What's the exact edit-trigger UX for the editable `number`?** Tap-to-edit on the pin itself, a separate edit affordance (pencil icon), double-click, long-press, or an admin/CMS-only mode distinct from the traveler-facing map? Not modeled in Figma (no edit-mode variant exists) and not specified beyond "must be editable" — needed to finalize the `editable` prop's interaction model and its accessibility treatment (see Accessibility). **Last open item on this component.**

---

# Checkbox

> Figma node: `Selection Box` — node `707:3126` (a wrapper frame containing 27 variant instances of a single underlying component — not itself a component-set node, same pattern as Eyebrow Highlight/Tags/Super Icon/Map_pin. `get_design_context` on each instance resolves to the same `SelectionBox` component signature with `size`/`state` props.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-3126
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Checkbox.tsx]` (Figma's own name is `Selection Box`; ✅ **`Checkbox` confirmed as the code name, 2026-07-19.**)
> Last updated: 2026-07-19
> Status: 🟢 Fully modeled and verified against Figma via MCP. `Disabled_selected` and `Disabled_indeterminate` were added (resolving both disabled+checked and disabled+indeterminate gaps), the bare `Unselected` state was renamed to `Unselected_color` (resolving both the tone-suffix naming inconsistency and the naming collision with Radio Button), and a Figma-side typo (`Disabled_undeterminate`) was corrected — all re-verified live, 2026-07-19. One structural limitation persists: every variant renders as a single flattened SVG asset (no separate border/fill/glyph layers exposed), so most color-role bindings are inferred rather than confirmed against a specific layer — flagged throughout. The checkmark/dash glyph color is the one fully-confirmed exception (see Tokens used). **No open design items remain on this component.**

## Description

A square selection control representing checked/unchecked/indeterminate status, at 3 sizes. Unlike every prior component in this doc set, **each variant here is exported as a single flattened SVG image** — border, fill, and check/dash glyph are baked into one asset rather than separate styleable layers. This is a real limitation on how precisely token bindings can be confirmed (see Tokens used) — it is not the same situation as, say, Map_pin, where per-layer `get_variable_defs` queries could isolate the outline from the badge.

⚠️ **The `State` values conflate two concerns, similar to Super Icon's `Fill` axis.** There are really two independent ideas flattened together: a **checked-value** (`unchecked`/`checked`/`indeterminate`) and a **tone** (`color`/`neutral`), plus an orthogonal `disabled` flag. See Variant axes and Props for the recommended decomposition.

✅ **RESOLVED 2026-07-19 — the tone-suffix naming inconsistency is fixed.** The previous round flagged that the "color" tone was signaled inconsistently: `Selected_color` spelled it out explicitly, but bare `Unselected` and bare `Indeterminate` relied on the *absence* of `_neutral` instead. Re-verified live via `get_metadata`: **all three checked-values now use the explicit `_color` suffix** — `Unselected_color`, `Selected_color`, `Indeterminate_color` — with the bare, unsuffixed forms retired. One clean, consistent convention across the whole `State` axis now.

✅ **RESOLVED 2026-07-19 — the cross-component naming collision with Radio Button is gone, fixed via the same rename.** The previous, most-important finding in this trio was that bare `Unselected` meant green on Checkbox but black on Radio Button. Re-verified live: Checkbox no longer has a bare `Unselected` state at all (renamed to `Unselected_color`, see above) — the ambiguous string simply doesn't exist on this component anymore, so there's nothing left to collide with. Radio Button's own bare `Unselected` is untouched and no longer ambiguous, since it's now the only component using that exact string. See Radio Button's Description for the mirrored resolution.

✅ **RESOLVED 2026-07-19 — disabled+checked is now a real, designed Figma variant, not just a proposal.** You added `Disabled_selected` directly in Figma (new node IDs `1551:694`/`1551:698`/`1551:702` for Large/Medium/Small — genuinely new nodes, not a relabel, consistent with how Toggle's `Disabled_true` also got fresh IDs). Re-verified via `get_design_context`, `get_variable_defs`, and a side-by-side screenshot of the full variant set: the box renders with a muted fill and a **clearly visible white checkmark** — matching the industry-standard proposal from the previous round (preserve the glyph, don't render empty). The old bare `Disabled` was also renamed to `Disabled_unselected` (same node IDs as before — a pure relabel) to pair cleanly with the new state.

✅ **RESOLVED 2026-07-19 — the remaining `disabled`+`indeterminate` gap is now filled too.** You added a third disabled variant directly in Figma (new node IDs `1552:738`/`1552:742`/`1552:746`). Re-verified via `get_design_context`, `get_variable_defs`, and a full-set screenshot: the box renders with the same muted fill and a clearly visible pale dash — matching `Disabled_selected`'s quality and contrast (unlike Radio Button's lower-contrast `Disabled_selected` — see that component). All three of Checkbox's `disabled` states are now modeled — the axis is fully orthogonal for the first time.

✅ **RESOLVED 2026-07-19 — the `Disabled_indeterminate` typo caught during verification has been corrected.** Figma's layer name briefly read `Disabled_undeterminate` (missing "in"); confirmed corrected via a fresh `get_metadata` pull, same node IDs. Purely cosmetic — the code prop already used the correctly-spelled `'indeterminate'` regardless — but good to have fixed at the source.

## Variant axes

The Figma node contains **27 variants** (enumerated directly via `get_metadata`, re-verified live 2026-07-19 after `Disabled_indeterminate` was added — previously 24).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `Unselected_color` · `Unselected_neutral` · `Selected_color` · `Selected_neutral` · `Indeterminate_color` · `Indeterminate_neutral` · `Disabled_unselected` · `Disabled_selected` · `Disabled_indeterminate` | 9 |
| `Size` | `24` · `20` · `16` | 3 |

No `Type` axis. No icon-visibility toggle (the check/dash glyph is baked into the state, not an optional overlay).

### Variant math (axes multiplied vs. actual)

```
9 (State) × 3 (Size) = 27 theoretical
Actual component count = 27
Excluded                = 0
```

**No exclusions** — full matrix, and now fully orthogonal for the first time: `3 (checked-value: unchecked/checked/indeterminate) × 2 (tone: color/neutral) = 6`, **plus** `3` disabled states (`Disabled_unselected`, `Disabled_selected`, `Disabled_indeterminate`) that sit outside the tone grid but now cover all three checked-values — `6 + 3 = 9`. Cleanest shape yet across this trio: no partial-coverage gaps remain on Checkbox.

### Valid combinations

```
{Unselected, Selected, Indeterminate} × {color, neutral} = 6, plus Disabled × {unselected, selected, indeterminate} = 3 = 9, all valid.
```

## Props (code API)

⚠️ CONFIRM with tech lead — the axis decomposition below follows the same reasoning already applied to Button's `State` split and Super Icon's `Fill` split.

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` (checked-value component) | `checked` | `boolean \| 'indeterminate'` | `false` | `Unselected*`/`Disabled_unselected`→`false`, `Selected_*`/`Disabled_selected`→`true`, `Indeterminate*`/`Disabled_indeterminate`→`'indeterminate'`. **Use the correctly-spelled `'indeterminate'` in code regardless of Figma's `Disabled_indeterminate` typo** — see Description. Matches the native HTML checkbox's own three-state model (`checked`/`indeterminate` are separate DOM properties — see Accessibility) closely enough to use the same shape. ✅ **`checked` and `disabled` are confirmed independent axes** (2026-07-19) — all three checked-values now survive independently of the disabled flag, same pattern as Toggle's `Disabled_true`. |
| `State` (tone component) | `tone` | `'color' \| 'neutral'` | `'color'` | ✅ **All three checked-values now use a consistent explicit suffix** (2026-07-19): `Unselected_color`/`Selected_color`/`Indeterminate_color`→`'color'`; `*_neutral`→`'neutral'`. **Ignored when `disabled`** — the disabled states have no tone variant of their own. |
| `State` (disabled component) | `disabled` | `boolean` | `false` | `Disabled_unselected`/`Disabled_selected`/`Disabled_indeterminate`→`true`. Decomposed out rather than kept as a flat `State` enum value, consistent with how Button's `Disabled` is a separate concern from its color-intent axis. ✅ **All three `disabled`+`checked` combinations are now modeled** — no more partial coverage. |
| `Size` | `size` | `'small' \| 'medium' \| 'large'` | `'large'` | ✅ **Renamed 2026-07-19 — size-naming unification confirmed system-wide** (see Toggle's Open questions and Cross-component consistency check). Figma's own variant axis stays numeric (`24`/`20`/`16` — that's the source labeling), but the recommended code prop now matches Toggle's native convention: `24`→`'large'`, `20`→`'medium'`, `16`→`'small'`. Supersedes the earlier numeric-prop recommendation. |

Non-visual props, none of which exist in Figma's own property panel:

- ⚠️ `onChange: (checked: boolean) => void` — not modeled in Figma (static states only) but required for any real checkbox. Standard HTML checkbox `onChange` semantics.
- ⚠️ `name` / `value` — standard form-field props, not modeled in Figma, needed if this ever participates in an HTML form submission.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = 9 flat values mixing checked-value, tone, and disabled | `checked: boolean \| 'indeterminate'` + `tone: 'color' \| 'neutral'` + `disabled: boolean` | The flat enum conflates three independent concerns — same category of fix as Button's `State` split and Super Icon's `Fill` split (see Description). |
| 2 | Single flattened SVG asset per variant | Recommend building as a real `<input type="checkbox">` (or a styled wrapper around one) with CSS-driven fill/border/glyph, not an `<img>` per state | An native checkbox gets keyboard interaction, focus, and form semantics for free; recreating 27 raster/vector state images in code would be needlessly fragile and lose native accessibility. This is a recommendation about *implementation strategy*, not just prop naming — flagged because it's a bigger divergence than usual for this doc set. |

## Tokens used

⚠️ **Read this section with the flattened-SVG limitation in mind (see Description/Status).** Every value below comes from `get_variable_defs` scoped to each state's single asset layer — this confirms *which* tokens are present in a given variant's bound-variable set, which is a reliable signal for border/fill color, but individual roles (e.g. "is this token the border or the fill?") are inferred from visual comparison against the screenshot, not confirmed by isolating separate layers the way Map_pin's outline/badge could be.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Colors/Icon/Headings` | `--pt-semantic-icon-headings` | `#222628` | Present only on `*_neutral` states (`Unselected_neutral`, `Selected_neutral`, `Indeterminate_neutral`) — border/fill color for the "neutral" tone. ⚠️ Bound under an `Icon/*` name for what is visually a border/fill color, not an icon glyph — same off-label-role pattern already seen repeatedly elsewhere in this doc set (Map_pin's `Selected` outline, Toggle's `True` border below). |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | Present on all `color`-tone states (`Unselected_color`, `Selected_color`, `Indeterminate_color`) — border/fill color for the "color" tone. Same off-label `Icon/*`-as-border/fill naming pattern as above. |
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | Present alongside `Icon/Action` on the same color-tone states — most likely the *fill* specifically (on `Selected_color`/`Indeterminate_color`) while `Icon/Action` is the *border*, though this can't be fully disambiguated from the flattened asset alone. |
| `Colors/Icon/Disabled` | `--pt-semantic-icon-disabled` | `#eef2f4` (grey-100) | ⚠️ **Still not confirmed in use on any Checkbox variant, including both `Disabled_selected` and `Disabled_indeterminate` (2026-07-19).** Present in the whole-node aggregate, but screenshots of both new disabled+checked-value states show a **white** glyph, not this grey-100 tone. This token remains bound somewhere in the file with no confirmed visible use anywhere in Checkbox specifically. |
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` (grey-500) | Present on `Disabled_unselected`, `Disabled_selected`, **and** `Disabled_indeterminate` — the muted box fill/border for all three disabled states, confirmed via screenshot comparison. |
| icon size `16`/`20`/`24` → stroke weight `1.5`/`1.75`/`2` | `--pt-icon-stroke_weight-{16,20,24}` | matches `PT_tokens.md` §7.3 exactly | Present in the aggregate `get_variable_defs` — confirms the stroke-weight scale, though (as with every prior component) the pixel *size* itself isn't bound to a `--pt-icon-size-*` token on the element, continuing the file-wide gap. |
| `Colors/Icon/On_action` | `--pt-semantic-icon-on_action` | `#ffffff` (light) / `#000000` (dark) | ✅ **RESOLVED (2026-07-19), confirmed via a manual Figma screenshot of the checkmark vector's Stroke panel** — not inferred, not guessed. The checkmark/dash glyph's stroke is bound to `Colors/Icon/On_action`, the same "on a filled surface" token already used elsewhere in this doc set (Button, Filter Chip, Map_pin). Also the glyph color on the new `Disabled_selected` state — see below. |
| `Disabled_selected` glyph + fill (2026-07-19) | `--pt-semantic-surface-disabled` (fill) + `--pt-semantic-icon-on_action` (checkmark) | fill `#a8c0c7` / glyph `#ffffff` | ✅ **Visually confirmed via side-by-side screenshot**: a muted grey-blue box with a clearly visible white checkmark — matches the industry-standard proposal exactly. ⚠️ **Caveat:** the raw `get_variable_defs` dump for this node also includes `Colors/Surface/Action` and `Colors/Icon/Action` (the green tokens from `Selected_color`), which are **not** what the screenshot shows. Most likely explanation: this variant was created by duplicating `Selected_color` as a starting template, leaving orphaned/unused variable bindings in the underlying layer tree — same category of stray-reference artifact already seen on Tags (two unused variable references, Open decisions item 29). Flagged, not silently dropped; a manual Figma layer check would confirm definitively if it matters. |
| `Disabled_indeterminate` glyph + fill (new, 2026-07-19) | `--pt-semantic-surface-disabled` (fill) + `--pt-semantic-icon-on_action` (dash) | fill `#a8c0c7` / glyph `#ffffff` | ✅ **Visually confirmed via full-set screenshot**: same muted fill as `Disabled_selected`, with a clearly visible pale dash — same quality/contrast level as `Disabled_selected`, not the murkier result seen on Radio Button's disabled+checked. Same stray-binding caveat applies here too: the raw dump includes `Colors/Surface/Action`/`Colors/Icon/Action`, not visually expressed — same likely explanation (duplicated from an existing color-tone variant as a template). |

The screenshot also revealed the glyph's own internal proportions per size (checkmark path ≈`10×7` at `Size=24` down to ≈`5.8×0` — the `0`-height entries are the flat dash/indeterminate glyph, not a checkmark) and that its stroke `Weight` is `Mixed` (multiple segment widths within one path) — noted for completeness, not independently critical to the token mapping above.

### Per-variant token map

| `State` | Checked-value | Tone | Border/fill token(s) | Glyph color |
|---|---|---|---|---|
| `Unselected_neutral` | unchecked | neutral | `--pt-semantic-icon-headings` (outline only, no fill) | — |
| `Unselected_color` | unchecked | color | `--pt-semantic-icon-action` (outline only, no fill) | — |
| `Selected_color` | checked | color | `--pt-semantic-surface-action` (fill) + `--pt-semantic-icon-action` (likely border/edge) | `--pt-semantic-icon-on_action` ✅ |
| `Selected_neutral` | checked | neutral | `--pt-semantic-icon-headings` (fill) | `--pt-semantic-icon-on_action` ✅ |
| `Indeterminate_color` | indeterminate | color | `--pt-semantic-surface-action` (fill) + `--pt-semantic-icon-action` | `--pt-semantic-icon-on_action` ✅ |
| `Indeterminate_neutral` | indeterminate | neutral | `--pt-semantic-icon-headings` (fill) | `--pt-semantic-icon-on_action` ✅ |
| `Disabled_unselected` | unchecked | n/a | `--pt-semantic-surface-disabled` | — |
| `Disabled_selected` | checked | n/a | `--pt-semantic-surface-disabled` ✅ (confirmed via screenshot; `Surface/Action`/`Icon/Action` present in the aggregate but not visually used — see Tokens table) | `--pt-semantic-icon-on_action` ✅ (white checkmark, clearly visible) |
| `Disabled_indeterminate` [sic] | indeterminate | n/a | `--pt-semantic-surface-disabled` ✅ (confirmed via screenshot; same stray-binding caveat as `Disabled_selected`) | `--pt-semantic-icon-on_action` ✅ (pale dash, clearly visible, same contrast as `Disabled_selected`) |

### Geometry

✅ **RESOLVED (2026-07-19): non-linear scaling is confirmed unintentional.** You confirmed Checkbox and Radio Button are meant to be **the same size** at each `Size` step. Radio Button's inner box is a clean `frame − 4px` at every size (`20px`/`16px`/`12px`); Checkbox's currently measures `20px`/`16.15px`/`12.367px` — matching only at `Size=24`. This is a **Figma authoring imprecision to fix at the source** (same category as the `body-sm` line-height JSON discrepancy already tracked), not a design choice to preserve in code.

| `Size` | Frame | Inner box (as currently exported) | Inner box (target, matching Radio Button) |
|---|---|---|---|
| `24` | 24×24px | `20×20px` | `20×20px` ✅ already matches |
| `20` | 20×20px | `16.15×16.15px` | `16×16px` |
| `16` | 16×16px | `12.367×12.367px` | `12×12px` |

**Recommend building to the clean `frame − 4px` target values**, not the current exported fractional ones — flagged as a Figma-side fix to make eventually (re-export the `20` and `16` size variants at the corrected proportions), but the code doc treats the clean values as authoritative starting now rather than baking in the imprecision.

## States

✅ **RESOLVED (2026-07-19): missing hover is not an inconsistency with Radio Button after all.** Radio Button's apparent hover state was a mislabeling on the Figma side — re-verified live via MCP, it's been renamed to `Unselected_color` and was never a hover treatment (see Radio Button's own section). **Neither sibling control has a designed hover.** This remains a real gap (same category as Button/Filter Chip's), just no longer an asymmetry between the two.

| State | Status |
|---|---|
| Hover | ⚠️ Not modeled in Figma — consistent with Radio Button, not a gap unique to Checkbox. **Moved to Design system roadmap.** |
| Focus (keyboard) | ⚠️ Not modeled in Figma. Same gap as every other interactive component in this doc set. **Moved to Design system roadmap.** |
| Checked / Unchecked / Indeterminate | Modeled via the `checked` axis — see Variant axes. |
| Disabled | ✅ **RESOLVED 2026-07-19 — fully modeled at all three checked-values.** `Disabled_unselected`, `Disabled_selected`, and `Disabled_indeterminate` all preserve their checked-value with a consistent muted-fill + pale-glyph treatment. No partial coverage left — Checkbox's `disabled` axis is now fully orthogonal, the first of the trio's disabled states to reach that point. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ⚠️ **Recommend a real `<input type="checkbox">`, not a styled `<div>`.** Gets keyboard focusability, space-to-toggle, and native form participation for free — see Figma-vs-code divergences.
- ⚠️ **`indeterminate` is not an HTML attribute — it's a DOM property, set imperatively.** `<input type="checkbox" indeterminate>` does **not** work as JSX/HTML; the codegen agent needs to set `inputRef.current.indeterminate = true` via a ref/effect, a well-known but easy-to-miss React/HTML quirk. Flagging explicitly since a naive codegen pass would very likely get this wrong.
- ⚠️ **Every checkbox needs an associated `<label>`** (wrapping or via `htmlFor`/`id`) — not modeled in Figma at all (no label/text content exists anywhere in this component), but a checkbox with no accessible label is a baseline accessibility failure. Recommend this component always ships paired with a label in usage, even though the label itself lives outside `Checkbox`'s own scope.
- Contrast not computed for any state — flagged for a future pass.
- Touch target: at `16px`/`20px`/`24px`, all three sizes are well under the 44×44 minimum — same category of gap already acknowledged-and-deprioritized on Filter Chip, not re-litigated here but worth noting it recurs.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `checked="indeterminate"` for "some but not all" selections in a group | Try to pass `indeterminate` as a plain HTML/JSX attribute — it must be set via a ref |
| Always pair with a visible, associated `<label>` | Ship a checkbox with no accessible label |
| Use `tone='neutral'` and `tone='color'` consistently with whatever convention the rest of the form uses | Mix tones arbitrarily within the same form/list |
| Render all three disabled checked-values (`Disabled_unselected`/`Disabled_selected`/`Disabled_indeterminate`) with their confirmed muted-fill treatments — now all real Figma variants | Assume disabled always means "looks unchecked" — resolved, no longer a guess |
| Map Figma's `Disabled_indeterminate` to `checked="indeterminate"` + `disabled` in code | — |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ✅ **RESOLVED (2026-07-19): disabled + checked.** `Disabled_selected` added directly in Figma — muted fill, clearly visible white checkmark, confirmed via screenshot. No longer a proposal.
- ✅ **RESOLVED (2026-07-19): disabled + indeterminate.** `Disabled_indeterminate` added directly in Figma — same muted fill, clearly visible pale dash, confirmed via screenshot. All three disabled+checked-value combinations are now modeled.
- ✅ **RESOLVED (2026-07-19): non-linear size scaling confirmed unintentional.** Checkbox and Radio Button are meant to be the same size at each step; recommend building to the clean `frame − 4px` values, and fixing the Figma export at the source when convenient.
- **RTL:** not modeled; low priority, same status as elsewhere in this doc set.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Checkbox } from '@/components/Checkbox';

<label>
  <Checkbox checked={isChecked} tone="color" size="large" onChange={setIsChecked} />
  I agree to the terms
</label>

// Indeterminate — "select all" driving a partially-checked group
<Checkbox checked="indeterminate" tone="color" size="medium" onChange={handleSelectAll} />

// Disabled, checked — muted fill + white checkmark, a real confirmed Figma variant (Disabled_selected, added 2026-07-19)
<Checkbox checked={true} disabled size="small" />

// Disabled, indeterminate — muted fill + pale dash, a real confirmed Figma variant
<Checkbox checked="indeterminate" disabled size="small" />
```

## Cross-component consistency check

Comparing Checkbox against Button, Button (Icon only), Filter Chip, Eyebrow Highlight, Tags, Super Icon, and Map_pin — plus, most relevantly, its sibling selection controls Radio Button and Toggle (documented next).

1. **⚠️ First component in the doc set where every variant is a single flattened SVG, not layered elements.** This is a structural limitation on how confidently tokens can be attributed to specific roles (border vs. fill vs. glyph) — flagged throughout Tokens used, not something any prior component's per-layer `get_variable_defs` technique (Map_pin, Super Icon) could work around here. One exception: the checkmark glyph color, confirmed via a manual Figma screenshot rather than inferred.
2. **`State` conflates multiple concerns again** — same pattern as Button's original `State`, Eyebrow Highlight's `Type`, and Super Icon's `Fill`. Recommended the same category of decomposition (`checked` + `tone` + `disabled`).
3. **⚠️ RESOLVED, corrected 2026-07-19 — no longer a hover asymmetry with Radio Button.** The previous round of this doc flagged Radio Button's `Unselected_hover` as a real designed hover Checkbox lacked. Re-verified live via MCP: that was a mislabeling on the Figma side, since corrected to `Unselected_color` — **neither component has a designed hover.** The gap is real but symmetric, not a Checkbox-specific shortfall.
4. **✅ RESOLVED 2026-07-19 — the `Unselected` naming collision with Radio Button is gone.** Previously the single most important finding in this trio: bare `Unselected` meant green on Checkbox but black on Radio Button. Re-verified live: Checkbox's bare `Unselected` was renamed to `Unselected_color`, eliminating the ambiguous string entirely — Radio Button's own bare `Unselected` is now the only component using it, so nothing collides anymore. A bonus of the same rename: the tone-suffix naming inconsistency (bare = color, implicitly) is also resolved, since all three checked-values now use an explicit `_color` suffix. See Description.
5. **Off-label `Icon/*`-as-border/fill token naming recurs.** `Colors/Icon/Headings` and `Colors/Icon/Action` used for box border/fill rather than an icon glyph — same category of role-mismatch already seen on Map_pin (`Selected`'s outline) and confirmed a third time on Toggle (`True` state's border, see that section).
6. **✅ RESOLVED, corrected 2026-07-19 — geometry inconsistency confirmed unintentional, not a Radio Button–specific design choice.** You confirmed Checkbox and Radio Button are meant to be the same size at every step; Checkbox's current non-linear export values are a Figma authoring gap to fix, not two components legitimately built to different scales.
7. **Naming confirmed:** the code component is `Checkbox` (2026-07-19), even though Figma's own name is `Selection Box`.
8. **✅ RESOLVED 2026-07-19 — `size` prop renamed to match the confirmed system-wide convention.** `Large`/`Medium`/`Small` (matching Toggle's native labels), not the numeric `24`/`20`/`16` — see Props. Figma's own variant axis for Checkbox keeps its numeric labels; only the recommended code prop changed.
9. **✅ RESOLVED 2026-07-19 — disabled is now fully modeled at every checked-value, and it's the trio's clearest execution.** `Disabled_selected` and `Disabled_indeterminate` both use a muted grey fill with a crisp, clearly visible pale glyph — good contrast, easy to read as "on but locked." Worth comparing against Radio Button's version of the same fix, which came out visually murkier — see Radio Button's own Cross-component consistency check.
10. ~~Figma's `Disabled_indeterminate` layer name was a typo~~ — **RESOLVED 2026-07-19: corrected in Figma**, re-verified live via `get_metadata` (same node IDs, just relabeled).

**Summary:** Checkbox is now fully closed out on the design side. This round resolved the last remaining gap — `disabled`+`indeterminate` — matching the quality of `Disabled_selected`, and the Figma-side typo caught during verification has since been corrected too. Combined with the earlier resolutions (the `Unselected` naming collision, the tone-suffix consistency, and disabled+checked), Checkbox's `State` axis is now completely orthogonal with no partial coverage and no open items anywhere.

## Open questions — what needs your confirmation

1. ✅ ~~Disabled + checked visual treatment~~ — **RESOLVED 2026-07-19: `Disabled_selected` added in Figma.** Muted fill + white checkmark, confirmed via screenshot. No further sign-off needed.
2. ~~Missing hover state~~ — **RESOLVED 2026-07-19: not an inconsistency.** Radio Button doesn't have a designed hover either (see that component's correction). Still on the roadmap as a shared gap, not a Checkbox-specific one.
3. ~~Non-linear size scaling~~ — **RESOLVED 2026-07-19: confirmed unintentional**, should match Radio Button's clean values. Figma-side fix recommended when convenient.
4. ~~Checkmark/dash glyph color~~ — **RESOLVED 2026-07-19: `Colors/Icon/On_action`**, confirmed via manual Figma screenshot.
5. ~~Component naming~~ — **RESOLVED 2026-07-19: `Checkbox`.**
6. ~~The `Unselected` naming collision with Radio Button~~ — **RESOLVED 2026-07-19: eliminated by the rename.** Checkbox's bare `Unselected` no longer exists (now `Unselected_color`); no Figma-side rename needed on Radio Button, since the ambiguous string was removed from Checkbox's side instead.
7. ~~Size-naming unification~~ — **RESOLVED 2026-07-19: `Large`/`Medium`/`Small`.** Confirmed on Toggle's section; `size` prop renamed here to match.
8. ~~`disabled`+`indeterminate` has no Figma variant~~ — **RESOLVED 2026-07-19: `Disabled_indeterminate` added.** Same muted-fill quality as `Disabled_selected`, confirmed via screenshot.
9. ~~Should `Disabled_indeterminate`'s typo be fixed in Figma?~~ — **RESOLVED 2026-07-19: corrected.** Re-verified live via `get_metadata`.
10. **Component code path + export name** — engineering task for the tech lead.

---

# Radio Button

> Figma node: `Radio Button` — node `707:3211` (a wrapper frame containing 18 variant instances of a single underlying component — not itself a component-set node, same pattern as Checkbox above. `get_design_context` on each instance resolves to the same `RadioButton` component signature with `size`/`state` props.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-3211
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/RadioButton.tsx]` (Figma's own name is already `Radio Button` — recommend `RadioButton`, no rename debate needed the way Checkbox's `Selection Box`→`Checkbox` is.)
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. A `Disabled_selected` variant was added (resolving the disabled+checked gap, mirroring Checkbox) and Checkbox's own bare `Unselected` rename eliminated the naming collision from this side too — both re-verified live, 2026-07-19. Same flattened-SVG limitation as Checkbox otherwise — see that section's Status note.

## Description

A circular single-select control, structurally Checkbox's closest sibling in this doc set — same flattened-single-SVG-asset construction, same 3-size scale, overlapping color families. **Confirmed size-for-size identical to Checkbox** — see Geometry.

⚠️ **Correction, 2026-07-19 — Radio Button does NOT have a designed hover state.** The previous round of this doc documented `Unselected_hover` as a real, confirmed hover treatment — the first genuinely-designed hover anywhere in this doc set. **That was a mistake on the Figma authoring side**, per your direct correction: the variant has been renamed to `Unselected_color`, and re-verified live via `get_metadata` — it is **not** a hover state at all, but the color-tone counterpart to the resting `Unselected` value (the same `_color`/`_neutral` tone-pair pattern Checkbox uses, just applied differently — see Variant axes). Removed throughout: the hover framing, the CSS `:hover` recommendation, and the "Radio Button is more polished than Checkbox" narrative that hover asymmetry drove. **Radio Button has no hover state, same as Checkbox** — this trio's shared hover gap, not an inconsistency between the two.

✅ **RESOLVED 2026-07-19 — the naming collision with Checkbox is gone, fixed from Checkbox's side.** The previous round flagged that bare `Unselected` meant black on Radio Button but green on Checkbox. Checkbox's bare `Unselected` has since been renamed to `Unselected_color` (see that section), which removes the ambiguous string from Checkbox entirely — Radio Button's own bare `Unselected` is untouched and is now the only component using that exact string, so there's nothing left to collide with. No rename was needed on this side.

✅ **RESOLVED 2026-07-19 — disabled+checked is now a real Figma variant here too, mirroring Checkbox.** You added `Disabled_selected` directly in Figma (new node IDs `1551:646`/`1551:650`/`1551:654` for Large/Medium/Small — genuinely new nodes). The old bare `Disabled` was renamed `Disabled_unselected` (same node IDs as before — a pure relabel). ⚠️ **Worth flagging honestly: the execution here is visually weaker than Checkbox's.** Checkbox's `Disabled_selected` uses a muted fill with a clearly visible white checkmark (strong contrast). Radio Button's `Disabled_selected`, per a fresh screenshot, shows a muted ring with a center dot in the **same muted tone as the ring itself** — technically present, but very low-contrast and easy to miss at a glance. See Tokens used for the token-level detail and Cross-component consistency check for the side-by-side comparison.

## Variant axes

The Figma node contains **18 variants** (enumerated directly via `get_metadata`, re-verified live 2026-07-19 after `Disabled_selected` was added — previously 15).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `Selected_neutral` · `Selected_color` · `Unselected_color` · `Unselected` · `Disabled_unselected` · `Disabled_selected` | 6 |
| `Size` | `24` · `20` · `16` | 3 |

Radio Button's bare `Unselected` stays unsuffixed (unlike Checkbox, which moved to an explicit `_color` suffix everywhere) — no longer ambiguous now that Checkbox no longer shares the string, but still a minor asymmetry in naming convention between the two siblings, not worth a forced rename on its own. The one remaining structural difference from Checkbox: no `indeterminate` concept (correctly — radios don't support it), so there's no third checked-value branch, and consequently no `Disabled`+`indeterminate` gap to worry about either (unlike Checkbox).

### Variant math (axes multiplied vs. actual)

```
6 (State) × 3 (Size) = 18 theoretical
Actual component count = 18
Excluded                = 0
```

**No exclusions** — full matrix. Decomposes as `2 (checked: false/true) × 2 (tone: neutral/color) = 4`, **plus** `2` disabled states (`Disabled_unselected`, `Disabled_selected`) outside the tone grid — `4 + 2 = 6`. Same clean shape as Checkbox's `6 + 2 = 8`, just with 2 checked-values instead of 3 (no indeterminate). Fully orthogonal this time — no partial-coverage gap the way Checkbox's `disabled`+`indeterminate` is missing, since Radio Button has no indeterminate concept to be missing in the first place.

### Valid combinations

```
{Unselected, Unselected_color, Selected_neutral, Selected_color} × tone-paired, plus Disabled × {unselected, selected} = 2 = 6, all valid.
```

## Props (code API)

⚠️ CONFIRM with tech lead.

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` (selected component) | `checked` | `boolean` | `false` | `Unselected*`/`Disabled_unselected`→`false`, `Selected_*`/`Disabled_selected`→`true`. No indeterminate concept, correctly. ✅ **`checked` and `disabled` confirmed independent** (2026-07-19) — same pattern as Checkbox's `Disabled_selected` and Toggle's `Disabled_true`. |
| `State` (tone component) | `tone` | `'color' \| 'neutral'` | `'color'` | ✅ **Revised 2026-07-19 — applies across both checked-values, not just `Selected`.** `Selected_color`/`Unselected_color`→`'color'`; `Selected_neutral`/`Unselected` (bare)→`'neutral'`. Corrects the previous round's "tone only meaningful when `checked`" note, which was based on the mistaken hover reading. **Ignored when `disabled`.** |
| `State` (disabled component) | `disabled` | `boolean` | `false` | `Disabled_unselected`/`Disabled_selected`→`true`. |
| `Size` | `size` | `'small' \| 'medium' \| 'large'` | `'large'` | ✅ **Renamed 2026-07-19 — size-naming unification confirmed system-wide** (see Toggle's Open questions). Figma's own variant axis stays numeric (`24`/`20`/`16`); the recommended code prop now matches Toggle's convention: `24`→`'large'`, `20`→`'medium'`, `16`→`'small'`. |

Non-visual props:

- ⚠️ `onChange: (checked: boolean) => void` and `name` — standard radio-group semantics, not modeled in Figma. Radios are meaningless without a shared `name` grouping them — flag for the tech lead that `RadioButton` likely needs a companion `RadioGroup` wrapper to manage exclusivity, same category of "the component alone isn't the whole story" note as Map_pin's map-wide selection exclusivity.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = 6 flat values mixing checked-value, tone, and disabled | `checked: boolean` + `tone: 'color'\|'neutral'` + `disabled: boolean` | Same category of decomposition as Checkbox — a clean, symmetric grid (see Variant axes). |
| 2 | `Disabled_selected`'s dot uses the same muted tone as its ring | Consider re-styling in code to use a higher-contrast glyph color (e.g. matching Checkbox's white-on-grey approach), pending your input | Not a code-vs-Figma divergence to silently "fix" — flagged as a legitimate design QA question instead, since the low contrast may not have been the intent. See Description and Open questions. |

## Tokens used

Same per-node `get_variable_defs` technique and same flattened-SVG confidence caveat as Checkbox — see that section's note. Re-verified for `Unselected_color` (same node `707:3220`, only the label changed), `Unselected` (`707:3224`), and the new `Disabled_selected` (`1551:646`), 2026-07-19.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Colors/Icon/Headings` | `--pt-semantic-icon-headings` | `#222628` | `Unselected` (bare, resting) ring color, and `Selected_neutral`'s ring+dot. Also present in the raw variable dump for `Disabled_selected` — see the caveat below, likely orphaned there. Same off-label `Icon/*`-as-border naming pattern already flagged on Checkbox and Map_pin. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | `Unselected_color`'s ring color and `Selected_color`'s ring+dot. |
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` (grey-500) | `Disabled_unselected` ring color, **and** confirmed via screenshot as both the ring **and** dot color on `Disabled_selected` (see next row). |
| icon size `16`/`20`/`24` → stroke weight `1.5`/`1.75`/`2` | `--pt-icon-stroke_weight-{16,20,24}` | matches `PT_tokens.md` §7.3 | Same confirmation as Checkbox — stroke-weight scale present, pixel size itself not bound to a token on the element (same file-wide gap). |
| Center-dot color (`Selected_*`) | `--pt-semantic-icon-on_action` (light `#ffffff`) | `#ffffff` | ✅ **RESOLVED 2026-07-19** — same manual-screenshot confirmation as Checkbox's checkmark (see that section). Radio Button's center dot uses the same `Colors/Icon/On_action` token on `Selected_color`/`Selected_neutral`, not independently re-verified with its own screenshot but reasonably inferred given the identical `Selected_*` visual pattern and shared component family. |
| `Disabled_selected` dot color (new, 2026-07-19) | `--pt-semantic-surface-disabled` (**not** `Icon/On_action`) | `#a8c0c7` | ⚠️ **Visually confirmed via screenshot — and worth flagging plainly: this is a low-contrast result.** Unlike Checkbox's `Disabled_selected` (white checkmark on grey fill, high contrast), Radio Button's dot appears to use the **same muted tone as the ring itself**, making the dot hard to distinguish at a glance — it's technically there, but doesn't read clearly as "selected" the way Checkbox's does. The raw `get_variable_defs` dump also includes `Colors/Icon/Headings` for this node, which is **not** what the screenshot shows for the dot — most likely an orphaned binding left over from duplicating `Selected_neutral` as a template (same category of stray-reference artifact as Checkbox's `Disabled_selected`, and as Tags' two unused variable references, Open decisions item 29). |

### Per-variant token map

| `State` | Checked | Tone | Ring color | Center dot |
|---|---|---|---|---|
| `Unselected` | false | neutral | `--pt-semantic-icon-headings` | — |
| `Unselected_color` | false | color | `--pt-semantic-icon-action` | — |
| `Selected_color` | true | color | `--pt-semantic-icon-action` | `--pt-semantic-icon-on_action` |
| `Selected_neutral` | true | neutral | `--pt-semantic-icon-headings` | `--pt-semantic-icon-on_action` |
| `Disabled_unselected` | false | n/a | `--pt-semantic-surface-disabled` | — |
| `Disabled_selected` | true | n/a | `--pt-semantic-surface-disabled` | `--pt-semantic-surface-disabled` ⚠️ same tone as ring, low contrast — see Tokens table |

### Geometry

✅ **Clean, consistent scaling, and confirmed identical to Checkbox at every size (2026-07-19, per your direct confirmation).**

| `Size` | Frame | Inner box (visible asset) | Relationship |
|---|---|---|---|
| `24` | 24×24px | `20×20px` | frame − 4px |
| `20` | 20×20px | `16×16px` (inferred from the clean pattern; not independently sampled, but consistent with 24 and 16) | frame − 4px |
| `16` | 16×16px | `12×12px` | frame − 4px |

Every size follows the same `frame − 4px` (2px padding on each side) relationship. Checkbox's equivalent values are being corrected to match these exactly (see Checkbox's own Geometry section) — the two controls are meant to be the same size, confirmed directly, not just visually similar.

## States

| State | Status |
|---|---|
| Hover | ⚠️ **Correction 2026-07-19: not modeled in Figma.** The `Unselected_hover` variant this doc previously documented as a real, confirmed hover treatment was a mislabeling — renamed to `Unselected_color` in Figma, confirmed live via MCP. Same gap as Checkbox, not an asymmetry. **Moved to Design system roadmap.** |
| Focus (keyboard) | ⚠️ Not modeled in Figma. **Moved to Design system roadmap**, same gap as everywhere else. |
| Checked / Unchecked | Modeled via the `checked` axis, now with a clean tone split on both branches (see Variant axes). |
| Disabled | ✅ **RESOLVED 2026-07-19 — now genuinely modeled.** `Disabled_selected` preserves the dot alongside the pre-existing `Disabled_unselected`. ⚠️ **But the contrast is low** — the dot uses the same muted tone as the ring, unlike Checkbox's higher-contrast white-on-grey treatment. Flagged as an open design QA question, not silently accepted or silently "fixed" — see Open questions. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ⚠️ **Recommend a real `<input type="radio">`**, grouped by a shared `name`, for native keyboard (arrow-key) navigation between options in a group — this is a well-known native-radio behavior that's difficult to fully replicate with a custom `<div>`-based control. Same "use the native element" recommendation as Checkbox, with an even stronger case here given radio groups' distinctive arrow-key semantics.
- ⚠️ **Every radio needs an associated `<label>`**, same requirement as Checkbox.
- Contrast not computed for any state.
- Touch target: same sub-44px gap at all 3 sizes as Checkbox, not re-litigated here.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Group radios under a shared `name` so only one can be selected at a time | Render radios without a shared `name` — breaks native single-select behavior |
| Treat `tone` as meaningful on both `checked` and `unchecked` states | Assume `tone` only matters when `checked` — corrected from the previous round |
| Always pair with a visible, associated `<label>` | Ship a radio with no accessible label |
| Use `Disabled_selected` for a disabled-but-checked radio (now a real Figma variant) | Assume disabled always means "looks unchecked" — resolved, no longer a guess |
| Flag the low dot-contrast on `Disabled_selected` for design review rather than silently accepting or "fixing" it | Assume the low-contrast dot is definitely a mistake, or definitely intentional — neither is confirmed |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ✅ ~~Disabled + checked visual~~ — **RESOLVED 2026-07-19: `Disabled_selected` added in Figma.** See the contrast caveat below.
- **New: `Disabled_selected`'s low dot contrast** — the dot is technically present but hard to see against the ring, since both use the same muted tone. Confirm whether this is intentional (a deliberately subtle/minimalist disabled treatment) or should be adjusted for clarity (e.g. matching Checkbox's white-on-grey approach) — see Open questions.
- ✅ ~~Hover on `Selected` or `Disabled`~~ — **moot, 2026-07-19.** No hover exists on any state; the underlying variant was a mislabeling, not a partial hover design.
- **RTL:** not modeled; low priority, same as elsewhere.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { RadioButton } from '@/components/RadioButton';

<fieldset>
  <legend>Choose a plan</legend>
  <label>
    <RadioButton name="plan" checked={plan === 'basic'} tone="color" size="large" onChange={() => setPlan('basic')} />
    Basic
  </label>
  <label>
    <RadioButton name="plan" checked={plan === 'pro'} tone="color" size="large" onChange={() => setPlan('pro')} />
    Pro
  </label>
</fieldset>

// Disabled, checked — now a real confirmed Figma variant (Disabled_selected, added 2026-07-19);
// note the dot currently renders low-contrast against the ring, see Open questions
<RadioButton name="plan" checked disabled tone="color" size="large" />
```

## Cross-component consistency check

Comparing Radio Button against Checkbox (its closest sibling, most of the comparison lives in Checkbox's own section) and the rest of the doc set.

1. **✅ RESOLVED, corrected 2026-07-19 — geometry is identical to Checkbox, not just "cleaner."** Both are confirmed to be the same size at every step; Checkbox's earlier non-linear values are being corrected to match Radio Button's clean `frame − 4px` scale, not documented as a legitimate design difference.
2. **⚠️ CORRECTED 2026-07-19 — no hover exists on either component.** The previous round's headline finding ("Radio Button has hover, Checkbox doesn't") was based on a Figma mislabeling, now fixed. Both components share the same hover gap. Worth stating plainly as a lesson: a variant *name* containing "hover" doesn't guarantee it's actually a hover treatment any more than a variant named `Active` guarantees click-driven behavior (the Super Icon lesson) — always re-verify what a state variant actually represents, not just what it's called.
3. **✅ RESOLVED 2026-07-19 — the `Unselected` naming collision with Checkbox is gone.** Fixed from Checkbox's side (its bare `Unselected` was renamed to `Unselected_color`), not by renaming anything here. Radio Button's bare `Unselected` is unchanged and no longer ambiguous.
4. **`State` shape is now much closer to Checkbox's than previously documented.** Both components apply a clean tone split across their unchecked and checked branches, plus two disabled states each (Radio Button: `4 + 2 = 6`; Checkbox: `6 + 2 = 8`) — the earlier "these decompose differently" framing was itself downstream of the hover mislabeling.
5. **Same off-label `Icon/*`-as-ring-color token pattern** as Checkbox — reinforces this is systemic, not a one-off.
6. **Radio groups need external `RadioGroup` orchestration**, similar in spirit to Map_pin's map-level single-selection enforcement — the individual component can't guarantee mutual exclusivity on its own.
7. **✅ RESOLVED 2026-07-19 — `size` prop renamed to match the confirmed system-wide convention.** `Large`/`Medium`/`Small`, matching Toggle's native labels and Checkbox's parallel update — see Props.
8. **🆕 Both components now have `Disabled_selected`, but the execution quality differs — worth flagging directly.** Checkbox's version is clean: muted grey fill, crisp white checkmark, easy to read as "on but locked." Radio Button's version is technically correct (the dot is genuinely there when selected, absent when not) but low-contrast — the dot uses the same muted tone as the ring, so it's easy to miss at a glance. Same underlying idea, executed with noticeably different visual clarity across two sibling components built the same day. Worth a quick design pass to align them, though not a blocker.

**Summary:** this round resolved the two biggest open items from before — the naming collision (fixed from Checkbox's side) and disabled+checked (built in Figma on both components). The one new, genuinely worth-raising finding is the contrast gap between the two components' disabled+checked executions: Checkbox reads clearly, Radio Button doesn't quite. Flagged as a design QA item, not silently fixed or silently ignored.

## Open questions — what needs your confirmation

1. ✅ ~~Disabled + checked visual treatment~~ — **RESOLVED 2026-07-19: `Disabled_selected` added in Figma.** See item 5 below for the follow-up contrast question.
2. ~~Should hover apply to `Selected` or `Disabled` states too?~~ — **MOOT, 2026-07-19.** No hover exists at all; the underlying premise was a mislabeling.
3. ~~Is Checkbox's missing hover intentional?~~ — **RESOLVED 2026-07-19: yes, both components lack hover equally.** No longer a meaningful question — see Checkbox's own Open questions.
4. ~~Should the `Unselected` naming collision with Checkbox be resolved in Figma?~~ — **RESOLVED/MOOT 2026-07-19.** Fixed from Checkbox's side; no change needed here.
5. **New: `Disabled_selected`'s dot is low-contrast against its ring** — the dot uses the same muted tone as the ring itself, unlike Checkbox's higher-contrast white-on-grey treatment for the equivalent state. Is this intentional (a deliberately subtle disabled look), or should the dot use a different, more visible color?
6. ~~Size-naming unification~~ — **RESOLVED 2026-07-19: `Large`/`Medium`/`Small`.** Confirmed on Toggle's section; `size` prop renamed here to match.
7. **Component code path + export name** — engineering task for the tech lead.

---

# Toggle

> Figma node: `Toggle` — node `707:3272` (a wrapper frame containing 9 variant instances of a single underlying component — not itself a component-set node, same pattern as Checkbox/Radio Button above. `get_design_context` on each instance resolves to the same `Toggle` component signature with `size`/`state` props.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-3272
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Toggle.tsx]` (Figma's own name is `Toggle`; the HTML/ARIA-correct role is `switch` — see Accessibility. Recommend keeping the component named `Toggle` but using `role="switch"` internally, not renaming the component itself.)
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Structurally the most transparent of the three selection controls — real layered elements (track + thumb), not a flattened single SVG, so token bindings here are directly confirmed rather than inferred. `Disabled_true` variant added to Figma, the `Icon/Action`→`Border/Action` naming fixed, and the disabled-thumb opacity bug resolved via a fill-token change — all re-verified live, 2026-07-19. **Fully closed out except the size-naming convention rollout to Checkbox/Radio Button (system-wide, not a Toggle-specific gap) and the code path/export name.**

## Description

A pill-shaped on/off switch with a sliding thumb, at 3 sizes. **Unlike Checkbox and Radio Button, Toggle is built from real separate layers** — a track (`<div>` with a bound background/border) and a thumb (a separate white circle asset positioned via inset percentages) — so `get_design_context` exposes actual token-bound CSS classes rather than one opaque flattened image. This makes Toggle's token bindings the most directly confirmed of the three components in this batch.

✅ **Update, 2026-07-19 — the missing disabled+on variant has been added to Figma.** Previously flagged as a gap (no `Disabled`+`True` combination existed), you added a `Disabled_true` variant directly in Figma. Re-verified live via fresh `get_metadata`/`get_design_context` calls (node `1550:611` for `Large`, plus `1550:614`/`1550:617` for `Medium`/`Small`) — confirmed it uses the **same track background/border as `Disabled_false`** (`Surface/Page` + `Border/Disabled`), with the thumb positioned **right** (same inset values as `True`), and the same `opacity-[var(--opacity/50,1)]` fallback-value quirk on the thumb as the off/disabled state. This resolves the old "disabled+on not modeled" edge case — see Variant axes, States, Edge cases below.

✅ **RESOLVED 2026-07-19 — track border naming fixed at the source.** Previously flagged as an off-label binding (`Colors/Icon/Action` used for a border role), you amended the Figma variable directly to `Colors/Border/Action` — confirmed via a fresh screenshot of the `True`-state selection colors panel, now showing `Colors/Border/Action` / `Colors/Surface/Action` / `Colors/Surface/Card_...` cleanly. Same resolved green value as before (`#5d9c4d`), now correctly named. This is the first of the three off-label `Icon/*`-as-border/fill instances in this trio to be fixed at the source rather than just documented — see Checkbox and Radio Button for the still-open instances.

✅ **RESOLVED 2026-07-19 — the `Opacity/50` fallback-value bug is moot, because the disabled-thumb treatment was rebuilt without opacity.** Rather than fixing the `Opacity/50` binding itself, you changed the disabled thumb's **fill token** from `Colors/Surface/Card_primary` (white) to `Colors/Surface/Card_deep` (a real, existing token — `--pt-semantic-surface-card_deep`, grey-200 `#dce6e9` light / grey-700 `#657377` dark) at **100% opacity**, confirmed via a fresh screenshot of the selection panel (`Opacity 100%`, `Fill: Colors/Surface/Card_...`). The muted look now comes from a genuinely muted fill color rather than a partial-opacity effect — cleaner and no longer dependent on a variable whose own fallback contradicted its name. Applies to both `Disabled_false` and `Disabled_true`.

## Variant axes

The Figma node contains **12 variants** (enumerated directly via `get_metadata`, re-verified live 2026-07-19 after `Disabled_true` was added — previously 9).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `State` | `False` · `True` · `Disabled_false` · `Disabled_true` | 4 |
| `Size` | `Large` · `Medium` · `Small` | 3 |

⚠️ **`State` is now renamed/restructured, not just extended.** The old bare `Disabled` value has been renamed `Disabled_false` (node IDs unchanged: `707:3282`/`707:3285`/`707:3288` for Large/Medium/Small), and a new `Disabled_true` sits alongside it (new node IDs `1550:611`/`1550:614`/`1550:617`). This now decomposes cleanly into `checked × disabled` (`2 × 2 = 4`), the same clean grid shape as before, just genuinely complete now instead of missing one cell.

✅ **`Size` uses descriptive labels (`Large`/`Medium`/`Small`) — confirmed 2026-07-19 as the system-wide winner for this trio.** You confirmed the unified convention across Checkbox, Radio Button, and Toggle should be `Large`/`Medium`/`Small`, not the numeric pixel labels. Toggle's own Figma variants already use this naming natively, so no change is needed here — Checkbox and Radio Button are the ones that need their code-facing `size` prop renamed to match (their Figma variant axis itself stays numeric — `24`/`20`/`16` — since that's the source variant labeling; only the recommended code prop convention changes). See those components' own sections and Cross-component consistency check below.

### Variant math (axes multiplied vs. actual)

```
4 (State) × 3 (Size) = 12 theoretical
Actual component count = 12
Excluded                = 0
```

**No exclusions** — full matrix, and same as before, this one *is* a clean, uniform grid — `State` here only carries two concerns (checked, disabled), no tone or hover sub-split to decompose. Now genuinely complete: `checked` and `disabled` are fully orthogonal, matching how the code props were already designed.

### Valid combinations

```
{False, True, Disabled_false, Disabled_true} × {Large, Medium, Small} = 12, all valid.
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `checked` | `boolean` | `false` | `False`/`Disabled_false`→`false`, `True`/`Disabled_true`→`true`. `disabled` decomposed out separately — see below. ✅ Now a real, independently-confirmed orthogonal mapping (2026-07-19) rather than an assumption — `Disabled_true` proves `checked` and `disabled` are genuinely independent axes in Figma too. |
| `State` (disabled component) | `disabled` | `boolean` | `false` | `Disabled_false`/`Disabled_true`→`true`. |
| `Size` | `size` | `'small' \| 'medium' \| 'large'` | `'large'` (Figma's spatial/enumeration-order default) | ✅ **Confirmed 2026-07-19 as the system-wide convention** — Checkbox and Radio Button's `size` prop should be renamed to match this (`'small'\|'medium'\|'large'`), not the other way around. See Cross-component consistency check. |

Non-visual props:

- ⚠️ `onChange: (checked: boolean) => void` — standard, not modeled in Figma.
- ⚠️ `aria-label` or an associated visible label — see Accessibility.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `False`/`Disabled`/`True` | `checked: boolean` + `disabled: boolean` | Same decomposition rationale as Checkbox/Radio Button, though simpler here since there's no tone/hover sub-split to also untangle. |
| 2 | ~~Track border on `True` bound to `Colors/Icon/Action`~~ | Consume `--pt-semantic-border-action` | ✅ **RESOLVED 2026-07-19** — no longer a divergence to reconcile. You fixed the binding at the source in Figma; code should simply consume the (now correctly-named) `Border/Action` token directly. |

## Tokens used

All values below are **directly confirmed** via `get_design_context`'s generated CSS classes (real bound classes, not inferred from a flattened asset — see Status).

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token (`PT_tokens.md`) | Value | Flag |
|---|---|---|---|
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` (grey-500) | Track background, `False` state (off, resting). |
| `Colors/Border/Disabled` | `--pt-semantic-border-disabled` | `#a8c0c7` (grey-500) | Track border, `False` **and** `Disabled` states. Correctly named this time (a `Border/*` token used for a border) — direct contrast with the `True` state's off-label binding immediately below. |
| `Colors/Surface/Action` | `--pt-semantic-surface-action` | `#5d9c4d` | Track background, `True` state (on). |
| `Colors/Border/Action` | `--pt-semantic-border-action` | `#5d9c4d` | Track border, `True` state. ✅ **RESOLVED 2026-07-19** — you amended the Figma binding from `Colors/Icon/Action` to this correctly-named token, confirmed via screenshot. Same resolved value as before, now correctly named. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` (grey-75) | Track background, `Disabled_false`/`Disabled_true` states. |
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | Thumb color, `False`/`True` (enabled) states (inferred from the aggregate `get_variable_defs` — the thumb itself is a separate SVG asset, so this specific binding has the same "present in the aggregate, not layer-confirmed" caveat as Checkbox/Radio Button, even though the track tokens above are fully confirmed). |
| `Colors/Surface/Card_deep` | `--pt-semantic-surface-card_deep` | `#dce6e9` (grey-200, light) / `#657377` (grey-700, dark) | ✅ **RESOLVED 2026-07-19** — thumb color, `Disabled_false`/`Disabled_true` states, at full (`100%`) opacity. Replaces the old `Opacity/50`-on-white approach; confirmed via screenshot of the selection panel (`Opacity 100%`, `Fill: Colors/Surface/Card_...`). Real, existing semantic token — not hardcoded. |
| ~~`Opacity/50`~~ | *(no longer used)* | — | ✅ **RESOLVED/MOOT 2026-07-19** — the disabled thumb no longer uses opacity at all; the muted look now comes from the `Card_deep` fill token above. The fallback-value bug (`1` instead of `0.5`) is no longer relevant since the binding itself was removed. |
| `Scale/12`/`Scale/10`/`Scale/8` | `--pt-scale-12` (48px) / `--pt-scale-10` (40px) / `--pt-scale-8` (32px) | Track width per size | Confirmed via the generated `w-[48px]`/`w-[40px]`/`w-[32px]` classes at each size — matches `PT_tokens.md`'s spacing scale exactly. |
| `Scale/6`/`Scale/5`/`Scale/4` | `--pt-scale-6` (24px) / `--pt-scale-5` (20px) / `--pt-scale-4` (16px) | Track height per size | Same confirmation as above. |
| `Scale/4` (`16px`) | `--pt-scale-4` | Track border-radius, **all 3 sizes** | ✅ **Confirmed a deliberate, clever geometry choice, not a mistake.** A fixed `16px` radius exceeds half the height of even the largest (`Large`, `24px` tall → `12px` half-height) track, which guarantees a fully-rounded pill shape at every size without needing a per-size radius token. Worth noting as a good pattern, not just a token binding. |

### Per-variant token map

| `State` | Track background | Track border | Thumb color | Thumb position |
|---|---|---|---|---|
| `False` | `--pt-semantic-surface-disabled` | `--pt-semantic-border-disabled` | `--pt-semantic-surface-card_primary` | Left (inset ~4–6% depending on size) |
| `True` | `--pt-semantic-surface-action` | `--pt-semantic-border-action` ✅ resolved | `--pt-semantic-surface-card_primary` | Right |
| `Disabled_false` | `--pt-semantic-surface-page` | `--pt-semantic-border-disabled` | `--pt-semantic-surface-card_deep` ✅ resolved, 100% opacity | Left |
| `Disabled_true` | `--pt-semantic-surface-page` (confirmed same as `Disabled_false`, not `Surface/Action`) | `--pt-semantic-border-disabled` (same as `Disabled_false`) | `--pt-semantic-surface-card_deep` ✅ resolved, 100% opacity | Right (same inset values as `True`) |

### Geometry

✅ Clean, consistently scaled — confirmed directly, not inferred.

| `Size` | Track (W×H) | Thumb diameter | Thumb inset |
|---|---|---|---|
| `Large` | `48×24px` | `20px` | `2px` on every edge (`8.33%` of `24px`) |
| `Medium` | `40×20px` | `16px` | `2px` on every edge (`10%` of `20px`) |
| `Small` | `32×16px` | `12px` | `2px` on every edge (`12.5%` of `16px`) |

Every size follows the same **`thumb diameter = track height − 4px`** relationship (a consistent 2px inset on every edge) — clean scaling, same positive pattern as Radio Button, not Checkbox's non-linear one.

## States

| State | Status |
|---|---|
| Hover | ⚠️ Not modeled in Figma. **Moved to Design system roadmap.** |
| Focus (keyboard) | ⚠️ Not modeled in Figma. **Moved to Design system roadmap.** |
| Off / On | Modeled via the `checked` axis. |
| Disabled | ✅ **Fully modeled now, both positions — resolved 2026-07-19.** `Disabled_false` (left, matching `False`) and `Disabled_true` (right, matching `True`) both preserve the correct thumb position with a muted track — unlike Checkbox/Radio Button's `Disabled`, which still loses the checked-value entirely. Toggle is now the only one of the three selection controls in this trio with a fully-specified disabled state at every checked value, not just a partial one. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ⚠️ **Recommend `role="switch"` with `aria-checked`**, not `role="checkbox"` — the ARIA switch role exists specifically for this on/off pattern and is the more correct semantic than treating it as a checkbox styled to look like a toggle. Implementation can be a native `<input type="checkbox" role="switch">` (works in most browsers/AT) or a `<button role="switch" aria-checked>` — flag both as valid options for the tech lead to choose based on their form-handling approach, don't prescribe one without their input.
- ⚠️ **Needs an accessible name** — via a visible associated `<label>`, or `aria-label` if visually labelless. Not modeled in Figma (no text content anywhere in this component).
- Contrast not computed for any state.
- Touch target: `Large` at 48×24px is closer to acceptable than Checkbox/Radio Button's sizes but still under 44×44 on the shorter axis — flagged, not re-litigated in depth.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `role="switch"` + `aria-checked`, not `role="checkbox"` | Treat this as a checkbox with different styling — the semantics differ |
| Always pair with a visible label or `aria-label` | Ship a toggle with no accessible name |
| Keep the fixed `16px` track radius regardless of size — it's a deliberate pill-guarantee, not a per-size value to vary | Recalculate radius per size — unnecessary, the current approach already works at every step |
| Use `--pt-semantic-surface-card_deep` at 100% opacity for the disabled thumb | Use opacity/alpha tricks on the white thumb color — resolved 2026-07-19, no longer the approach |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ✅ ~~Disabled + on (`True`)~~ — **RESOLVED 2026-07-19.** `Disabled_true` added to Figma and confirmed: same muted track as `Disabled_false`, thumb positioned right.
- ✅ ~~`Opacity/50` fallback-value discrepancy~~ — **RESOLVED/MOOT 2026-07-19.** Rebuilt without opacity — disabled thumb now uses `Colors/Surface/Card_deep` at 100% opacity.
- **RTL:** the thumb sliding left→right on activation is a spatial, directional animation — worth flagging as a real RTL consideration (unlike, say, Map_pin's symmetric icon), though still lower-priority until RTL support is scoped. The thumb's slide direction would need to mirror in RTL contexts.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Toggle } from '@/components/Toggle';

<label>
  <Toggle checked={notificationsEnabled} size="large" onChange={setNotificationsEnabled} />
  Enable notifications
</label>

// Disabled, off
<Toggle checked={false} disabled size="medium" aria-label="Feature unavailable" />

// Disabled, on — now a real, confirmed Figma variant (Disabled_true, added 2026-07-19)
<Toggle checked={true} disabled size="medium" aria-label="Feature unavailable, currently on" />
```

## Cross-component consistency check

Comparing Toggle against Checkbox and Radio Button (its closest siblings — all three are binary/tri-state selection controls) and the rest of the doc set.

1. **✅ Structurally the most transparent of the three** — real layered track+thumb elements, not a flattened SVG, meaning its token bindings are the most directly confirmed of any component in this batch (and arguably in the whole doc set alongside Map_pin's own per-layer confirmations).
2. **✅ RESOLVED 2026-07-19 — `Size` naming is no longer a divergence to flag, it's the confirmed system-wide standard.** You confirmed `Large`/`Medium`/`Small` as the unified convention across all three form controls — Toggle already used it natively; Checkbox and Radio Button need their `size` prop renamed to match (see those sections' own updates).
3. **✅ Toggle's `Disabled` state is the best-behaved of the three, and now completely specified.** With `Disabled_true` added 2026-07-19, Toggle preserves thumb position at *both* checked values when disabled, with a real muted fill color (`Card_deep`) rather than an opacity trick. Checkbox and Radio Button's `Disabled` still loses the checked-value entirely — an industry-standard proposal (muted glyph) is pending your sign-off there, see those sections' Open questions.
4. **✅ RESOLVED 2026-07-19 — the off-label `Icon/Action`-as-border binding is fixed on Toggle specifically.** You amended the Figma variable to `Colors/Border/Action`, confirmed via screenshot. Still open on Checkbox and Radio Button (their flattened-SVG structure means the same fix would need a separate confirmation on each).
5. **✅ RESOLVED 2026-07-19 — the `Opacity/50` fallback-value discrepancy is now moot.** Rebuilt without opacity entirely — the disabled thumb uses a real muted fill token (`Colors/Surface/Card_deep`) at 100% opacity instead. No other component in this doc set needed this kind of fix, so it doesn't recur elsewhere, but worth remembering as a pattern: prefer a real muted color token over an opacity-based fade when the underlying opacity binding is unreliable.
6. **The fixed-radius pill-guarantee pattern (`Scale/4` regardless of size) is a genuinely good, worth-praising piece of design-system craft** — flagged positively, not just as a token binding, since it's a reusable pattern (a radius large enough to guarantee full rounding at any height) worth the tech lead recognizing as intentional rather than re-deriving per-size radius values themselves.

**Summary:** Toggle is now fully closed out. All three issues flagged in the previous round — the size-naming divergence, the `Opacity/50` bug, and the off-label border binding — are resolved, two of them (border naming, opacity) fixed directly at the source in Figma rather than just documented. The size-naming resolution also settles the open question for Checkbox and Radio Button: unify to `Large`/`Medium`/`Small`, matching Toggle's native convention. Only the component code path/export name remains, for the tech lead.

## Open questions — what needs your confirmation

1. ~~Disabled + on (`True`) visual treatment~~ — **RESOLVED 2026-07-19.** `Disabled_true` added in Figma; same muted track as `Disabled_false`, thumb right.
2. ~~`Opacity/50` fallback-value quirk~~ — **RESOLVED 2026-07-19.** Disabled thumb rebuilt using `Colors/Surface/Card_deep` at 100% opacity instead of an opacity-based fade — confirmed via screenshot.
3. ~~`Icon/Action`-vs-`Border/Action` naming~~ — **RESOLVED 2026-07-19.** Amended in Figma to `Colors/Border/Action` — confirmed via screenshot.
4. ~~Size-naming unification across Checkbox/Radio Button/Toggle~~ — **RESOLVED 2026-07-19: `Large`/`Medium`/`Small`.** Confirmed directly ("The sizes are Large / Medium / Small across"). Toggle needs no change; Checkbox and Radio Button's `size` prop should be renamed to match.
5. **Component code path + export name** — engineering task for the tech lead. Only remaining open item.

---

# Menu_item

> Figma node: `Menu_item` — node `707:2440` (three symbol instances of a single underlying component within the "Menu" frame — not itself a classic component-set node; same "wrapper of instances" pattern as Checkbox/Radio Button/Toggle. Parent section node `707:2428` bundles this alongside a second, distinct component, **Menu_sub-item** — documented separately below, per instruction not to force unrelated components into one section.)
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2440
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/MenuItem.tsx]`
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A single row in a dropdown/action menu. The parent Figma frame's own description text reads: *"Displays a menu to the user — such as a set of actions or functions — triggered by a button."* — confirming this is a menu opened from a trigger control (e.g. a kebab/hamburger button), not a persistent nav sidebar. Menu_item is the top-level row: leading icon, title label, an optional trailing value, and a trailing chevron. See [Menu_sub-item](#menu_sub-item) below — **confirmed 2026-07-19: Menu_sub-item is nested under an expanded Menu_item** (not a same-level alternate style).

✅ **Confirmed 2026-07-19: interactive.** Menu_item is clickable, and `Selected` is reached by user click (not an externally-driven "current page" indicator). See States and Accessibility.

## Variant axes

The Figma node contains **3 variants** (enumerated directly via `get_metadata`).

Figma exposes exactly **one** variant property. ⚠️ Unlike every other component documented so far, this axis was never renamed from Figma's own generic default — it's still literally called **`Property 1`** (not `State`, not `Menu Item State`, etc.).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Property 1` | `Default` · `Selected` · `Disabled` | 3 |

No `Size` axis, no `Type` axis — the smallest variant surface of any component documented so far.

### Variant math (axes multiplied vs. actual)

```
3 (Property 1) = 3 theoretical
Actual component count = 3
Excluded                = 0
```

No exclusions — every value is a real, distinct component.

### Valid combinations

```
{Default, Selected, Disabled} — all valid, no combinable axes.
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Property 1` | `state` | `'default' \| 'selected' \| 'disabled'` | `'default'` | Renamed from Figma's generic `Property 1` — same rationale as every other axis-rename in this doc set. ✅ **Meaning confirmed 2026-07-19:** `selected` is reached by user click, not externally driven. |
| `title` | `children` | `ReactNode` | `"Title item"` (Figma placeholder) | Consistent with Button/Filter Chip's `children` convention. |
| `right` | `count` | `number` (optional) | — | ✅ **RESOLVED 2026-07-19: represents an item count/badge** (e.g. number of results in that category). Renamed from the literal `right`/generic `trailingLabel` to `count` and typed as `number` rather than `string` now that its meaning is known; format for display (e.g. `String(count)`) at render time. Figma's `"48"` placeholder was just a sample value, not a hint at a different meaning. |
| `showLeftIcon` | `showLeftIcon` | `boolean` | `true` | Kept as-is — already a clear, well-formed Figma property name (first component in this doc set where no rename is needed for a visibility toggle). |
| `swapLeftIcon` | `iconLeft` | `ReactNode` (optional) | `null` | Collapsed with `showLeftIcon` into one optional slot, same pattern as Filter Chip's `showIcon`+`iconSwap`→`icon`: passing `iconLeft` renders it, omitting it hides the icon. ⚠️ CONFIRM this collapse is wanted — Figma keeps them as two independent properties (an icon could theoretically be swapped while hidden), which this collapse would make unrepresentable. |
| `showRightIcon` | *(not exposed)* | — | — | ⚠️ Recommend NOT exposing as a separate prop — see divergence #2 below. The trailing chevron reads as a structural navigation affordance, not decorative content the consumer should toggle independently. |
| `swapRightIcon` | `iconRight` | `ReactNode` (optional) | `null` (→ default chevron) | ✅ **Real, resolved icon** — Figma's own layer name for the default is `chevron-right`, an exact, valid Tabler slug (`IconChevronRight` per `PT_tokens.md` §4's bridging convention) — the first fully production-ready icon default in this entire doc set, not a coincidental placeholder like `diamond`. Recommend keeping this as the built-in default and only exposing an override for genuinely different trailing-icon use cases. |

Non-visual props, none of which exist in Figma:

- ✅ **`onClick` — required, confirmed 2026-07-19.** Menu_item is interactive; `selected` is reached by user click. Whether the underlying element is a `<button>` or `<a>` is still an engineering choice for the tech lead (both are valid depending on whether the row performs an in-page action or navigates) — not a Figma-derivable fact, but no longer blocked on "is it clickable at all."
- `aria-pressed`/`aria-checked` — see Accessibility for the recommended ARIA pattern now that the click-to-select mechanic is confirmed.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Property 1` = `Default`/`Selected`/`Disabled` | `state: 'default'\|'selected'\|'disabled'` | Same axis-rename rationale as every other component — `Property 1` is Figma's unedited default name, not a real design-system term. |
| 2 | `showRightIcon` (independent boolean) | Not exposed; chevron always renders | The chevron is the only visual cue that a row navigates/expands. Making it independently toggleable risks a row that looks identical to a plain label but behaves differently. ⚠️ CONFIRM — if there's a legitimate non-navigating use of Menu_item (e.g. a plain info row), revert this and expose `showRightIcon` after all. |
| 3 | `right` (raw text property) | `count: number` | ✅ **RESOLVED 2026-07-19** — confirmed to represent an item count/badge; renamed and re-typed accordingly. |
| 4 | `title` (text property) | `children` | Consistency with Button/Filter Chip. |

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on node `707:2440`), re-verified live 2026-07-19 after you updated the icon-color bindings.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Title, `Default`/`Selected`. Right value, `Selected` only. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | Title + right value, `Disabled`. Right value only, `Default`. |
| `Colors/Icon/Body` | `--pt-semantic-icon-body` | `#222628` | ✅ **RESOLVED 2026-07-19 — re-verified live via `get_variable_defs`.** `Default`'s icon color. Previously bound to `Colors/Icon/Headings` (inferred); you changed it to `Colors/Icon/Body`, matching the label's own `Typography/Body` role — same fix pattern already applied to Filter Chip's `Default`/`Outline` icon. `Colors/Icon/Headings` is now gone from the node entirely. Icons still render as flattened `<img>` assets in `get_design_context`, so per-state binding is confirmed via the aggregate variable list, not a literal traceable class — same limitation as Button/Filter Chip/Map_pin. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | `Selected`'s icon color (pairs with the `Selected` border below). Same traceability caveat as above. |
| `Colors/Icon/Body_Secondary` | `--pt-semantic-icon-body_secondary` | `#869a9f` | ✅ **RESOLVED 2026-07-19 — re-verified live.** `Disabled`'s icon color. Previously bound to `Colors/Icon/Body_caption`; you changed it to `Colors/Icon/Body_Secondary` to unify with Menu_sub-item's equivalent role (per your confirmation — "They are all Body_secondary now"). `Colors/Icon/Body_caption` is gone from the node. See Cross-component consistency check — this closes that finding. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Selected` background. Same token Filter Chip's `Highlighted` uses. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | `Disabled` background. |
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | ⚠️ **Stray reference, still present as of the 2026-07-19 re-check.** Not bound anywhere in any of the 3 sampled variants' generated classes. Same pattern as the "Tags — two stray variable references" finding in `MD_progress.md`. Low-priority Figma cleanup item, not blocking. |
| `Scale/2` | `--pt-scale-2` | `8px` | Icon↔title↔value gap. |
| `Scale/3` | `--pt-scale-3` | `12px` | Vertical padding. |
| `Scale/4` | `--pt-scale-4` | `16px` | Horizontal padding. |
| `Scale/6` | `--pt-scale-6` | `24px` | Title/value line-height. Same "bound to `Scale/6` instead of a `body-default-line_height` token" reuse pattern already documented on Button and Filter Chip — no drift. |
| `Scale/0` | `--pt-scale-0` | `0px` | ✅ **RESOLVED 2026-07-19: intentional, per your decision.** `Selected`'s left border stays invisible (`0px` width) — you confirmed this is the desired look, not a bug to fix. The border **color** binding (`Colors/Icon/Action`, off-label — an icon token used for a border role) is still present in Figma as a vestigial leftover; low-priority cosmetic cleanup (remove the unused binding, or leave it — doesn't affect the rendered result either way), not blocking. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | Title/value weight. |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | |
| icon-size `24` → stroke weight `2` | `--pt-icon-stroke_weight-24` | `2` | Confirms `PT_tokens.md` §7.3 exactly — no drift. |

**No HARDCODED colors, spacing, or typography values found**, beyond the same file-wide icon-pixel-size gap already flagged five times prior (Button, Filter Chip, Eyebrow Highlight, Tags, Super Icon) — the 24px icon container itself isn't bound to a named size token in Figma, only its stroke weight is → `⚠️ HARDCODED — no token bound in Figma`, consistent with the established systemic pattern, not a new issue.

### Per-variant token map

| `Property 1` | Background | Left border | Title color | Right-value color | Icon color |
|---|---|---|---|---|---|
| `Default` | none (transparent) | none | `--pt-semantic-typography-body` | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body` ✅ |
| `Selected` | `--pt-semantic-surface-success` | `--pt-semantic-icon-action`-colored (off-label, vestigial) at `0px` width — intentional, confirmed 2026-07-19 | `--pt-semantic-typography-body` | `--pt-semantic-typography-body` | `--pt-semantic-icon-action` |
| `Disabled` | `--pt-semantic-surface-page` | none | `--pt-semantic-typography-body_secondary` | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body_secondary` ✅ |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | Transparent background, dark title, muted right-value | Resting state. |
| `Selected` | Green-tinted (`surface-success`) background, dark title, dark right-value | ✅ **Confirmed 2026-07-19: reached by user click.** Not an externally-driven "current page" indicator — the consumer's own click handler sets it, same general shape as Filter Chip's `active` (though the two are still independent props on independent components, not shared logic). |
| `Disabled` | Muted (`surface-page`) background, muted title and right-value | Standard non-interactive treatment. |
| Hover | ⚠️ Not modeled in Figma. Now that interactivity is confirmed, this is a real gap, not a hypothetical one. **Design system roadmap** — use a minimal CSS-only placeholder (e.g. a subtle background shift) until designed, same approach as Filter Chip. |
| Focus (keyboard) | ⚠️ Not modeled in Figma. Same systemic gap as every interactive component so far. **Design system roadmap.** |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **Interactive, confirmed 2026-07-19.** Render as `<li><button aria-pressed={state==='selected'}>…</button></li>` (in-menu action) or `<li><a href>…</a></li>` (navigation) depending on what the row actually does — that specific choice is an engineering call for the tech lead, not a Figma-derivable fact. Recommend `role="menuitemradio"`/`aria-checked` instead of `aria-pressed` if only one Menu_item can be `selected` at a time within its menu (single-select) — confirm the selection model (single vs. multi) before finalizing; not modeled in Figma.
- `Disabled`: `aria-disabled="true"`, removed from tab order (`tabIndex={-1}` or a non-interactive element), no `onClick`.
- Focus ring: not modeled. **Design system roadmap** (same as every other interactive component).
- ✅ **Touch target: `Default`/`Selected`/`Disabled` all measure 48px tall** (`12px` padding × 2 + `24px` line-height/icon) — **clears the 44×44 minimum**, the row's full width easily clearing the horizontal axis too. Joins Button's `Default` size as one of the few components in this doc set that clears the touch-target bar without qualification.
- Left icon is decorative/redundant with the title text in every sampled case — recommend `aria-hidden="true"` on the icon wrapper unless a future use case makes the icon convey unique meaning.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use for rows inside a triggered dropdown/action menu | Use as a persistent sidebar nav item without confirming the interaction model first |
| Keep the trailing chevron for rows that navigate/expand | Repurpose the chevron as a purely decorative element |
| Wire `onClick` to set `state="selected"` | Treat `selected` as externally/route-driven — it's a click-set state |
| Disable pointer/keyboard interaction entirely on `disabled` | Style a row as disabled while leaving it clickable |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long titles:** No wrap/truncation modeled (single-line samples only; the generated class includes `[word-break:break-word]`, suggesting wrapping is allowed rather than truncating — but not confirmed against a genuinely long string).
- **`count` overflow:** No behavior modeled for very large numbers (e.g. does it cap/abbreviate at some threshold, similar to Map_pin's confirmed 1–99 clamp)? Not confirmed for this component — treat as unbounded until specified.
- **Selected + Disabled combined:** No such variant exists — only 3 flat values, not a 2-axis grid. Confirm whether a disabled row can simultaneously be marked selected, or if selecting a row always implies it's enabled.
- **Single- vs. multi-select within one menu:** Not modeled in Figma. Affects the ARIA pattern (`menuitemradio` vs. `menuitemcheckbox`/`aria-pressed`) — see Accessibility.
- **RTL:** Not modeled. The chevron's directionality would need to mirror in RTL, same open item as every icon-driven component. **Design system roadmap.**

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { MenuItem } from '@/components/MenuItem';

<ul role="menu">
  <MenuItem count={48} onClick={handleSelect}>
    Trip type
  </MenuItem>

  {/* Selected — set by the click handler above, not externally/route-driven */}
  <MenuItem state="selected" count={48} onClick={handleSelect}>
    Trip type
  </MenuItem>

  <MenuItem state="disabled" count={48}>
    Trip type
  </MenuItem>
</ul>
```

## Open questions — what needs your confirmation

1. ~~Is Menu_item interactive at all?~~ — **RESOLVED 2026-07-19: yes**, `selected` reached by user click.
2. ~~What does `Selected` actually mean?~~ — **RESOLVED 2026-07-19: user-click-triggered**, not externally/route-driven.
3. ~~`count`'s semantic purpose~~ — **RESOLVED 2026-07-19: an item count/badge.**
4. ~~`Selected`'s left border bound at `0px` width~~ — **RESOLVED 2026-07-19: intentional**, per your decision — stays invisible. The leftover color-token binding in Figma is a low-priority cosmetic cleanup only.
5. **Is the trailing chevron ever meant to be hidden or swapped**, or is it a fixed structural affordance? (Divergence #2 above assumes fixed — still open.)
6. **Single- vs. multi-select within one menu** — determines the correct ARIA pattern (see Accessibility/Edge cases). Still open.
7. Component code path + export name — engineering task for the tech lead.

---

# Menu_sub-item

> Figma node: `Menu_sub-item` — node `707:2456` (three symbol instances of a single underlying component, same "wrapper of instances" pattern as Menu_item above). Bundled in the same parent Figma frame as Menu_item (`707:2428`) but a structurally and visually distinct component — documented separately per instruction.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2456
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/MenuSubItem.tsx]`
> Last updated: 2026-07-19
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

The second, visually distinct component bundled in the same Figma frame as [Menu_item](#menu_item). A more compact, lighter-weight row: smaller icon (20px vs. 24px), thinner type (font-weight 300 vs. 500), and tighter vertical padding (8px vs. 12px). ✅ **Confirmed 2026-07-19: Menu_sub-item is nested under an expanded Menu_item** — the sizing/weight/padding cues were a correct read. The exact disclosure mechanics (parent expand/collapse trigger, chevron rotation, indentation implementation) are still an engineering choice, not modeled in Figma — see Open questions.

✅ **Confirmed 2026-07-19: interactive, same as Menu_item.** `Selected` is reached by user click.

## Variant axes

The Figma node contains **3 variants** (enumerated directly via `get_metadata`, re-verified live 2026-07-19).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Property 1` | `Default` · `Selected` · `Disabled` | 3 |

✅ **RESOLVED 2026-07-19 — renamed at the source.** Previously `Variant2`/`Variant3` (Figma's unedited auto-generated names); you renamed them directly in Figma to `Selected`/`Disabled`, confirmed live via a fresh `get_metadata` pull (same node IDs `707:2462`/`707:2467`, just relabeled). This matches exactly what the token-level evidence predicted (`Variant2`→`Selected`, `Variant3`→`Disabled`) — see the now-closed finding in Cross-component consistency check.

### Variant math (axes multiplied vs. actual)

```
3 (Property 1) = 3 theoretical
Actual component count = 3
Excluded                = 0
```

### Valid combinations

```
{Default, Selected, Disabled} — all valid, no combinable axes.
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Property 1` | `state` | `'default' \| 'selected' \| 'disabled'` | `'default'` | ✅ Figma values now match the code enum directly — no rename-pending caveat left. |
| `title` | `children` | `ReactNode` | `"Title item"` | Same as Menu_item. |
| `right` | `count` | `number` (optional) | — | ✅ **RESOLVED 2026-07-19: item count/badge**, same as Menu_item — see that section. |
| `showLeftIcon` | `showLeftIcon` | `boolean` | `true` | Same as Menu_item. |
| `swapLeftIcon` | `iconLeft` | `ReactNode` (optional) | `null` | Same collapse as Menu_item — same ⚠️ CONFIRM caveat. |
| `swapRightIcon` | `iconRight` | `ReactNode` (optional) | `null` (→ default `chevron-right`) | Same real, resolved default as Menu_item. |

Non-visual props: ✅ `onClick` required, confirmed interactive — same as Menu_item, see that section for the single-vs-multi-select ARIA-pattern question.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Property 1` = `Default`/`Selected`/`Disabled` | `state: 'default'\|'selected'\|'disabled'` | ✅ **RESOLVED 2026-07-19** — Figma values renamed at the source to match; no mapping gymnastics needed. |
| 2 | `title`/`right` (raw text properties) | `children`/`count` | Same rationale as Menu_item. |

## Tokens used

Re-verified live via `get_variable_defs` on `707:2456`, 2026-07-19, after your icon-token unification.

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Title, `Default`/`Selected`. Right value, `Selected` only. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | Title + right value, `Disabled`. Right value only, `Default`. |
| `Colors/Icon/Body` | `--pt-semantic-icon-body` | `#222628` | `Default` icon color. Same variable Menu_item now uses (both were previously on `Icon/Headings`) — confirms consistent unification across both components. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | `Selected` icon color. |
| `Colors/Icon/Body_Secondary` | `--pt-semantic-icon-body_secondary` | `#869a9f` | ✅ **`Disabled` icon color — now confirmed matching Menu_item's equivalent binding.** Per your decision ("They are all Body_secondary now"), Menu_item's muted icon was changed from `Colors/Icon/Body_caption` to this same `Colors/Icon/Body_Secondary` variable — both components now share one role for this purpose. Closes the drift finding from the previous round. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Selected` background — identical token to Menu_item's `Selected`. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | `Disabled` background — identical token to Menu_item's `Disabled`. |
| `Scale/2` | `--pt-scale-2` | `8px` | Icon↔title↔value gap; also vertical padding for this component (see Cross-component consistency check for the padding-value difference vs. Menu_item). |
| `Scale/4` | `--pt-scale-4` | `16px` | Horizontal padding. |
| `Scale/Half` | `--pt-scale-half` | `2px` | ⚠️ **Stray reference, still present as of the 2026-07-19 re-check.** Not bound anywhere in any of the 3 sampled variants' generated classes. Same "unused leftover" pattern as Menu_item's stray `Card_primary` reference and the previously-documented Tags stray refs. Low-priority Figma cleanup item, not blocking. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/ExtraLight` | `--pt-typography-font_weight-extra_light` | `300` | Title/value weight — **notably lighter than Menu_item's `500`**, a real confirmed typographic distinction, not an error. See Cross-component consistency check. |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | Same size as Menu_item — only the weight differs, not the scale step. |
| `Body_default/Line_height` | `--pt-typography-body-default-line_height` | `24px` | ⚠️ Bound to the literal line-height token here, whereas Menu_item's equivalent text is bound to `Scale/6` (same `24px` value, different variable). Same "same value, different variable" pattern documented elsewhere in this doc set (e.g. Button vs. Filter Chip's icon-on-filled tokens) — not a functional bug, flagged as a naming-consistency note. Still open — not part of this round's fixes. |
| icon-size `20` → stroke weight `1.75` | `--pt-icon-stroke_weight-20` | `1.75` | Confirms `PT_tokens.md` §7.3 exactly — no drift. |

**No HARDCODED colors or typography values.** Same systemic icon-pixel-size gap as every other component (20px container not bound to a named size token) — sixth confirmation of the file-wide pattern, not a new issue.

### Per-variant token map

| `Property 1` | Background | Title color | Right-value color | Icon color |
|---|---|---|---|---|
| `Default` | none | `--pt-semantic-typography-body` | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body` |
| `Selected` | `--pt-semantic-surface-success` | `--pt-semantic-typography-body` | `--pt-semantic-typography-body` | `--pt-semantic-icon-action` |
| `Disabled` | `--pt-semantic-surface-page` | `--pt-semantic-typography-body_secondary` | `--pt-semantic-typography-body_secondary` | `--pt-semantic-icon-body_secondary` ✅ |

Note: unlike Menu_item's `Selected`, **`Selected` here still has no border binding at all** — not even the off-label, zero-width one Menu_item has. Per your decision to leave Menu_item's border invisible rather than make it visible, this asymmetry is no longer a discrepancy to resolve — neither component renders a visible accent border, they just get there via slightly different (harmless) means.

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | Transparent background, dark title, muted right-value | Resting state. |
| `Selected` | Green-tinted background, dark title, dark right-value | ✅ **Confirmed 2026-07-19: reached by user click**, same mechanism as Menu_item's `Selected`. |
| `Disabled` | Muted background, muted title and right-value | Same standard non-interactive treatment as Menu_item's `Disabled`. |
| Hover | ⚠️ Not modeled. Now confirmed relevant, since the component is interactive. **Design system roadmap.** |
| Focus (keyboard) | ⚠️ Not modeled. **Design system roadmap.** |

## Accessibility

- ✅ **Interactive, confirmed 2026-07-19** — same as Menu_item, see that section for the recommended `<button>`/`<a>` and `menuitemradio` vs. `aria-pressed` pattern.
- ✅ **Nested under an expanded Menu_item, confirmed 2026-07-19.** Recommend `role="menu"`/`role="menuitem"` nesting (a Menu_item that expands should toggle `aria-expanded` and reveal a nested `<ul role="menu">` of Menu_sub-items), or an indented `<li>` inside the parent's list if the tech lead's disclosure widget is simpler than a full nested-menu pattern. The precise DOM shape is still an engineering choice — Figma doesn't model the expand/collapse interaction itself (no "expanded Menu_item" variant exists to inspect).
- ⚠️ **Touch target: 40px tall** (`8px` padding × 2 + `24px` line-height) — **falls short of the 44×44 minimum by 4px**, joining Filter Chip, Checkbox, Radio Button, and Toggle's already-flagged touch-target gap. Row width is flexible, so the shortfall is purely vertical. Not yet acknowledged/deprioritized by you — still a live roadmap item.
- Left icon: same "decorative, `aria-hidden`" recommendation as Menu_item.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use for the nested/secondary row inside an expanded Menu_item | Use it as an alternate top-level style — confirmed nested, not same-level |
| Keep the lighter type weight (300) — a real, intentional distinction from Menu_item | "Fix" the weight to match Menu_item's 500 — that would erase a confirmed design distinction |
| Wire `onClick` to set `state="selected"`, same as Menu_item | Treat `selected` as anything other than a click-set state |

## Edge cases

Same open items as Menu_item (long titles, `count` overflow, single/multi-select ARIA pattern, RTL) — not re-litigated here. Additionally:

- **Nesting depth:** Only one sub-level is modeled. Confirm whether deeper nesting (a sub-item under a sub-item) is ever needed, or if the hierarchy is capped at two levels.
- **Expand/collapse mechanics:** Not modeled in Figma at all (no "expanded" variant of Menu_item exists to inspect) — the trigger, animation, and chevron-rotation behavior (if any) are entirely an engineering/design decision outside this doc's scope.

## Code example

```tsx
import { MenuItem } from '@/components/MenuItem';
import { MenuSubItem } from '@/components/MenuSubItem';

// Menu_sub-item is nested under an expanded Menu_item (confirmed 2026-07-19).
// Expand/collapse mechanics themselves are not modeled in Figma — illustrative only.
<ul role="menu">
  <MenuItem count={48} aria-expanded={isExpanded} onClick={toggleExpand}>
    Categories
  </MenuItem>
  {isExpanded && (
    <ul role="menu">
      <MenuSubItem count={12} onClick={handleSelect}>
        Beach
      </MenuSubItem>
      <MenuSubItem state="selected" count={8} onClick={handleSelect}>
        Mountain
      </MenuSubItem>
      <MenuSubItem state="disabled" count={0}>
        Desert
      </MenuSubItem>
    </ul>
  )}
</ul>
```

## Cross-component consistency check

Comparing Menu_item and Menu_sub-item against each other and against the rest of the documented system (Button, Button (Icon only), Filter Chip, Eyebrow Highlight, Tags, Super Icon, Map_pin, Checkbox, Radio Button, Toggle). Re-checked live 2026-07-19 after your round of Figma amendments and decisions.

1. **✅ RESOLVED 2026-07-19 — `Variant2`/`Variant3` renamed at the source.** Confirmed live via `get_metadata`: both now read `Selected`/`Disabled`, matching Menu_item exactly and matching the token-level prediction from the prior round. No longer a placeholder-naming gap.
2. **⚠️ `Property 1` is still the least-descriptive variant-axis name in the whole doc set** — not renamed (only the *values* were). Every other component's axis was at least renamed to something meaningful (`State`, `Button Type`, `Size`); this pair still uses Figma's raw default axis name. Low-priority cosmetic item, not blocking (`state` is used as the code-facing prop name regardless).
3. **✅ RESOLVED 2026-07-19 — icon-role naming unified.** Per your decision, Menu_item's muted/disabled icon was changed from `Colors/Icon/Body_caption` to `Colors/Icon/Body_Secondary`, matching Menu_sub-item's binding exactly — confirmed live via `get_variable_defs` on both nodes. Both components now share one role for this purpose. As a related, unprompted improvement also visible in the same re-check: both components' `Default`-state icon moved from `Colors/Icon/Headings` to `Colors/Icon/Body`, matching the label's own role — the same fix pattern already applied to Filter Chip.
4. **✅ RESOLVED 2026-07-19 — border asymmetry accepted, not fixed.** Per your decision, Menu_item's `Selected` border stays invisible (`0px` width, vestigial color binding); Menu_sub-item's `Selected` has no border binding at all. Since neither renders a visible border, this is no longer a discrepancy needing reconciliation — both reach the same (no visible border) result by slightly different means.
5. **Line-height token reference still differs between the two components for the identical `24px` value** — Menu_item's title/value binds `Scale/6`; Menu_sub-item's binds `Body_default/Line_height`. Same value, different variable — consistent with the system-wide "same resolved value, different Figma variable" pattern already seen (Button/Filter Chip's icon tokens). Cosmetic, still open, not part of this round's fixes.
6. **Confirmed, intentional (not drift) differences:** icon size (24px Menu_item vs. 20px Menu_sub-item), vertical padding (`Scale/3`=12px vs. `Scale/2`=8px), font weight (500 vs. 300 extra_light), and vertical alignment (`items-start` vs. `items-center`). All four consistently support the now-**confirmed** "Menu_sub-item is nested under an expanded Menu_item" relationship.
7. **Both components confirm the file-wide icon-pixel-size gap** (24px/20px containers not bound to a named size token) for the sixth time across the doc set (Button, Filter Chip, Eyebrow Highlight, Tags, Super Icon, and now Menu_item/Menu_sub-item) — reinforcing it's systemic, not per-component.
8. **`chevron-right` is the first fully-resolved, production-real icon default anywhere in this doc set.** Every prior component's default icon was a generic placeholder (`diamond`, etc.) that happened to coincidentally match a real Tabler name. Here, `chevron-right` is semantically correct for its role (navigate/expand) as well as being a valid Tabler slug — no icon-resolution work remains.
9. **No `Disabled`-plus-`Selected` combination exists on either component** (both are flat 3-value lists, not a 2-axis grid) — consistent with Filter Chip's similarly flat `State` axis, structurally different from Button's fully-crossed `Type × Size × State × Icon` grid. Not a gap, a structural fact.
10. **Both components' stray/unused variable references** (`Card_primary` on Menu_item, `Scale/Half` on Menu_sub-item) remain unresolved — same unexplained-leftover pattern already flagged on Tags. A third and fourth instance of this specific kind of gap; still worth a single system-wide check with the designer rather than resolving one at a time. Low priority, not blocking.

**Summary (2026-07-19 re-check):** The two headline findings from the previous round — the `Variant2`/`Variant3` placeholder names and the icon-role naming split — are both **resolved directly in Figma**, re-verified live. Interactivity, the selection mechanism, the nesting relationship, and the trailing-value's meaning are all now confirmed. Remaining open items are all low-priority/cosmetic (the un-renamed `Property 1` axis, the line-height variable-reference difference, the two stray variable references) or genuine engineering choices outside Figma's scope (expand/collapse mechanics, single- vs. multi-select ARIA pattern, `<button>` vs. `<a>`). No blocking token gaps anywhere.

## Open questions — what needs your confirmation

1. ~~Rename `Variant2`→`Selected`, `Variant3`→`Disabled` in Figma?~~ — **RESOLVED 2026-07-19**, confirmed live via `get_metadata`.
2. ~~Is Menu_sub-item nested under an expanded Menu_item?~~ — **RESOLVED 2026-07-19: yes.**
3. ~~Interactivity / `selected` meaning / `count`'s purpose~~ — **RESOLVED 2026-07-19**, same as Menu_item — see that section.
4. ~~Icon-role naming: unify `Body_caption`/`Body_Secondary`?~~ — **RESOLVED 2026-07-19: unified to `Body_Secondary`**, confirmed live via `get_variable_defs`.
5. ~~Should Menu_sub-item's `Selected` gain a left-border binding to match Menu_item?~~ — **RESOLVED 2026-07-19: no** — Menu_item's border stays invisible by decision, so there's nothing for Menu_sub-item to match.
6. **Single- vs. multi-select within one menu** — determines the `menuitemradio` vs. `aria-pressed`/`menuitemcheckbox` ARIA pattern (see Menu_item's Accessibility). Still open.
7. **Expand/collapse mechanics** (trigger, chevron rotation, animation) for revealing Menu_sub-items under an expanded Menu_item — not modeled in Figma at all; an engineering/design decision outside this doc's scope. Still open.
8. Component code path + export name — engineering task for the tech lead.

---

# Card_image

> Figma node: `Card_image` — three variant instances of a single underlying component: `Shadow=Shadow_top` (`689:929`), `Shadow=Shadow_bottom` (`693:1767`), `Shadow=Shadow_overlay` (`693:1796`). All three are direct children of the documentation frame `Card_light` (`707:1164`), alongside four other distinct components — see the "Cross-component consistency check" at the end of this Card-family block for the full bundle breakdown.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1164
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/CardImage.tsx]`
> Last updated: 2026-07-20
> Status: 🟡 Verified against Figma via MCP. Several items marked ⚠️ need a human decision — more than usual for this component, see Open questions.

## Family structure — macro vs. micro (confirmed 2026-07-20)

The 5 components documented under this "Card" pull split into two tiers, per your direct confirmation: **[Card_hero-image](#card_hero-image) and [Card_carousel](#card_carousel) are the macro components** — the actual, top-level "Card" layouts a consumer reaches for. **Card_image (this component), [Text Block](#text-block), and [Ratings](#ratings) are micro components** — general-purpose, reusable building blocks that are **not exclusive to Card**. They're shown here because the two Card macros happen to use them, but they should be treated (and likely code-organized) as standalone primitives in their own right, available anywhere in the system, not as "Card sub-parts." Applies to all 5 sections below — not re-stated in each one.

## Description

A general-purpose image container with a gradient/flat overlay (for legibility of overlaid UI), an optional pill-shaped category chip, up to two optional action icons (top-right), and an optional title baked into the bottom of the image. A micro/reusable component — **used by both of the Card macros** ([Card_hero-image](#card_hero-image), [Card_carousel](#card_carousel)) as a nested instance, confirmed via matching node structure and identical token bindings, but not exclusive to them; treat as a standalone primitive.

✅ **Confirmed 2026-07-20: the heart action icon is an interactive favorite/save toggle.** No hover/pressed/focus variant exists anywhere in the 3 sampled instances, and only the outline heart is shown in Figma — but ✅ **confirmed 2026-07-20: this is not a design gap.** The filled/"favorited" state is a plain icon swap (Tabler's library already has a solid-fill heart, `IconHeartFilled`, pairing with the outline default `IconHeart`) — no new Figma variant needs to be designed. Implement `favorited` as a boolean that swaps the icon component directly.

## Variant axes

The Figma node contains **3 variants** (enumerated via `get_metadata` on the parent `Card_light` frame — each is a full component, not a documentation-only instance, confirmed by each carrying its own component description text in Figma).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Shadow` | `Shadow_top` · `Shadow_bottom` · `Shadow_overlay` | 3 |

Figma's own component descriptions (pulled live, not inferred) clarify intended usage per value:

- **`Shadow_top`** — *"Use this variant when using the action icons and category chip"* (dark-to-transparent gradient at the top only).
- **`Shadow_bottom`** — *"Use this variant when the entire card is an image and title appears within the image"* (transparent-to-dark gradient at the bottom only).
- **`Shadow_overlay`** — *"Use this variant when the card image [has] both the action icons and card title"* (flat, uniform semi-transparent tint over the whole image — sic, Figma's own description text has a small grammatical gap, "image both" — quoted verbatim, not corrected).

In addition to the `Shadow` variant axis, **4 independent boolean component properties** exist on every `Shadow` value (not additional variants — same "component property, not a variant axis" pattern as Filter Chip's `showIcon`): `showCategory` (default `false`), `showIconLeft` (default `false`), `showIconRight` (default `true`), `showImageTitle` (default `false`). Plus two instance-swap slots (`iconLeft`, `iconRight`) and one text property (`title`, default `"Card title..."`).

### Variant math (axes multiplied vs. actual)

```
3 (Shadow) = 3 theoretical
Actual component count = 3
Excluded                = 0
```

No exclusions on the `Shadow` axis itself. The 4 boolean properties are orthogonal to `Shadow` and to each other (not modeled as combinatorial variants in Figma at all — enumerating 3 × 2⁴ = 48 "theoretical" combinations would be the wrong frame; Figma treats them as independent toggles layered on top of any `Shadow` value, not a variant grid to exhaust).

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Shadow` | `shadow` | `'top' \| 'bottom' \| 'overlay'` | `'top'` | Stripped the repeated `Shadow_` prefix from each value, same rationale as every other axis-value cleanup in this doc set (e.g. Super Icon's `Fill` decomposition). |
| `showCategory` | `showCategory` | `boolean` | `false` | Kept as-is — clear Figma name. |
| `showIconLeft` | `showIconLeft` | `boolean` | `false` | Kept as-is. |
| `showIconRight` | `showIconRight` | `boolean` | `true` | ⚠️ Note the default is `true` here — opposite of the usual "icons default hidden" pattern seen on Filter Chip/Menu_item. Confirmed real (not a copy error): the heart icon renders in every one of the 13 sampled Card-family instances except where explicitly hidden. |
| `iconLeft` | `iconLeft` | `ReactNode \| null` | `null` | Instance-swap slot; no default icon renders (hidden via `showIconLeft=false`). |
| `iconRight` | `iconRight` | `ReactNode \| null` | `null` (→ default heart icon) | ⚠️ Kept as a **separate** prop from `showIconRight` rather than collapsed into one optional slot (unlike Menu_item's `showLeftIcon`+`swapLeftIcon`→`iconLeft` collapse) — the non-standard `true` default makes an implicit collapse ambiguous (would `iconRight={null}` mean "hide" or "use the built-in default heart"?). Recommend keeping both explicit; flagged as a deliberate divergence from the Menu_item precedent, not an oversight. |
| `showImageTitle` | `showImageTitle` | `boolean` | `false` | Kept as-is. |
| `title` | `title` | `string` | `"Card title..."` | Only rendered when `showImageTitle=true`. |

Non-visual props, none of which exist in Figma:

- ✅ **`favorited: boolean`** (default `false`) + **`onFavoriteToggle: () => void`** — **confirmed 2026-07-20: the heart is a real favorite toggle.** ✅ **Resolved 2026-07-20: the filled/"favorited" visual is a plain Tabler icon swap** (`IconHeart` ↔ `IconHeartFilled`), not a missing design — implement directly, no Figma work needed.
- `alt` (or equivalent) for the underlying photo — required, not modeled in Figma (Figma never encodes accessibility metadata).

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Shadow` = `Shadow_top`/`Shadow_bottom`/`Shadow_overlay` | `shadow: 'top'\|'bottom'\|'overlay'` | Prefix cleanup, same rationale as every other axis rename in this doc set. |
| 2 | `showIconRight` independent of `iconRight` | Kept as two separate props (not collapsed) | The `true` default makes an implicit `null`-means-hide collapse ambiguous — see Props table note. |

## Tokens used

All values below are the **actual bound variables** read from Figma (`get_variable_defs` on `707:1164`, `get_design_context` on all 3 `Shadow` instances).

### Figma variable → `PT_tokens.md` token reference

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Neutral/500` | *(primitive, not a semantic token)* | `#a8c0c7` | ✅ **Accepted as-is, per your confirmation 2026-07-20.** Primitive used directly as the placeholder fill behind the photo before a real image loads — technically diverges from `PT_tokens.md` §4's "never use primitives directly in components" rule, but you've confirmed this is intentional, not a bug to fix. Documented as a deliberate, acknowledged exception (same treatment as Super Icon's manually-placed icon color) — not remapped to `surface-disabled` despite the matching hex. |
| `Overlay/Shadow_100` | `--pt-overlay-shadow-100` ✅ | `#657377` (= grey-700's value) | **Formalized 2026-07-20** in `PT_tokens.md` §7.10, per your confirmation. Used as the dark gradient stop on `Shadow_top`/`Shadow_bottom`, and as the flat tint on `Shadow_overlay`. |
| `Overlay/Shadow_0` | `--pt-overlay-shadow-0` ✅ | `#ffffff` (white) | **Formalized 2026-07-20** in `PT_tokens.md` §7.10. The light gradient stop. |
| `Opacity/50` | `--pt-opacity-50` ✅ | `50` (%) | **Formalized 2026-07-20** in `PT_tokens.md` §7.11, alongside Super Icon's `Opacity/85` (`--pt-opacity-85`). `Shadow_overlay`'s flat tint opacity. |
| `Colors/Border/Default` | `--pt-semantic-border-default` | `#f2f6f7` | ✅ **Verified correct, not a mismatch — caught and corrected during this doc's own verification pass.** The generated fallback (`#f2f6f7`) initially looked wrong against the *light-mode* value (`#222628`) documented everywhere else in this file, but it's an exact match for `border-default`'s **dark-mode** resolved value (`PT_tokens.md` §7.7). Category_chip sits on a photo and needs a light-toned border regardless of app theme — this specific instance was evidently sampled/authored against the dark-mode value, or the chip intentionally pins to it. Correctly bound; not a naming or value error. |
| `Colors/Typography/Body` *(Category_chip's label)* | `--pt-semantic-typography-body` | `#f2f6f7` | ✅ **Same verified-correct pattern as the border above** — `#f2f6f7` is `typography-body`'s dark-mode value (`PT_tokens.md` §7.4), not a mismatch. Same chip, same explanation. |
| `Colors/Typography/On_action` | `--pt-semantic-typography-on_action` | `#ffffff` | Image title text color. |
| `Colors/Shadow/Normal` | `--pt-semantic-shadow-normal` | `#a8c0c7` | Used both in the Shadow/Solid/Xs card elevation and in the image title's text-shadow (see below). |
| `Colors/Shadow/Light` | `--pt-semantic-shadow-light` | `#cbd9dd` | Card elevation shadow, second layer. |
| `Shadow/Solid/Xs` | `--pt-shadow-solid-xs` | `0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` | ⚠️ **First non-hover use of this token family in the doc set.** Every prior component applied `Solid/Xs`/`Sm` only on `:hover`; here it's the card's permanent resting elevation. Not a token problem, just a new usage pattern worth noting. |
| `Scale/3` | `--pt-scale-3` | `12px` | Corner radius. |
| `Scale/4` | `--pt-scale-4` | `16px` | Category_chip horizontal padding; action-icon inset from top/right edges. |
| `Scale/2` | `--pt-scale-2` | `8px` | Category_chip vertical padding; gap between action icons. |
| `Scale/1` | `--pt-scale-1` | `4px` | Category_chip internal icon↔label gap. |
| `Scale/15` | `--pt-scale-15` | `60px` | Category_chip corner radius (pill shape). Confirms `PT_tokens.md`'s scale.13–20 range exactly — no drift. |
| `Scale/3Quat` | `--pt-scale-3quat` | `3px` | Image title text-shadow offset. |
| `Scale/1Half` | `--pt-scale-1half` | `6px` | Image title text-shadow blur radius. |
| `Typography/Body Emphasis/Default` | Poppins, weight 700-styled/600-numeric ("SemiBold"), 16px/24px | — | Image title text style. |
| `Typography/Body Regular/Small` | Poppins Regular, 14px/20px | — | Category_chip label ("Filter text" placeholder). |

⚠️ **Icon color — not MCP-traceable.** Icons render as flattened `<img>` SVG assets in every sample (same limitation already documented for Button/Filter Chip/Map_pin/Menu_item's icons) — `Colors/Icon/On_action`, `Colors/Icon/Headings`, and `Colors/Icon/Action` all appear in the aggregate `get_variable_defs` dump but none is traceably bound to a specific icon in the generated code. Not guessed at.

**HARDCODED, confirmed:** icon pixel size (16px action icons, 16px category-chip icon) — not bound to a named size token. **7th confirmed instance of this exact gap** across the doc set (Button, Filter Chip, Eyebrow Highlight, Tags, Super Icon, Menu_item/Menu_sub-item, now Card_image).

### Per-variant token map

| `Shadow` | Gradient direction | Stop 1 | Stop 2 | Blend mode |
|---|---|---|---|---|
| `Shadow_top` | top → bottom | `Overlay/Shadow_100` @ 5% | `Overlay/Shadow_0` @ 39.9% | `multiply` |
| `Shadow_bottom` | top → bottom | `Overlay/Shadow_0` @ 60% | `Overlay/Shadow_100` @ 95% | `multiply` |
| `Shadow_overlay` | *(flat, no gradient)* | `Overlay/Shadow_100` @ `Opacity/50` (50%) uniform | — | `multiply` |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Shadow_top` | Dark top fading to clear | Default — supports category chip + action icons at the top. |
| `Shadow_bottom` | Clear fading to dark bottom | Supports a title baked into the image bottom. |
| `Shadow_overlay` | Flat 50%-tinted image | Supports both action icons at top *and* a title, simultaneously. |
| Heart: default (not favorited) | Outline heart | Resting state — the only state Figma actually shows. |
| Heart: `favorited` | ✅ **RESOLVED 2026-07-20: no new Figma variant needed.** Per your confirmation, the filled state is a plain icon swap — a solid-fill heart already exists in the Tabler library (`IconHeartFilled`, pairing with the outline default `IconHeart`). No design work required; implement as `favorited ? <IconHeartFilled /> : <IconHeart />`. No longer a roadmap item. |
| Heart: hover / focus / pressed | ⚠️ Not modeled anywhere in Figma. **Design system roadmap**, same gap as every other interactive icon in this doc set. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **Action icon (heart), confirmed interactive.** Render as `<button aria-pressed={favorited} aria-label={favorited ? "Remove from favorites" : "Add to favorites"}>`. Touch target is currently 16px — fails 44×44 badly (same gap already flagged repeatedly across this doc set, e.g. Button (Icon only) Small, Filter Chip); pad the hit area to at least 44×44 with the visible icon staying at its designed 16px, don't scale the icon itself up.
- ⚠️ **Nested-interactive-elements hazard, since the whole card is also confirmed clickable — see [Card_hero-image](#card_hero-image)/[Card_carousel](#card_carousel)'s Accessibility sections for the resolved pattern** (the heart button must never be nested inside the card's own link/button, and must stop click propagation so activating it doesn't also trigger card navigation).
- Photo requires real `alt` text describing the image content — always consumer-supplied, never a component default (same treatment as every other image-bearing slot in this doc set).
- ✅ **Category_chip, confirmed decorative 2026-07-20.** Render as a plain, non-interactive `<span>`/`<div>` — no `<button>` semantics, no click handler. `aria-hidden="true"` on the diamond icon inside it (redundant with the visible label text).
- Focus ring: not modeled. **Design system roadmap** (same gap as every interactive component in this doc set).

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Choose `Shadow_top` when showing the category chip and/or action icons without a baked-in title | Use `Shadow_top` for a variant that also shows `showImageTitle` — no gradient coverage at the bottom |
| Choose `Shadow_bottom` when the title is baked into the image and no chip/icons show | Choose `Shadow_bottom` while also showing the category chip — no gradient coverage at the top |
| Choose `Shadow_overlay` only when both chip/icons *and* title show together | Default to `Shadow_overlay` for every case "just to be safe" — it flattens contrast everywhere, not just where needed |
| Supply real `alt` text for the photo | Ship the `Neutral/500` placeholder fill in production without a real photo behind it |
| Stop click propagation on the heart button so it never triggers the card's own click/navigation | Nest the heart `<button>` inside the card's own `<a>`/`<button>` wrapper — see Card_hero-image/Card_carousel's Accessibility for the resolved pattern |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Missing/failed image load:** no fallback state modeled (does it keep showing `Neutral/500`, or something else?).
- **Long `Filter text` overflow** in the category chip: not modeled (single short sample only); the chip has no `max-width` or truncation class in the generated code.
- **Aspect ratio / cropping** of the actual photo: not modeled — Figma's placeholder is a flat fill, not a real image, so cropping behavior (`object-fit: cover` vs. `contain`) is unconfirmed.
- **`showCategory` + `showImageTitle` + `showIconLeft` + `showIconRight` all `true` simultaneously:** not sampled in any of the 3 pulled instances — layout collision risk (category chip and title both anchor near the edges, likely fine, but not visually verified together).

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { CardImage } from '@/components/CardImage';

{/* Shadow_top — category chip (decorative) + favorite toggle, no title */}
<CardImage
  shadow="top"
  showCategory
  showIconRight
  iconRight={favorited ? <IconHeartFilled /> : <IconHeart />}
  favorited={favorited}
  onFavoriteToggle={() => setFavorited((f) => !f)}
  src={photoUrl}
  alt="Sunset over the harbor"
/>

{/* Shadow_bottom — title baked into the image, no chip/icons */}
<CardImage shadow="bottom" showImageTitle title="Coastal Walking Tour" showIconRight={false} src={photoUrl} alt="…" />

{/* Shadow_overlay — both chip/icons and title */}
<CardImage shadow="overlay" showCategory showIconRight showImageTitle title="Mountain Trek" src={photoUrl} alt="…" />
```

## Open questions — what needs your confirmation

1. ~~Is the heart action icon interactive?~~ — **RESOLVED 2026-07-20: yes, favorite/save toggle.** ~~No filled/"favorited" heart variant exists in Figma~~ — **RESOLVED 2026-07-20: not a design gap, it's a plain Tabler icon swap** (`IconHeart` ↔ `IconHeartFilled`). No Figma work needed.
2. ~~Category_chip — clickable filter trigger, or purely decorative label?~~ — **RESOLVED 2026-07-20: decorative.** No `<button>` semantics needed — render as a plain, non-interactive label; `aria-hidden` the diamond icon inside it.
3. ~~Category_chip's border/label dark-mode pin~~ — **RESOLVED 2026-07-20: intentional**, confirmed by you — pinned to the dark-mode value on purpose, for visibility against the image/shadow overlay regardless of app theme.
4. ~~`Neutral/500` as the placeholder fill~~ — **RESOLVED 2026-07-20: accept as-is**, no new semantic token needed.
5. ~~New `Overlay` token category and second `Opacity` value~~ — **RESOLVED 2026-07-20: formalized**, per your confirmation. Now real, named tokens: `--pt-overlay-shadow-0`, `--pt-overlay-shadow-100` (`PT_tokens.md` §7.10), `--pt-opacity-50` (§7.11, alongside Super Icon's `--pt-opacity-85`).
6. ✅ Component code path convention **RESOLVED 2026-07-20: flat**, e.g. `src/components/CardImage.tsx` — see `MD_progress.md` entry 29. Exact path still pending your tech lead plugging in the real project root.

---

# Card_hero-image

> Figma node: `Card_hero-image` — parent frame `704:1132`, two variant instances: `Type=Image+card` (`696:2160`), `Type=Image_only` (`704:1133`).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1164
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/CardHeroImage.tsx]`
> Last updated: 2026-07-20
> Status: 🟡 Verified against Figma via MCP. Items marked ⚠️ need a human decision.

## Description

✅ **One of the 2 macro Card components** (confirmed 2026-07-20 — see [Card_image](#card_image)'s "Family structure" note). A large, featured card. Composes a nested [Card_image](#card_image) instance (micro/reusable, not Card-exclusive) with a content slot below or overlapping it. Two layouts: **`Image+card`** — a `Shadow_top`-treated image on top, plus a white, intrinsic-height content panel below it (for arbitrary content — [Text Block](#text-block) and [Ratings](#ratings), both micro/reusable, are the examples shown in the docs frame, but the slot itself accepts any `ReactNode`); **`Image_only`** — the entire card is the image (`Shadow_bottom`-treated), with **either** a baked-in `title` **or** a `children` content slot near the bottom — ✅ **confirmed 2026-07-20: mutually exclusive**, not simultaneous.

✅ **Confirmed 2026-07-20: the whole card is clickable** (navigates to a details view), *and* the nested heart icon is independently interactive (see [Card_image](#card_image)) — meaning this component has two real, overlapping interactive targets. See Accessibility for the resolved interaction pattern (a "stretched link" over the whole card, with the heart button living outside it and stopping click propagation).

## Variant axes

**2 variants** (enumerated via `get_metadata`).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Type` | `Image+card` · `Image_only` | 2 |

### Variant math (axes multiplied vs. actual)

```
2 (Type) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Type` | `type` | `'image_card' \| 'image_only'` | `'image_card'` | `Image+card`'s literal `+` character isn't code-safe — sanitized to `image_card`, same rationale as every other axis-value cleanup in this doc set. |
| *(no Figma property — inferred slot)* | `children` | `ReactNode` | — | The "Content _slot" layer (note the stray space in Figma's own layer name — cosmetic quirk, see Cross-component consistency check) has no backing component property; treated as a children slot the same way Filter Chip/Menu_item's content areas are, not a literal Figma-derivable prop. ✅ **On `Image_only` specifically: mutually exclusive with `title`** — see below. |
| `title` (pass-through to Card_image) | `title` | `string` | `"Card title..."` | Only meaningful on `Image_only` (the baked-in image title). ✅ **RESOLVED 2026-07-20: mutually exclusive with `children` on `Image_only`** — pass one or the other, never both, for that bottom region. See Edge cases. |

⚠️ **Card_image's broader prop surface (category chip, action icons) is still not independently exposed** in the sampled code — only `title` is confirmed to pass through (per the resolution above); the rest render with fixed defaults (only `showIconRight=true`). See Open questions.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Type` = `Image+card`/`Image_only` | `type: 'image_card'\|'image_only'` | `+` isn't a valid identifier character. |
| 2 | No component property backs the content area | `children: ReactNode` | Inferred slot, same treatment as other components' content areas. |

## Tokens used

Reuses [Card_image](#card_image)'s tokens exactly for the embedded image (`Shadow_top` on `Image+card`, `Shadow_bottom` on `Image_only`) — not re-documented here. New tokens specific to this component:

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | Content panel background, `Image+card` only. |
| `Scale/3` | `--pt-scale-3` | `12px` | Content panel corner radius (matches the image's own radius, for the seamless overlap effect below). |

⚠️ **Negative-margin overlap, easy to lose in a rebuild.** `Image+card`'s embedded image carries `margin-bottom: -12px`, causing its rounded bottom corners to sit fractionally over the white content panel's rounded top corners — an intentional layered visual technique, not a spacing bug. Reproduce exactly, don't "clean up" the negative margin.

✅ **Content panel height — RESOLVED 2026-07-20: intrinsic/auto.** Per your confirmation, neither `Image+card`'s content panel nor `Image_only`'s content slot should be pinned to Figma's docs-sample values (184px / 100px) — both grow to fit whatever content is passed in. Don't hardcode either number into the component.

## States

✅ Confirmed clickable (whole card) — no hover/pressed/focus **visual** exists in Figma for this state, though. **Design system roadmap**: add a hover/pressed treatment for the clickable card surface (e.g. a subtle elevation/scale bump), same placeholder-CSS approach used elsewhere in this doc set for undesigned hover states.

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **Nested-interactive-elements hazard — confirmed real, resolved with the "stretched link" pattern.** Both the whole card and the heart icon are confirmed interactive (see Card_image), so a naive implementation (heart `<button>` nested inside a card-wide `<a>`/`<button>`) is invalid HTML and breaks keyboard/screen-reader navigation. Recommended structure:
  ```
  <article style="position: relative">
    <a href={detailsUrl} class="stretched-link" aria-label={title}>
      {/* image + baked-in title, if any — the link's accessible name comes from aria-label, not visible text duplication */}
    </a>
    <button
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      style="position: relative; z-index: 1"
      onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
    >
      <HeartIcon />
    </button>
    {/* rest of card content, e.g. Text Block / Ratings — not inside the link */}
  </article>
  ```
  The card-wide link is stretched to fill the `<article>` via CSS (`::after` pseudo-element with `position: absolute; inset: 0`) rather than wrapping all visible content in the `<a>` itself — this keeps the heart button a sibling, not a descendant, of the link, so there's no invalid nesting. The heart sits above the stretched link (`z-index`) and stops propagation on click so tapping it doesn't also trigger navigation. This is a standard, well-established pattern for "clickable card with an independent action icon," not a novel invention — but the exact framework wiring is an engineering decision for the tech lead.
- Touch target: heart icon still 16px — pad the hit area to 44×44, same gap as every other icon-only affordance in this doc set.
- Image `alt` text: consumer-supplied, required (see Card_image). When the card-wide link is present, keep the image `alt=""` (decorative) and put the real accessible name on the link's `aria-label` instead, to avoid the name being announced twice.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `Image+card` when there's substantial content to show below the photo | Use `Image+card` for a photo-only tile — that's what `Image_only` is for |
| Use `Image_only` for a compact, image-forward tile with a short title | Cram a full Text Block into `Image_only`'s tight content slot without checking for overlap with the baked-in title |
| Preserve the `-12px` negative-margin overlap on `Image+card` | "Fix" the negative margin — it's an intentional layered effect |
| On `Image_only`, pass either `title` or `children`, never both | Pass both `title` and `children` to `Image_only` expecting them to stack or coexist — they're mutually exclusive |

## Edge cases

- ~~`Image_only`'s baked-in title overlay and its separate floating content slot both occupy the bottom region~~ — **RESOLVED 2026-07-20: mutually exclusive**, per your direction. Pass `title` or `children`, never both — no visual-collision case to handle.
- ~~Content panel height~~ — **RESOLVED 2026-07-20: intrinsic/auto**, not fixed. See Tokens used.
- Image loading/error fallback: not modeled (same gap as Card_image). Still open.

## Code example

⚠️ Illustrative only.

```tsx
import { CardHeroImage } from '@/components/CardHeroImage';
import { TextBlock } from '@/components/TextBlock';
import { Ratings } from '@/components/Ratings';

<CardHeroImage
  type="image_card"
  href="/tours/coastal-walking-tour"
  title="Coastal Walking Tour"
  favorited={isFavorited}
  onFavoriteToggle={() => toggleFavorite(tourId)}
>
  <TextBlock title="Coastal Walking Tour" bodyCopy="Lorem ipsum dolor sit amet consectetur" />
  <Ratings rating={4.7} />
</CardHeroImage>

<CardHeroImage type="image_only" href="/tours/mountain-trek" title="Mountain Trek" favorited={false} onFavoriteToggle={...} />
{/* OR, mutually exclusive with title on image_only: */}
<CardHeroImage type="image_only" href="/tours/mountain-trek" favorited={false} onFavoriteToggle={...}>
  <Ratings size="small" rating={4.9} />
</CardHeroImage>
```

## Open questions — what needs your confirmation

1. ~~Whole-card click behavior + nested-heart-icon interaction model~~ — **RESOLVED 2026-07-20: both confirmed interactive.** Resolved with the "stretched link" pattern — see Accessibility.
2. **Should Card_image's broader prop surface (category chip, action icons) pass through `CardHeroImage`**, or stay fixed/simplified as currently modeled (only the default heart icon shows)? `title` is now confirmed to pass through (see Props) — this question narrows to just category chip/icons. Still open.
3. ~~`Image_only`: how do the baked-in title overlay and the floating content slot coexist?~~ — **RESOLVED 2026-07-20: mutually exclusive**, per your direction.
4. ~~Content panel height~~ — **RESOLVED 2026-07-20: intrinsic/auto.**
5. **No hover/pressed visual exists for the now-confirmed clickable card surface** — new item, route to Design system roadmap unless you want to specify one now.
6. ✅ Component code path convention **RESOLVED 2026-07-20: flat**, e.g. `src/components/CardHeroImage.tsx` — see `MD_progress.md` entry 29. Exact path still pending your tech lead plugging in the real project root.

---

# Card_carousel

> Figma node: `Card_carousel` — parent frame `704:1059`, two variant instances: `Type=Left_content` (`700:2362`), `Type=Bottom_content` (`704:1060`).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1164
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/CardCarousel.tsx]`
> Last updated: 2026-07-20
> Status: 🟡 Verified against Figma via MCP. Items marked ⚠️ need a human decision.

## Description

✅ **The other of the 2 macro Card components** (confirmed 2026-07-20 — see [Card_image](#card_image)'s "Family structure" note). A compact card for horizontal-scrolling/carousel contexts. Composes a nested [Card_image](#card_image) instance (micro/reusable, not Card-exclusive) — **always `Shadow_top`, not configurable at this level** (unlike Card_hero-image, which varies its embedded shadow by `type`) — with a content slot. Two layouts: **`Left_content`** — a square image on the left (height fills the container, width follows via `aspect-square`) with content to its right; **`Bottom_content`** — a full-width square image on top, with content stacked below.

✅ **Confirmed 2026-07-20: same as Card_hero-image** — the whole card is clickable, and the heart icon is independently interactive. Same "stretched link" resolution applies — see [Card_hero-image](#card_hero-image)'s Accessibility section.

## Variant axes

**2 variants** (enumerated via `get_metadata`).

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Type` | `Left_content` · `Bottom_content` | 2 |

### Variant math (axes multiplied vs. actual)

```
2 (Type) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Type` | `type` | `'left_content' \| 'bottom_content'` | `'left_content'` | Lowercased/snake-cased for code-facing consistency with every other renamed enum in this doc set. |
| *(inferred slot)* | `children` | `ReactNode` | — | Same inferred-slot treatment as Card_hero-image; Figma shows an empty 120×185px placeholder div when no content is present — almost certainly an authoring artifact, not a real empty-state design. |

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Type` = `Left_content`/`Bottom_content` | `type: 'left_content'\|'bottom_content'` | Casing consistency only — values themselves need no other cleanup. |

## Tokens used

Reuses [Card_image](#card_image)'s `Shadow_top` tokens exactly (see that section) — Card_carousel never exposes a `shadow` choice.

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Scale/4` | `--pt-scale-4` | `16px` | Gap between the image and the content slot. |
| `Scale/3` | `--pt-scale-3` | `12px` | Internal content-slot gap. |

Sizing: `Left_content`'s image is `aspect-square`, height driven by the container (`h-full` — width follows via the aspect ratio, so it's not independently settable); docs sample renders at ~120×120px. `Bottom_content`'s image is `aspect-square`, full width; docs sample renders at ~185×185px. Both are consumer/container-controlled sizes, **not** fixed tokens — same caveat as Card_image's own sizing.

## States

✅ Confirmed clickable, same as Card_hero-image. No hover/pressed visual designed in Figma — **Design system roadmap**.

## Accessibility

Same nested-interactive-elements hazard as [Card_hero-image](#card_hero-image), same "stretched link" resolution — see that section for the full pattern, not re-explained here. Touch target: same 16px heart-icon gap, same fix (pad hit area to 44×44).

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `Left_content` for a wide/landscape carousel row item | Use `Left_content` when the surrounding container can't guarantee a consistent height — the image's width derives from it |
| Use `Bottom_content` for a taller, portrait-oriented carousel tile | Expect a `shadow` prop here — it's fixed to `Shadow_top` by design |

## Edge cases

- **Left_content's image width is fully derived from container height** (via `aspect-square` + `h-full`) — if the surrounding row has inconsistent heights, image widths will vary unexpectedly. Flag for whoever builds the carousel container.
- Empty content-slot placeholder (120×185px div): treat as a Figma authoring artifact, not a real empty state to replicate.

## Code example

⚠️ Illustrative only.

```tsx
import { CardCarousel } from '@/components/CardCarousel';
import { TextBlock } from '@/components/TextBlock';

<CardCarousel type="left_content">
  <TextBlock property1="title_body" title="Desert Safari" bodyCopy="Half-day guided tour" />
</CardCarousel>
```

## Open questions — what needs your confirmation

1. ~~Whole-card click model~~ — **RESOLVED 2026-07-20**, same as Card_hero-image — see that section's Accessibility for the "stretched link" pattern.
2. **Confirm hardcoding `Shadow_top` (never `Shadow_bottom`/`Shadow_overlay`) is intentional** — carousel cards never show a baked-in title in the sampled instances, which would explain why the other two shadow treatments don't apply here, but this wasn't explicitly stated anywhere in Figma. Still open.
3. ✅ Component code path convention **RESOLVED 2026-07-20: flat**, e.g. `src/components/CardCarousel.tsx` — see `MD_progress.md` entry 29. Exact path still pending your tech lead plugging in the real project root.

---

# Text Block

> Figma node: `Text Block` — parent frame `703:991`, four variant instances: `Property 1=Default` (`696:2092`), `Property 1=Title+body` (`703:992`), `Property 1=Title+eyebrow` (`703:1000`), `Property 1=Eyebrow+body` (`703:1008`).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1164
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/TextBlock.tsx]`
> Last updated: 2026-07-20
> Status: 🟡 Verified against Figma via MCP. Items marked ⚠️ need a human decision.

## Description

✅ **A micro/reusable component, not exclusive to Card** (confirmed 2026-07-20 — see [Card_image](#card_image)'s "Family structure" note): an optional "eyebrow" tag, an optional title, and optional body copy, in various combinations. Shown filling the two Card macros' ([Card_hero-image](#card_hero-image), [Card_carousel](#card_carousel)) content slots in the documentation examples, but is a standalone primitive usable anywhere — the slots themselves accept any `ReactNode`, so Text Block is a common filler, not a structural requirement of either Card macro.

✅ **Confirmed real composition, not just visual similarity.** The eyebrow tag is a genuine nested instance of the already-documented [Eyebrow Highlight](#eyebrow-highlight) component — token-for-token identical bindings (`Colors/Surface/Error` + `Colors/Border/Error` + `Colors/Typography/Error`, matching Eyebrow Highlight's `State=Error` in its soft/tinted emphasis). First confirmed instance in this doc set of one documented component embedding another's actual implementation, not just a sibling/nesting relationship (contrast with Menu_sub-item, which sits *next to* Menu_item, not *inside* it).

⚠️ **Interactivity not independently confirmed for Text Block itself.** Inferred non-interactive by precedent (Eyebrow Highlight and Tags are both confirmed static), but that inference has been wrong before in this doc set (Super Icon assumed interactive from naming and wasn't; Menu_item was assumed unconfirmed and turned out to be click-driven) — flagged as inferred-not-verified rather than silently assumed. See Open questions.

## Variant axes

**4 variants** (enumerated via `get_metadata`).

⚠️ Same un-renamed axis-name gap as Menu_item/Menu_sub-item: still literally `Property 1`, not renamed to something descriptive like `Content`.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Property 1` | `Default` · `Title+body` · `Title+eyebrow` · `Eyebrow+body` | 4 |

### Variant math (axes multiplied vs. actual)

The underlying structure is 3 independent, optional content elements (eyebrow tag / title / body copy) → **2³ = 8 theoretical boolean combinations.** Figma names and builds only **4**, all requiring at least 2 of the 3 elements:

| # | Eyebrow | Title | Body | Figma variant | Built in Figma? |
|---|---|---|---|---|---|
| 1 | ✗ | ✗ | ✗ | — | ❌ excluded (empty) |
| 2 | ✗ | ✗ | ✓ | — | ❌ excluded (body-only) |
| 3 | ✗ | ✓ | ✗ | — | ❌ excluded (title-only) |
| 4 | ✗ | ✓ | ✓ | `Title+body` | ✅ |
| 5 | ✓ | ✗ | ✗ | — | ❌ excluded (eyebrow-only) |
| 6 | ✓ | ✗ | ✓ | `Eyebrow+body` | ✅ |
| 7 | ✓ | ✓ | ✗ | `Title+eyebrow` | ✅ |
| 8 | ✓ | ✓ | ✓ | `Default` | ✅ |

```
2³ (Eyebrow × Title × Body) = 8 theoretical
Actual component count       = 4
Excluded                     = 4 (empty, body-only, title-only, eyebrow-only)
```

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Property 1` | `property1` | `'default' \| 'title_body' \| 'title_eyebrow' \| 'eyebrow_body'` | `'default'` | ⚠️ **Ship with Figma's literal 4-value enum for now — decomposing into 3 independent props is deferred to the Design system roadmap, per your direction 2026-07-20**, not a blocking decision. Values snake_cased for code-safety (`+` isn't a valid identifier character), same rationale as every other axis-value cleanup in this doc set. |
| `title` | `title` | `ReactNode` | — (optional, present on `default`/`title_body`/`title_eyebrow`) | |
| `bodyCopy` | `bodyCopy` | `ReactNode` | — (optional, present on `default`/`title_body`/`eyebrow_body`) | |
| *(eyebrow tag, present on `default`/`title_eyebrow`/`eyebrow_body`)* | `eyebrowText` | `string` | `"Important"` | ⚠️ Fixed sample copy in every instance — unconfirmed whether this should be freely configurable text, or the eyebrow's *state*/*emphasis* (error/soft, reused from Eyebrow Highlight) should also be exposed, or both are fixed to this one "flagged/important" use case. |

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Property 1` = `Default`/`Title+body`/`Title+eyebrow`/`Eyebrow+body` | `property1: 'default'\|'title_body'\|'title_eyebrow'\|'eyebrow_body'` | Casing/character cleanup only — kept as Figma's literal 4-value enum, not decomposed (deferred, see Open questions #1). |
| 2 | *(future, deferred)* Decompose into `showEyebrow`/`title`/`bodyCopy` independent optional props | Not implemented yet | Would allow 4 more combinations Figma never designed (title-only, body-only, eyebrow-only, empty) — revisit later per the Design system roadmap. |

## Tokens used

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Headings` | `--pt-semantic-typography-headings` | `#222628` | Title color. |
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Body copy color. Resolves identically to Headings in light mode today, despite the two different semantic roles — same "different variable, same value" pattern already flagged elsewhere (Menu_item/Menu_sub-item's line-height reference difference) — not a bug. |
| `Colors/Surface/Error` | `--pt-semantic-surface-error` | `#f7dada` | Eyebrow tag background — matches Eyebrow Highlight's `State=Error` exactly. |
| `Colors/Border/Error` | `--pt-semantic-border-error` | `#efb5b5` | Eyebrow tag border — matches Eyebrow Highlight's `State=Error` exactly. |
| `Colors/Typography/Error` | `--pt-semantic-typography-error` | `#802929` | Eyebrow tag label + icon color — matches Eyebrow Highlight's `State=Error` exactly. |
| `Typography/Body Emphasis/Default` | Poppins SemiBold(700-styled)/16px/24px | — | Title. |
| `Typography/Body Regular/Default` | Poppins Regular/16px/24px | — | Body copy. |
| `Typography/Body Regular/XSmall` | Poppins Regular/12px/16px | — | Eyebrow tag label. |
| `Scale/1` | `--pt-scale-1` | `4px` | Eyebrow↔title gap within the header group. |
| `Scale/3` | `--pt-scale-3` | `12px` | ✅ Header→body gap on **all** variants that have both — `Default`, `Title+eyebrow`'s header group, and now `Title+body` too. **RESOLVED 2026-07-20 and re-verified live via `get_design_context` on `703:992`:** you fixed `Title+body`'s gap in Figma from `Scale/2` (8px) to `Scale/3` (12px), matching `Default` — confirmed, the generated code now reads `gap-[var(--scale/3,12px)]` where it previously read `--scale/2,8px`. No longer an inconsistency. |

Icon: eyebrow tag uses the "diamond" placeholder at 12px, same as every prior Eyebrow-Highlight-derived instance in this doc set — consistent, not a new gap.

**HARDCODED, confirmed:** icon pixel size (12px) not bound to a named size token — 8th confirmed instance of the file-wide gap.

### Per-variant token map

| `Property 1` | Eyebrow shown? | Title shown? | Body shown? | Header→body gap |
|---|---|---|---|---|
| `Default` | ✓ | ✓ | ✓ | `Scale/3` (12px) |
| `Title+body` | ✗ | ✓ | ✓ | `Scale/3` (12px) ✅ fixed 2026-07-20, was `Scale/2` (8px) |
| `Title+eyebrow` | ✓ | ✓ | ✗ | — |
| `Eyebrow+body` | ✓ | ✗ | ✓ | `Scale/3` (12px) |

## States

Inferred non-interactive by precedent (Eyebrow Highlight, Tags) — **not independently reconfirmed for Text Block itself.** See Description and Open questions.

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Title should render as an appropriately-leveled heading element — exact level (h3/h4/etc.) depends on the surrounding page's heading hierarchy, not a fixed component default.
- Body copy as a plain `<p>`.
- Eyebrow tag: inherits Eyebrow Highlight's own accessibility notes (see that section) — decorative icon, `aria-hidden` unless it conveys unique meaning beyond the adjacent text.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `Default` when you have all three elements (eyebrow, title, body) | Assume all 8 boolean combinations are validated — only 4 are Figma-confirmed |
| Keep the eyebrow tag's error/soft styling when reusing "Important"-style flags | Repurpose the eyebrow slot for a different Eyebrow Highlight state without confirming that's intended |

## Edge cases

- **Long title/body wrapping:** `[word-break:break-word]` is present in the generated classes, suggesting wrapping is allowed — not confirmed against a genuinely long string.
- **The 4 unbuilt combinations** (title-only, body-only, eyebrow-only, empty) — if the props are decomposed as recommended, these become reachable in code with no Figma precedent for how they should look. Recommend explicit confirmation before shipping, rather than assuming graceful degradation is fine.

## Code example

⚠️ Illustrative only.

```tsx
import { TextBlock } from '@/components/TextBlock';

<TextBlock
  property1="default"
  eyebrowText="Important"
  title="Title text"
  bodyCopy="Lorem ipsum dolor sit amet consectetur"
/>

<TextBlock property1="title_body" title="Title text" bodyCopy="Lorem ipsum dolor sit amet consectetur" />
```

## Open questions — what needs your confirmation

1. **Decompose into 3 independent props, or keep Figma's 4-value enum?** ⚠️ **Deferred 2026-07-20, per your direction — moved to the Design system roadmap in `MD_progress.md`, not blocking.** Ship with Figma's literal 4-value `property1` enum for now (the safe, Figma-confirmed default); revisit the decomposition + the 4 unbuilt combinations' behavior later.
2. **Is the eyebrow tag's copy and state/emphasis meant to be fully configurable**, or fixed to this one "Important"/error-soft use case? Still open.
3. ~~12px vs. 8px header-to-body gap inconsistency~~ — **RESOLVED 2026-07-20 and re-verified live via MCP.** You fixed it in Figma; `Title+body` now uses `Scale/3` (12px) everywhere, matching `Default`.
4. **Confirm Text Block is genuinely non-interactive** — currently inferred from Eyebrow Highlight/Tags precedent, not independently verified for this component.
5. ✅ Component code path convention **RESOLVED 2026-07-20: flat**, e.g. `src/components/TextBlock.tsx` — see `MD_progress.md` entry 29. Exact path still pending your tech lead plugging in the real project root.

---

# Ratings

> Figma node: `Ratings` — parent frame `693:1807`, two variant instances: `Property 1=Default` (`693:1808`), `Property 1=Small` (`693:1825`).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-1164
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Ratings.tsx]`
> Last updated: 2026-07-20
> Status: 🟡 Verified against Figma via MCP. Items marked ⚠️ need a human decision.

## Description

✅ **A micro/reusable component, not exclusive to Card** (confirmed 2026-07-20 — see [Card_image](#card_image)'s "Family structure" note): a star-rating display, a 5-star graphic plus a numeric value label. Shown as a content-slot filler alongside Text Block in the documentation examples, same non-structural, standalone-primitive relationship to the two Card macros as Text Block itself.

⚠️ **The 5-star graphic is a single flattened image asset in Figma** (`imgGroup1000003616`), not a real, decomposable star-rating primitive. It cannot be reverse-engineered into individual per-star fill states via MCP. See Tokens used and Open questions.

✅ **Confirmed 2026-07-20: always read-only display**, never an interactive input. Matches the "no interaction states modeled" signal from Figma.

## Variant axes

**2 variants** (enumerated via `get_metadata`).

⚠️ Same un-renamed `Property 1` axis-name gap as Text Block/Menu_item/Menu_sub-item — the 3rd/4th instance now confirmed within this single Card-family pull.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Property 1` | `Default` · `Small` | 2 |

### Variant math (axes multiplied vs. actual)

```
2 (Property 1) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

Recommend code prop name `size: 'default'|'small'` — consistent direction with the already-unified `Large`/`Medium`/`Small` sizing convention (Checkbox/Radio Button/Toggle), though Ratings only has 2 of the 3 tiers.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `Property 1` | `size` | `'default' \| 'small'` | `'default'` | Same axis-rename rationale as every other un-renamed `Property 1` axis in this doc set. |
| `rating` | `rating` | `number` | — (⚠️ required? see Open questions) | Retyped from Figma's raw `string` ("4.7") to `number`, formatted at render time — same rationale as Menu_item's `count` retype. |

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Property 1` = `Default`/`Small` | `size: 'default'\|'small'` | Same rename rationale as every other `Property 1` axis. |
| 2 | `rating` as text property (`string`) | `rating: number` | The value is numeric; formatting (decimal places, etc.) is a render-time concern, not a storage-type one. |

## Tokens used

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Rating-value label color, both sizes. |
| `Typography/Body Regular/Default` | Poppins Regular/16px/24px | — | Label text style, `Default` size. |
| `Typography/Body Regular/Small` | Poppins Regular/14px/20px | — | Label text style, `Small` size. |
| `Scale/2` | `--pt-scale-2` | `8px` | Gap between the star graphic and the label, both sizes. |

✅ **Star color — RESOLVED 2026-07-20, per your direction.** The Figma asset is a flattened image with no traceable binding, but you've specified the intended tokens for a real (non-flattened) star implementation: **fill = `Colors/Surface/Action` / `--pt-semantic-surface-action`**, **stroke = `Colors/Icon/Action` / `--pt-semantic-icon-action`**. Both resolve to the identical hex in both themes (`#5d9c4d` light / `#7db071` dark — confirmed against `PT_tokens.md` §7.5/§7.6), but they're semantically distinct roles (fill vs. stroke), so bind both separately rather than using one token for the whole star. This confirms the star should be built as a real two-tone SVG shape (filled body + stroked outline), not a flat single-color icon.

**HARDCODED, confirmed:** star-graphic pixel dimensions (`Default` ≈91.24×16px, `Small` ≈76.99×13.76px) — non-round values from a flattened image export, not driven by any token. 9th confirmed instance of the icon/asset-size-not-token-bound gap pattern (though this one is a compound graphic, not a single icon).

## States

✅ **Confirmed 2026-07-20: read-only display only, no interactive/input state.** Only two visual states exist: `Default` and `Small` (sizing, not interaction).

## Accessibility

Required section — Figma encodes no accessibility metadata.

- **Needs a full accessible-name alternative**, e.g. `aria-label="4.7 out of 5 stars"` — the star graphic itself is a flattened image with no inherent semantic meaning to assistive tech, and shouldn't rely on the adjacent visible numeral alone for programmatic association.
- ✅ Confirmed read-only — no `radiogroup`/slider semantics needed, a static `<div role="img" aria-label="…">` (or `<span>` with the same aria-label) around the graphic+numeral pair is sufficient.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Build a real star-rating renderer driven by the numeric `rating` value | Try to reverse-engineer partial-star-fill logic from Figma's flattened image asset |
| Provide a text alternative summarizing the rating | Rely on the visible numeral alone for accessibility |
| Bind fill to `surface-action` and stroke to `icon-action` separately | Use a single flat-fill icon/color for the star — the design is a two-tone (filled + stroked) shape |

## Edge cases

- **Values outside 0–5:** not modeled — clamp/validate range unconfirmed.
- **Decimal formatting:** sample shows one decimal place (`4.7`) in both sizes — unconfirmed whether this is always exactly 1 decimal (e.g. would an integer rating show `"4.0"` or `"4"`?).
- **Empty/no-ratings-yet state:** not modeled.

## Code example

⚠️ Illustrative only.

```tsx
import { Ratings } from '@/components/Ratings';

{/* Star shape: fill = var(--pt-semantic-surface-action), stroke = var(--pt-semantic-icon-action) */}
<Ratings size="default" rating={4.7} />
<Ratings size="small" rating={4.7} />
```

## Open questions — what needs your confirmation

1. ~~Is Ratings ever an interactive input?~~ — **RESOLVED 2026-07-20: no, always read-only.**
2. ~~Star fill color~~ — **RESOLVED 2026-07-20: fill = `surface-action`, stroke = `icon-action`**, per your direction. See Tokens used.
3. **Is `rating` required?** Does it have a sensible empty/zero state, or should the component simply not render without one? Still open.
4. **Decimal formatting rule** — always 1 decimal place? Still open.
5. ✅ Component code path convention **RESOLVED 2026-07-20: flat**, e.g. `src/components/Ratings.tsx` — see `MD_progress.md` entry 29. Exact path still pending your tech lead plugging in the real project root.

---

## Cross-component consistency check (Card family)

Comparing the 5 new Card-family components — [Card_image](#card_image), [Card_hero-image](#card_hero-image), [Card_carousel](#card_carousel), [Text Block](#text-block), [Ratings](#ratings) — against each other and against all 12 previously documented components (Button, Button (Icon only), Filter Chip, Eyebrow Highlight, Tags, Super Icon, Map_pin, Checkbox, Radio Button, Toggle, Menu_item, Menu_sub-item). Pulled live via MCP 2026-07-20.

1. **Largest "wrapper of instances" bundle documented so far — and the first with a confirmed macro/micro tier structure, not just a flat list of siblings.** The given node (`707:1164`, `Card_light`) turned out to contain **5 distinct components**, not 1 — more than any prior bundle (previous max was 2: Checkbox/Radio Button/Toggle documented as 3 separate siblings sharing a wrapper pattern; Menu_item/Menu_sub-item as 2). ✅ **Per your confirmation 2026-07-20:** these 5 aren't peers — **Card_hero-image and Card_carousel are the macro ("Card") components**; **Card_image, Text Block, and Ratings are micro/reusable components, not exclusive to Card**, shown here only because the two macros happen to use them. Documented as 5 separate `#` sections per your standing instruction, with the tier distinction now noted throughout rather than presenting all 5 as equal "Card family" siblings.
2. **First confirmed instance of one documented component embedding another's actual implementation**, not just sitting near it. Text Block's eyebrow tag is a real nested instance of Eyebrow Highlight (`State=Error`, soft/tinted emphasis) — confirmed via token-for-token identical bindings (`Surface/Error` + `Border/Error` + `Typography/Error`), not inferred from visual similarity alone. Previously, composition was inferred structurally (e.g., "Menu_sub-item is nested under Menu_item") but never traced to shared token bindings this precisely.
3. **`Property 1` — the un-renamed Figma default axis name — confirmed a 3rd and 4th time** (Text Block, Ratings), joining Menu_item/Menu_sub-item. No longer an isolated quirk; a recurring authoring habit across at least 4 components now.
4. **New "Overlay" token category — found, then formalized.** `Overlay/Shadow_0` (white) and `Overlay/Shadow_100` (`#657377`, same hex as grey-700 but a distinct bound variable, not an alias) drive all three of Card_image's gradient/flat overlay treatments. ✅ **RESOLVED 2026-07-20:** added to `PT_tokens.md` §7.10 as `--pt-overlay-shadow-0`/`--pt-overlay-shadow-100`, per your confirmation.
5. **`Opacity` token gap — found twice, then formalized.** `Opacity/50` (Card_image's `Shadow_overlay`) joined Super Icon's `Opacity/85` as two real, bound percentage values with no formal category. ✅ **RESOLVED 2026-07-20:** both added to `PT_tokens.md` §7.11 as `--pt-opacity-50`/`--pt-opacity-85`.
6. **A primitive token (`Neutral/500`) used directly as a component background — a first in this doc set.** Every prior primitive-in-a-component finding was `PT_tokens.md` §4's rule being followed correctly elsewhere; this is the first confirmed violation, on Card_image's placeholder fill. Coincidentally identical to `--pt-semantic-surface-disabled`'s primitive reference, but the two are different semantic roles — flagged, not silently remapped.
7. **Initial "Category_chip token mismatch" finding corrected during this same pass — worth noting as a caution about verifying against `PT_tokens.md` before flagging drift.** The generated fallback (`#f2f6f7`) looked wrong against `Border/Default`/`Typography/Body`'s light-mode value (`#222628`), but cross-checking `PT_tokens.md` §7.4/§7.7 shows `#f2f6f7` is exactly those tokens' correct **dark-mode** value. Not a naming/binding error — the chip is properly bound, likely intentionally pinned to the dark-mode value for legibility against photos regardless of app theme (worth confirming that's deliberate, not a genuine open item about a wrong binding).
8. **First text-shadow usage in the doc set**, distinct from the established `Gradient`/`Solid`/`Bottom_sheet` box-shadow families. Card_image's `Image_title` text uses a manually-composed text-shadow from raw primitives (`Scale/3Quat`, `Scale/1Half`, `Colors/Shadow/Normal`) rather than a named shadow-effect token — a new, unnamed pattern worth a token-name proposal if it recurs.
9. **First non-hover, "resting" use of an existing `Solid`-family shadow token.** Every prior component (Button, Button (Icon only), Filter Chip) applied `Shadow/Solid/Xs`/`Sm` only on `:hover`. Card_image/Card_hero-image/Card_carousel apply `Shadow/Solid/Xs` as the card's permanent elevation — not a token problem, just the first time this family has appeared outside a hover state.
10. **Icon-pixel-size-not-bound-to-a-token gap confirmed a 7th–9th time** (Button, Filter Chip, Eyebrow Highlight, Tags, Super Icon, Menu_item/Menu_sub-item, now Card_image/Text Block/Ratings) — fully systemic; no longer separately re-litigated per component going forward.
11. **`diamond` remains the default placeholder icon** on Category_chip and on the Eyebrow-Highlight-instance embedded in Text Block — consistent with the established Filter Chip/Eyebrow Highlight/Tags default, not a new icon-resolution question.
12. **Card_image's heart-shaped action icon has no traceable Tabler slug.** Its Figma layers are named generically (`Icon_left`/`Icon_right`), unlike the `chevron-right` precedent on Menu_item/Menu_sub-item, which was both a real Tabler name and semantically correct. Recommend renaming the layer to a real slug (e.g. `heart`) once confirmed, per the bridging convention in `PT_tokens.md` §4.
13. **New nested-interactive-elements accessibility hazard — confirmed real, and resolved.** Both the whole card (Card_hero-image/Card_carousel) and the heart icon are confirmed independently interactive, per your 2026-07-20 confirmation. Resolved with the standard "stretched link" pattern (card-wide link stretched via CSS, heart button as a sibling with `stopPropagation`) — see Card_hero-image's Accessibility section for the full pattern. First real instance of this hazard class in the doc set, now also the first one fully resolved rather than left open.
14. **Stray/unused variable references — likely resolved, not a real gap.** `Colors/Surface/Page`, `Colors/Border/Page`, and `Gradient/Default` all appear in the aggregate `get_variable_defs` pull for the Card node, but investigating further (`get_design_context` on the doc-page header frame, `707:1165`) found the explanation: that frame — the "Card" title, description paragraph, and gradient-filled "View docs" button — is the **documentation-page chrome** Figma wraps around every component, not part of any of the 5 actual Card components. The "View docs" button's background is confirmed literally bound to `Gradient/Default`'s two stops (`Default_fill/Stop1`/`Stop2`, matching `--pt-gradient-default` exactly) — fully explaining that reference. `Surface/Page`/`Border/Page` are very likely the page background and header divider line from that same chrome block (the divider renders as a flattened image, so not 100% pixel-confirmed, but the pattern match is strong).
   ⚠️ **This likely retroactively explains the earlier "stray reference" findings on Tags/Menu_item/Menu_sub-item too** — those pulls were also run on wrapper/documentation frames that include the same title+description+"View docs"+divider chrome. Recommend: next time, scope `get_variable_defs` to each component's own instance node rather than the wrapper frame, to avoid this contamination. Not re-verified against the older components in this pass — flagging as a hypothesis worth checking, not re-litigating those 3 components' docs retroactively.
15. **Ratings' `Default`/`Small` extends the already-unified sizing-convention direction** (`Large`/`Medium`/`Small`, established on Checkbox/Radio Button/Toggle) — only 2 of the 3 tiers exist here, but the naming direction is consistent, not a new scheme.
16. **Content-prop naming stays fragmented — a 4th/5th case.** Card_hero-image/Card_carousel use bare `children` (the already-recommended convention) for their slots; Text Block keeps Figma's own `title`/`bodyCopy`. Still the same unresolved system-wide question first raised on Button/Filter Chip/Eyebrow Highlight — not newly broken, just not newly fixed either.

**Summary (final pass, 2026-07-20):** No spacing-scale drift, no color-value drift on any already-documented token. Two apparent problems turned out, on verification, not to be problems: the Category_chip "token mismatch" was actually a correctly-bound (and confirmed intentional) dark-mode value, and the "stray variable" findings are very likely documentation-page chrome (title/description/"View docs" button/divider) bleeding into wrapper-frame variable dumps, not real unused bindings. Effectively everything raised in this pull is now resolved: macro/micro tier confirmed, heart-icon favorite toggle + filled-state icon swap, whole-card click + nested-interactive hazard (stretched-link pattern), Category_chip confirmed decorative, `Overlay`/`Opacity` formalized as real tokens (314 total), `Neutral/500` accepted as-is, Ratings confirmed read-only with fill/stroke tokens specified, `Image_only`'s title/children confirmed mutually exclusive, content-panel height confirmed intrinsic, Text Block's gap fixed at the source, and code-path convention confirmed flat. **Only two items remain genuinely open** across the whole family: Text Block's enum-vs-decomposed-props shape (deferred to roadmap, not blocking) and whether Card_image's category-chip/icon props should pass through the two macro components (item 2 in Card_hero-image's Open questions).

---

# Tab Navigation

> Figma node: `Tab Navigation` — node `707:2620`, two variant instances of a single underlying component. Direct child of the documentation frame `Navigation_light` (`707:2608`), alongside two other distinct components — **Bottom Nav** and **Top Anchor Nav**, documented separately below — same "wrapper of instances" pattern as Card/Checkbox-Radio-Toggle/Menu_item-Menu_sub-item. ✅ **Per your confirmation 2026-07-21: all three Navigation components are independent macros** (top-level, reach-for-directly) — none composes or reuses another as a sub-part, unlike Card_hero-image/Card_carousel's use of the micro components Card_image/Text Block/Ratings.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2620
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/TabNavigation.tsx]`
> Last updated: 2026-07-21
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A single tab in a horizontal tab strip (e.g. switching between content views within one screen — the Figma sample shows one tab at a time, not an assembled multi-tab bar). ✅ **Confirmed 2026-07-21: interactive, single-select.** Clicking a tab makes it `selected`; only one tab is selected at a time across the whole strip — collection-level constraint enforced by the consuming app, same shape as Filter Chip's `active`/Map_pin's `Selected` (naming parity confirmed to also carry real behavioral parity here, not assumed).

## Variant axes

**2 variants** confirmed by enumeration (`get_metadata`). One axis, no `Size`, no `Type`, no `Disabled`.

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Unselected` · `Selected` | 2 |

### Variant math

```
2 (State) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

No exclusions.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `state` | `'unselected' \| 'selected'` | `'unselected'` | Renamed from Figma's `State`; default flipped to `'unselected'`, same deliberate-divergence rationale as Filter Chip's `state` default. |
| `label` | `children` | `ReactNode` | `"Tab 1"` (Figma placeholder) | Consistent with Button/Filter Chip's `children` convention. ⚠️ Figma's own prop name is `label`, not `title`/`text` — a **fifth** distinct content-prop name across the doc set (Button `children`, Filter Chip `title`, Eyebrow Highlight/Tags `text`, Menu_item `title`, now Tab Navigation `label`) — see Cross-component consistency check. |

Non-visual props, none of which exist in Figma:

- `onClick` — required; confirmed interactive, click-driven selection.
- `role="tab"` / `aria-selected` — see Accessibility.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `Unselected`/`Selected` | `state: 'unselected'\|'selected'`, default `'unselected'` | Same axis-rename + default-flip rationale as Filter Chip. |
| 2 | `label` (text property) | `children` | Consistency with Button's content pattern. |
| 3 | Fixed `172px` width per tab | Not hardcoded — auto/flex width recommended, with the strip container set to overflow (recommend horizontal scroll) once total tab width exceeds available space | ✅ **RESOLVED 2026-07-21, per your direction: overflow, not wrap or shrink.** Figma's doc sample shows exactly 2 tabs at a fixed 172px each; a real tab strip needs to accommodate N tabs of varying label length, scrolling rather than resizing tabs to fit. |

## Tokens used

Pulled via `get_variable_defs` scoped to the component's own node (`707:2620`), not the wrapper frame, and `get_design_context` on both variant instances (`707:2621` Unselected, `707:2623` Selected).

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | `Unselected` background. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Selected` background. **Same token Menu_item's `Selected` uses** — a real cross-component reuse, not drift (both mean "this row/tab is the current one"). |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `Unselected` label color. |
| `Colors/Typography/Action` | `--pt-semantic-typography-action` | `#5d9c4d` | `Selected` label color. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | `Selected`'s bottom border color. ⚠️ **Off-label icon-token-as-border binding** — same recurring pattern as Menu_item's vestigial `Selected` border and Toggle's pre-fix border (`PT_tokens.md` has no dedicated "border-action" role distinct from `Colors/Border/Action`, which exists and would be the on-label choice — see Cross-component consistency check). Unlike Menu_item's version, **this border actually renders** (not zero-width). |
| `Scale/Half` | `--pt-scale-half` | `2px` | `Selected`'s bottom border width. |
| `Scale/3` | `--pt-scale-3` | `12px` | Horizontal padding. |
| `Scale/2` | `--pt-scale-2` | `8px` | Vertical padding. |
| `Scale/0` | `--pt-scale-0` | `0px` | Internal gap (single child, not visually meaningful). |
| `Scale/2` (as radius) | `--pt-scale-2` | `8px` | Top-left/top-right corner radius only (`rounded-tl`/`rounded-tr`) — flat bottom edge, consistent with a tab strip sitting on a divider line. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | `Unselected` label weight. |
| `Typography/Font_weight/SemiBold` | `--pt-typography-font_weight-semibold` | `700` | `Selected` label weight (rendered bold). |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | |
| `Scale/6` | `--pt-scale-6` | `24px` | Label line-height — same "bound to `Scale/6` instead of a line-height-named token" reuse pattern already documented on Button/Filter Chip/Menu_item. |

**No HARDCODED colors found.** ⚠️ **HARDCODED — no token bound in Figma:** the `172px` tab width is a literal pixel value with no size/scale token behind it — flagged as a layout gap (see divergence #3), not a token gap.

### Per-variant token map

| `State` | Background | Bottom border | Label color | Label weight |
|---|---|---|---|---|
| `Unselected` | `--pt-semantic-surface-page` | none | `--pt-semantic-typography-body_secondary` | Regular (500) |
| `Selected` | `--pt-semantic-surface-success` | `--pt-semantic-icon-action`-colored, `2px` | `--pt-semantic-typography-action` | SemiBold (700) |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Unselected` | Muted background, muted label, regular weight | Resting state. |
| `Selected` | Green-tinted background, green bold label, green underline | ✅ Confirmed click-driven, single-select across the tab strip. |
| Hover | ⚠️ Not modeled in Figma. **Design system roadmap** — same systemic gap as Filter Chip/Map_pin/Menu_item; CSS-only placeholder until designed. |
| Focus (keyboard) | ⚠️ Not modeled. **Design system roadmap.** |
| Disabled | ⚠️ No variant exists — omit the prop until designed, same as Filter Chip's `Disabled` gap. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Render as `role="tab"` inside a `role="tablist"` container, with `aria-selected={state === 'selected'}`. Use `aria-controls` to point at the associated panel if tabs drive visible panel content (not confirmed either way in Figma — an engineering/IA decision).
- Keyboard: arrow-key navigation between tabs within the tablist is the standard ARIA `tablist` pattern — not modeled in Figma, but a well-established default. ⚠️ Flagged as an industry-standard placeholder, not confirmed by design.
- Focus ring: not modeled. **Design system roadmap.**
- ⚠️ **Touch target: fails at the sampled width.** `172px` wide × `40px` tall (`8px` padding × 2 + `24px` line-height) clears the horizontal minimum but **not the vertical 44px minimum** — joins the already-flagged Filter Chip/Checkbox/Radio Button/Toggle/Menu_sub-item pattern.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `role="tablist"`/`role="tab"` for a strip of mutually-exclusive views | Use for independent multi-select toggles — that's Filter Chip's job |
| Enforce single-select at the tablist/collection level | Let `state="selected"` be set on more than one tab in the same strip |
| Size tabs to fit their label content | Assume every tab is exactly 172px — that's an artifact of the 2-tab doc sample |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Tab strip width/overflow:** ✅ **RESOLVED 2026-07-21, per your direction: overflow — when tabs don't fit the available width, the strip overflows** rather than wrapping to multiple rows or auto-shrinking tab width. Recommend horizontal scroll as the standard implementation of "overflow" for a tab strip (most common pattern), though the exact mechanism (scroll only vs. scroll + edge-fade/arrow indicators) isn't specified — a no-Figma-basis implementation detail, not a blocker.
- **Long labels:** no wrap/truncation behavior modeled (single short-word sample only).
- **Fewer than 2 tabs:** not a meaningful case for a tab strip, but not explicitly excluded either.
- **RTL:** not modeled — irrelevant until RTL support is needed, same as Button/Filter Chip/Map_pin/Menu_item.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { TabNavigation } from '@/components/TabNavigation';

<div role="tablist" aria-label="Trip views">
  <TabNavigation state="selected" onClick={() => setActiveTab('overview')}>
    Overview
  </TabNavigation>
  <TabNavigation state="unselected" onClick={() => setActiveTab('itinerary')}>
    Itinerary
  </TabNavigation>
</div>
```

## Open questions — what needs your confirmation

1. ~~Are Tab Navigation, Bottom Nav, and Top Anchor Nav independent macros, or does one reuse another?~~ — **RESOLVED 2026-07-21: all three are independent macros.**
2. ~~Is Tab Navigation interactive / single-select?~~ — **RESOLVED 2026-07-21: yes, click-driven, single-select across the strip.**
3. ~~Tab strip width/overflow behavior~~ — **RESOLVED 2026-07-21: overflow** (not wrap, not auto-shrink) when tabs exceed the available width. Exact scroll-mechanism details remain an implementation choice, not blocking.
4. **Content-prop name (`label` vs. the system's other four names)** — see Cross-component consistency check. Still open, system-wide.
5. Component code path + export name — engineering task for the tech lead.

---

# Bottom Nav

> Figma node: `Bottom Nav` — node `707:2625`, two variant instances of a single underlying component. Direct child of `Navigation_light` (`707:2608`), sibling of Tab Navigation and Top Anchor Nav, not a sub-part of either. ✅ Independent macro, per your 2026-07-21 confirmation.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2625
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/BottomNav.tsx]`
> Last updated: 2026-07-21
> Status: 🟢 Verified against Figma via MCP. Items marked ⚠️ still need a human decision.

## Description

A single destination item in a bottom tab bar (icon over label). ✅ **Confirmed 2026-07-21: interactive, single-select.** Same model as Tab Navigation — clicking sets `active`, and only one item is active across the whole bar at a time, enforced by the consuming app.

✅ **Real assembly confirmed 2026-07-21, per your reference screenshot (Figma dev-mode inspect panel — not independently re-verified via MCP this session; provide the node ID if you want a live re-pull).** A real Bottom Nav bar contains (at least) 4 items: **Explore** (`search` icon), **Lumo** (`sparkles` icon — PinTours' AI assistant entry point, ties directly into Top Anchor Nav's confirmed `Search`→AI-dialogue morph, see that section), **Booked** (a ticket icon), and **Profile** (a person icon, shown `active` — green + underlined, matching the already-documented `Active` token bindings exactly). ⚠️ The ticket/person icons' exact Tabler slugs aren't confirmed (screenshot only, not a live `get_design_context` pull on this assembly node) — don't guess a slug name; treat as `ReactNode` icon props until verified.

## Variant axes

**2 variants** confirmed by enumeration. One axis, no `Size`, no `Type`, no `Disabled`.

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Default` · `Active` | 2 |

### Variant math

```
2 (State) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

No exclusions.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `state` | `'default' \| 'active'` | `'default'` | Renamed from Figma's `State`, matching the code-facing convention used everywhere else (Figma's own default value kept as the code default here, unlike Tab Navigation/Filter Chip's flipped defaults — no rename-driven reason to flip this one). |
| `label` | `label` | `string` | `"Home"` (Figma placeholder) | ✅ **RESOLVED 2026-07-21 — renamed at the source.** You amended this directly in Figma from `navTitle` to `label`, confirmed live via a fresh `get_design_context` pull on `707:2626`. Now unified with Tab Navigation's own `label` prop — no rename needed on the code side. |
| `iconSwap` | `icon` | `ReactNode` (optional) | `IconHome` (Tabler; Figma layer named `home`, a real, valid Tabler slug — see `PT_tokens.md` §4's bridging convention) | Figma's own prop is already a clean optional-override slot (`ReactNode \| null`, defaulting to `null` which falls back to the built-in `home` icon) — simplest icon-slot API of any component in this doc set (no separate `showIcon` boolean to collapse, unlike Filter Chip/Menu_item). |

Non-visual props, none of which exist in Figma:

- `onClick` — required; confirmed interactive, click-driven, single-select across the bar.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` = `Default`/`Active` | `state: 'default'\|'active'` | Axis rename, consistent with the rest of the doc set. |
| 2 | `label` (text property) | `label` | ✅ **RESOLVED 2026-07-21** — was `navTitle`, renamed at the source in Figma to unify with Tab Navigation. No divergence remains; kept as-is. |
| 3 | `iconSwap` (ReactNode\|null) | `icon` | Shorter, consistent with the system's general icon-slot naming (though Figma's own name was already clear — smallest rename in the doc set). |

## Tokens used

Pulled via `get_variable_defs` scoped to `707:2625`, and `get_design_context` on both variants (`707:2626` Default, `707:2630` Active).

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Icon/Body_Secondary` | `--pt-semantic-icon-body_secondary` | `#869a9f` | Present in the aggregate variable dump for the `Default` icon role. ⚠️ **Icon renders as a flattened `<img>` asset in both sampled variants** — same limitation as Button/Filter Chip/Map_pin/Menu_item; per-state icon color is inferred from the aggregate binding, not literally traceable through the generated code. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `Default` label color. |
| `Colors/Icon/Action` | `--pt-semantic-icon-action` | `#5d9c4d` | `Active`'s label underline color (same off-label icon-as-border pattern as Tab Navigation/Menu_item). Also the presumed `Active` icon color (same traceability caveat as above). |
| `Colors/Typography/Action` | `--pt-semantic-typography-action` | `#5d9c4d` | `Active` label color. |
| `Scale/Half` | `--pt-scale-half` | `2px` | Icon↔label vertical gap; also `Active`'s label underline width and bottom padding. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | `Default` label weight. |
| `Typography/Font_weight/SemiBold` | `--pt-typography-font_weight-semibold` | `700` | `Active` label weight. |
| `Body_xs/Font_size` | `--pt-typography-body-xs-font_size` | `12px` | Label uses the **XSmall** body scale — smallest text size used by any interactive-label component in the doc set so far (everything else uses `default`/`sm`). |
| `Body_xs/Line_height` | `--pt-typography-body-xs-line_height` | `16px` | |
| icon 24px → stroke weight `2` | `--pt-icon-stroke_weight-24` | `2` | Confirms `PT_tokens.md` §7.3 — no drift. |

**No HARDCODED colors found**, beyond the systemic icon-pixel-size-not-bound-to-a-token gap already flagged 9+ times prior. ⚠️ **HARDCODED — no token bound in Figma:** the label's `50px` fixed width has no size token behind it.

### Per-variant token map

| `State` | Icon color (inferred) | Label color | Label weight | Underline |
|---|---|---|---|---|
| `Default` | `--pt-semantic-icon-body_secondary` (unconfirmed — see above) | `--pt-semantic-typography-body_secondary` | Regular (500) | none |
| `Active` | `--pt-semantic-icon-action` (unconfirmed — see above) | `--pt-semantic-typography-action` | SemiBold (700) | `--pt-semantic-icon-action`-colored, `2px`, under label only |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | Muted icon + label | Resting state. |
| `Active` | Green icon + bold green label + underline **under the label only** (not the icon) | ✅ Confirmed click-driven, single-select across the bar. Underline placement differs from Tab Navigation's (which underlines the whole tab, not just its label) — a real, confirmed visual difference between the two components, not drift (see Cross-component consistency check). |
| Hover | ⚠️ Not modeled. **Design system roadmap.** |
| Focus (keyboard) | ⚠️ Not modeled. **Design system roadmap.** |
| Disabled | ⚠️ No variant exists — omit the prop until designed. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Render as a `<button>` or `<a>` (engineering choice, same open call as Menu_item) inside a `<nav aria-label="Primary">` or similar landmark, with `aria-current="page"` (if navigating) on the `Active` item — same pattern already confirmed correct for Map_pin's `Selected` state.
- Icon should be `aria-hidden="true"` — it's redundant with the visible label text in every sampled case, same reasoning as Menu_item's leading icon.
- Focus ring: not modeled. **Design system roadmap.**
- ⚠️ **Touch target: fails.** Icon (`24px`) + gap (`2px`) + label (`16px` line-height) + bottom padding (`2px`) ≈ `44px` tall, but the label's fixed `50px` width is narrower than most real bottom-nav hit areas — and there's no confirmed minimum tap-target padding around the whole item (icon+label stack), only around the visible content. Recommend padding the whole touch target to 44×44 minimum at the container level, not just relying on the visible icon+label bounds. Same systemic gap as Filter Chip/Checkbox/Radio Button/Toggle/Menu_sub-item/Tab Navigation.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use for a bottom tab bar's destination items | Use for a top-of-screen tab strip — that's Tab Navigation's job |
| Enforce single-select at the bar/collection level | Mark more than one item `active` at once |
| Keep labels short (single word, XSmall type scale) | Assume long labels will fit the fixed `50px` sample width without truncation testing |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ~~**Bar assembly spacing**~~ — **RESOLVED 2026-07-21, per your reference screenshot.** Container padding: `Scale/4` (`16px`) left/right, `Scale/3` (`12px`) top, `Scale/2` (`8px`) bottom. Items are distributed with **`Auto` gaps** between them (Figma auto-layout's flexible/space-between-style spacing, not a fixed `Scale/*` gap token) — confirmed on a 4-item sample (Explore/Lumo/Booked/Profile). ⚠️ From a screenshot, not an independent MCP pull — re-verify via `get_design_context` if you share the assembly's node ID.
- **Long labels:** no wrap/truncation modeled against the fixed `50px` label width.
- ~~**Badge/notification dot**~~ — **RESOLVED 2026-07-21, per your direction: NOT an icon-overlay badge dot.** It's a separate horizontal banner/strip element positioned **below Top Anchor Nav or above Bottom Nav** — not a small dot layered on a nav icon the way most bottom-nav libraries implement it. This is effectively a **new, distinct, not-yet-designed component** (a notification banner), not a Bottom Nav prop — moved to the Design system roadmap in `MD_progress.md` rather than modeled as part of this component.
- **RTL:** not modeled — irrelevant until RTL support is needed.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { BottomNav } from '@/components/BottomNav';
import { IconSearch } from '@tabler/icons-react';

<nav aria-label="Primary" className="flex justify-around">
  <BottomNav state="active" label="Home" onClick={() => navigate('/')} />
  <BottomNav
    state="default"
    label="Search"
    icon={<IconSearch size={24} stroke={2} aria-hidden="true" />}
    onClick={() => navigate('/search')}
  />
</nav>
```

## Open questions — what needs your confirmation

1. ~~Is Bottom Nav interactive / single-select?~~ — **RESOLVED 2026-07-21: yes, click-driven, single-select across the bar.**
2. ~~Rename `navTitle`→`label`~~ — **RESOLVED 2026-07-21: done directly in Figma**, confirmed live via `get_design_context` on `707:2626`.
3. **Icon color per state** — inferred from the aggregate variable dump, not literally traceable (icon renders as a flattened asset). Still open, same limitation as several prior components.
4. ~~Bar assembly spacing (3+ items)~~ — **RESOLVED 2026-07-21, per your reference screenshot.** `Scale/4`/`Scale/3`/`Scale/2` container padding, `Auto` gaps between items. See Edge cases; recommend a live MCP re-pull once you have the assembly's node ID.
5. ~~Badge/notification-dot support~~ — **RESOLVED 2026-07-21: not part of Bottom Nav at all.** It's a separate banner component (below Top Anchor Nav / above Bottom Nav), not an icon-overlay dot. Moved to Design system roadmap as its own future component.
6. **New (2026-07-21): confirm "Lumo" is the locked product name** for the AI-assistant Bottom Nav destination (and Top Anchor Nav's AI dialogue target) — seen in your reference screenshot, not yet confirmed as final vs. sample data. Also relevant to Top Anchor Nav's Open questions item 12.
7. ~~Confirm exact Tabler icon slugs for "Booked"/"Profile"~~ — **explicitly deferred 2026-07-21, per your direction: "we don't have to define that here."** Not a blocker for this documentation pass; revisit if/when it matters for implementation.
8. Component code path + export name — engineering task for the tech lead.

---

# Top Anchor Nav

> Figma node: `Top Anchor Nav` — node `707:2634`, seven variant instances of a single underlying component (Figma's own `Property 1` axis). Direct child of `Navigation_light` (`707:2608`), sibling of Tab Navigation and Bottom Nav, not a sub-part of either. ✅ Independent macro, per your 2026-07-21 confirmation. **By far the most structurally varied component documented so far** — each `Property 1` value exposes a different set of secondary boolean/content props, not a uniform template with one axis of variation.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2634
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/TopAnchorNav.tsx]`
> Last updated: 2026-07-21
> Status: 🟢 **Fully closed out on every design-facing question**, verified against Figma via MCP for all 7 sampled presets, plus 5 rounds of your direct confirmations. Component shape (`mode` prop), the `Search`↔Lumo morph (`variant="lumo"`, confirmed as the locked product name), the confirmed non-merging of the other 5 presets (and confirmation that their Lumo trigger lives entirely outside this component), `progress`'s fill math, `title`/`cta`/`progress`/`children` mutual exclusivity, `cta`'s color, and the `Gradient/Default` stroke are all resolved. Only non-blocking items remain: the expanded-input state's visual design (acknowledged not built yet, moved to roadmap) and the component code path (pending your tech lead) — see Open questions.

## Description

The persistent bar anchored to the top of a screen (back navigation, screen title, contextual actions). Unlike every other component documented so far, Figma doesn't model this as "one shape with state/size variants" — it models **7 named presets**, each a different real-world screen configuration: a plain back+title+actions bar (`Default`), a step-progress bar (`Progress bar`), two custom-content slots (`Slot_center`, `Slot_left`), a back+title+"Skip" bar (`CTA_right`), a glowing AI-assistant entry point (`AI Mode`), and a search bar (`Search`).

⚠️ **Partially resolved, per your 2026-07-21 input.** Whether the bar ever switches between *different* presets live (e.g. `Default` → `Search`) while mounted is still open — you're considering this for the AI surface but haven't done the design work to confirm. **This documentation assumes the safe default for that question — each of the 7 presets is a fixed configuration a given screen renders, no built-in cross-preset transition.**

✅ **However, a real, confirmed local interaction exists within `AI Mode` and `Search` themselves:** the "Ask anything"/search pill is not static — **tapping it expands it in place into a real, typeable text input.** This is a genuine collapsed↔expanded state on those two modes specifically, not yet modeled as a Figma variant — see States, Accessibility, and Open questions.

✅ **Confirmed 2026-07-21: `Search` and `AI Mode`/Lumo are also connected to each other, not just fixed independent presets.** `Search` is the plain/"analog" entry point; tapping the sparkles icon on the `Search` bar **morphs it in place into Lumo** (PinTours' AI assistant — confirmed as the locked product name, see below). ✅ **Confirmed further, same day:** the other 5 bar presets (`Default`/`Progress bar`/`Slot_center`/`Slot_left`/`CTA_right`) **never merge or morph into each other** — that part of the earlier open question is now closed. They can also lead a user into Lumo, but **✅ confirmed 2026-07-21: that trigger lives outside Top Anchor Nav entirely** — it's not a button/icon inside the nav bar's own bounds (unlike `Search`'s in-bar sparkles icon). This means **Top Anchor Nav itself doesn't need to model a Lumo-trigger for those 5 presets at all** — that responsibility belongs to whatever UI element sits elsewhere on those screens (out of scope for this component).
✅ **Also confirmed 2026-07-21: Lumo is *not* independently reachable as its own starting configuration on Top Anchor Nav.** It's only ever reached via a trigger from an already-active nav surface (`Search`'s sparkles tap here, or Bottom Nav's `Lumo` tab). Modeled as `mode="search"` with an internal `variant: 'analog' | 'lumo'` sub-state (not a separate top-level `mode` value) — see Props.
✅ **"Lumo" confirmed 2026-07-21 as the locked product name** for PinTours' AI assistant (not sample/placeholder data) — the `variant` value is renamed `ai`→`lumo` throughout this section to match.

## Variant axes

**7 variants** confirmed by enumeration (`get_metadata`). One axis, no `Size`, no `Type`.

| Axis (Figma property) | Values (exact Figma strings) | Count |
|---|---|---|
| `Property 1` | `Default` · `Progress bar` · `Slot_center` · `Slot_left` · `AI Mode` · `CTA_right` · `Search` | 7 |

⚠️ Un-renamed Figma default axis name (`Property 1`) — same recurring pattern as Menu_item/Menu_sub-item/Text Block/Ratings, now a 5th–6th confirmation across the doc set.

### Variant math

```
7 (Property 1) = 7 theoretical
Actual component count = 7
Excluded                = 0
```

No exclusions — but unlike every prior flat-enum component (Menu_item, Text Block), **each of the 7 values exposes a different secondary component-property panel** (see Props table below) — the "no exclusions" framing undersells how structurally different the 7 values are from each other.

### Per-preset secondary properties (confirmed via `get_design_context` on all 7 instances)

| Preset | `showLeftIcon` | `showRightIcon` | `showRightSecondaryIcon` | `showTitle` | Other content |
|---|---|---|---|---|---|
| `Default` | ✅ | ✅ | ✅ | ✅ | `title` (text) |
| `Progress bar` | ✅ | ✅ | — (present but hidden, `opacity-0`, in this sample) | — (present but hidden) | Fixed progress-fill graphic, no exposed percentage |
| `Slot_center` | ✅ | ✅ | — | — | `children` (custom center slot, 298px) |
| `Slot_left` | — (no left-icon slot at all in this preset) | ✅ | — | — | `children` (custom slot, 346px, occupies the left-icon's space too) |
| `AI Mode` | ✅ (circular back button, distinct treatment) | — | — | — | Fixed "Ask anything" input pill + nested Super Icon (sparkles) |
| `CTA_right` | ✅ | — | — | ✅ | `title` (text) + `cta` (text, "Skip") — no icon slots at all |
| `Search` | ✅ (search icon, not chevron-left) | ✅ (sparkles icon — **confirmed 2026-07-21: tapping it morphs the bar into `AI Mode`**) | — | — | Fixed search-input pill + placeholder text + a small circular glow highlight behind the sparkles icon (confirmed 2026-07-21: a visual cue hinting the icon triggers the AI morph, not a decorative avatar) |

## Props (code API)

⚠️ **This table represents a recommended unification, not a literal 1:1 Figma property list** — Figma exposes 7 differently-shaped property panels (above), not one. The `mode` prop below is a **recommended engineering addition with no Figma basis** — see Figma-vs-code divergences.

| Recommended code prop | Type | Default | Notes |
|---|---|---|---|
| `mode` | `'bar' \| 'search'` | `'bar'` | ✅ **RESOLVED 2026-07-21, per your direction: ship as one component with this prop** (not three separate components). ⚠️ **Refined 2026-07-21:** dropped `'ai'` as an independent mode value — `AI Mode` is confirmed reachable by tapping the sparkles icon *within* `mode="search"`, not as a separately-selected top-level mode. `'search'` now carries its own internal `variant: 'analog' \| 'ai'` sub-state (see below) that the sparkles tap flips. Whether `AI Mode` should *also* be directly selectable as a starting configuration (bypassing `Search`) is still unconfirmed — flagged in Open questions rather than assumed either way. |
| `variant` (only used when `mode="search"`) | `'analog' \| 'lumo'` | `'analog'` | ✅ **New 2026-07-21, per your direction; value renamed `ai`→`lumo` the same day, per your confirmation that "Lumo" is the locked product name.** Not a Figma property — models the confirmed sparkles-tap morph from the plain search bar into the `AI Mode`/Lumo glow treatment. `analog` renders the plain search-pill styling (see Tokens used → `Search`); `lumo` renders the glow/pill styling (see Tokens used → `AI Mode` / Lumo). |
| `leftIcon` | `ReactNode \| null` | `IconChevronLeft` (Figma layer `chevron-left`, real Tabler slug) | Omit to hide (matches `Slot_left`'s absent left-icon slot). |
| `rightIcon` | `ReactNode \| null` | `IconX` (Figma layer `x`) | Omit to hide (matches `CTA_right`'s absent right-icon slot). |
| `rightSecondaryIcon` | `ReactNode \| null` | `null` | Only `Default` uses this (Figma layer `share`). Omit/null hides it. |
| `title` | `string` | — | Center title text. ✅ **Mutually exclusive with `children`/`progress`/`cta` — confirmed 2026-07-21**, per your direction. |
| `cta` | `{ label: string; onClick: () => void }` | — | Replaces the right-icon slot(s) with a text action (`CTA_right`'s "Skip"). ✅ **Mutually exclusive with `title`/`children`/`progress` — confirmed 2026-07-21.** |
| `progress` | `number` (0–100) | — | ⚠️ **Not exposed as a Figma property at all** — the `Progress bar` preset renders one fixed sample (~25% fill, `70.5px` of a `282px` track). ✅ **Fill math confirmed 2026-07-21, per your direction: linear** — `progress` maps proportionally to the track width (e.g. `progress={50}` fills exactly half the track), same approach as the one sampled sample implies. Go with this as the real behavior, not just a placeholder guess. ✅ Mutually exclusive with `title`/`cta`/`children`. |
| `children` | `ReactNode` | — | Custom center slot (`Slot_center`, `Slot_left`). ✅ **Mutually exclusive with `title`/`cta`/`progress` — confirmed 2026-07-21.** |
| `onLeftIconClick` / `onRightIconClick` | `() => void` | — | Non-visual; not in Figma. |

`mode="search"` (either `variant`) renders its own fixed internal structure (see Tokens used below) rather than reusing `leftIcon`/`rightIcon`/`title`/etc. from `mode="bar"` — confirmed as the right split, per your direction throughout this round.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma preset | Recommended code | Why the change |
|---|---|---|---|
| 1 | `Property 1=Default` | `mode="bar"`, `title="…"`, default icons | Baseline bar. |
| 2 | `Property 1=Progress bar` | `mode="bar"`, `progress={n}`, no title | `progress` is a recommended addition — no Figma percentage prop exists. |
| 3 | `Property 1=Slot_center` | `mode="bar"`, `children={…}` | |
| 4 | `Property 1=Slot_left` | `mode="bar"`, `leftIcon={null}`, `children={…}` | |
| 5 | `Property 1=CTA_right` | `mode="bar"`, `title="…"`, `cta={{label:"Skip", onClick}}` | |
| 6 | `Property 1=AI Mode` | `mode="search"`, `variant="lumo"` | ⚠️ **Refined 2026-07-21, renamed same day** — was `mode="ai"`, then `variant="ai"`; now `variant="lumo"` since "Lumo" is confirmed as the locked product name. Modeled as `Search`'s `lumo` sub-variant, since the two are confirmed connected (see divergence #10). Fixed internal structure — see Tokens used. |
| 7 | `Property 1=Search` | `mode="search"`, `variant="analog"` (default) | Fixed internal structure — see Tokens used. |
| 8 | (no Figma basis) | `mode` prop itself | ✅ **RESOLVED 2026-07-21, per your direction:** one component with this prop, not 3 separate components. |
| 9 | (no Figma basis) | `expanded` state on `mode="search"` (either `variant`) | ✅ **New 2026-07-21, per your direction.** The pill isn't static — tapping it **expands it into a real, typeable text input in place**. Not modeled as a separate Figma variant (only the collapsed look was sampled); the expanded look/layout is undocumented in Figma and needs a design pass. See States and Open questions. |
| 10 | (no Figma basis — inferred from confirmed behavior) | `variant: 'analog' \| 'lumo'` sub-state | ✅ **New 2026-07-21, per your direction; enum value renamed `ai`→`lumo` the same day.** Tapping the sparkles icon on `Search` (`variant="analog"`) morphs it into `variant="lumo"` (the `AI Mode`/Lumo glow treatment) in place. This is why `Property 1=AI Mode` is modeled as a `Search` sub-variant rather than its own top-level `mode` — Figma's flat `Property 1` enum doesn't capture that these two are actually connected. |

## Tokens used

Pulled via `get_variable_defs` scoped to `707:2634` (the component's own frame, not the `Navigation_light` wrapper), and `get_design_context` on all 7 variant instances individually.

### Bar mode (`Default`, `Progress bar`, `Slot_center`, `Slot_left`, `CTA_right`)

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | Bar background, all 5 bar-mode presets. |
| `Colors/Typography/Headings` | `--pt-semantic-typography-headings` | `#222628` | `title` text color. |
| `Colors/Icon/Headings` | `--pt-semantic-icon-headings` | `#222628` | Icon-button hit-area default fill role (icons themselves are flattened assets — same traceability caveat as every icon in this doc set). |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `Search`'s placeholder text (see Search subsection). |
| `Scale/10` | `--pt-scale-10` | `40px` | Icon hit-area size (square) — each icon sits in a 40×40 tap target. |
| `Scale/1Half` | `--pt-scale-1half` | `6px` | Icon hit-area corner radius. |
| `Scale/6` | `--pt-scale-6` | `24px` | Icon size; title line-height. |
| `Scale/4` | `--pt-scale-4` | `16px` | |
| `Scale/2` | `--pt-scale-2` | `8px` | |
| `Scale/Half` | `--pt-scale-half` | `2px` | `Progress bar`'s track height. |
| `Colors/Surface/Disabled` | `--pt-semantic-surface-disabled` | `#a8c0c7` | `Progress bar`'s **base track** color. ⚠️ Off-label reuse — "disabled" surface token used for a non-disabled progress track background, same category of role-mismatch already flagged elsewhere (e.g. Eyebrow Highlight's `Neutral`/`Dark`). |
| `Opacity/50` | `--pt-opacity-50` | `50%` | `Progress bar`'s base track opacity. Already a formalized token (§7.11) — no new gap. |
| `Default_fill/Stop1` / `Default_fill/Stop2` | `--pt-color-green-400` (`#7db071`) / `--pt-color-teal-500` (`#009bc8`) | — | `Progress bar`'s **fill** segment. ⚠️ **Consumes the two `Gradient/Default` stop primitives directly** (`bg-gradient-to-r from-[…] to-[…]`) rather than the composed `Gradient/Default` token — the same distinction `PT_tokens.md`'s Gradient section already calls out: "§4 is satisfied only if the component consumes the gradient token, not the individual stop primitives." Recommend the component consume `--pt-gradient-default` directly instead. |
| `Body_sm/Font_size` / `Body_sm/Line_height` | `--pt-typography-body-sm-font_size` / `-line_height` | `14px` / `20px` | `CTA_right`'s `cta` ("Skip") text size. |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | `cta` text weight. |

✅ **`cta` ("Skip") renders in `Colors/Typography/Headings` (near-black), not `Colors/Typography/Action` (green) — RESOLVED 2026-07-21, confirmed intentional per your direction.** You matched it deliberately to the bar's icon color (`Colors/Icon/Headings`) rather than the green action color, because you found the green text not legible enough in this context. Documented as a confirmed, deliberate exception to the "interactive text uses the action color" pattern seen elsewhere (Filter Chip's selected label, Menu_item's `Selected` label) — not a missed binding.

### `AI Mode` / Lumo (`Search` with `variant="lumo"`)

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_85` | `--pt-semantic-surface-card_85` | `rgba(255,255,255,0.85)` | Back-button circle fill (`Scale/16` = `64px` corner radius = full circle). Same token/pattern already resolved on Super Icon. |
| `Default_fill/Stop1` | `--pt-color-green-400` (`#7db071`) | — | Input pill's own `2px` border (a separate, outer pill outline — distinct from the glow-layer stroke below). Raw gradient-stop primitive used directly as a solid border color, not the composed `Gradient/Default` token — a gradient can't be a flat border color, so this is a defensible, different case from Progress bar's fill. |
| `Scale/8` | `--pt-scale-8` | `32px` | Pill corner radius (full pill at `40px` height). |
| `Scale/4` / `Scale/1` | `--pt-scale-4` / `--pt-scale-1` | `16px` / `4px` | Pill horizontal padding (left/right asymmetric — room for the trailing icon). |
| `Typography/Body Default/Regular` | body-default tokens | `16px` regular | "Ask anything" placeholder text, `Colors/Typography/Headings`. |
| **Nested Super Icon instance** | — | — | ✅ **Confirmed via node-ID lineage, not just visual resemblance** — the trailing sparkles icon's instance IDs (`I765:2260;707:1888`, `I765:2260;707:1889`) directly reference Super Icon's own node range (`707:1883`–`707:1933`, documented in this file's [Super Icon](#super-icon) section). This is the **second** confirmed real-component-embedded-in-another-component instance in the doc set (first was Text Block's nested Eyebrow Highlight). |
| **Background glow — two layered effects** | See below | — | ⚠️ Elaborate, multi-layer effect (conic-gradient + blur + mask) — the color stops are now fully resolved and confirmed (below), but the *composition* itself (masking, layering order) is still treated as component-specific CSS, not a portable token. |
| — Outer glow layer | `Gradient/Background_Layer1` | Conic gradient, 6 stops (see `PT_tokens.md` §7.9) | `rotate-180`, masked to the pill's rounded shape (`Scale/5` = `20px` radius). |
| — Inner glow layer (**`Background_Layer2`**) | Fill = `Gradient/Background_Layer2` (conic, 3 stops); **Stroke = `Gradient/Default`, 1px, Position: Inside** | See `PT_tokens.md` §7.9 for both | ✅ **RESOLVED 2026-07-21 — directly confirmed against Figma's own Fill/Stroke panel (screenshot).** This layer has a **fill** bound to `Gradient/Background_Layer2` *and* a separate **stroke** bound to the full `Gradient/Default` token (1px, inside) — not a raw primitive approximation as the generated Tailwind code suggested (`border-[var(--default_fill/stop1)]` was the code-gen tool's best flat-color approximation of a gradient stroke, which CSS `border` can't render natively). This is what the earlier "unattributed `Gradient/Default` reference" actually was — not a stray/unused binding, a real stroke. |
| — Blur (both glow layers) | `Layer blur` effect | **Uniform 40px** | ✅ **Corrected 2026-07-21, confirmed directly in Figma.** The generated code approximated this as `blur-30px` (outer layer) and `blur-20px` (inner layer) — both wrong; the real, single blur value confirmed via Figma's Effects panel is **40px on both layers**. |
| — Base mask rectangle | `Colors/Surface/Card_primary` | `#ffffff` | At `Opacity/65`, behind both glow layers. |

### `Search` (`variant="analog"`, default)

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | Search-bar pill background. |
| `Colors/Border/Divider` | `--pt-semantic-border-divider` | `#a8c0c7` | Pill border, `1px`. |
| `Scale/6` | `--pt-scale-6` | `24px` | Pill corner radius. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | Placeholder text ("Search cities or categories"). |
| Left icon | `search` (real Tabler slug → `IconSearch`) | — | |
| Right icon | `sparkles` | — | ⚠️ **Not a nested Super Icon instance** (unlike `AI Mode`'s) — node-ID lineage doesn't trace back to `707:188x`. A plain Tabler `sparkles` icon reused independently. ✅ **Confirmed 2026-07-21: this is the tap target that morphs `Search` into `AI Mode`/Lumo** (`variant="lumo"`) — not just a visual echo of it. |
| Small circular glow highlight (`Ellipse 11`, `39px`) behind the sparkles icon | — | — | ✅ **RESOLVED 2026-07-21, per your direction: this is a morph-affordance cue, not a decorative avatar.** A subtle preview of the `AI Mode` glow effect, positioned behind the sparkles icon to hint that tapping it triggers something special (the morph into `AI Mode`) — same visual language as `AI Mode`'s own background glow, just smaller/subtler in the collapsed `analog` state. |

**New tokens added, per your 2026-07-21 direction:** `Opacity/65` → `--pt-opacity-65`, added to `PT_tokens.md` §7.11. **`Gradient/Background_Layer1`/`Background_Layer2` stop compositions resolved for the first time** (previously documented as existing-but-unused, stops undocumented) and added to `PT_tokens.md` §7.9. **`Gradient/Default`'s appearance on this preset is now fully explained** — it's the confirmed stroke on the `Background_Layer2` glow layer (see `AI Mode` above), not a stray/unused reference.

## States

Top Anchor Nav doesn't expose interaction states the way Button/Filter Chip do — it's a content/layout-driven component, not a toggle. No `Hover`/`Selected`/`Disabled` variants exist for any of the 7 presets.

| Interaction | Status |
|---|---|
| Icon buttons (`leftIcon`/`rightIcon`/`rightSecondaryIcon`) hover/focus/pressed | ⚠️ Not modeled. **Design system roadmap.** |
| `cta` ("Skip") hover/focus/pressed | ⚠️ Not modeled. **Design system roadmap.** |
| `mode="search"`, `variant="analog"` — `collapsed` (default) | ✅ **Confirmed 2026-07-21: a tappable affordance**, not a live, already-active input. This is the state sampled in Figma (the `|` cursor glyph in "Ask anything" is a static placeholder character, not a real blinking caret — the input isn't live yet in this state). |
| `variant="analog"` → `variant="lumo"` (tap the sparkles icon) | ✅ **Confirmed 2026-07-21: the plain search bar morphs in place into the `AI Mode`/Lumo glow treatment.** The first confirmed cross-preset transformation in Top Anchor Nav — see Description. |
| `collapsed` → `expanded` (tap the pill itself, either `variant`) | ✅ **Confirmed 2026-07-21: tapping the collapsed pill expands it in place into a real, typeable text input.** ⚠️ Not modeled as a Figma variant — no `expanded` sample exists, so its exact layout/sizing/animation is undocumented and needs a design pass. Recommend an `expanded: boolean` (or internal state) + `onExpand`/`onCollapse` callbacks. |
| Transition between the other 5 presets (`Default`/`Progress bar`/`Slot_center`/`Slot_left`/`CTA_right`) | ✅ **RESOLVED 2026-07-21: never — these 5 don't merge or morph into each other.** Each is a fixed, separate-screen configuration. |
| Any of the 5 bar presets → Lumo | ✅ **Confirmed possible 2026-07-21**, per your direction — same destination as `Search`'s morph. ✅ **RESOLVED, same day: the trigger lives outside Top Anchor Nav entirely** — not an icon/button inside the bar's own bounds. Out of scope for this component; belongs to whatever UI sits elsewhere on those screens (e.g. a floating action button, or navigating via Bottom Nav's `Lumo` tab). No prop or internal state needed on Top Anchor Nav for this. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Bar mode's icon buttons: real `<button aria-label="…">` elements (icons alone convey no accessible name) — `leftIcon` typically "Back," `rightIcon`/`rightSecondaryIcon` need per-instance labels (e.g. "Close," "Share").
- ✅ **`Search`'s input pill (both `variant`s) — RESOLVED 2026-07-21, per your direction.** It's a **two-stage control**: `collapsed` renders as a `<button aria-label="Search">`/`<button aria-label="Ask anything">` (not a live input — the visible placeholder text is a label, not an editable value); tapping it swaps to `expanded`, which renders a real `<input type="text" aria-label="…">` that receives focus immediately. This is the same general shape as a "search-icon-that-expands-into-a-search-bar" pattern common in mobile nav bars. ⚠️ The expanded layout itself (width, whether it covers the whole bar, how to collapse back) isn't modeled in Figma — needs a design pass before implementation, but the *mechanism* (button → input) is now confirmed, not guessed.
- ✅ **The sparkles icon's role — RESOLVED 2026-07-21.** It's not decorative — it's a real `<button aria-label="Switch to AI search">` (or similar) that flips `variant` from `analog` to `ai`. Give it its own accessible name distinct from the search button itself, since the two are separately tappable within the same collapsed pill.
- Focus ring: not modeled anywhere on this component. **Design system roadmap.**
- ⚠️ **Touch targets: bar-mode icons pass, others don't confirm cleanly.** Bar-mode icon hit areas are `40×40px` (`Scale/10`) — **below the 44×44 minimum**, same systemic gap as Filter Chip/Checkbox/Radio Button/Toggle/Menu_sub-item/Tab Navigation/Bottom Nav. AI Mode's back button is `40px` circular — same gap. The `cta` ("Skip") text-only tap target has no confirmed minimum padding at all.
- RTL: `chevron-left`'s directionality would need to mirror; not modeled. **Design system roadmap**, same as every icon-driven component.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `mode="bar"` for standard back/title/action screens | Force `AI Mode`'s glow effect onto a plain bar outside of `Search`'s `ai` variant |
| Let tapping the sparkles icon morph `Search` from `analog`→`ai` in place | Model `AI Mode` as a fully independent top-level `mode` disconnected from `Search` — confirmed connected 2026-07-21 |
| Treat `Default`/`Progress bar`/`Slot_center`/`Slot_left`/`CTA_right` as fixed, non-interchangeable configurations — confirmed they never morph into each other | Build transition/morph animation *between those 5* — confirmed not to happen |
| Let something outside Top Anchor Nav (e.g. a FAB, or Bottom Nav's `Lumo` tab) trigger Lumo from those 5 presets' screens | Build a Lumo-trigger icon/button *inside* Top Anchor Nav for those 5 presets — confirmed out of scope for this component |
| Render `Search` as a `collapsed` button by default (either `variant`), expanding to a real `<input>` on tap | Ship the pill as a permanently-static `<div>`, or as an already-live input with no collapsed state |
| Give every icon-only button a real `aria-label`, including the sparkles/AI-switch icon | Ship icon-only buttons unlabeled |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- ~~Live morphing between the other 5 presets~~ — **RESOLVED: never.** They don't merge into each other. ✅ **They can lead to Lumo, but that trigger lives outside Top Anchor Nav entirely — RESOLVED 2026-07-21, no in-bar UI needed for it.**
- ~~Whether `AI Mode` is directly reachable as a starting configuration~~ — **RESOLVED: no**, only reached via a trigger from an active nav surface.
- **`AI Mode`/`Search` expanded-state layout** — confirmed genuinely not designed yet (not a documentation gap). Moved to Design system roadmap.
- ~~`progress` value validation~~ — **RESOLVED 2026-07-21: linear, 0–100, proportional to track width.** Clamping behavior at the edges (0 and 100) still assumed, not separately tested against a Figma sample.
- ~~Mutual exclusivity of `title`/`cta`/`progress`/`children`~~ — **RESOLVED 2026-07-21: confirmed mutually exclusive**, per your direction.
- **Long `title` text** — no wrap/truncation modeled (short samples only, all "Utility Title").
- **RTL** — not modeled.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation, and the `mode` prop itself is a proposed unification, not a Figma-derived fact.

```tsx
import { TopAnchorNav } from '@/components/TopAnchorNav';
import { IconShare } from '@tabler/icons-react';

{/* Default */}
<TopAnchorNav
  title="Utility Title"
  rightSecondaryIcon={<IconShare size={24} stroke={2} aria-label="Share" />}
  onLeftIconClick={() => navigate(-1)}
/>

{/* Progress bar — fill scales linearly, confirmed 2026-07-21 (progress={50} = half the track) */}
<TopAnchorNav mode="bar" progress={25} onLeftIconClick={() => navigate(-1)} />

{/* CTA_right */}
<TopAnchorNav
  title="Utility Title"
  cta={{ label: 'Skip', onClick: handleSkip }}
  onLeftIconClick={() => navigate(-1)}
/>

{/* Search — starts as a plain "analog" search bar. Renders collapsed (button) by default;
    tapping the pill expands it to a real <input> in place (expanded layout not yet modeled
    in Figma). Tapping the sparkles icon instead morphs it into the AI Mode glow treatment
    — confirmed 2026-07-21. */}
<TopAnchorNav mode="search" />

{/* Rendering the bar already in its Lumo-morphed state — e.g. right after the sparkles tap
    above completes. NOT a supported standalone starting configuration — confirmed 2026-07-21,
    Lumo is only ever reached via a trigger from an active nav surface, never rendered fresh. */}
<TopAnchorNav mode="search" variant="lumo" onLeftIconClick={() => navigate(-1)} />
```

## Open questions — what needs your confirmation

1. ~~Do the remaining 5 presets ever morph live into each other?~~ — **RESOLVED 2026-07-21: no, they never merge/morph into each other.** ✅ **New, confirmed the same day: they CAN each morph into the AI dialogue ("Lumo")** — same target as `Search`'s morph. ⚠️ **Unconfirmed:** the concrete trigger UI for this on the other 5 presets — only `Search`'s sparkles icon and Bottom Nav's `Lumo` tab are visually modeled entry points today. Needs a Figma pass showing the actual affordance (icon? always-visible button?) on `Default`/`Progress bar`/etc. before this can be implemented beyond `Search`.
2. ~~AI Mode's glow — one-off effect or formal token?~~ — **RESOLVED 2026-07-21.** `Opacity/65`, `Gradient/Background_Layer1`/`Background_Layer2` stops, and the `Gradient/Default` stroke on `Background_Layer2` are all now formalized/confirmed in `PT_tokens.md` §7.9/§7.11. Blur corrected to a uniform `40px` (was mis-approximated as `20px`/`30px` in generated code), confirmed directly against Figma's Effects panel.
3. ~~Is `Search`'s input pill a real text input, or a button opening a separate surface?~~ — **RESOLVED 2026-07-21: both, in sequence.** Renders `collapsed` as a button by default; tapping the pill **expands it in place into a real, typeable text input**; tapping the sparkles icon instead **morphs `variant="analog"` into `variant="lumo"`**. Both mechanisms confirmed; the expanded state's exact layout is acknowledged not designed yet — see item 10.
4. ~~`progress` prop fill math~~ — **RESOLVED 2026-07-21: linear**, per your direction — `progress={50}` fills exactly half the track.
5. ~~Should Top Anchor Nav be one component with a `mode` prop, or three separate components?~~ — **RESOLVED 2026-07-21: one component with `mode`**, per your direction. `mode` is `'bar'|'search'` (2 values), with Lumo modeled as `Search`'s `variant="lumo"` sub-state (renamed from `"ai"` the same day, per confirmation that "Lumo" is the locked product name).
6. ~~`cta` ("Skip") text color~~ — **RESOLVED 2026-07-21: confirmed intentional.** Deliberately matched to the bar's icon color, not the green action color, because you found the green text not legible enough in this context.
7. ~~`Search`'s circular image asset~~ — **RESOLVED 2026-07-21: a morph-affordance glow cue**, not a decorative avatar — hints that tapping the sparkles icon triggers the `AI Mode` morph.
8. ~~New unattributed `Gradient/Default` reference on `AI Mode`/`Search`~~ — **RESOLVED 2026-07-21, confirmed directly against Figma's Fill/Stroke panel.** It's the real stroke (1px, inside) on the `Background_Layer2` glow layer — not a stray/unused binding.
9. ~~Is Lumo (`variant="lumo"`) directly reachable as a starting configuration?~~ — **RESOLVED 2026-07-21: no.** Confirmed only reachable via a trigger from an already-active nav surface (e.g. `Search`'s sparkles tap, Bottom Nav's `Lumo` tab), never rendered as a standalone starting configuration.
10. **`AI Mode`/`Search` expanded-state design** — **confirmed 2026-07-21: genuinely not designed yet**, not a documentation gap. Moved to the Design system roadmap (`MD_progress.md`) as a real, acknowledged future-design item.
11. ~~What's the actual trigger UI for launching Lumo from `Default`/`Progress bar`/`Slot_center`/`Slot_left`/`CTA_right`?~~ — **RESOLVED 2026-07-21: it lives outside Top Anchor Nav entirely**, per your direction. Not this component's concern — no prop or internal state added for it.
12. ~~Is "Lumo" the confirmed product/brand name for the AI assistant?~~ — **RESOLVED 2026-07-21: yes, confirmed.** `variant` value renamed `ai`→`lumo` throughout this section to match.
13. Component code path + export name — engineering task for the tech lead.

---

## Cross-component consistency check (Navigation family)

Comparing the 3 new Navigation components — [Tab Navigation](#tab-navigation), [Bottom Nav](#bottom-nav), [Top Anchor Nav](#top-anchor-nav) — against each other and against all 17 previously documented components. Pulled live via MCP 2026-07-21, with `get_variable_defs` scoped to each component's own node (not the `Navigation_light` wrapper), per the scoping fix recommended in the Card family's Cross-component consistency check (entry 14).

1. **Third bundle of independent macros with no micro/reusable sub-parts (after Checkbox/Radio Button/Toggle and Button/Button (Icon only)), confirmed rather than assumed.** ✅ Per your 2026-07-21 direction, Tab Navigation, Bottom Nav, and Top Anchor Nav are three peer macros — none reuses another, unlike Card_hero-image/Card_carousel's use of Card_image/Text Block/Ratings. Following your standing instruction, this was asked rather than inferred from the flat sibling structure alone.
2. ~~**Content-prop naming fragmentation — Tab Navigation `label` vs. Bottom Nav `navTitle`.**~~ — **RESOLVED 2026-07-21.** You renamed Bottom Nav's prop directly in Figma to `label`, confirmed live via a fresh `get_design_context` pull. The two sibling nav components are now unified on this specific pair — the larger, system-wide content-prop-naming question (Button `children`, Filter Chip `title`, Eyebrow Highlight/Tags `text`, Menu_item `title`, Card_hero-image/Card_carousel `children`, Text Block `title`/`bodyCopy`) remains open, but this is the first individual instance of that broader pattern to get fixed at the source rather than just flagged.
3. **`Selected`/`Active`-state background reuse confirmed correct, not drift.** Tab Navigation's `Selected` and Menu_item's `Selected` both bind `Colors/Surface/Success` — same token, same "this is the current one" semantic role, genuinely shared rather than coincidental.
4. **Off-label icon-token-as-border pattern appears a fourth and fifth time** (Tab Navigation's `Selected` underline, Bottom Nav's `Active` underline use `Colors/Icon/Action` as a border/underline color) — joining Menu_item's vestigial border and Toggle's pre-fix border. Unlike Menu_item's version (zero-width, invisible), **these two actually render** — reinforcing this is a systemic naming gap (no dedicated "underline" or "border-action" semantic role distinct from the icon role) rather than a per-component mistake.
5. **Underline placement differs between Tab Navigation and Bottom Nav for the same "active/selected" concept** — Tab Navigation underlines the whole tab (bottom edge of the full component); Bottom Nav underlines only the label text, not the icon above it. Confirmed as a genuine, deliberate visual difference (not queried against you, but visually unambiguous from `get_design_context` and the screenshot) — flagged for awareness, not treated as a bug.
6. **`Property 1` un-renamed axis name confirmed a 5th time** (Top Anchor Nav), joining Menu_item/Menu_sub-item/Text Block/Ratings. Fully systemic at this point — no longer separately notable per component going forward.
7. **First component where the same variant axis's different values expose entirely different secondary property panels.** Every prior flat-enum component (Menu_item's `Property 1`, Text Block's `Property 1`) varied *content* under a uniform template. Top Anchor Nav's 7 `Property 1` values are structurally different component shapes (bar vs. pill vs. AI-glow), the first time in the doc set a single Figma variant axis has needed this much unification work to become one clean code API.
8. **Second and third confirmed instances of one documented component embedded in another** (after Text Block's Eyebrow Highlight nesting) — AI Mode's sparkles icon is a real nested **Super Icon** instance, confirmed via node-ID lineage tracing directly to Super Icon's own node range (`707:188x`), a more rigorous confirmation method than the token-matching used for Text Block. Search's sparkles icon, by contrast, is **not** a Super Icon instance despite looking identical — a plain Tabler icon reused independently. Worth noting as a caution: visual identity between two icons doesn't guarantee they're the same underlying implementation — check node-ID lineage, not just appearance.
9. **`Opacity` token gap reaches a third confirmed value.** `Opacity/65` (AI Mode) joins Super Icon's `Opacity/85` and Card_image's `Opacity/50`. ✅ **RESOLVED 2026-07-21, per your direction:** added to `PT_tokens.md` §7.11.
10. **`Gradient/Background_Layer1`/`Background_Layer2` — first real usage found, and stop compositions resolved for the first time.** `PT_tokens.md`'s original Gradient tokens section listed these two (plus `Card_top shadow`/`Card_bottom shadow`) as existing in Figma's `Gradient` collection but "not used by Button, stop values not documented." AI Mode's background glow is the first component in this doc set to actually use them. ✅ **RESOLVED 2026-07-21:** both stop compositions documented and added to `PT_tokens.md` §7.9. `Card_top shadow`/`Card_bottom shadow` remain unused and undocumented — still open if a future component surfaces them.
11. ~~**New stray-reference pattern — this time NOT explained by the wrapper-chrome finding.**~~ — **RESOLVED 2026-07-21, confirmed directly against Figma's Fill/Stroke panel (screenshot).** `Gradient/Default` is a real, deliberate **stroke** (1px, Position: Inside) on the `Background_Layer2` glow layer — not a stray/unused binding at all. The generated Tailwind code had approximated this gradient stroke as a flat `border-[var(--default_fill/stop1)]` (CSS borders can't render a gradient directly), which is why it looked unattributed. **Worth noting as a new lesson distinct from the Card family's wrapper-chrome explanation:** sometimes an "unattributed" reference isn't stray at all — it's a real binding that the code-generation step simplified away. Confirms this doc set now has two distinct root causes for the same symptom (wrapper-chrome bleed vs. code-gen gradient-to-solid-color approximation), not one universal explanation.
12. **`Progress bar`'s fill segment consumes `Gradient/Default`'s two stop primitives directly, not the composed gradient token** — the exact anti-pattern `PT_tokens.md`'s own Gradient section warns against ("§4 is satisfied only if the component consumes the gradient token, not the individual stop primitives"). First confirmed real-world instance of this specific violation; recommend fixing at the component-code level (consume `--pt-gradient-default`) even though the Figma binding itself may be unchanged.
13. **`Colors/Surface/Disabled` reused for `Progress bar`'s non-disabled base track** — same off-label-token-reuse category as Eyebrow Highlight's `Neutral`/`Dark` background (which reuses the same token for a different, non-disabled role). Third confirmed instance of this specific token being reused outside its literal "disabled" meaning.
14. **Icon-pixel-size-not-bound-to-a-token gap confirmed a 10th–12th time** (Tab Navigation has no icon; Bottom Nav's 24px icon and Top Anchor Nav's 24px/40px-hit-area icons both lack a named size token, stroke-weight only) — fully systemic, no longer separately re-litigated.
15. **Touch-target gap confirmed on all 3 new components** — Tab Navigation (172×40px), Bottom Nav (icon+label stack, ~44px tall but narrow/unpadded), Top Anchor Nav (40×40px icon buttons) all fall short of or barely graze the 44×44 minimum. Joins the large existing list (Filter Chip, Checkbox, Radio Button, Toggle, Menu_sub-item, Card's heart icon).
16. ~~**First component in the doc set to raise a genuine "does this even map to one component" engineering question.**~~ — **RESOLVED 2026-07-21, per your direction: one component with a `mode` prop**, not three separate components.
17. **New (2026-07-21), confirmed: `Search` is a two-stage control (collapsed button → expanded input), the first confirmed instance of this pattern in the doc set.** No prior component (Filter Chip, Menu_item, Map_pin, etc.) has a state that changes its fundamental element type (button → input) rather than just its visual treatment.
18. **New (2026-07-21), confirmed: Top Anchor Nav's `cta` ("Skip") deliberately breaks the "interactive text uses the green Action color" convention seen on Filter Chip/Menu_item, for a legibility reason you identified (green text not legible in this context).** Worth remembering as a precedent — not every clickable text element needs the Action color if legibility is a real concern; document the exception rather than treating every future non-green clickable text as a bug.
19. **New (2026-07-21), confirmed: `Search` and Lumo are not independent siblings — Lumo is a reachable sub-state of `Search`, triggered by tapping its sparkles icon.** First confirmed instance of cross-preset live transformation anywhere in this doc set. Recharacterized Top Anchor Nav's `mode` prop from 3 values (`bar`/`ai`/`search`) down to 2 (`bar`/`search`), with Lumo modeled as `Search`'s `variant="lumo"` sub-state (renamed from the initial `"ai"` placeholder once "Lumo" was confirmed as the locked name — see item 21).
20. **New (2026-07-21): a code-generation artifact, not a Figma binding gap, was the real cause of the AI Mode/Lumo blur-value and border-token discrepancies.** The generated Tailwind code approximated a gradient border as a flat single-stop color and reported two different blur values (`20px`/`30px`) for what a direct Figma inspection confirmed is one uniform `40px` blur on both glow layers. Worth remembering going forward: when `get_design_context`'s generated code and a direct Figma panel screenshot disagree, trust the screenshot — the code-gen step can lossy-approximate effects that don't map cleanly to CSS (gradients-as-borders, in this case).
21. **New (2026-07-21): the AI dialogue Top Anchor Nav's Lumo treatment leads to has a real, confirmed product name — "Lumo" — and is reachable from more than one nav surface.** Bottom Nav's real assembly (per your reference screenshot) includes a dedicated `Lumo` destination (sparkles icon), the same icon that triggers `Search`'s morph into Lumo on Top Anchor Nav. This is the first confirmed case of two sibling Navigation macros sharing a destination/feature, not just a token or pattern. ✅ **Confirmed 2026-07-21 as the locked name** (not sample data) — `variant="ai"` renamed to `variant="lumo"` throughout Top Anchor Nav to match.
22. **New (2026-07-21): Bottom Nav's real assembly spacing resolved, via a user-provided reference screenshot rather than a fresh MCP pull.** `Scale/4`/`Scale/3`/`Scale/2` container padding, `Auto` (flexible) gaps between items — worth noting for provenance: this is the first data point in the whole doc set sourced from a screenshot the user provided directly rather than `get_metadata`/`get_variable_defs`/`get_design_context`. Flagged for a live re-pull once a node ID is available, consistent with the "real MCP values only" rule.
23. **New (2026-07-21): "Badge/notification-dot" — corrected from an assumed icon-overlay pattern to a confirmed separate banner component**, positioned below Top Anchor Nav or above Bottom Nav. Worth remembering as a caution: don't assume a common UI pattern's typical implementation (icon-overlay badges are the default elsewhere) carries over to PinTours without confirming — same category of lesson as Super Icon's reversed interactivity assumption.
24. **New (2026-07-21), confirmed: the 5 non-`Search` bar presets never morph into each other, but can each lead into Lumo — and that trigger lives outside Top Anchor Nav entirely.** Narrows the "does this bar morph?" question to something structurally clean and fully closed: presets are fixed relative to *each other*; every one of them is a potential doorway into Lumo, but the doorway itself (a FAB, or navigating via Bottom Nav's `Lumo` tab) is confirmed out of scope for this component — nothing further to model here.

**Summary (2026-07-21, updated after your round-5 confirmations):** No spacing-scale drift, no resolved-color-value drift on any already-documented token. Two real token gaps were found and closed (`Opacity/65`, `Gradient/Background_Layer1`/`Background_Layer2` stops). Bottom Nav's `navTitle`→`label` rename landed and was re-verified live. Top Anchor Nav ships as one component with a 2-value `mode` prop (`bar`/`search`), with Lumo modeled as `Search`'s `variant="lumo"` sub-state (renamed from `"ai"`, now confirmed as the locked product name — not sample data). `progress`'s linear fill math and `title`/`cta`/`progress`/`children`'s mutual exclusivity are confirmed. The "unattributed" `Gradient/Default` reference and `Search`'s circular image asset are both resolved. Tab Navigation's overflow behavior and Bottom Nav's real assembly spacing (padding + auto gaps) are confirmed. **Top Anchor Nav is now fully closed out on every design-facing question:** the 5 non-`Search` presets are confirmed fixed relative to each other and to Lumo (whose trigger lives entirely outside this component). **Only two items remain, both explicitly non-blocking:** the expanded-input state's visual design (acknowledged not built yet — moved to roadmap) and the component code path (pending your tech lead). Bottom Nav's icon slugs for "Booked"/"Profile" were explicitly deferred, per your direction — not worth defining in this pass.

---

# Label

> Figma node: `Label` — node `707:2133`, 6 variant instances of a single underlying component. Direct child of the documentation frame `Input_light` (`707:2121`), alongside three other distinct components — **Footnote**, **Form field**, and **Search**, documented separately below — same "wrapper of instances" pattern as Card/Navigation/Menu_item. ✅ **Per your confirmation 2026-07-21: Form field is the macro (assembled Input) component; Label and Footnote are its micro/reusable sub-parts (composed into Form field's floating label and helper/error text respectively), while Search is an independent sibling, not composed by Form field** — same asked-not-assumed pattern as Card_hero-image/Card_carousel's confirmed use of Card_image/Text Block/Ratings.
> **Family structure:** Label (this section) and [Footnote](#footnote) are micro, standalone components — reusable anywhere a labeled field or helper/error line is needed, not exclusive to [Form field](#form-field). Form field is the macro "Input" component that composes both. [Search](#search) is a fourth, independent sibling — confirmed 2026-07-21 to be its own standalone component, not a variant of Form field and not the same component as Top Anchor Nav's `mode="search"` pill (structurally different, no shared morph behavior).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2133
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Label.tsx]`
> Last updated: 2026-07-21 (round-2 confirmations applied)
> Status: 🟢 Verified against Figma via MCP, including a live re-pull confirming two source-side fixes. Fully closed out except the code path placeholder.

## Description

The field label + optional required-asterisk + optional info icon, rendered in one of two sizes: `Default` (16px, resting inline inside an empty/unfocused field) and `Floated` (14px caption, floated above the field's top border once the field has focus or a value — see [Form field](#form-field)'s floating-label behavior). ✅ **Renamed from Figma's original `Eyebrow` value to `Floated` directly in Figma, per your direction — re-verified live via a fresh `get_metadata` pull.** Resolves the naming collision with Eyebrow Highlight's unrelated "eyebrow" meaning. Not interactive itself in either size — a static text element. ✅ **Confirmed 2026-07-21: the info icon is a real tooltip trigger** (content not yet designed — see Open questions), and it **defaults to hidden** (`showInfoIcon: false`), diverging from Figma's own `infoIcon = true` sample default — see Figma-vs-code divergences.

## Variant axes

**6 variants** confirmed by enumeration (`get_metadata`). Two axes, no `Type`.

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Default` · `Error` · `Disabled` | 3 |
| `Size` | `Default` · `Floated` | 2 |

### Variant math

```
3 (State) × 2 (Size) = 6 theoretical
Actual component count = 6
Excluded                = 0
```

Full matrix, no exclusions.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `state` | `'default' \| 'error' \| 'disabled'` | `'default'` | Lowercased, same rename convention as every other `State` axis in the doc set. |
| `Size` | `size` | `'default' \| 'floated'` | `'default'` | ✅ **RESOLVED 2026-07-21 — renamed directly in Figma from `Eyebrow` to `Floated`, re-verified live.** Code prop now matches the Figma value name exactly (lowercased), no divergence. |
| `labelTitle` | `children` or `label` | `ReactNode` / `string` | `"Label"` | **Sixth** distinct content-prop name pattern in the doc set (see Cross-component consistency check). |
| `asterisk` | `required` | `boolean` | `true` | Renamed for clarity — the asterisk is a visual proxy for a required-field indicator, not a free-floating punctuation toggle. Should also drive `aria-required` on the associated `<input>`, not just the visual mark. |
| `infoIcon` | `showInfoIcon` | `boolean` | ⚠️ **`false`** (Figma sample default is `true`) | ✅ **Per your confirmation 2026-07-21** — the info icon is a real tooltip trigger but defaults to hidden; consumers opt in per field. Same Figma-default-vs-code-default divergence category as Footnote's `showCheckbox` and Tags' `showIcon`. |

Non-visual props, none of which exist in Figma:

- `htmlFor` / `id` — required for real `<label>`→`<input>` association. Not modeled in Figma (design tool has no concept of DOM association) — see Accessibility.
- `onInfoClick` / tooltip content — ✅ **Confirmed 2026-07-21: the info icon is a real tooltip trigger.** Needs a click/hover handler and the tooltip's actual copy — content itself isn't designed in Figma yet (mechanism confirmed, copy is not). See Open questions.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `asterisk` (boolean) | `required` (boolean) | Naming clarity — the prop's real job is required-field semantics, not just showing a glyph. |
| 2 | `infoIcon = true` (Figma sample default) | `showInfoIcon = false` | ✅ **Per your confirmation 2026-07-21** — the info icon is real (a tooltip trigger) but opt-in, not shown by default. |
| 3 | `Size="Floated"` | Backing value for the floated/caption rendering of the label inside [Form field](#form-field) | Not a standalone "small label" choice for a consumer to reach for directly — in practice this size is driven by Form field's own `state`, not set independently. Recommend exposing `size` on `Label` for API completeness/reuse, but note that Form field should set it automatically. |
| 4 | `Size="Floated"` background is baked into each Figma sample (`Colors/Surface/Success` for `Default`, `Colors/Surface/Error` for `Error`, `Colors/Surface/Card_primary` for `Disabled`) | **Not a fixed token of the Label component itself** — the background must be supplied by whatever it's floating over, so it visually "cuts through" the field's top border | ⚠️ Important for the codegen agent: these three background values are demo-only, matching each Figma sample's corresponding Form field state color (`Active`=green/`Success`, `Error`=red/`Error`, `Filled`=white/`Card_primary`). Hardcoding one of these three onto `Label` itself would be wrong in the other two contexts — the floated `Label` needs a `background` prop (or must inherit the parent Form field's own background token) rather than owning a fixed color. |

## Tokens used

Pulled via `get_variable_defs` scoped to the component's own node (`707:2133`), not the wrapper frame, and `get_design_context` on all 6 variant instances. Re-verified live 2026-07-21 after your two source-side fixes (Size rename, Floated/Error color).

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | `Default`/`Default`-size label + asterisk text. |
| `Colors/Typography/Error` | `--pt-semantic-typography-error` | `#802929` | `Error`/`Default`-size **and** `Error`/`Floated`-size label text. ✅ **RESOLVED 2026-07-21 — re-verified live via `get_variable_defs`.** `Error`/`Floated` now binds `Colors/Typography/Error` directly (was `Colors/Typography/Body_secondary`, muted grey) — fixed at the source in Figma, per your direction, so both `Error` states now render red consistently. |
| `Colors/Typography/Body_caption` | `--pt-semantic-typography-body_caption` | `#869a9f` | `Disabled`/`Default`-size **and** `Disabled`/`Floated`-size label text. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `Default`/`Floated`-size label text only (no longer used by `Error`/`Floated` — see above). |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Default`/`Floated`-size demo background — see divergence #4. |
| `Colors/Surface/Error` | `--pt-semantic-surface-error` | `#f7dada` | `Error`/`Floated`-size demo background — see divergence #4. |
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | `Disabled`/`Floated`-size demo background — see divergence #4. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | Both sizes. |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | `Default` size only. |
| `Scale/6` | `--pt-scale-6` | `24px` | `Default` size line-height. |
| `Body_sm/Font_size` | `--pt-typography-body-sm-font_size` | `14px` | `Floated` size only. |
| `Body_sm/Line_height` | `--pt-typography-body-sm-line_height` | `20px` | `Floated` size only. |
| `Scale/1` | `--pt-scale-1` | `4px` | Gap between label text and info icon. |
| `Scale/2` | `--pt-scale-2` | `8px` | Horizontal padding. |

**No HARDCODED values found.** Info icon's own stroke/fill color is an unconfirmed SVG-asset limitation (see below), not a hardcoded value — same category as Ratings' star and Eyebrow Highlight's `Warning`/`Solid` icon color.

⚠️ **Info icon color unconfirmed via MCP.** The `info-circle` glyph renders as a flattened image asset (single-path SVG export), the same limitation already documented on Eyebrow Highlight/Tags's icon-color gaps — `get_variable_defs` can't trace a fill token through an exported vector asset. Needs a manual check in the Figma UI if a specific token (vs. `currentColor` inheritance) is required.

### Per-variant token map

| `State` | `Size` | Text color | Weight |
|---|---|---|---|
| `Default` | `Default` | `--pt-semantic-typography-body` | Regular (500) |
| `Error` | `Default` | `--pt-semantic-typography-error` | Regular (500) |
| `Disabled` | `Default` | `--pt-semantic-typography-body_caption` | Regular (500) |
| `Default` | `Floated` | `--pt-semantic-typography-body_secondary` | Regular (500) |
| `Error` | `Floated` | `--pt-semantic-typography-error` ✅ (fixed 2026-07-21, was `body_secondary`) | Regular (500) |
| `Disabled` | `Floated` | `--pt-semantic-typography-body_caption` | Regular (500) |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | Near-black text | Resting label for an empty, unfocused, valid field. |
| `Error` | Red text (both sizes, as of the 2026-07-21 fix) | Field failed validation. |
| `Disabled` | Muted grey text | Field is disabled. |
| Hover / Focus | Not modeled — Label itself isn't interactive; any hover/focus treatment belongs to the field it labels, not the label text. | |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Render as a real `<label htmlFor={inputId}>`, not a plain `<span>`/`<p>` — this is the actual accessible association mechanism screen readers rely on, and Figma has no way to express it.
- `required` (the asterisk): the visual `*` alone is not sufficient for screen readers. Pair it with `aria-required="true"` on the associated `<input>`, and consider visually-hidden text (e.g. "required") alongside the glyph for users who can't perceive the asterisk's meaning from shape alone.
- ✅ **Info icon — confirmed 2026-07-21: a real tooltip trigger, opt-in (`showInfoIcon: false` by default).** ✅ **Interaction pattern confirmed the same day: click-to-open** (tap/click the icon to open, tap elsewhere or `Escape` to close — not hover-triggered), rendered as a **lightweight popover** (not the native `title` attribute or a full modal). Render as a real `<button aria-label="More information" aria-expanded={open} aria-controls={tooltipId}>`, with the popover itself as `role="tooltip"` or `role="dialog"` depending on whether it ever contains interactive content. Per-field tooltip **copy** is still undesigned — see Open questions/Design system roadmap.
- Focus ring: N/A — Label isn't itself focusable.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Always pair with a real `<label htmlFor>`/`<input id>` association | Render Label as purely decorative text with no DOM link to its field |
| Let `size` switch automatically based on the parent Form field's focus/value state | Let a consumer manually toggle `size="floated"` on a resting, empty, unfocused field |
| Supply a `background` matching whatever surface the floated label sits on | Hardcode the floated label's background to one of the three demo colors |
| Default `showInfoIcon` to `false`, let consumers opt in per field | Show the info icon everywhere by default, or wire it up with no accessible name once content is designed |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long label text:** no wrap/truncation behavior modeled (short single-word samples only).
- **Info icon tooltip content:** interaction pattern confirmed (click-to-open popover), but the actual copy/content per field isn't designed yet — see Open questions.
- **RTL:** not modeled — irrelevant until RTL support is needed, same as every icon-driven component so far.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Label } from '@/components/Label';
import { useState } from 'react';

<Label htmlFor="email" required>
  Email address
</Label>

{/* With the opt-in info-icon tooltip trigger — click-to-open popover, per your confirmation */}
function LabelWithTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <Label
      htmlFor="email"
      required
      showInfoIcon
      infoButtonProps={{
        'aria-expanded': open,
        'aria-controls': 'email-info-tooltip',
        onClick: () => setOpen((o) => !o),
      }}
    >
      Email address
      {open && <Popover id="email-info-tooltip" role="tooltip" onDismiss={() => setOpen(false)}>
        {/* Copy not yet designed — see Design system roadmap */}
      </Popover>}
    </Label>
  );
}

{/* Floated usage — driven automatically by the parent Form field, not set directly */}
<Label htmlFor="email" required size="floated" background="var(--pt-semantic-surface-success)">
  Email address
</Label>
```

## Open questions — what needs your confirmation

1. ~~`Size="Eyebrow"` naming~~ — **RESOLVED 2026-07-21: renamed to `Floated` directly in Figma, re-verified live.**
2. ~~`Floated`-size `Error` not turning red~~ — **RESOLVED 2026-07-21: fixed at the source in Figma, re-verified live.** Both `Error` sizes now bind `Colors/Typography/Error`.
3. ~~Is the info icon a tooltip trigger?~~ — **RESOLVED 2026-07-21: yes, confirmed, defaults hidden.**
4. ~~Tooltip interaction pattern~~ — **RESOLVED 2026-07-21: click-to-open, lightweight popover** (not hover, not native `title`, not a full modal). Per-field tooltip **copy** is still undesigned — route to the Design system roadmap.
5. Component code path + export name — engineering task for the tech lead, still pending their real project root as of 2026-07-21.

---

# Footnote

> Figma node: `Footnote` — node `707:2170`, 2 variant instances of a single underlying component. Direct child of `Input_light` (`707:2121`), sibling of [Label](#label), [Form field](#form-field), and [Search](#search). ✅ **Confirmed 2026-07-21: a micro, reusable component, composed into Form field's helper/error text slot** (same family-structure confirmation as Label — see [Label](#label)'s header for the full family note).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2170
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Footnote.tsx]`
> Last updated: 2026-07-21 (round-2 confirmations applied)
> Status: 🟢 Verified against Figma via MCP. Fully closed out except the code path placeholder.

## Description

Helper/hint text rendered below a form field — carries a plain informational message (`Default`) or a validation error message (`Error`). Also exposes an optional leading checkbox slot and a trailing info icon. ✅ **Per your confirmation 2026-07-21: the checkbox is an optional accessory, not a core part of Footnote's typical use** — Footnote's primary role is plain helper/error text; the checkbox should default to hidden in code, diverging from Figma's own `checkboxView = true` default (see Figma-vs-code divergences).

## Variant axes

**2 variants** confirmed by enumeration (`get_metadata`). One axis, no `Size`.

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Default` · `Error` | 2 |

### Variant math

```
2 (State) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

No exclusions.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | `state` | `'default' \| 'error'` | `'default'` | Same lowercase-rename convention as every other `State` axis. |
| `footnote` | `children` | `ReactNode` | `"Footnote sentence for the form field."` | Same content-prop pattern noted throughout the doc set. |
| `checkboxView` | `showCheckbox` | `boolean` | ⚠️ **`false`** (Figma default is `true`) | **Deliberate divergence, per your confirmation 2026-07-21** — the checkbox is an optional accessory, not shown by default. Same category of Figma-default-vs-code-default divergence as Tags' `showIcon` (item 31, resolved `false` despite an initial `true` reading). |
| `checkbox2` | `checkbox` | `ReactNode \| null` | `null` | Slot override, same pattern as Form field's `rightIcon`. |
| `infoIcon` | `showInfoIcon` | `boolean` | ⚠️ **`false`** (Figma sample default is `true`) | ✅ **Per your confirmation 2026-07-21** — same tooltip-trigger, opt-in-by-default treatment as Label's info icon (see [Label](#label)'s Props). |

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `checkboxView = true` | `showCheckbox = false` | ✅ **Per your confirmation 2026-07-21** — checkbox is an optional, usually-hidden accessory; Footnote's core job is plain helper/error text. |
| 2 | Checkbox glyph is a flat, non-interactive image (`icons/Check-square/unselected`) | ✅ **RESOLVED 2026-07-21, per your confirmation: if `showCheckbox` is ever turned on, render the real, already-documented [Checkbox](#checkbox) component**, not this flattened icon asset. | The layer name literally references Checkbox's own "unselected" state naming — this is now a confirmed reuse decision, not just a naming-based inference. |
| 3 | `infoIcon = true` (Figma sample default) | `showInfoIcon = false` | ✅ **Per your confirmation 2026-07-21** — same divergence as Label's info icon. |

## Tokens used

Pulled via `get_variable_defs` scoped to the component's own node (`707:2170`), not the wrapper frame, and `get_design_context` on both variant instances.

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Typography/Body_caption` | `--pt-semantic-typography-body_caption` | `#869a9f` | `Default` text color. |
| `Colors/Typography/Error` | `--pt-semantic-typography-error` | `#802929` | `Error` text color. |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/ExtraLight` | `--pt-typography-font_weight-extra_light` | `300` | ⚠️ **First confirmed use of the lightest weight token (`Font_weight/ExtraLight`, Figma style name "Thin") anywhere in the doc set** — every prior component uses `Regular`(500) or heavier. Worth a visual gut-check: 300-weight body text at 14px can be thin enough to hurt legibility for an error message specifically; not flagged as a problem, just noted as new. |
| `Body_sm/Font_size` | `--pt-typography-body-sm-font_size` | `14px` | |
| `Scale/6` | `--pt-scale-6` | `24px` | Line-height — same "bound to `Scale/6` instead of a line-height-named token" reuse pattern already documented repeatedly elsewhere. |
| `Scale/2` | `--pt-scale-2` | `8px` | Gap between checkbox / text / info icon. |

**No HARDCODED values found.** Checkbox and info icons are both flattened SVG assets — their own fill/stroke colors aren't traceable via `get_variable_defs` (same limitation as Label's info icon, Ratings' star, Eyebrow Highlight's `Warning`/`Solid` icon).

### Per-variant token map

| `State` | Text color | Weight |
|---|---|---|
| `Default` | `--pt-semantic-typography-body_caption` | ExtraLight (300) |
| `Error` | `--pt-semantic-typography-error` | ExtraLight (300) |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | Muted grey text | Plain helper/hint message. |
| `Error` | Red text | Validation error message. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- ✅ **This is the component that satisfies the "error/validation state" and "helper/hint text" requirements for the Input & Form family** — pair with `aria-describedby` on the associated `<input>` pointing at this element's `id`.
- `Error` state: recommend `role="alert"` (or `aria-live="polite"`) so a validation message announces itself when it appears/changes, without requiring the user to have focus already on it. ⚠️ Industry-standard placeholder, not confirmed by design — Figma has no way to encode live-region behavior.
- ✅ **If `showCheckbox` is enabled: renders the real Checkbox component**, per your confirmation — inherits Checkbox's own accessibility treatment (label association, `aria-checked` semantics) directly, rather than needing a separate implementation.
- ✅ **Info icon — confirmed 2026-07-21: a real tooltip trigger, opt-in by default, click-to-open, lightweight popover** — identical interaction pattern to Label's, see Label's Accessibility section for the full `aria-expanded`/`aria-controls`/`role="tooltip"` treatment. Per-field copy still undesigned — Design system roadmap.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `Error` state + `role="alert"` for real validation failures | Use `Error` styling for non-error hint text just for visual emphasis |
| Pair with `aria-describedby` on the field it explains | Leave Footnote text unassociated with its field in the accessibility tree |
| Default `showCheckbox` to `false` | Assume every Footnote needs its checkbox slot — it's the exception, not the rule |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Long footnote text:** no wrap/truncation behavior modeled (single-sentence sample only).
- **Multiple simultaneous messages** (e.g. a hint AND an error at once): not modeled — Figma shows one Footnote per field, one state at a time.
- **RTL:** not modeled.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { Footnote } from '@/components/Footnote';

{/* Plain helper text */}
<Footnote id="email-hint">We'll never share your email.</Footnote>

{/* Validation error, announced via role="alert" */}
<Footnote id="email-error" state="error" role="alert">
  Enter a valid email address.
</Footnote>
```

## Open questions — what needs your confirmation

1. ~~Is the checkbox a real, commonly-shown part of Footnote, or an optional accessory?~~ — **RESOLVED 2026-07-21: optional accessory, defaults hidden.**
2. ~~Should the checkbox slot, when enabled, literally render the Checkbox component?~~ — **RESOLVED 2026-07-21: yes, confirmed.**
3. ~~Is the info icon a tooltip trigger?~~ — **RESOLVED 2026-07-21: yes, same as Label's, defaults hidden.**
4. ~~Tooltip interaction pattern~~ — **RESOLVED 2026-07-21: click-to-open, lightweight popover**, same as Label. Per-field copy still undesigned — Design system roadmap.
5. Component code path + export name — engineering task for the tech lead, still pending their real project root as of 2026-07-21.

---

# Form field

> Figma node: `Form field` — node `707:2179`, 6 variant instances of a single underlying component. Direct child of `Input_light` (`707:2121`), sibling of [Label](#label), [Footnote](#footnote), and [Search](#search). ✅ **Confirmed 2026-07-21: the macro "Input" component** — assembles [Label](#label) (as its internal floating label) and [Footnote](#footnote) (as its helper/error text) into one composed text-input; neither sub-part is exclusive to Form field (see [Label](#label)'s Family structure note). [Search](#search) is a separate, independent sibling, not a variant of this component.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2179
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/Input.tsx]`
> Last updated: 2026-07-21 (round-2 confirmations applied)
> Status: 🟢 Verified against Figma via MCP. Fully closed out — the `textarea` question is deferred (Design system roadmap, per your direction), not blocking; only the code path placeholder remains.

## Description

A single-line text input with a floating label — the standard PinTours text-entry field (name, email, free text, etc.). ✅ **Confirmed 2026-07-21: a generic text input**, not a Select/Dropdown — the sample's `chevron-down` right icon is a swappable placeholder (`rightIcon` prop), not a fixed, meaningful part of this component's identity. A plain field would typically render with `showRightIcon={false}` or a different icon (e.g. a clear/"x" button once filled).

The label starts centered inline inside the empty, unfocused field (`Default`/`Hover`/`Disabled` states) and **floats up into a small caption above the field's top border** the moment the field is focused or has a value (`Active`/`Filled`/`Error` states) — confirmed directly from real token/layout data (not inferred): the floated position reuses [Label](#label)'s `Floated` size, the resting position reuses its `Default` size. This is the first "floating label" interaction pattern anywhere in the doc set. ✅ **Confirmed 2026-07-21: `Active` is the focused/typing state**, per your direction — the derivation in Figma-vs-code divergence #1 and States below is now confirmed, not just recommended.

## Variant axes

**6 variants** confirmed by enumeration (`get_metadata`). One axis — **no `Size` axis at all**, the first text-entry-style component in the doc set with zero size variation modeled (contrast Button/Filter Chip's `Size` axis, or Checkbox/Radio Button/Toggle's `Large`/`Medium`/`Small` convention).

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Default` · `Hover` · `Disabled` · `Active` · `Filled` · `Error` | 6 |

### Variant math

```
6 (State) = 6 theoretical
Actual component count = 6
Excluded                = 0
```

No exclusions.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | — (derived, not set directly) | — | — | ⚠️ **Not a prop a consumer sets.** `State` is fully derived from real input behavior: `value` (empty vs. filled), `disabled`, focus, and validation — see Figma-vs-code divergences #1. |
| `formInput` | `value` | `string` | `""` | The actual typed/entered text. |
| `rightIcon` | `rightIcon` | `ReactNode \| null` | `null` | |
| `showRightIcon` | `showRightIcon` | `boolean` | `true` | |

Non-visual props, none of which exist in Figma (this is a real `<input>`, most of its API is standard HTML, not design-driven):

- `label` — composes [Label](#label) internally (required text, drives its floating behavior automatically).
- `required` — passed through to the internal `Label`'s `required` prop.
- `helperText` / `errorText` — composes [Footnote](#footnote) internally below the field.
- `disabled` — drives the `Disabled` visual state.
- `onChange`, `onFocus`, `onBlur` — standard controlled-input handlers; focus/blur drive `Active`↔`Filled`/`Default` transitions.
- `id` / `name` — required for the internal `Label`'s `htmlFor` association.
- `type` (`text`/`email`/`password`/etc.) — not modeled in Figma at all; an engineering decision per field instance.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` is a flat 6-value enum a designer picks per instance | Derive it: `disabled` → `Disabled`; else `error` (validation failed) → `Error`; else focused → `Active`; else `value` non-empty → `Filled`; else hovered → `Hover`; else → `Default` | ✅ **`focused` → `Active` confirmed 2026-07-21, per your direction — no longer just a recommendation.** Same "decompose a flat Figma enum into real interaction-driven props" pattern as Filter Chip/Map_pin, but the most complex derivation logic seen so far — 6 mutually exclusive visual states driven by 4 independent real signals (disabled, error, focus, value-presence), not a simple 1:1 click toggle. |
| 2 | Default right icon = `chevron-down` | ✅ **Confirmed 2026-07-21: swappable sample icon, not fixed to this component's identity.** Omit or swap freely per field type. | Resolves the "is this secretly a Select?" question — it's not; chevron-down was just this sample's icon choice. |
| 3 | Label positioning (`Default`/`Floated` size + absolute offsets) | Handled internally by composing the `Label` sub-component and switching its `size` based on derived `State` | Not something the consuming code should hand-position — see [Label](#label)'s divergence #3. |
| 4 | Fixed `380px` sample width | Not hardcoded — fluid/`100%` width recommended, same "sample width, not a real constraint" pattern as Filter Chip's chip widths and Tab Navigation's `172px`. | |

## Tokens used

Pulled via `get_variable_defs` scoped to the component's own node (`707:2179`), not the wrapper frame, and `get_design_context` on all 6 variant instances.

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | `Default`/`Filled` background. |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Hover`/`Active` background. ⚠️ **Off-label token reuse** — same "success" token used for a non-success role (interactive/focused highlight), joining Tab Navigation's `Selected` and Menu_item's `Selected` in reusing this token outside its literal name. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | `Disabled` background. |
| `Colors/Surface/Error` | `--pt-semantic-surface-error` | `#f7dada` | `Error` background. |
| `Colors/Border/Card_primary` | `--pt-semantic-border-card_primary` | `#a8c0c7` | `Default`/`Disabled`/`Filled` border. ⚠️ `Disabled` reuses the same border as `Default` — no dedicated disabled-border token; consistent with how `Disabled` reuses regular tokens elsewhere in the doc set (e.g. Toggle before its fix). |
| `Colors/Border/Action` | `--pt-semantic-border-action` | `#5d9c4d` | `Hover`/`Active` border. |
| `Colors/Border/Error` | `--pt-semantic-border-error` | `#efb5b5` | `Error` border. |
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Input text color (`Active`/`Filled`). |
| `Colors/Typography/Error` | `--pt-semantic-typography-error` | `#802929` | Input text color (`Error`). |
| `Shadow/Solid/Xs` | `--pt-shadow-solid-xs` | `0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` | **`Hover` only.** ⚠️ Confirmed `Active` does **not** carry this shadow, despite sharing `Hover`'s exact background/border colors — shadow presence is the only visual differentiator between the two beyond label position (see States). Don't conflate them. |
| `Scale/Quat` | `--pt-scale-quat` | `1px` | Border width. |
| `Scale/1` | `--pt-scale-1` | `4px` | Corner radius. |
| `Scale/2` | `--pt-scale-2` | `8px` | Internal gap (text ↔ icon). |
| `Scale/4` | `--pt-scale-4` | `16px` | Horizontal padding. |
| `Scale/5` | `--pt-scale-5` | `20px` | Vertical padding. |
| `Scale/0` / `Scale/Half` | `--pt-scale-0` / `--pt-scale-half` | `0px` / `2px` | Shadow effect offsets (see `Shadow/Solid/Xs` above). |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | |
| `Scale/6` | `--pt-scale-6` | `24px` | Line-height. |

**No HARDCODED colors found.** ⚠️ **HARDCODED — no token bound in Figma:** the `380px` sample width (see divergence #4) and the right-icon's own fill color (flattened SVG asset, same limitation as Label/Footnote's icons — likely `Icon/Headings` or `Icon/Body` by convention, unconfirmed).

### Per-variant token map

| `State` | Background | Border | Shadow | Label position | Input text |
|---|---|---|---|---|---|
| `Default` | `--pt-semantic-surface-card_primary` | `--pt-semantic-border-card_primary` | none | Resting (Label `Default` size) | hidden (empty) |
| `Hover` | `--pt-semantic-surface-success` | `--pt-semantic-border-action` | `--pt-shadow-solid-xs` | Resting | hidden (empty) |
| `Disabled` | `--pt-semantic-surface-page` | `--pt-semantic-border-card_primary` | none | Resting, muted (Label `Disabled`) | hidden (empty) |
| `Active` | `--pt-semantic-surface-success` | `--pt-semantic-border-action` | none | **Floated** (Label `Floated` size) | visible, `--pt-semantic-typography-body` |
| `Filled` | `--pt-semantic-surface-card_primary` | `--pt-semantic-border-card_primary` | none | **Floated**, stays up | visible, `--pt-semantic-typography-body` |
| `Error` | `--pt-semantic-surface-error` | `--pt-semantic-border-error` | none | **Floated** | visible, `--pt-semantic-typography-error` |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | White bg, grey border, label resting centered, no value | Empty, unfocused, untouched. |
| `Hover` | Green-tinted bg/border + shadow lift, label still resting, no value | Mouse-hover cue on an empty field. ⚠️ Recommended derivation: `!disabled && !focused && !value && isHovered`. |
| `Disabled` | Pale grey bg, muted label, no value | Field is disabled. |
| `Active` | Green-tinted bg/border (no shadow), label floated, value visible | ✅ **Confirmed 2026-07-21: the focused/typing state**, per your direction — not just a token-behavior inference anymore. |
| `Filled` | White bg, grey border (reverted to resting colors), label floated permanently, value visible | Field has a value and has lost focus — the classic "blurred but filled" floating-label resting point. |
| `Error` | Red bg/border, label floated, value visible in red | Failed validation. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Real `<input>` element, with `id` matching the composed `Label`'s `htmlFor`.
- `Error` state: set `aria-invalid="true"` on the `<input>` and `aria-describedby` pointing at the composed `Footnote`'s `id` (see Footnote's Accessibility section for the `role="alert"` recommendation on that side).
- `Disabled` state: use the real HTML `disabled` attribute, not just a visual treatment — this also removes it from the tab order and blocks interaction natively, which no amount of CSS-only styling would do correctly.
- Focus ring: not modeled in Figma at all (same systemic gap as every other interactive component) — but unlike most of those, this component's `Active` state **does** already show a strong visual change (green bg/border) that could plausibly serve double duty as a focus indicator. ⚠️ Still recommend a dedicated focus-visible outline for keyboard users, since color-alone changes don't reliably meet the 3:1 non-text-contrast focus requirement — flagged to the Design system roadmap like every other component's missing focus ring, not assumed solved by the `Active` styling alone.
- `required`: pass through to the composed `Label`, and also set `aria-required="true"` / the native `required` attribute on the `<input>` itself — don't rely on the visual asterisk alone.
- ⚠️ **Touch target:** the field itself is tall (64px, clears 44px), but the right icon (when present) sits inside a 20px hit area with no confirmed padding — if it's ever made interactive (e.g. a clear/"x" button once filled, or an actual select trigger), it would fail the 44×44 minimum, same systemic gap as everywhere else in the doc set.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Derive `State` from real signals (`disabled`, `error`, focus, `value`) | Let a consumer set `state="Active"` directly as a static prop |
| Compose `Label` + `Footnote` internally, syncing their `size`/`state` to the field's own derived state | Hand-roll a separate label/helper-text implementation next to `Input` |
| Use the real HTML `disabled` attribute for `Disabled` | Fake disabled styling with CSS alone while leaving the input focusable/typeable |
| Treat `chevron-down` as an optional, swappable sample icon | Assume this component is a Select just because of the default icon — confirmed generic text input 2026-07-21 |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Multi-line / `textarea` variant:** not modeled anywhere in Figma — no basis to build one. ✅ **Deferred to the Design system roadmap, per your direction 2026-07-21** — not a blocker for shipping the single-line `Input`; revisit if/when a multi-line need arises.
- **Character counter / max-length indicator:** not modeled.
- **Clear ("x") button once filled:** not modeled — `rightIcon` could carry this, but no Figma sample shows it.
- **Autofill / browser-native styling collisions** with the floating-label pattern (a long-standing CSS challenge with `:-webkit-autofill`): not addressed in Figma, purely an engineering concern.
- **Long input values overflowing the field width:** no truncation/scroll behavior modeled (short sample text only).
- **RTL:** not modeled.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation, and `state` derivation itself is a proposed pattern, not a literal Figma prop.

```tsx
import { Input } from '@/components/Input';
import { useState } from 'react';

function EmailField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <Input
      id="email"
      label="Email address"
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
      errorText={error ?? undefined}
      helperText={!error ? "We'll never share your email." : undefined}
      showRightIcon={false}
    />
  );
}
```

## Open questions — what needs your confirmation

1. ~~Is this a generic text Input, or specifically a Select/Dropdown?~~ — **RESOLVED 2026-07-21: generic text Input**, `chevron-down` is a swappable sample icon.
2. ~~Does this component compose Label and Footnote, or are all 4 siblings fully independent?~~ — **RESOLVED 2026-07-21: Form field is the macro, composing both as micro sub-parts.**
3. ~~Is `Active` literally the focused/typing state?~~ — **RESOLVED 2026-07-21: yes, confirmed.**
4. ~~Multi-line (`textarea`) variant~~ — **DEFERRED 2026-07-21, per your direction — moved to the Design system roadmap, not blocking.** Not modeled in Figma at all; revisit if/when a real multi-line need arises.
5. Component code path + export name — engineering task for the tech lead.

---

# Search

> Figma node: `Search` — node `707:2204`, 2 variant instances of a single underlying component. Direct child of `Input_light` (`707:2121`), sibling of [Label](#label), [Footnote](#footnote), and [Form field](#form-field) — not composed by or into any of them. ✅ **Confirmed 2026-07-21: an independent, standalone component**, distinct from [Top Anchor Nav](#top-anchor-nav)'s `mode="search"` pill — structurally different (two-box pill-with-attached-icon-button layout here, vs. Top Anchor Nav's single morphing pill) and confirmed to share no morph/Lumo behavior with it. Same "visual resemblance ≠ shared implementation" caution already documented for Search's own sparkles icon on Top Anchor Nav (Navigation family, item 8).
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=707-2204
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/components/SearchInput.tsx]`
> Last updated: 2026-07-21 (round-2 confirmations applied)
> Status: 🟢 Verified against Figma via MCP. Fully closed out except the code path placeholder.

## Description

A standalone search field: a text-entry pill attached to a dedicated search-icon button, rendered as one visually continuous control (shared border, no seam between the text area and the icon button beyond a corner-radius split). Two states only — `Default` (empty, muted placeholder) and `Active` (green-tinted, near-black text, drop shadow). No `Label`/`Footnote` composition, no `required`/asterisk, no multi-state validation model — a simpler, single-purpose component than [Form field](#form-field). ✅ **Confirmed 2026-07-21: `Active` is the focused state** (same confirmation as Form field's `Active`), and **Search is deliberately kept simpler than Form field — no validation/error states are planned**, per your direction.

## Variant axes

**2 variants** confirmed by enumeration (`get_metadata`). One axis, no `Size`.

| Axis (Figma property) | Values | Count |
|---|---|---|
| `State` | `Default` · `Active` | 2 |

### Variant math

```
2 (State) = 2 theoretical
Actual component count = 2
Excluded                = 0
```

No exclusions. **No `Error`/`Disabled`/`Hover`/`Filled` states exist** — a much smaller state surface than Form field's 6, despite both being text-entry components pulled in the same session (see Cross-component consistency check). ✅ **Confirmed 2026-07-21: this is intentional, not a gap** — Search stays deliberately simpler than Form field, per your direction.

## Props (code API)

| Figma property | Recommended code prop | Type | Default | Mapping notes |
|---|---|---|---|---|
| `State` | — (derived) | — | — | Same derivation caution as Form field — not a prop a consumer sets directly. |
| *(text content)* | `value` / `placeholder` | `string` | `"Enter search query"` | Figma's sample text doubles as both the placeholder (`Default`) and the "typed" value (`Active`) — no separate `formInput`-style prop was exposed here the way Form field has one; treat the visible string as a real `<input>` value/placeholder pair. |

Non-visual props, none of which exist in Figma:

- `onChange`, `onSubmit`/`onSearch` — standard controlled-input + submit handlers.
- `onFocus`/`onBlur` — drive `Default`↔`Active`, same recommended derivation pattern as Form field.

## Figma-vs-code divergences (logic tree for the codegen LLM)

| # | Figma default | Recommended code | Why the change |
|---|---|---|---|
| 1 | `State` is a flat 2-value enum | Derive from focus: unfocused/empty → `Default`, focused → `Active` | ✅ **`focused` → `Active` confirmed 2026-07-21, per your direction.** Simpler version of Form field's derivation — only one real signal (focus) drives this component's two states, no separate `error`/`disabled`/`value`-presence branches modeled (confirmed deliberate, not a gap — see Description). |
| 2 | Fixed `370px` sample width | Not hardcoded — fluid/`100%` width recommended, same sample-width caveat as Form field's `380px`. | |
| 3 | `Active` renders `Shadow/Solid/Xs` in Figma today | **Omit the shadow on `Active`** | ✅ **RESOLVED 2026-07-21, per your direction: align with Form field's shadow-free `Active`**, now that both are confirmed to mean "focused." A code-level decision — Figma itself hasn't been updated to match yet; recommend a matching source-side removal so the two stay in sync, but not blocking implementation today. |

## Tokens used

Pulled via `get_variable_defs` scoped to the component's own node (`707:2204`), not the wrapper frame, and `get_design_context` on both variant instances.

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Colors/Surface/Card_primary` | `--pt-semantic-surface-card_primary` | `#ffffff` | `Default` background (both the text area and the icon button). |
| `Colors/Surface/Success` | `--pt-semantic-surface-success` | `#dfebdb` | `Active` background. Same off-label "success"-token-as-interactive-highlight reuse as Form field's `Hover`/`Active`. |
| `Colors/Border/Card_primary` | `--pt-semantic-border-card_primary` | `#a8c0c7` | `Default` border. |
| `Colors/Border/Action` | `--pt-semantic-border-action` | `#5d9c4d` | `Active` border. |
| `Colors/Typography/Body_secondary` | `--pt-semantic-typography-body_secondary` | `#869a9f` | `Default` placeholder text color. |
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | `Active` text color. |
| `Shadow/Solid/Xs` | `--pt-shadow-solid-xs` | `0px 2px 0px 0px #a8c0c7, 0px 0px 4px 0px #cbd9dd` | **`Active` in Figma today.** This is the exact same shadow Form field applies to its `Hover` state, not its `Active` state — the word "Active" described two different visual moments across these two sibling components. ✅ **RESOLVED 2026-07-21, per your direction: the code implementation should drop this shadow on `Active`**, aligning Search with Form field's shadow-free `Active` treatment now that both are confirmed to mean "focused." ⚠️ **Not yet changed at the Figma source** — this is a code-level decision, applied here in the docs; recommend a matching removal in Figma so the two stay in sync going forward, but not blocking. |
| `Scale/Quat` | `--pt-scale-quat` | `1px` | Border width. |
| `Scale/1` | `--pt-scale-1` | `4px` | Corner radius (outer corners only — the two halves share a seam with no radius between them). |
| `Scale/2` | `--pt-scale-2` | `8px` | Internal gap. |
| `Scale/5` | `--pt-scale-5` | `20px` | Padding (text side). |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | |
| `Scale/6` | `--pt-scale-6` | `24px` | Line-height. |

**No HARDCODED colors found.** ⚠️ **HARDCODED — no token bound in Figma:** `370px` sample width (see divergence #2); the icon button's fixed `48px` width and `10px` internal padding also have no named size token behind them (though `48px` conveniently equals `--pt-scale-12`, this wasn't confirmed as an intentional binding vs. coincidence). Search icon's own fill color is the same flattened-SVG-asset limitation as every other icon in this family.

### Per-variant token map

| `State` | Background | Border | Shadow | Text |
|---|---|---|---|---|
| `Default` | `--pt-semantic-surface-card_primary` | `--pt-semantic-border-card_primary` | none | `--pt-semantic-typography-body_secondary` (placeholder) |
| `Active` | `--pt-semantic-surface-success` | `--pt-semantic-border-action` | ~~`--pt-shadow-solid-xs`~~ **none, per code-level decision** (see divergence #3) | `--pt-semantic-typography-body` |

## States

| State (Figma) | Visual | Meaning |
|---|---|---|
| `Default` | White bg, grey border, muted placeholder text | Resting/empty. |
| `Active` | Green-tinted bg/border, near-black text. ✅ **Shadow removed 2026-07-21, per your direction** (Figma today still shows it — see divergence #3). | ✅ **Confirmed 2026-07-21: the focused state**, same confirmation as Form field's `Active` — now also aligned with it visually (both shadow-free). |
| Hover | ⚠️ Not modeled. **Design system roadmap.** |
| Disabled | ⚠️ Not modeled — no variant exists. |
| Error | ✅ **Confirmed 2026-07-21: intentionally absent** — Search is deliberately kept simpler than Form field, no validation model planned. |

## Accessibility

Required section — Figma encodes no accessibility metadata.

- Real `<input type="search">`, with a visible or visually-hidden `<label>` (e.g. "Search") — the placeholder text alone is not an accessible label substitute.
- The search-icon button: a real `<button type="submit" aria-label="Search">` (or `type="button"` if it triggers a search programmatically rather than a form submit) — icon-only, needs its own accessible name, same pattern as every other icon-only button in the doc set.
- Focus ring: not modeled. **Design system roadmap.**
- ✅ **Touch target: the icon button (`48px` wide × field-height tall, ~64px) clears the 44×44 minimum** — a rare positive finding in a doc set where most icon-only controls (Button (Icon only) `Small`, Filter Chip, Top Anchor Nav's bar icons) fall short.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use for a dedicated, standalone search field (search results page, search-first surfaces) | Use as a general-purpose text `Input` — it has no label/validation/helper-text model at all |
| Give the icon button its own `aria-label` | Ship the search icon as an unlabeled, purely decorative element if it's actually clickable |
| Treat as fully independent from Top Anchor Nav's `Search`/Lumo pill | Assume this component shares Top Anchor Nav's morph-to-Lumo behavior — confirmed 2026-07-21 it does not |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Empty submit** (pressing the search button/Enter with no text): behavior not modeled.
- **Clear ("x") button once a query is typed:** not modeled.
- **Long query text overflow:** not modeled (short sample only).
- **RTL:** not modeled — the icon button's fixed right-side position would need mirroring.

## Code example

⚠️ Illustrative only — prop names above are recommendations pending tech-lead confirmation.

```tsx
import { SearchInput } from '@/components/SearchInput';
import { useState } from 'react';

function DestinationSearch() {
  const [query, setQuery] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }}>
      <SearchInput
        aria-label="Search destinations"
        placeholder="Enter search query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
```

## Open questions — what needs your confirmation

1. ~~Is this the same component as Top Anchor Nav's `mode="search"` pill?~~ — **RESOLVED 2026-07-21: no, a distinct standalone component.**
2. ~~Is `Active` literally the focused state?~~ — **RESOLVED 2026-07-21: yes, confirmed.**
3. ~~Should Search ever support validation/error states?~~ — **RESOLVED 2026-07-21: no, deliberately kept simpler than Form field**, per your direction.
4. ~~Should Search's `Active` shadow be aligned with Form field's shadow-free `Active`?~~ — **RESOLVED 2026-07-21: yes, align by removing Search's shadow**, per your direction. Applied as a code-level decision; Figma itself hasn't been updated to match yet — low-priority source-side cleanup, not blocking.
5. Component code path + export name — engineering task for the tech lead, still pending their real project root as of 2026-07-21.

---

## Cross-component consistency check (Input & Form family)

Comparing the 4 new Input & Form components — [Label](#label), [Footnote](#footnote), [Form field](#form-field), [Search](#search) — against each other and against all 20 previously documented components. Pulled live via MCP 2026-07-21, with `get_variable_defs` scoped to each component's own node (not the `Input_light` wrapper), per the scoping fix established in the Card family's Cross-component consistency check (entry 14) and reused for Navigation.

1. **First bundle combining both prior bundle shapes in one pull.** Every prior multi-component bundle was either all-independent-macros (Button/Button (Icon only); Checkbox/Radio Button/Toggle; Tab Navigation/Bottom Nav/Top Anchor Nav) or macro-plus-composed-micros (Card_hero-image/Card_carousel composing Card_image/Text Block/Ratings). This bundle is the first to combine both patterns at once: Form field is a macro that composes two micros (Label, Footnote), while Search sits alongside as a fully independent fourth sibling. ✅ Confirmed by asking directly, per your standing instruction, not inferred from the flat sibling layout.
2. **First "floating label" interaction pattern in the doc set.** Label's two size variants (`Default`/`Floated`) map directly onto two different behavioral moments of its parent Form field (resting vs. focused-or-filled) — a more specific, state-synchronized composition relationship than Card_image's simpler independent reuse inside Card_hero-image/Card_carousel.
3. **Icon-asset-naming drift for the same "info" glyph.** Label's info icon layer is named `info-circle` (single vector); Footnote's is `icons/Character/info` (4-vector compound), pulled in the same session, for what renders as the identical ⓘ glyph in both. Joins the broader "icon resolution isn't yet unified across the file" pattern already seen with the Tabler-icon-placeholder findings.
4. **Footnote's checkbox icon literal layer name (`icons/Check-square/unselected`) strongly implies intended reuse of the real, already-documented [Checkbox](#checkbox) component** rather than a bespoke implementation — the first time a component's own Figma layer name has pointed this directly at another documented component's naming convention.
5. **`Colors/Typography/Body_caption`/`Body_secondary` duplicate-token pattern confirmed again** (Label's `Disabled` uses `body_caption`; its `Default`/`Floated` uses `body_secondary`; Footnote's `Default` uses `body_caption`) — same resolved hex (`#869a9f`), different token names, joining the long list of prior confirmations (Menu_item, Tab Navigation, etc.). No longer separately notable going forward.
6. **`Colors/Surface/Success` reused as an interactive/focus highlight, not a "success" signal, on both Form field (`Hover`/`Active`) and Search (`Active`).** Same off-label-token-reuse category as Tab Navigation's `Selected` and Menu_item's `Selected` — reinforces this is a systemic naming gap (no dedicated "interactive-tint" or "focus-highlight" semantic role distinct from "success"), not a per-component mistake.
7. ~~`Active` = focused on both Form field and Search, but the two components implement it with genuinely different visual treatment.~~ — **RESOLVED 2026-07-21, per your direction: aligned by removing Search's shadow.** Form field's `Active` has no shadow and a floated label; Search's `Active` **used to** carry a shadow (`Shadow/Solid/Xs` — token-for-token the same one Form field applies on `Hover`, not its own `Active`) and no label to float. Per your direction, the code implementation now omits Search's `Active` shadow to match Form field's shadow-free treatment. ⚠️ **Not yet changed at the Figma source** — a code-level decision applied in the docs; recommend a matching removal in Figma so the two stay in sync, but not blocking. First case in the doc set where a same-semantic-different-implementation drift was resolved by picking one component's treatment as the standard, rather than by a Figma-side fix or leaving both as documented exceptions.
8. **First text-entry components with zero `Size` axis.** Form field and Search both ship one size only — contrasts with Button/Filter Chip's `Size` axis and Checkbox/Radio Button/Toggle's unified `Large`/`Medium`/`Small` convention. Not a gap to fix, just noted as the first components built this way.
9. **First confirmed use of `Font_weight/ExtraLight` (300, Figma style "Thin") in the doc set** — Footnote's helper/error text. Every prior component used `Regular`(500) or heavier.
10. ~~Floated-size Label's `Error` state doesn't turn red~~ — **RESOLVED 2026-07-21, fixed at the source in Figma per your direction, re-verified live via `get_variable_defs`.** `Error`/`Floated` now binds `Colors/Typography/Error` directly (was `Body_secondary`). Both `Error` sizes render red consistently as of this fix.
11. **A suggestive default icon (`chevron-down`) initially looked like it fixed Form field's identity as a Select/Dropdown — confirmed otherwise.** Same caution category as Super Icon's reversed interactivity assumption and Menu_item's "does naming parity carry behavior" lesson: a component's default sample prop doesn't necessarily reveal its true identity — worth checking directly rather than inferring from the most visually distinctive default.
12. **Required-field indication, label association, and error/validation state are all real, Figma-modeled facts for the first time in the doc set**, not invented per your instruction: Label's `asterisk` prop (required-field), Form field/Footnote's paired `Error` states (validation), and the general `<label htmlFor>`/`<input id>` pattern recommended throughout (though the DOM association itself isn't and can't be modeled in Figma — an engineering-side accessibility requirement, flagged not invented).
13. **Icon-pixel-size-not-bound-to-a-token gap confirmed again** (Label/Footnote's 16px info/checkbox icons, Form field/Search's 20px chevron/search icons) — fully systemic at this point, consistent with the 12+ prior confirmations across the doc set.
14. **Touch-target gap, with one exception.** Form field's own field height (64px) clears 44×44; its potential future interactive right-icon (20px, unconfirmed padding) would not. Search's icon button (48×~64px) **clears** the minimum — a rare positive finding, joining Menu_item's `chevron-right` and the Card family's `chevron-right` default as one of the few components in this doc set that doesn't need a touch-target flag.
15. **New (2026-07-21), confirmed: Label's `Size="Eyebrow"` renamed to `Size="Floated"` directly in Figma, re-verified live via `get_metadata`.** Resolves the naming collision with Eyebrow Highlight's unrelated meaning — the code prop (`size: 'default' | 'floated'`) now matches the Figma value name exactly, no rename divergence needed on the code side. First time in this pull that a naming-collision flag was resolved at the Figma source within the same round of confirmations, rather than staying a code-side-only rename recommendation.
16. **New (2026-07-21), confirmed: Label's and Footnote's info icons are both real tooltip triggers, confirmed by you, but both default to hidden** (`showInfoIcon: false`) despite Figma's own `infoIcon = true` sample default — a third instance of the Figma-default-vs-code-default divergence pattern in this family alone (joining Footnote's `showCheckbox`), and consistent with Tags' `showIcon` precedent elsewhere in the doc set.
17. **New (2026-07-21), confirmed: Footnote's checkbox slot, when enabled, renders the real Checkbox component** — closes the family's last remaining "reuse vs. bespoke" ambiguity; every optional sub-element in this family (Label's floating behavior, Footnote's checkbox) now composes an already-documented component rather than reimplementing it.
18. **New (2026-07-21), confirmed: Label's and Footnote's info-icon tooltip interaction pattern is click-to-open, lightweight popover** — not hover, not native `title`, not a full modal. Per-field copy is still undesigned (Design system roadmap), but the trigger mechanism and UI treatment are now fully specified for the codegen agent.
19. **New (2026-07-21), confirmed: the Form field/Search `Active`-shadow drift (item 7) resolved by standardizing on Form field's shadow-free treatment**, not by keeping both as documented exceptions or waiting for a Figma-side fix first. First instance in the doc set of a cross-component visual drift resolved via an explicit "pick one as the standard" decision rather than a source-side rename/token fix.

**Summary (2026-07-21, updated after your round-3 confirmations):** No spacing-scale or resolved-color-value drift found against any already-documented token — every color/spacing/typography value in this family resolves to an existing `PT_tokens.md` token, zero new token gaps. Two source-side fixes landed directly in Figma and were re-verified live: `Size="Eyebrow"`→`"Floated"` (resolves the Eyebrow Highlight naming collision) and the `Floated`-size `Error` label color (now binds `Colors/Typography/Error`, matching the full-size `Error` treatment). `Active` is confirmed to mean "focused" on both Form field and Search; the two components' differing visual treatment (shadow vs. no shadow) is now resolved by standardizing on Form field's shadow-free version, applied as a code-level decision pending a matching Figma-side cleanup. Search is confirmed deliberately simpler than Form field (no validation states planned). Both components' info icons are confirmed real tooltip triggers that default to hidden, open via click, and render as a lightweight popover; Footnote's checkbox is confirmed to reuse the real Checkbox component when enabled. **The Input & Form family is now fully closed out** except two non-blocking items: the info-icon tooltip's actual copy/content (moved to the Design system roadmap) and the literal component code paths (still pending your tech lead's project root as of 2026-07-21, same placeholder status as every other component in the doc set).

---

# Fixed Grid (Mobile)

> Figma node: `Fixed Grid` — node `1582:1686`, a documentation frame containing one annotated mobile screen mockup (402×874px, iPhone-style device frame). Not a component with variants/states — a **layout specification**: fixed margins, safe-area exclusion zones, consistent header/footer chrome placement, and the typography roles used for page-level content. Per your direction 2026-07-21, documented as a new top-level section in `PT_components.md` (not `PT_tokens.md`), scoped to **mobile only** for this pass — this Figma frame shows a single mobile breakpoint; tablet/desktop grid variants (if they exist elsewhere in the file) are explicitly deferred, not pulled.
> ⚠️ **Tooling note:** `get_metadata` failed on this node with a repeated SSE/JSON parse error (not a data issue — retried 3× with the same result). Documented instead from `get_design_context` (full component tree + generated code, including child node IDs) plus `get_variable_defs` and a screenshot — equivalent real-MCP coverage, just a different combination of tools than usual. No values in this section are inferred or estimated.
> Figma link: https://www.figma.com/design/oUL21btTntSZLQCpLAEAe5/PinTours-Design-System?node-id=1582-1686
> Tokens: named from [`PT_tokens.md`](./PT_tokens.md)
> Code path: `[fill in with tech lead — e.g. src/styles/grid.css or a Layout/PageShell component]`
> Last updated: 2026-07-22
> Status: 🟢 Verified against Figma via MCP (via `get_design_context`/`get_variable_defs`, not `get_metadata` — see tooling note). All 3 open design questions resolved and re-verified live 2026-07-22. Mobile-only; tablet/desktop scope deferred; code path still pending tech lead.

## Description

Despite the Figma name "Fixed Grid," this spec defines **no column/gutter system** — no column count, no gutter width anywhere in the pulled node. It's a simpler, single-column **fixed-margin layout framework** for mobile pages: a `16px` margin on each side, safe-area exclusion zones top and bottom for device chrome (status bar, home indicator), consistent placement of the already-documented [Top Anchor Nav](#top-anchor-nav) and [Bottom Nav](#bottom-nav) components as page header/footer, and two named typography roles ("Page headline," "Body content spec") for the content in between. ✅ Confirmed 2026-07-22: "Fixed Grid" is the complete spec — no separate multi-column system exists elsewhere in the file.

## Layout specification

Pulled from the "Grid" frame (`225:1819`, 402×874px) and its children — real values, not estimated from the screenshot.

| Rule | Value | Token | Notes |
|---|---|---|---|
| Side margins | `16px` each side | `--pt-scale-4` | Confirmed twice: the "16 px margins on either side" annotation, and the content block's own horizontal padding (`px-Scale/4`). |
| Content width formula | viewport width − 32px | derived | Confirmed mathematically: sampled viewport `402px` − 2×`16px` = `370px`, matching the Body content block's explicit rendered width (`370px`) exactly. |
| Block spacing (major sections within page content) | `32px` | `--pt-scale-8` | Gap on the `Page content` container (`225:1830`). Only one content block sampled in this frame — spacing between more than 2 blocks isn't demonstrated. |
| Headline-to-body gap | `12px` | `--pt-scale-3` | Gap inside the `HL+explainer` block (`225:1831`), also used as its top padding. |
| Top safe-area exclusion | `62px` (this device sample) | not a token — see Edge cases | iOS status bar mockup height. Device-specific, not a fixed design-system value — real implementation should use `env(safe-area-inset-top)`, not this literal pixel figure. |
| Bottom safe-area exclusion | `34px` (this device sample) | not a token — see Edge cases | iOS home-indicator mockup height. Same caveat — use `env(safe-area-inset-bottom)`. |
| Sampled viewport width | `402px` (illustrative device only) | `--pt-breakpoint-canvas_small` = `440px` is the real mobile ceiling | ✅ Confirmed 2026-07-22: `402px` is just this one sample device's point-width (iPhone 14/15/16 class), not itself a breakpoint. Design/build against `canvas_small` (440px) as the mobile ceiling. |
| Device frame corner radius | `48px` | `--pt-scale-12` | ⚠️ This is the illustrative phone-bezel mockup's own styling, not a PinTours content-radius spec — noted for completeness, not a real grid rule. |

**At a glance** — the two `Scale/3` bands are distinct, not one shared value applied once (see the Code example note below for why this tripped us up initially):

```
┌──────────────────────────────────────────┐
│ ←16px→ Scale/4 (side margin)     ←16px→   │
│                                            │
│              ┆                            │
│              ┆ 12px  Scale/3 (band #1 —   │
│              ┆        top padding)        │
│              ┆                            │
│          Page headline                    │
│              ┆                            │
│              ┆ 12px  Scale/3 (band #2 —   │
│              ┆        headline→body gap)  │
│              ┆                            │
│   Body content providing explanation       │
│                                            │
└──────────────────────────────────────────┘
              ┆
              ┆ 32px  Scale/8 (gap to next block,
              ┆        not demonstrated with 2+ blocks)
              ▼
```

✅ **Cross-check, not a new finding but a valuable re-confirmation:** Bottom Nav's container padding in this mockup (`Scale/4` left/right, `Scale/3` top, `Scale/2` bottom, per the pulled code) matches, value-for-value, the spacing previously documented from your reference screenshot (`MD_progress.md` Open decisions item 99) — which had been flagged as sourced from a screenshot, not an independent MCP pull, pending live re-verification. **This Fixed Grid node is that live re-verification** — the values are confirmed via `get_design_context` on a real, independent node. Closing item 99's outstanding re-verification request.

## Typography roles used

| Role | Figma property | Token | Resolved | Flag |
|---|---|---|---|---|
| Page headline | `Typography/Heading Regular/H3` | `--pt-typography-small-h3-font_size` / `-line_height` | `32px` / `40px` | ✅ **RESOLVED and re-verified live via MCP 2026-07-22.** Per your direction, amended in Figma from H4/`large` to H3/`small` so the mobile headline correctly uses the `small` device scale. Re-pulled `get_design_context` + `get_variable_defs` on the live node (`225:1832`) to confirm: text style is now bound to `Typography/Heading Regular/H3`, resolving to `Heading 3/Font_size`=`32`, `Heading 3/Line_height`=`40` — an exact match for `--pt-typography-small-h3-*` (32/40 per `PT_tokens.md` §7.2), not `--pt-typography-large-h3-*` (which would be 40/48). Rendered pixel size is unchanged (32/40) — only the semantic token binding changed, which is the correct fix. ⚠️ Note: the frame's own annotation callout box (node `1580:1671`) still displays stale text reading `/* Typography/Heading Regular/H4 */` and `Heading-4-Font_size` — that's leftover Figma documentation-chrome text that wasn't updated when the actual layer was amended. Doesn't affect this spec (which reflects the live binding, not the stale annotation), but worth a quick fix in Figma for future clarity. |
| Body content | `Typography/Body Regular/Default` | `--pt-typography-body-default-font_size` / `--pt-scale-6` | `16px` / `24px` | No drift — `Body` tokens aren't device-prefixed in `PT_tokens.md` (one universal scale regardless of viewport), so this is consistent by design, not a coincidence. |

Both roles: `--pt-typography-font_family-primary` (Poppins), `--pt-typography-font_weight-regular` (500), color `--pt-semantic-typography-headings` (headline) / `--pt-semantic-typography-body` (body content) — both resolve to `#222628` in light mode, correctly bound to their respective semantic roles (not the same token reused twice).

## Tokens used

| Figma variable | Canonical token | Resolved value | Flag |
|---|---|---|---|
| `Scale/4` | `--pt-scale-4` | `16px` | Side margins; also the content block's horizontal padding. |
| `Scale/8` | `--pt-scale-8` | `32px` | Inter-block spacing. |
| `Scale/3` | `--pt-scale-3` | `12px` | Headline-to-body gap / top padding. |
| `Scale/12` | `--pt-scale-12` | `48px` | Device-mockup bezel radius only — not a content spec. |
| `Colors/Typography/Headings` | `--pt-semantic-typography-headings` | `#222628` | Page headline color. |
| `Colors/Typography/Body` | `--pt-semantic-typography-body` | `#222628` | Body content color. |
| `Colors/Surface/Page` | `--pt-semantic-surface-page` | `#f2f6f7` | Page background (the `Grid` frame's own fill). |
| `Heading 3/Font_size`, `Heading 3/Line_height` | `--pt-typography-small-h3-font_size`, `-line_height` | `32px`, `40px` | See Typography roles — resolved, re-verified live 2026-07-22 (amended from H4/`large` to H3/`small` in Figma). |
| `Body_default/Font_size` | `--pt-typography-body-default-font_size` | `16px` | |
| `Typography/Font_family/Primary` | `--pt-typography-font_family-primary` | `Poppins` | |
| `Typography/Font_weight/Regular` | `--pt-typography-font_weight-regular` | `500` | |

**No HARDCODED grid values found** — every real spacing/typography value in the content area resolves to an existing token. The two device-chrome pixel figures (`62px` status bar, `34px` home indicator) are correctly excluded from this — they're device-mockup reference dimensions, not PinTours tokens, and shouldn't be hardcoded into real layout code (use `env(safe-area-inset-*)` instead — see Edge cases).

⚠️ **Documentation-chrome contamination confirmed a third root cause, distinct from the two already known (wrapper-chrome bleed, code-gen flattening).** The aggregate `get_variable_defs` pull on this node returned a large batch of unrelated tokens — `Grayscale/900`, `Grayscale/400`, `Labels/Primary`, `Base/white`, `Gradient/Default`, `Default_fill/Stop1`/`Stop2` — none of which are PinTours tokens. Traced via `get_design_context` to two identifiable, unrelated sources: (1) the page's own "Fixed Grid" / "Layout framework" title-and-annotation banner (same documentation-page chrome pattern as Card/Navigation), and (2) the **iOS status bar mockup** itself (native Apple HIG colors/SF Pro font, used only to render a realistic device frame around the actual content). Neither belongs to the grid spec — both excluded from the tables above. Worth flagging as a new instance of root cause #1 (doc-page chrome bleed), now confirmed to also include device-frame mockup chrome, not just title/description/divider chrome.

## Composition

This layout reuses two already-documented macro components as its fixed header/footer:

- **[Top Anchor Nav](#top-anchor-nav)** — pinned directly below the top safe area, rendered here in its `Default`/bar mode (`leftIcon` = back chevron, centered `title` = "Page title", `rightIcon` = close/x). Confirms "Consistent Page header placement" per the annotation — every page in this grid uses the same anchor-nav positioning, not a per-page choice.
- **[Bottom Nav](#bottom-nav)** — pinned directly above the bottom safe area. See the cross-check above re-confirming its assembly spacing.

Neither component's own spec changes because of this grid — this section only documents *where* they sit relative to the page content and safe areas, not new props or states on either.

## Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Apply `16px` (`--pt-scale-4`) side margins to page content | Let page content run edge-to-edge on mobile |
| Use `env(safe-area-inset-top)`/`env(safe-area-inset-bottom)` for device-chrome exclusion | Hardcode `62px`/`34px` — those are this one sample device's dimensions, not universal |
| Pin Top Anchor Nav/Bottom Nav consistently across pages | Vary header/footer placement per page without a real design reason |
| Use `small`-H3 (`--pt-typography-small-h3-*`) for the mobile page headline | Reuse `large`-H4/H3 values on mobile — resolved 2026-07-22, see Typography roles |

## Edge cases

⚠️ Each of these is unspecified in Figma — confirm with design, or the agent will guess.

- **Safe-area insets across devices:** this mockup samples one device's status-bar/home-indicator heights (`62px`/`34px`). Real devices vary (notch vs. Dynamic Island vs. no notch, Android gesture bars, etc.) — implementation must use CSS environment variables, not these literal figures.
- **Long headline/body text wrapping:** not modeled (short single-line samples only).
- **More than one content block:** only one `HL+explainer` block is shown; behavior with multiple stacked blocks is inferred from the `32px` gap token, not demonstrated directly.
- **Landscape orientation:** not modeled — this frame is portrait-only.
- **Tablet/desktop grid variants:** ✅ explicitly deferred per your direction 2026-07-21 — not pulled in this pass. If they exist elsewhere in the file, they're a separate follow-up, not assumed to scale linearly from these mobile values.

## Code example

⚠️ Illustrative only — prop names/structure above are recommendations pending tech-lead confirmation.

Matches the annotated dev-mode redlines exactly — `Scale/3` (`12px`) appears **twice**, as two distinct bands, not one shared value applied once: the top padding *above* the headline, and the gap *between* the headline and body copy. `Scale/4` (`16px`) is the side-margin band, running the full height of the content block on both left and right — shown separately from `Scale/3` in the redlines because it's a horizontal (inline) measurement, not a vertical one.

```css
.page-shell {
  min-height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--pt-semantic-surface-page);
}

.page-content {
  /* Scale/4 — the left/right hatched bands in the redline, full-height, both sides */
  padding-inline: var(--pt-scale-4); /* 16px side margins */
  display: flex;
  flex-direction: column;
  gap: var(--pt-scale-8); /* 32px between major blocks */
}

.page-headline-block {
  display: flex;
  flex-direction: column;
  /* Scale/3, band #1 — the hatched strip ABOVE "Page headline" in the redline */
  padding-top: var(--pt-scale-3); /* 12px */
  /* Scale/3, band #2 — the hatched strip BETWEEN "Page headline" and the body copy */
  gap: var(--pt-scale-3); /* 12px — same token, second distinct application, not reused from band #1 */
}

.page-headline {
  /* small-H3 (32px/40px) — confirmed and re-verified live via MCP 2026-07-22 */
  font: var(--pt-typography-small-h3-font_size) / var(--pt-typography-small-h3-line_height) var(--pt-typography-font_family-primary);
  color: var(--pt-semantic-typography-headings);
}

.page-body-content {
  font-size: var(--pt-typography-body-default-font_size);
  line-height: var(--pt-scale-6);
  color: var(--pt-semantic-typography-body);
}
```

```tsx
import { TopAnchorNav } from '@/components/TopAnchorNav';
import { BottomNav } from '@/components/BottomNav';

<div className="page-shell">
  <TopAnchorNav title="Page title" onLeftIconClick={() => navigate(-1)} />
  {/* .page-content's padding-inline = the Scale/4 margin bands (left + right) */}
  <main className="page-content">
    {/* .page-headline-block's padding-top = Scale/3 band #1 (above headline);
        its flex gap = Scale/3 band #2 (between headline and body) */}
    <div className="page-headline-block">
      <h1 className="page-headline">Page headline</h1>
      <p className="page-body-content">Body content providing explanation</p>
    </div>
  </main>
  <BottomNav /* items */ />
</div>
```

## Open questions — what needs your confirmation

1. ~~Is the `large`-H4 binding (32px/40px) on the mobile page headline intentional~~ — **RESOLVED and re-verified live via MCP 2026-07-22:** amended in Figma to `Typography/Heading Regular/H3`, resolving to `small`-H3 (`--pt-typography-small-h3-*`, 32px/40px). Confirmed via fresh `get_design_context` + `get_variable_defs` on node `225:1832`. See Typography roles used. (Note: the frame's own annotation callout box still has stale text referencing H4 — cosmetic Figma-side fix, doesn't affect this spec.)
2. ~~Does "Fixed Grid" refer to a real multi-column grid system that exists elsewhere in the Figma file~~ — **RESOLVED 2026-07-22:** confirmed no, "fixed margins + safe areas + consistent chrome" is the complete spec.
3. ~~Is `402px` meant to represent the general mobile breakpoint~~ — **RESOLVED 2026-07-22:** `402px` is just this one sample device; `--pt-breakpoint-canvas_small` (440px) is the real mobile ceiling to design against.
4. **Tablet/desktop grid variants** — deferred per your direction 2026-07-21, not pulled this pass. Follow-up whenever you want them documented.
5. Component/file code path — engineering task for the tech lead, same pending-project-root status as every other section.
