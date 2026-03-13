'use strict';

/**
 * PinTours Design System — Style Dictionary Build
 *
 * Reads tokens/tokens.json → generates:
 *   build/web/variables.css
 *   build/ios/Tokens.swift
 *   build/android/values/colors.xml
 *   build/android/values-night/colors.xml
 *   build/android/values/dimens.xml
 */

const StyleDictionary = require('style-dictionary');
const fs   = require('fs');
const path = require('path');

// ── Pre-process: strip $metadata so SD doesn't try to parse it ──────────────
const rawTokens = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'tokens/tokens.json'), 'utf-8')
);
const { $metadata, ...tokens } = rawTokens;

// ── Constants ────────────────────────────────────────────────────────────────
const PREFIX = 'pt';

// ── Token predicate helpers ──────────────────────────────────────────────────
const isColor     = t => t.type === 'color';
const isEffect    = t => t.type === 'boxShadow';
// Scope light/dark detection to semantic tokens only — prevents collisions with
// primitive token keys that happen to be named "light" (e.g. font_weight.light).
const isSemantic  = t => t.path[0] === 'semantic';
const isLight     = t => isSemantic(t) && t.path.includes('light');
const isDark      = t => isSemantic(t) && t.path.includes('dark');
const isPrimitive = t => !isLight(t) && !isDark(t) && !isEffect(t);

// ── Naming helpers ───────────────────────────────────────────────────────────
function stripMode(pathArr) {
  return pathArr.filter(p => p !== 'light' && p !== 'dark');
}

/** tokens.json path → --pt-kebab-case */
function toCSSVar(pathArr) {
  // Only strip light/dark mode segments from semantic token paths.
  // Non-semantic tokens (e.g. typography.font_weight.light) must not be stripped.
  const path = pathArr[0] === 'semantic' ? stripMode(pathArr) : pathArr;
  return `--${PREFIX}-` + path.join('-');
}

/** tokens.json path → pt_snake_case */
function toAndroidName(pathArr) {
  const path = pathArr[0] === 'semantic' ? stripMode(pathArr) : pathArr;
  return `${PREFIX}_` + path.join('_');
}

/** array of path parts → clean camelCase Swift identifier
 *  Treats both _ and - as word separators so snake_case keys
 *  (font_size, line_height …) become camelCase segments.
 *  Numeric-leading segments are prefixed with 'n'.
 *  Examples:
 *    ['desktop', 'h1', 'font_size']       → desktopH1FontSize
 *    ['font_family', 'primary']           → fontFamilyPrimary
 *    ['body', 'paragraph_spacing']        → bodyParagraphSpacing
 *    ['on_action']                        → onAction
 */
function toSwiftIdent(parts) {
  return parts
    .flatMap(p => p.split(/[_-]+/))   // split each part on _ or -
    .filter(Boolean)
    .map((seg, i) => {
      const safe = /^\d/.test(seg) ? `n${seg}` : seg;
      return i === 0
        ? safe.toLowerCase()
        : safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
    })
    .join('');
}

/** Add px unit to dimension tokens that are bare numbers */
function withUnit(token) {
  const v = String(token.value);
  const dimensionTypes = ['sizing', 'spacing', 'fontSizes', 'lineHeights'];
  if (dimensionTypes.includes(token.type) && !/[a-z%]/.test(v)) {
    return v + 'px';
  }
  return v;
}

// ── Composite text-style weight definitions ───────────────────────────────────
// Three design-system weight variants used in composite text-style tokens.
// Note: weight 300 is named 'Light' in standard Poppins (Google Fonts), but
// 'ExtraLight' in this project's Figma file.  Font face names reflect standard
// Poppins naming; verify against the font files embedded in each platform project.
const TEXT_STYLE_WEIGHTS = [
  {
    key:          'regular',
    value:        '500',
    cssWeightVar: '--pt-typography-font_weight-regular',
    swiftFace:    'Poppins-Medium',
    swiftSysFW:   '.medium',
    androidFont:  'poppins_medium',
  },
  {
    key:          'emphasis',
    value:        '700',
    cssWeightVar: '--pt-typography-font_weight-semibold',
    swiftFace:    'Poppins-Bold',
    swiftSysFW:   '.bold',
    androidFont:  'poppins_bold',
  },
  {
    key:          'thin',
    value:        '300',
    cssWeightVar: '--pt-typography-font_weight-extra_light',
    swiftFace:    'Poppins-Light',
    swiftSysFW:   '.light',
    androidFont:  'poppins_light',
  },
];

