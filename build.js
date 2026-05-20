'use strict';

/**
 * PinTours Design System — Style Dictionary Build
 *
 * Reads tokens/primitives.json + tokens/semantic.json → generates:
 *   build/web/variables.css
 *   build/ios/Tokens.swift
 *   build/android/values/colors.xml
 *   build/android/values-night/colors.xml
 *   build/android/values/dimens.xml
 */

const StyleDictionary = require('style-dictionary');
const fs   = require('fs');
const path = require('path');

// ── Pre-process: merge primitives + semantic files, strip $metadata ──────────
function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

const { $metadata, ...primTokens } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'tokens/primitives.json'), 'utf-8')
);
const tokens = deepMerge(
  primTokens,
  JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tokens/semantic.json'), 'utf-8'))
);

// ── Constants ────────────────────────────────────────────────────────────────
const PREFIX = 'pt';

// ── Token predicate helpers ──────────────────────────────────────────────────
const isColor     = t => t.type === 'color';
const isEffect    = t => t.type === 'boxShadow';
const isGradient  = t => t.type === 'gradient';
// Scope light/dark detection to semantic tokens only — prevents collisions with
// primitive token keys that happen to be named "light" (e.g. font_weight.light).
const isSemantic  = t => t.path[0] === 'semantic';
const isLight     = t => isSemantic(t) && t.path.includes('light');
const isDark      = t => isSemantic(t) && t.path.includes('dark');
const isPrimitive = t => !isLight(t) && !isDark(t) && !isEffect(t) && !isGradient(t);

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
    const gradients  = allTokens.filter(isGradient);
    const lights     = allTokens.filter(isLight);
    const darks      = allTokens.filter(isDark);

    function renderLine(t, indent) {
      if (t.type === 'gradient') {
        const v = t.value;
        if (Array.isArray(v)) {
          const stops = v.map(s => `${s.color}${s.position ? ' ' + s.position : ''}`).join(', ');
          return `${indent}${toCSSVar(t.path)}: linear-gradient(to right, ${stops});`;
        }
        if (v && v.stops) {
          const stops = v.stops.map(s => `${s.color}${s.position ? ' ' + s.position : ''}`).join(', ');
          const css = v.gradientType === 'conic'
            ? `conic-gradient(from ${v.angle}${v.center ? ' at ' + v.center : ''}, ${stops})`
            : `linear-gradient(${v.angle || 'to right'}, ${stops})`;
          return `${indent}${toCSSVar(t.path)}: ${css};`;
        }
      }
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

    const gradientBlock = gradients.length
      ? `\n\n  /* ── Gradients ─────────────────────────── */\n${renderGroup(gradients)}`
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
      gradientBlock,
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

    // ── Gradients ──
    const gradientTokens = allTokens.filter(isGradient);
    if (gradientTokens.length) {
      lines.push(
        '',
        '    // MARK: - Gradients',
        '    public enum Gradient {',
        '        public struct Definition {',
        '            public let colors: [UIColor]',
        '            public let startPoint: CGPoint',
        '            public let endPoint: CGPoint',
        '        }',
      );
      for (const t of gradientTokens) {
        if (!Array.isArray(t.value)) continue;
        const rawName  = t.path[t.path.length - 1];
        const swiftName = rawName === 'default' ? '`default`' : toSwiftIdent([rawName]);
        const colorList = t.value.map(s => `UIColor(hex: "${s.color}")`).join(', ');
        lines.push(
          `        public static let ${swiftName} = Definition(`,
          `            colors: [${colorList}],`,
          `            startPoint: CGPoint(x: 0, y: 0.5),`,
          `            endPoint:   CGPoint(x: 1, y: 0.5)`,
          `        )`,
        );
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
// FORMAT: Jetpack Compose theme (Android)
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: 'pintours/compose',
  formatter({ dictionary }) {
    const allTokens = dictionary.allTokens;

    // Build dark-value lookup keyed by mode-stripped path (same as Swift format)
    const darkLookup = {};
    for (const t of allTokens.filter(isDark)) {
      darkLookup[stripMode(t.path).join('.')] = t.value;
    }

    /** hex or rgba string → Compose Color(0xAARRGGBB) literal */
    function toComposeColor(val) {
      if (!val || typeof val !== 'string') return 'Color.Unspecified';
      const v = val.trim();
      if (v.startsWith('rgba')) {
        const m = v.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (m) {
          const a = Math.round(parseFloat(m[4]) * 255);
          const hex = [a, parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
            .map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
          return `Color(0x${hex})`;
        }
      }
      const h = v.replace('#', '').toUpperCase();
      if (h.length === 6) return `Color(0xFF${h})`;
      if (h.length === 8) return `Color(0x${h})`;
      return 'Color.Unspecified';
    }

    /** path parts → Kotlin camelCase identifier (same logic as toSwiftIdent) */
    function toKotlin(parts) {
      return parts
        .flatMap(p => p.split(/[_-]+/))
        .filter(Boolean)
        .map((seg, i) => {
          const safe = /^\d/.test(seg) ? `n${seg}` : seg;
          return i === 0
            ? safe.toLowerCase()
            : safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
        })
        .join('');
    }

    const lines = [
      '// PinTours Design System — Jetpack Compose Theme',
      '// Auto-generated by Style Dictionary. DO NOT EDIT MANUALLY.',
      '// Source: tokens/tokens.json',
      '//',
      '// Usage:',
      '//   1. Wrap your app root:      PTTheme { Surface(...) { ... } }',
      '//   2. Semantic colors:         MaterialTheme.ptColors.surfaceCardPrimary',
      '//   3. Spacing:                 PTDimens.s4   // 16.dp',
      '//   4. Text styles:             PTTextStyles.smallH1Regular',
      '',
      'package com.pintours.designsystem.theme',
      '',
      'import androidx.compose.foundation.isSystemInDarkTheme',
      'import androidx.compose.material3.MaterialTheme',
      'import androidx.compose.material3.darkColorScheme',
      'import androidx.compose.material3.lightColorScheme',
      'import androidx.compose.runtime.Composable',
      'import androidx.compose.runtime.CompositionLocalProvider',
      'import androidx.compose.runtime.ReadOnlyComposable',
      'import androidx.compose.runtime.staticCompositionLocalOf',
      'import androidx.compose.ui.graphics.Brush',
      'import androidx.compose.ui.graphics.Color',
      'import androidx.compose.ui.text.TextStyle',
      'import androidx.compose.ui.text.font.Font',
      'import androidx.compose.ui.text.font.FontFamily',
      'import androidx.compose.ui.text.font.FontWeight',
      'import androidx.compose.ui.unit.Dp',
      'import androidx.compose.ui.unit.dp',
      'import androidx.compose.ui.unit.sp',
      '',
    ];

    // ── Color Primitives ──
    const colorPrimitives = allTokens.filter(t => isPrimitive(t) && isColor(t));
    if (colorPrimitives.length) {
      lines.push(
        '// ── Color Primitives ─────────────────────────────────────────────────────────',
        '',
        'object PTColorPrimitives {',
      );
      let lastPalette = '';
      for (const t of colorPrimitives) {
        const palette = t.path[1];
        if (palette !== lastPalette) {
          if (lastPalette) lines.push('');
          lines.push(`    // ${palette.charAt(0).toUpperCase() + palette.slice(1)}`);
          lastPalette = palette;
        }
        lines.push(`    val ${toKotlin(t.path.slice(1))} = ${toComposeColor(t.value)}`);
      }
      lines.push('}', '');
    }

    // ── Semantic color palette ──
    const lightColors = allTokens.filter(t => isLight(t) && isColor(t));
    if (lightColors.length) {
      const fields = lightColors.map(t => {
        const key      = stripMode(t.path).join('.');
        const darkVal  = darkLookup[key];
        const fieldName = toKotlin(stripMode(t.path).slice(1)); // drop 'semantic'
        return { fieldName, lightVal: t.value, darkVal: darkVal != null ? darkVal : t.value };
      });

      lines.push(
        '// ── Semantic Color Palette ────────────────────────────────────────────────────',
        '',
        'data class PTPalette(',
        ...fields.map(({ fieldName }) => `    val ${fieldName}: Color,`),
        ')',
        '',
        'fun lightPTPalette() = PTPalette(',
        ...fields.map(({ fieldName, lightVal }) => `    ${fieldName} = ${toComposeColor(lightVal)},`),
        ')',
        '',
        'fun darkPTPalette() = PTPalette(',
        ...fields.map(({ fieldName, darkVal }) => `    ${fieldName} = ${toComposeColor(darkVal)},`),
        ')',
        '',
      );
    }

    // ── Spacing ──
    const scaleTokens = allTokens.filter(t => isPrimitive(t) && t.path[0] === 'scale');
    if (scaleTokens.length) {
      lines.push(
        '// ── Spacing ───────────────────────────────────────────────────────────────────',
        '',
        'object PTDimens {',
        ...scaleTokens.map(t => `    val s${t.path.slice(1).join('_')}: Dp = ${t.value}.dp`),
        '}',
        '',
      );
    }

    // ── Gradients ──
    const composeGradientTokens = allTokens.filter(isGradient);
    if (composeGradientTokens.length) {
      lines.push(
        '// ── Gradients ───────────────────────────────────────────────────────────────',
        '',
        'object PTGradients {',
      );
      for (const t of composeGradientTokens) {
        if (!Array.isArray(t.value)) continue;
        const name      = toKotlin([t.path[t.path.length - 1]]);
        const colorList = t.value.map(s => toComposeColor(s.color)).join(', ');
        lines.push(`    val ${name}: Brush = Brush.horizontalGradient(listOf(${colorList}))`);
      }
      lines.push('}', '');
    }

    // ── Typography ──
    const fontWeightMap = {
      '.medium': 'FontWeight.Medium',
      '.bold':   'FontWeight.Bold',
      '.light':  'FontWeight.Light',
    };
    const groups = buildTextStyleGroups(allTokens);

    lines.push(
      '// ── Typography ───────────────────────────────────────────────────────────────',
      '//',
      '// FONT SETUP: Add these files to res/font/ in your Android project:',
      '//   res/font/poppins_light.ttf    (weight 300 — thin styles)',
      '//   res/font/poppins_medium.ttf   (weight 500 — regular styles)',
      '//   res/font/poppins_bold.ttf     (weight 700 — emphasis styles)',
      '',
      'val PoppinsFontFamily = FontFamily(',
      '    Font(R.font.poppins_light,  FontWeight.Light),',
      '    Font(R.font.poppins_medium, FontWeight.Medium),',
      '    Font(R.font.poppins_bold,   FontWeight.Bold),',
      ')',
      '',
      'object PTTextStyles {',
    );

    for (const [scaleKey, { font_size, line_height }] of groups) {
      const parts      = scaleKey.split('-');
      const devicePart = parts[0];
      const typeParts  = parts.slice(1);
      for (const { key: wKey, swiftSysFW } of TEXT_STYLE_WEIGHTS) {
        const propName = toKotlin([devicePart, ...typeParts]) +
          wKey.charAt(0).toUpperCase() + wKey.slice(1);
        lines.push(
          `    val ${propName} = TextStyle(`,
          `        fontFamily  = PoppinsFontFamily,`,
          `        fontWeight  = ${fontWeightMap[swiftSysFW] || 'FontWeight.Normal'},`,
          `        fontSize    = ${font_size}.sp,`,
          `        lineHeight  = ${line_height}.sp,`,
          `    )`,
        );
      }
      lines.push('');
    }
    lines.push('}', '');

    // ── Composition local + PTTheme ──
    lines.push(
      '// ── Composition Local ─────────────────────────────────────────────────────────',
      '',
      'val LocalPTPalette = staticCompositionLocalOf { lightPTPalette() }',
      '',
      'val MaterialTheme.ptColors: PTPalette',
      '    @Composable',
      '    @ReadOnlyComposable',
      '    get() = LocalPTPalette.current',
      '',
      '// ── PTTheme ───────────────────────────────────────────────────────────────────',
      '',
      '@Composable',
      'fun PTTheme(',
      '    darkTheme: Boolean = isSystemInDarkTheme(),',
      '    content: @Composable () -> Unit,',
      ') {',
      '    val palette = if (darkTheme) darkPTPalette() else lightPTPalette()',
      '',
      '    val colorScheme = if (darkTheme) {',
      '        darkColorScheme(',
      '            primary          = palette.surfaceAction,',
      '            onPrimary        = palette.typographyOnAction,',
      '            primaryContainer = palette.surfaceActionHover,',
      '            background       = palette.surfacePage,',
      '            onBackground     = palette.typographyHeadings,',
      '            surface          = palette.surfaceCardPrimary,',
      '            onSurface        = palette.typographyBody,',
      '            error            = palette.surfaceNegative,',
      '            onError          = palette.typographyOnAction,',
      '        )',
      '    } else {',
      '        lightColorScheme(',
      '            primary          = palette.surfaceAction,',
      '            onPrimary        = palette.typographyOnAction,',
      '            primaryContainer = palette.surfaceActionHover,',
      '            background       = palette.surfacePage,',
      '            onBackground     = palette.typographyHeadings,',
      '            surface          = palette.surfaceCardPrimary,',
      '            onSurface        = palette.typographyBody,',
      '            error            = palette.surfaceNegative,',
      '            onError          = palette.typographyOnAction,',
      '        )',
      '    }',
      '',
      '    CompositionLocalProvider(LocalPTPalette provides palette) {',
      '        MaterialTheme(',
      '            colorScheme = colorScheme,',
      '            content     = content,',
      '        )',
      '    }',
      '}',
      '',
    );

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
    compose: {
      transforms: ['attribute/cti'],
      buildPath:  'build/android/compose/',
      files: [
        { destination: 'PTTheme.kt', format: 'pintours/compose' },
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
console.log('  build/android/values/text_appearances.xml');
console.log('  build/android/compose/PTTheme.kt\n');