/**
 * Build an ordered Map of type-scale groups from resolved typography tokens.
 * Keys: 'desktop-display1', 'mobile-h1', 'desktop-body-lg', etc.
 * Values: { font_size, line_height, paragraph_spacing } (raw numeric strings, no units).
 *
 * Body tokens (device-agnostic in tokens.json) are expanded into both
 * desktop-body-* and mobile-body-* entries per the design decision.
 *
 * Map order: desktop display → desktop heading → desktop body →
 *            mobile display  → mobile heading  → mobile body
 */
function buildTextStyleGroups(allTokens) {
  const deviceGroups = new Map();
  const bodyValues   = new Map(); // 'lg' | 'sm' | 'xs' | 'default' → { font_size, … }

  for (const t of allTokens) {
    if (t.path[0] !== 'typography') continue;
    const seg1 = t.path[1];
    if (seg1 === 'font_family' || seg1 === 'font_weight') continue;

    const prop = t.path[t.path.length - 1];
    if (!['font_size', 'line_height', 'paragraph_spacing'].includes(prop)) continue;

    if (seg1 === 'body') {
      const subKey = t.path.slice(2, -1).join('-'); // 'lg', 'sm', 'xs', 'default'
      if (!bodyValues.has(subKey)) bodyValues.set(subKey, {});
      bodyValues.get(subKey)[prop] = String(t.value);
    } else {
      const scaleKey = t.path.slice(1, -1).join('-'); // 'desktop-display1', 'mobile-h1'
      if (!deviceGroups.has(scaleKey)) deviceGroups.set(scaleKey, {});
      deviceGroups.get(scaleKey)[prop] = String(t.value);
    }
  }

  // Assemble in logical section order
  const result = new Map();
  for (const [k, v] of deviceGroups) {
    if (k.startsWith('large-')) result.set(k, v);
  }
  for (const [subKey, v] of bodyValues) {
    result.set(`large-body-${subKey}`, v);
  }
  for (const [k, v] of deviceGroups) {
    if (k.startsWith('small-')) result.set(k, v);
  }
  for (const [subKey, v] of bodyValues) {
    result.set(`small-body-${subKey}`, v);
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: CSS custom properties (web)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/css',
  formatter({ dictionary }) {
    const allTokens = dictionary.allTokens;

    const primitives = allTokens.filter(isPrimitive);
    const effects    = allTokens.filter(isEffect);
    const lights     = allTokens.filter(isLight);
    const darks      = allTokens.filter(isDark);

    function renderLine(t, indent) {
      if (Array.isArray(t.value)) {
        // box-shadow composite token
        const shadows = t.value
          .map(s => `${s.offsetX || 0}px ${s.offsetY || 0}px ${s.blur || 0}px ${s.spread || 0}px ${s.color}`)
          .join(', ');
        return `${indent}${toCSSVar(t.path)}: ${shadows};`;
      }
      return `${indent}${toCSSVar(t.path)}: ${withUnit(t)};`;
    }

    function renderGroup(tokenList, indent = '  ') {
      return tokenList.map(t => renderLine(t, indent)).join('\n');
    }

    // Group primitives by top-level section for readable comments
    const sections = {};
    for (const t of primitives) {
      const key = t.path[0];
      if (!sections[key]) sections[key] = [];
      sections[key].push(t);
    }
    const primitiveBlock = Object.entries(sections)
      .map(([key, group]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `  /* ── ${label} ${'─'.repeat(Math.max(0, 38 - label.length))} */\n${renderGroup(group)}`;
      })
      .join('\n\n');

    const effectBlock = effects.length
      ? `\n\n  /* ── Effects ───────────────────────────── */\n${renderGroup(effects)}`
      : '';

    const lightBlock = lights.length
      ? `\n\n  /* ── Semantic: Light (default) ──────────── */\n${renderGroup(lights)}`
      : '';

    const darkOverride = darks.length
      ? [
          '',
          '/* ── Runtime theme override ────────────────────────────────────── */',
          `[data-theme="dark"] {`,
          renderGroup(darks),
          '}',
        ].join('\n')
      : '';

    const mediaFallback = darks.length
      ? [
          '',
          '/* ── System preference fallback (data-theme="light" wins) ──────── */',
          '@media (prefers-color-scheme: dark) {',
          `  :root:not([data-theme="light"]) {`,
          renderGroup(darks, '    '),
          '  }',
          '}',
        ].join('\n')
      : '';

    return [
      '/**',
      ' * PinTours Design System — CSS Custom Properties',
      ' * Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY.',
      ' * Source: tokens/tokens.json',
      ' *',
      ' * Dark mode: set data-theme="dark" on <html> to activate.',
      ' * System preference is also respected as a fallback (see bottom of file).',
      ' */',
      '',
      ':root {',
      primitiveBlock,
      effectBlock,
      lightBlock,
      '}',
      darkOverride,
      mediaFallback,
      '',
    ].join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Swift constants + dynamic UIColors (iOS)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/swift',
  formatter({ dictionary }) {
    const allTokens = dictionary.allTokens;

    // Build a dark-value lookup keyed by mode-stripped path
    const darkLookup = {};
    for (const t of allTokens.filter(isDark)) {
      darkLookup[stripMode(t.path).join('.')] = t.value;
    }

    const lines = [
      '// PinTours Design System — Swift Constants',
      '// Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY.',
      '// Source: tokens/tokens.json',
      '//',
      '// Usage: PT.Color.Green.c500, PT.Semantic.Typography.headings, PT.Scale.s4',
      '',
      'import UIKit',
      '',
      '// MARK: - UIColor Hex Initializer (private to this file)',
      'private extension UIColor {',
      '    convenience init(hex: String) {',
      '        var h = hex.trimmingCharacters(in: .whitespacesAndNewlines)',
      '        if h.hasPrefix("#") { h = String(h.dropFirst()) }',
      '        var rgb: UInt64 = 0',
      '        Scanner(string: h).scanHexInt64(&rgb)',
      '        let r = CGFloat((rgb >> 16) & 0xFF) / 255',
      '        let g = CGFloat((rgb >>  8) & 0xFF) / 255',
      '        let b = CGFloat( rgb        & 0xFF) / 255',
      '        self.init(red: r, green: g, blue: b, alpha: 1)',
      '    }',
      '}',
      '',
      '// MARK: - Design Tokens',
      'public enum PT {',
    ];

    // ── Color primitives grouped by palette ──
    const colorPalettes = {};
    for (const t of allTokens.filter(t => isPrimitive(t) && isColor(t))) {
      const palette = t.path[1];
      if (!colorPalettes[palette]) colorPalettes[palette] = [];
      colorPalettes[palette].push(t);
    }
    if (Object.keys(colorPalettes).length) {
      lines.push('', '    // MARK: - Color Primitives', '    public enum Color {');
      for (const [palette, ptokens] of Object.entries(colorPalettes)) {
        const enumName = palette.charAt(0).toUpperCase() + palette.slice(1);
        lines.push(`        public enum ${enumName} {`);
        for (const t of ptokens) {
          const shade = t.path.slice(2).join('_');
          lines.push(`            public static let c${shade} = UIColor(hex: "${t.value}")`);
        }
        lines.push('        }');
      }
      lines.push('    }');
    }

    // ── Scale ──
    const scaleTokens = allTokens.filter(t => isPrimitive(t) && t.path[0] === 'scale');
    if (scaleTokens.length) {
      lines.push('', '    // MARK: - Scale', '    public enum Scale {');
      for (const t of scaleTokens) {
        const name = 's' + t.path.slice(1).join('_');
        lines.push(`        public static let ${name}: CGFloat = ${t.value}`);
      }
      lines.push('    }');
    }

    // ── Typography primitives ──
    const typoTokens = allTokens.filter(
      t => isPrimitive(t) && t.path[0] === 'typography' && !Array.isArray(t.value)
    );
    if (typoTokens.length) {
      lines.push('', '    // MARK: - Typography', '    public enum Typography {');
      for (const t of typoTokens) {
        const name = toSwiftIdent(t.path.slice(1));
        const isNum = !isNaN(String(t.value));
        if (isNum) {
          lines.push(`        public static let ${name}: CGFloat = ${t.value}`);
        } else {
          lines.push(`        public static let ${name}: String = "${t.value}"`);
        }
      }
      lines.push('    }');
    }

    // ── Semantic dynamic colors ──
    const lightColors = allTokens.filter(
      t => isLight(t) && isColor(t) && !String(t.value).startsWith('rgba')
    );
    if (lightColors.length) {
      lines.push(
        '',
        '    // MARK: - Semantic Colors (auto-switch with system / app theme)',
        '    public enum Semantic {'
      );
      const catMap = {};
      for (const t of lightColors) {
        const cat = t.path[1];
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(t);
      }
      for (const [cat, ctokens] of Object.entries(catMap)) {
        const catEnum = cat.charAt(0).toUpperCase() + cat.slice(1);
        lines.push(`        public enum ${catEnum} {`);
        for (const t of ctokens) {
          const key      = stripMode(t.path).join('.');
          const darkVal  = darkLookup[key];
          const propName = toSwiftIdent([t.path[t.path.length - 1]]);

          if (darkVal && !String(darkVal).startsWith('rgba')) {
            lines.push(
              `            public static let ${propName} = UIColor { trait in`,
              `                trait.userInterfaceStyle == .dark`,
              `                    ? UIColor(hex: "${darkVal}")`,
              `                    : UIColor(hex: "${t.value}")`,
              `            }`
            );
          } else {
            lines.push(
              `            /// Dark value unavailable — using light fallback`,
              `            public static let ${propName} = UIColor(hex: "${t.value}")`
            );
          }
        }
        lines.push('        }');
      }
      lines.push('    }');
    }

    lines.push('}', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Android XML — colors (light mode + primitives)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/android-colors-light',
  formatter({ dictionary }) {
    const colorTokens = dictionary.allTokens.filter(
      t => isColor(t) && (isPrimitive(t) || isLight(t))
    );
    const lines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<!-- PinTours Design System — Light mode colors (+ primitives) -->',
      '<!-- Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY. -->',
      '<resources>',
    ];
    let lastSection = '';
    for (const t of colorTokens) {
      const section = t.path[0];
      if (section !== lastSection) {
        lines.push(`\n    <!-- ${section.toUpperCase()} -->`);
        lastSection = section;
      }
      const name = toAndroidName(t.path);
      if (String(t.value).startsWith('rgba')) {
        lines.push(`    <!-- ${name}: ${t.value} — requires ColorStateList for opacity -->`);
      } else {
        lines.push(`    <color name="${name}">${t.value}</color>`);
      }
    }
    lines.push('\n</resources>', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Android XML — colors (dark mode overrides, values-night)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/android-colors-night',
  formatter({ dictionary }) {
    const darkTokens = dictionary.allTokens.filter(t => isColor(t) && isDark(t));
    const lines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<!-- PinTours Design System — Dark mode overrides (values-night) -->',
      '<!-- Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY. -->',
      '<!-- Android auto-uses this file when system dark mode is active. -->',
      '<resources>',
    ];
    let lastSection = '';
    for (const t of darkTokens) {
      const section = t.path[1]; // e.g. 'typography', 'surface'
      if (section !== lastSection) {
        lines.push(`\n    <!-- ${section.toUpperCase()} -->`);
        lastSection = section;
      }
      const name = toAndroidName(t.path);
      if (String(t.value).startsWith('rgba')) {
        lines.push(`    <!-- ${name}: ${t.value} — requires ColorStateList for opacity -->`);
      } else {
        lines.push(`    <color name="${name}">${t.value}</color>`);
      }
    }
    lines.push('\n</resources>', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Android XML — dimensions (spacing + typography sizes)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/android-dimens',
  formatter({ dictionary }) {
    const dimenTokens = dictionary.allTokens.filter(
      t =>
        isPrimitive(t) &&
        !isColor(t) &&
        !Array.isArray(t.value) &&
        t.type !== 'fontFamilies' &&
        t.type !== 'fontWeights'
    );
    const lines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<!-- PinTours Design System — Dimensions (spacing + type sizes) -->',
      '<!-- Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY. -->',
      '<resources>',
    ];
    let lastSection = '';
    for (const t of dimenTokens) {
      const section = t.path[0];
      if (section !== lastSection) {
        lines.push(`\n    <!-- ${section.toUpperCase()} -->`);
        lastSection = section;
      }
      const name = toAndroidName(t.path);
      const unit = t.type === 'fontSizes' ? 'sp' : 'dp';
      lines.push(`    <dimen name="${name}">${t.value}${unit}</dimen>`);
    }
    lines.push('\n</resources>', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Composite text-style tokens — CSS utility classes (web)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/css-text-styles',
  formatter({ dictionary }) {
    const groups = buildTextStyleGroups(dictionary.allTokens);

    const SECTIONS = [
      { prefix: 'large-display', label: 'Large · Display' },
      { prefix: 'large-h',       label: 'Large · Heading' },
      { prefix: 'large-body',    label: 'Large · Body'    },
      { prefix: 'small-display', label: 'Small · Display' },
      { prefix: 'small-h',       label: 'Small · Heading' },
      { prefix: 'small-body',    label: 'Small · Body'    },
    ];

    // Derive font_size / line_height CSS var refs from a composite scale key.
    // Body tokens live at typography.body.* (device-agnostic), so strip the
    // large-/small- prefix.  Heading/display tokens live at typography.large-* etc.
    function getTypoCSSVar(scaleKey, prop) {
      const bodyMatch = scaleKey.match(/^(?:large|small)-body-(.+)$/);
      if (bodyMatch) return `--pt-typography-body-${bodyMatch[1]}-${prop}`;
      return `--pt-typography-${scaleKey}-${prop}`;
    }

    // Read the breakpoint value from tokens so it stays in sync automatically
    const bpToken = dictionary.allTokens.find(t => t.path.join('.') === 'breakpoint.large');
    const bp = bpToken ? bpToken.value : 768;

    const classBlocks = [];
    for (const { prefix, label } of SECTIONS) {
      const keys = [...groups.keys()].filter(k => k.startsWith(prefix));
      if (!keys.length) continue;
      classBlocks.push(`/* ── ${label} ${'─'.repeat(Math.max(0, 38 - label.length))} */`);
      for (const scaleKey of keys) {
        for (const { key: wKey, cssWeightVar } of TEXT_STYLE_WEIGHTS) {
          const fsVar = getTypoCSSVar(scaleKey, 'font_size');
          const lhVar = getTypoCSSVar(scaleKey, 'line_height');
          classBlocks.push(
            `.pt-text-style-${scaleKey}-${wKey} {`,
            `  font-family: var(--pt-typography-font_family-primary, 'Poppins');`,
            `  font-size: var(${fsVar});`,
            `  font-weight: var(${cssWeightVar});`,
            `  line-height: var(${lhVar});`,
            `}`,
          );
        }
        classBlocks.push('');
      }
    }

    // ── Responsive classes (mobile-first, auto-switch at bp) ─────────────────
    // Collect unique type keys preserving display→heading→body order.
    // large-* entries come first in the Map, so first-seen dedup gives correct order.
    const seen = new Set();
    const orderedTypeKeys = [];
    for (const k of groups.keys()) {
      const typeKey = k.replace(/^(?:large|small)-/, '');
      if (!seen.has(typeKey)) { seen.add(typeKey); orderedTypeKeys.push(typeKey); }
    }

    const respBase  = [];
    const respMedia = [];

    for (const typeKey of orderedTypeKeys) {
      const smallVals = groups.get(`small-${typeKey}`);
      const largeVals = groups.get(`large-${typeKey}`);
      if (!smallVals || !largeVals) continue;

      const fsVarSmall = getTypoCSSVar(`small-${typeKey}`, 'font_size');
      const lhVarSmall = getTypoCSSVar(`small-${typeKey}`, 'line_height');
      const fsVarLarge = getTypoCSSVar(`large-${typeKey}`, 'font_size');
      const lhVarLarge = getTypoCSSVar(`large-${typeKey}`, 'line_height');
      // Only emit a media-query override when the values actually differ (H5, H6,
      // and body tokens share the same values across breakpoints — no override needed)
      const valsDiffer = smallVals.font_size !== largeVals.font_size ||
                         smallVals.line_height !== largeVals.line_height;

      for (const { key: wKey, cssWeightVar } of TEXT_STYLE_WEIGHTS) {
        const cls = `.pt-text-style-${typeKey}-${wKey}`;
        respBase.push(
          `${cls} {`,
          `  font-family: var(--pt-typography-font_family-primary, 'Poppins');`,
          `  font-size: var(${fsVarSmall});`,
          `  font-weight: var(${cssWeightVar});`,
          `  line-height: var(${lhVarSmall});`,
          `}`,
        );
        if (valsDiffer) {
          respMedia.push(
            `  ${cls} { font-size: var(${fsVarLarge}); line-height: var(${lhVarLarge}); }`,
          );
        }
      }
      respBase.push('');
    }

    const responsiveBlock = [
      `/* ── Responsive · mobile-first · switches at ${bp}px ──────── */`,
      `/* Use .pt-text-style-{type}-{weight} for automatic scaling.    */`,
      `/* Use large-* or small-* above for explicit per-breakpoint control. */`,
      '',
      ...respBase,
    ];
    if (respMedia.length) {
      responsiveBlock.push(
        `@media (min-width: ${bp}px) {`,
        ...respMedia,
        `}`,
        '',
      );
    }

    return [
      '/**',
      ' * PinTours Design System — Text Style Utility Classes',
      ' * Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY.',
      ' *',
      ' * Three tiers of classes:',
      ` *   large-*  explicit desktop   e.g. class="pt-text-style-large-h1-regular"`,
      ` *   small-*  explicit mobile    e.g. class="pt-text-style-small-h1-regular"`,
      ` *   (none)   responsive auto    e.g. class="pt-text-style-h1-regular"`,
      ` *            → small by default, switches to large at ${bp}px`,
      ' *',
      ' * Weight variants:',
      ' *   regular  → 500  Poppins Medium',
      ' *   emphasis → 700  Poppins Bold',
      ' *   thin     → 300  Poppins Light',
      ' */',
      '',
      ...classBlocks,
      ...responsiveBlock,
      '',
    ].join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Composite text-style tokens — Swift PTTextStyle structs (iOS)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/swift-text-styles',
  formatter({ dictionary }) {
    const groups = buildTextStyleGroups(dictionary.allTokens);

    const lines = [
      '// PinTours Design System — Composite Text Style Tokens (Swift)',
      '// Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY.',
      '//',
      '// ── FONT SETUP CHECKLIST (one-time, manual) ────────────────────────────────',
      '// 1. Embed these Poppins font files in your Xcode target:',
      '//      Poppins-Light.ttf      (weight 300 — thin styles)',
      '//      Poppins-Medium.ttf     (weight 500 — regular styles)',
      '//      Poppins-Bold.ttf       (weight 700 — emphasis styles)',
      '//    Download: https://fonts.google.com/specimen/Poppins',
      '// 2. Add each file to your app target (check "Add to target" in the file inspector).',
      '// 3. In Info.plist add key "Fonts provided by application" (UIAppFonts)',
      '//    with all three filenames as array values.',
      '// 4. Verify font names at runtime with UIFont.familyNames / fontNamesForFamilyName.',
      '//',
      '// Note: this project\'s weight labels differ from standard Poppins naming:',
      '//   thin     = weight 300 → Poppins-Light   (standard Poppins "Light")',
      '//   regular  = weight 500 → Poppins-Medium',
      '//   emphasis = weight 700 → Poppins-Bold',
      '// ────────────────────────────────────────────────────────────────────────────',
      '',
      'import UIKit',
      '',
      '// MARK: - PTTextStyle',
      '',
      '/// A composite type style: font, line height, and paragraph spacing bundled together.',
      'public struct PTTextStyle {',
      '    public let font: UIFont',
      '    public let lineHeight: CGFloat',
      '    public let paragraphSpacing: CGFloat',
      '',
      '    /// NSAttributedString attributes applying this style.',
      '    public func attributes(alignment: NSTextAlignment = .natural) -> [NSAttributedString.Key: Any] {',
      '        let para = NSMutableParagraphStyle()',
      '        para.minimumLineHeight  = lineHeight',
      '        para.maximumLineHeight  = lineHeight',
      '        para.paragraphSpacing   = paragraphSpacing',
      '        para.alignment          = alignment',
      '        return [',
      '            .font:           font,',
      '            .paragraphStyle: para,',
      '            .baselineOffset: (lineHeight - font.lineHeight) / 4,',
      '        ]',
      '    }',
      '}',
      '',
      '// MARK: - PT.TextStyle',
      '',
      'public extension PT {',
      '    enum TextStyle {',
    ];

    for (const device of ['large', 'small']) {
      const deviceLabel = device.charAt(0).toUpperCase() + device.slice(1);
      lines.push(`        public enum ${deviceLabel} {`);

      const keys = [...groups.keys()].filter(k => k.startsWith(device + '-'));
      for (const scaleKey of keys) {
        const { font_size, line_height, paragraph_spacing = '0' } = groups.get(scaleKey);
        const typeParts = scaleKey.split('-').slice(1);

        for (const { key: wKey, swiftFace, swiftSysFW } of TEXT_STYLE_WEIGHTS) {
          const propName = toSwiftIdent(typeParts) +
            wKey.charAt(0).toUpperCase() + wKey.slice(1);
          lines.push(
            `            public static let ${propName} = PTTextStyle(`,
            `                font: UIFont(name: "${swiftFace}", size: ${font_size})`,
            `                    ?? .systemFont(ofSize: ${font_size}, weight: ${swiftSysFW}),`,
            `                lineHeight: ${line_height},`,
            `                paragraphSpacing: ${paragraph_spacing}`,
            `            )`,
          );
        }
        lines.push('');
      }
      lines.push('        }');
    }

    lines.push('    }', '}', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// FORMAT: Composite text-style tokens — Android TextAppearance styles
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/android-text-styles',
  formatter({ dictionary }) {
    const groups = buildTextStyleGroups(dictionary.allTokens);

    const SECTIONS = [
      { prefix: 'large-display', label: 'Large · Display' },
      { prefix: 'large-h',       label: 'Large · Heading' },
      { prefix: 'large-body',    label: 'Large · Body'    },
      { prefix: 'small-display', label: 'Small · Display' },
      { prefix: 'small-h',       label: 'Small · Heading' },
      { prefix: 'small-body',    label: 'Small · Body'    },
    ];

    const lines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<!-- PinTours Design System — Composite Text Appearances -->',
      '<!-- Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY. -->',
      '<!--',
      '  ── FONT SETUP CHECKLIST (one-time, manual) ──────────────────────────────',
      '  1. Add Poppins font files to res/font/ in your Android project:',
      '         res/font/poppins_light.ttf       (weight 300 — thin styles)',
      '         res/font/poppins_medium.ttf      (weight 500 — regular styles)',
      '         res/font/poppins_bold.ttf        (weight 700 — emphasis styles)',
      '       Download: https://fonts.google.com/specimen/Poppins',
      '  2. Create res/font/poppins.xml (downloadable font family descriptor):',
      '       <font-family xmlns:app="http://schemas.android.com/apk/res-auto">',
      '           <font app:fontStyle="normal" app:fontWeight="300" app:font="@font/poppins_light" />',
      '           <font app:fontStyle="normal" app:fontWeight="500" app:font="@font/poppins_medium" />',
      '           <font app:fontStyle="normal" app:fontWeight="700" app:font="@font/poppins_bold" />',
      '       </font-family>',
      '  3. Apply a style:',
      '       android:textAppearance="@style/PT.TextStyle.Large.Display1.Regular"',
      '  ──────────────────────────────────────────────────────────────────────────',
      '-->',
      '<resources>',
      '',
      '    <!-- Base — do not use directly; extended by all named styles -->',
      '    <style name="PT.TextStyle.Base">',
      '        <item name="android:includeFontPadding">false</item>',
      '    </style>',
    ];

    for (const { prefix, label } of SECTIONS) {
      const keys = [...groups.keys()].filter(k => k.startsWith(prefix));
      if (!keys.length) continue;
      lines.push('', `    <!-- ${label} -->`);

      for (const scaleKey of keys) {
        const { font_size, line_height } = groups.get(scaleKey);
        const multiplier = (Number(line_height) / Number(font_size)).toFixed(3);
        const parts = scaleKey.split('-');
        const device  = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const typeStr = parts.slice(1)
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join('');

        for (const { key: wKey, androidFont } of TEXT_STYLE_WEIGHTS) {
          const weightStr = wKey.charAt(0).toUpperCase() + wKey.slice(1);
          lines.push(
            `    <style name="PT.TextStyle.${device}.${typeStr}.${weightStr}" parent="PT.TextStyle.Base">`,
            `        <item name="android:fontFamily">@font/${androidFont}</item>`,
            `        <item name="android:textSize">${font_size}sp</item>`,
            `        <item name="android:lineSpacingMultiplier">${multiplier}</item>`,
            `    </style>`,
          );
        }
        lines.push('');
      }
    }

    lines.push('</resources>', '');
    return lines.join('\n');
  },
});

// ────────────────────────────────────────────────────────────────────────────
// BUILD
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.extend({
  // Pass pre-processed tokens directly (avoids $metadata confusion)
  properties: tokens,
  platforms: {
    web: {
      transforms: ['attribute/cti'],
      buildPath:  'build/web/',
      files: [
        { destination: 'variables.css',   format: 'pintours/css'             },
        { destination: 'text-styles.css', format: 'pintours/css-text-styles' },
      ],
    },
    ios: {
      transforms: ['attribute/cti'],
      buildPath:  'build/ios/',
      files: [
        { destination: 'Tokens.swift',      format: 'pintours/swift'             },
        { destination: 'TextStyles.swift',  format: 'pintours/swift-text-styles' },
      ],
    },
    android: {
      transforms: ['attribute/cti'],
      buildPath:  'build/android/',
      files: [
        { destination: 'values/colors.xml',              format: 'pintours/android-colors-light' },
        { destination: 'values-night/colors.xml',        format: 'pintours/android-colors-night' },
        { destination: 'values/dimens.xml',              format: 'pintours/android-dimens'       },
        { destination: 'values/text_appearances.xml',    format: 'pintours/android-text-styles'  },
      ],
    },
  },
}).buildAllPlatforms();

// Write build hash for determinism check
require('child_process').execSync('node scripts/diff-check.js --write', { stdio: 'inherit' });

console.log('\n✓ Build complete\n');
console.log('  build/web/variables.css');
console.log('  build/web/text-styles.css');
console.log('  build/ios/Tokens.swift');
console.log('  build/ios/TextStyles.swift');
console.log('  build/android/values/colors.xml');
console.log('  build/android/values-night/colors.xml');
console.log('  build/android/values/dimens.xml');
console.log('  build/android/values/text_appearances.xml\n');
