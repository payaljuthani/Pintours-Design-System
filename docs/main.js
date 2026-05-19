/**
 * PinTours Design System — Token Reference · main.js
 * Builds the full token gallery: colors, semantic, typography, spacing, shadows.
 */

// Load the design token CSS variables via Vite's module resolution.
// Using an import (not a <link> tag) ensures Vite correctly resolves the path
// relative to this file, even though Vite's web root is the docs/ directory.
import '../build/web/variables.css';
import '../build/web/text-styles.css';
import iconNodes from '../node_modules/@tabler/icons/tabler-nodes-outline.json';
import iconMeta  from '../node_modules/@tabler/icons/icons.json';

const root = document.documentElement;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCSSVar(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

/** Convert kebab-case and snake_case segments to camelCase */
function toCamel(str) {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}

// ─── Snippet derivation ───────────────────────────────────────────────────────

function cssSnippet(cssVar) {
  if (/^--pt-shadow-/.test(cssVar)) return `box-shadow: var(${cssVar});`;
  return `var(${cssVar})`;
}

function swiftSnippet(cssVar) {
  const name = cssVar.replace(/^--/, '');

  // --pt-color-{palette}-{shade} → PT.Color.{Palette}.c{shade}
  const colorMatch = name.match(/^pt-color-([a-z]+)-(\d+)$/);
  if (colorMatch) {
    const palette = colorMatch[1][0].toUpperCase() + colorMatch[1].slice(1);
    return `PT.Color.${palette}.c${colorMatch[2]}`;
  }

  // --pt-scale-{key} → PT.Scale.s{key}
  const scaleMatch = name.match(/^pt-scale-(.+)$/);
  if (scaleMatch) {
    return `PT.Scale.s${scaleMatch[1]}`;
  }

  // --pt-semantic-{category}-{prop} → PT.Semantic.{Category}.{camelProp}
  const semanticMatch = name.match(/^pt-semantic-([a-z]+)-(.+)$/);
  if (semanticMatch) {
    const category = semanticMatch[1][0].toUpperCase() + semanticMatch[1].slice(1);
    const prop = toCamel(semanticMatch[2]);
    return `PT.Semantic.${category}.${prop}`;
  }

  // --pt-typography-{rest} → PT.Typography.{camelRest}
  const typoMatch = name.match(/^pt-typography-(.+)$/);
  if (typoMatch) {
    return `PT.Typography.${toCamel(typoMatch[1])}`;
  }

  // --pt-shadow-{key} → PT.Shadow.{camelKey}
  const shadowMatch = name.match(/^pt-shadow-(.+)$/);
  if (shadowMatch) {
    return `PT.Shadow.${toCamel(shadowMatch[1])}`;
  }

  return `PT.${toCamel(name.replace(/^pt-/, ''))}`;
}

function androidSnippet(cssVar) {
  const name = cssVar.replace(/^--/, '').replace(/-/g, '_');

  // Colors: primitive palette + all semantic tokens (they resolve to color values)
  if (/--pt-color-/.test(cssVar) || /--pt-semantic-/.test(cssVar)) {
    return `@color/${name}`;
  }

  // Dimensions: spacing scale and typography sizes
  if (/--pt-(scale|typography)/.test(cssVar)) {
    return `@dimen/${name}`;
  }

  // Effects: compound shadow value (--pt-shadow-lg etc.)
  return `@style/${name}`;
}

// ─── Snippet panel factory ────────────────────────────────────────────────────

let currentOpenPanel = null;

function togglePanel(panel) {
  if (currentOpenPanel && currentOpenPanel !== panel) {
    currentOpenPanel.classList.remove('open');
    currentOpenPanel.style.left = '';
    const prevBtn = currentOpenPanel._toggleBtn;
    if (prevBtn) prevBtn.classList.remove('active');
  }
  const isOpen = panel.classList.toggle('open');
  if (isOpen && !panel.classList.contains('inline')) {
    // Reset to default then check for right-edge overflow
    panel.style.left = '0';
    const rect = panel.getBoundingClientRect();
    const overflow = rect.right - (window.innerWidth - 8);
    if (overflow > 0) {
      panel.style.left = `${-overflow}px`;
    }
  }
  currentOpenPanel = isOpen ? panel : null;
}

/**
 * Build a snippet panel element with Web / iOS / Android tabs.
 * Pass inline:true for panels that sit inside wider containers (sem tiles, shadow).
 */
function buildPanel(cssVar, { inline = false } = {}) {
  const snippets = {
    web:     cssSnippet(cssVar),
    ios:     swiftSnippet(cssVar),
    android: androidSnippet(cssVar),
  };

  const panel = document.createElement('div');
  panel.className = 'snippet-panel' + (inline ? ' inline' : '');
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn"        data-tab="ios">iOS</button>
      <button class="tab-btn"        data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text">${snippets.web}</code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      codeEl.textContent = snippets[tab.dataset.tab];
    });
  });

  copyBtn.addEventListener('click', () => {
    const activeTab = panel.querySelector('.tab-btn.active').dataset.tab;
    navigator.clipboard.writeText(snippets[activeTab]);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  return panel;
}

// ─── Dark mode toggle ──────────────────────────────────────────────────────────

const themeBtn = document.getElementById('themeToggle');

themeBtn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? 'Dark' : 'Light';

  // Refresh resolved hex values in all semantic tiles
  document.querySelectorAll('.sem-tile').forEach(tile => {
    const sw  = tile.querySelector('.sem-swatch');
    const val = tile.querySelector('.sem-value');
    if (sw && val) val.textContent = getCSSVar(sw.dataset.cssvar);
  });
});

// ─── Color palettes ───────────────────────────────────────────────────────────

const palettes = {
  Green:  { prefix: '--pt-color-green-',  shades: [50,100,200,300,400,500,600,700,800,900,1000] },
  Teal:   { prefix: '--pt-color-teal-',   shades: [50,100,200,300,400,500,600,700,800,900,1000] },
  Red:    { prefix: '--pt-color-red-',    shades: [50,100,200,300,400,500,600,700,800,900,1000] },
  Yellow: { prefix: '--pt-color-yellow-', shades: [50,100,200,300,400,500,600,700,800,900,1000] },
  Grey:   { prefix: '--pt-color-grey-',   shades: [25,50,75,100,200,300,400,500,600,700,800,850,900,1000] },
};

const colorsSection = document.getElementById('colors');

for (const [paletteName, { prefix, shades }] of Object.entries(palettes)) {
  const group = document.createElement('div');
  group.className = 'palette-group';
  group.innerHTML = `<div class="palette-label">${paletteName}</div>`;

  const row = document.createElement('div');
  row.className = 'palette';

  for (const shade of shades) {
    const cssVar = `${prefix}${shade}`;

    const wrap = document.createElement('div');
    wrap.className = 'swatch-wrap';

    const sw = document.createElement('div');
    sw.className = 'swatch';
    // Use var() reference so the color renders from CSS custom properties live,
    // regardless of when the stylesheet finishes injecting.
    sw.style.background = `var(${cssVar})`;

    const label = document.createElement('span');
    label.className = 'shade-label';
    label.textContent = shade;

    const tooltip = document.createElement('div');
    tooltip.className = 'swatch-tooltip';
    tooltip.textContent = cssVar; // updated with resolved hex on hover

    // Read the resolved hex lazily so it reflects the current theme
    sw.addEventListener('mouseenter', () => {
      tooltip.textContent = `${cssVar} · ${getCSSVar(cssVar)}`;
    });

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';
    toggleBtn.setAttribute('aria-label', 'Show code snippet');

    const panel = buildPanel(cssVar);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    wrap.append(sw, label, tooltip, toggleBtn, panel);
    row.appendChild(wrap);
  }

  group.appendChild(row);
  colorsSection.appendChild(group);
}

// ─── Semantic tiles ────────────────────────────────────────────────────────────

const semanticGroups = [
  {
    label: 'Typography',
    category: 'typography',
    keys: [
      'headings', 'body', 'body_secondary', 'body_caption',
      'action', 'action_hover', 'disabled',
      'success', 'warning', 'error', 'information',
      'on_action', 'on_hover', 'on_disabled',
    ],
  },
  {
    label: 'Icon',
    category: 'icon',
    keys: [
      'headings', 'body', 'body_secondary', 'body_caption',
      'action', 'action_hover', 'disabled',
      'success', 'warning', 'error', 'information',
      'on_action', 'on_hover', 'on_disabled',
    ],
  },
  {
    label: 'Surface',
    category: 'surface',
    keys: [
      'page', 'page_90', 'card_primary', 'card_85',
      'action', 'action_hover', 'negative', 'negative_hover',
      'information_core', 'warning_core',
      'success', 'warning', 'error', 'information', 'disabled',
    ],
  },
  {
    label: 'Border',
    category: 'border',
    keys: [
      'page', 'default', 'divider', 'card_primary',
      'action', 'action_hover', 'negative', 'negative_hover',
      'information_core', 'warning_core',
      'success', 'warning', 'error', 'information', 'disabled',
    ],
  },
];

const semanticSection = document.getElementById('semantic');

for (const { label, category, keys } of semanticGroups) {
  const groupEl = document.createElement('div');
  groupEl.className = 'sem-group';
  groupEl.innerHTML = `<h3>${label}</h3>`;

  const grid = document.createElement('div');
  grid.className = 'semantic-grid';

  for (const key of keys) {
    const cssVar = `--pt-semantic-${category}-${key}`;
    const hexVal = getCSSVar(cssVar);
    const displayName = key.replace(/_/g, ' ');

    const tile = document.createElement('div');
    tile.className = 'sem-tile';

    const badge = document.createElement('span');
    badge.className = 'sem-badge';
    badge.textContent = label;

    const swatch = document.createElement('div');
    swatch.className = 'sem-swatch';
    swatch.style.background = `var(${cssVar})`;
    swatch.dataset.cssvar = cssVar;

    const name = document.createElement('div');
    name.className = 'sem-name';
    name.textContent = displayName;

    const valueEl = document.createElement('div');
    valueEl.className = 'sem-value';
    valueEl.textContent = hexVal;

    const snippetBtn = document.createElement('button');
    snippetBtn.className = 'sem-snippet-btn';
    snippetBtn.textContent = '▸ {}';

    const panel = buildPanel(cssVar, { inline: true });
    panel._toggleBtn = snippetBtn;

    snippetBtn.addEventListener('click', () => {
      snippetBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    tile.append(badge, swatch, name, valueEl, snippetBtn, panel);
    grid.appendChild(tile);
  }

  groupEl.appendChild(grid);
  semanticSection.appendChild(groupEl);
}

// Shadow color semantic tokens appended to the semantic section
{
  const shadowGroup = document.createElement('div');
  shadowGroup.className = 'sem-group';
  shadowGroup.innerHTML = '<h3>Shadow</h3>';

  const shadowGrid = document.createElement('div');
  shadowGrid.className = 'semantic-grid';

  for (const [tokenKey, displayName] of [
    ['shadow',        'shadow (light)'],
    ['shadow-normal', 'shadow (normal)'],
  ]) {
    const cssVar = `--pt-semantic-${tokenKey}`;
    const hexVal = getCSSVar(cssVar);

    const tile = document.createElement('div');
    tile.className = 'sem-tile';

    const badge = document.createElement('span');
    badge.className = 'sem-badge';
    badge.textContent = 'Shadow';

    const swatch = document.createElement('div');
    swatch.className = 'sem-swatch';
    swatch.style.background = `var(${cssVar})`;
    swatch.dataset.cssvar = cssVar;

    const name = document.createElement('div');
    name.className = 'sem-name';
    name.textContent = displayName;

    const valueEl = document.createElement('div');
    valueEl.className = 'sem-value';
    valueEl.textContent = hexVal;

    const snippetBtn = document.createElement('button');
    snippetBtn.className = 'sem-snippet-btn';
    snippetBtn.textContent = '▸ {}';

    const panel = buildPanel(cssVar, { inline: true });
    panel._toggleBtn = snippetBtn;

    snippetBtn.addEventListener('click', () => {
      snippetBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    tile.append(badge, swatch, name, valueEl, snippetBtn, panel);
    shadowGrid.appendChild(tile);
  }

  shadowGroup.appendChild(shadowGrid);
  semanticSection.appendChild(shadowGroup);
}

// ─── Typography scale ──────────────────────────────────────────────────────────

// Body variants are device-agnostic — shown in both Desktop and Mobile views
const bodyTokens = [
  { label: 'Body LG', key: 'body-lg' },
  { label: 'Body',    key: 'body-default' },
  { label: 'Body SM', key: 'body-sm' },
  { label: 'Body XS', key: 'body-xs' },
];

const typeGroups = {
  large: [
    { label: 'Display 1', key: 'large-display1' },
    { label: 'Display 2', key: 'large-display2' },
    { label: 'Display 3', key: 'large-display3' },
    { label: 'H1', key: 'large-h1' },
    { label: 'H2', key: 'large-h2' },
    { label: 'H3', key: 'large-h3' },
    { label: 'H4', key: 'large-h4' },
    { label: 'H5', key: 'large-h5' },
    { label: 'H6', key: 'large-h6' },
    ...bodyTokens,
  ],
  small: [
    { label: 'Display 1', key: 'small-display1' },
    { label: 'Display 2', key: 'small-display2' },
    { label: 'Display 3', key: 'small-display3' },
    { label: 'H1', key: 'small-h1' },
    { label: 'H2', key: 'small-h2' },
    { label: 'H3', key: 'small-h3' },
    { label: 'H4', key: 'small-h4' },
    { label: 'H5', key: 'small-h5' },
    { label: 'H6', key: 'small-h6' },
    ...bodyTokens,
  ],
};

const typeScaleEl = document.getElementById('typeScale');

// ─── Composite text-style snippet panels ──────────────────────────────────────
// Each typography row gets a weight-aware panel that updates its snippet content
// whenever the active weight sub-filter changes.

const typeStylePanelUpdaters = [];

function getCurrentWeight() {
  const btn = document.querySelector('.type-weight-btn.active');
  return btn ? btn.dataset.weight : 'regular';
}

function typeStyleCSSSnippet(scaleKey, weightKey) {
  return [
    `<!-- Requires: text-styles.css -->`,
    `<p class="pt-text-style-${scaleKey}-${weightKey}">Sample text</p>`,
  ].join('\n');
}

function typeStyleSwiftSnippet(scaleKey, weightKey, largeSize, largeLh, smallSize, smallLh) {
  const weightValue = weightKey === 'regular' ? '500' : weightKey === 'emphasis' ? '700' : '300';
  // Derive type name from scaleKey, stripping the large-/small- device prefix
  const typeKey   = scaleKey.replace(/^(?:large|small)-/, '');
  const typeStr   = toCamel(typeKey); // 'display1', 'h1', 'bodyLg'
  const weightStr = weightKey[0].toUpperCase() + weightKey.slice(1);
  const lToken    = `PT.TextStyle.Large.${typeStr}${weightStr}`;
  const sToken    = `PT.TextStyle.Small.${typeStr}${weightStr}`;

  const lSz = (largeSize || '').replace('px', '') || '?';
  const lLh = (largeLh  || '').replace('px', '') || '?';
  const sSz = (smallSize || '').replace('px', '') || '?';
  const sLh = (smallLh  || '').replace('px', '') || '?';

  if (lSz !== sSz || lLh !== sLh) {
    // Values differ across breakpoints — show the trait-adaptive pattern so developers
    // get a single copy-paste snippet that handles both size classes correctly.
    return [
      `// large:   ${lSz}pt · ${weightValue} · lh ${lLh}`,
      `// small:   ${sSz}pt · ${weightValue} · lh ${sLh}`,
      `let style: PTTextStyle = traitCollection.horizontalSizeClass == .regular`,
      `    ? ${lToken}`,
      `    : ${sToken}`,
      `label.attributedText = NSAttributedString(`,
      `    string: label.text ?? "",`,
      `    attributes: style.attributes()`,
      `)`,
    ].join('\n');
  } else {
    // Same size at both breakpoints (H5, H6, Body) — single token is sufficient.
    return [
      `// ${lSz}pt · ${weightValue} · lh ${lLh}`,
      `label.attributedText = NSAttributedString(`,
      `    string: label.text ?? "",`,
      `    attributes: ${lToken}.attributes()`,
      `)`,
    ].join('\n');
  }
}

function typeStyleAndroidSnippet(scaleKey, weightKey, size, lh) {
  const weightValue = weightKey === 'regular' ? '500' : weightKey === 'emphasis' ? '700' : '300';
  const parts     = scaleKey.split('-');
  const device    = parts[0][0].toUpperCase() + parts[0].slice(1);
  const typeStr   = parts.slice(1).map(p => p[0].toUpperCase() + p.slice(1)).join('');
  const weightStr = weightKey[0].toUpperCase() + weightKey.slice(1);
  const styleName = `PT.TextStyle.${device}.${typeStr}.${weightStr}`;
  const rStyle    = styleName.replace(/\./g, '_');
  const sizeNum   = size ? size.replace('px', '') : '?';
  const lhNum     = lh   ? lh.replace('px', '')   : '?';
  return [
    `<!-- ${sizeNum}sp · ${weightValue} · lh ${lhNum} -->`,
    `<TextView`,
    `    android:textAppearance="@style/${styleName}" />`,
    ``,
    `<!-- Kotlin -->`,
    `textView.setTextAppearance(R.style.${rStyle})`,
  ].join('\n');
}

/**
 * Build a snippet panel whose content reflects the active weight filter.
 * scaleKey              — composite style key, e.g. 'large-display1', 'small-body-lg'
 * largeSize / largeLh   — resolved CSS values for the large (desktop) variant
 * smallSize / smallLh   — resolved CSS values for the small (mobile) variant
 * iOS shows adaptive pattern when sizes differ; Android uses the current group's values.
 */
function buildTypeStylePanel(scaleKey, largeSize, largeLh, smallSize, smallLh) {
  const WEIGHT_KEYS = ['regular', 'emphasis', 'thin'];

  // Android snippet uses the current group's size (large or small) — derived from scaleKey
  const androidSize = scaleKey.startsWith('small-') ? smallSize : largeSize;
  const androidLh   = scaleKey.startsWith('small-') ? smallLh   : largeLh;

  // Pre-compute all 9 snippets (3 weights × 3 platforms)
  const allSnippets = {};
  for (const w of WEIGHT_KEYS) {
    allSnippets[w] = {
      web:     typeStyleCSSSnippet(scaleKey, w),
      ios:     typeStyleSwiftSnippet(scaleKey, w, largeSize, largeLh, smallSize, smallLh),
      android: typeStyleAndroidSnippet(scaleKey, w, androidSize, androidLh),
    };
  }

  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn"        data-tab="ios">iOS</button>
      <button class="tab-btn"        data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');

  let activeTab    = 'web';
  let activeWeight = getCurrentWeight();

  function refresh() {
    codeEl.textContent = allSnippets[activeWeight][activeTab];
  }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(allSnippets[activeWeight][activeTab]);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  // Register so applyWeight() can push updates when the filter changes
  typeStylePanelUpdaters.push(newWeight => {
    activeWeight = newWeight;
    refresh();
  });

  return panel;
}

function buildTypeGroup(groupKey, tokens) {
  const groupEl = document.createElement('div');
  groupEl.className = 'type-group' + (groupKey === 'large' ? ' active' : '');
  groupEl.dataset.group = groupKey;

  for (const { label, key } of tokens) {
    const sizeVar = `--pt-typography-${key}-font_size`;
    const lhVar   = `--pt-typography-${key}-line_height`;
    const size    = getCSSVar(sizeVar);
    const lh      = getCSSVar(lhVar);

    // Derive the large and small CSS var keys so the iOS snippet can show both
    // values in the trait-adaptive pattern regardless of which tab we're building.
    // Body tokens are device-agnostic — large and small resolve to the same vars.
    let largeKey, smallKey;
    if (key.startsWith('large-')) {
      largeKey = key;
      smallKey = 'small-' + key.slice(6);
    } else if (key.startsWith('small-')) {
      smallKey = key;
      largeKey = 'large-' + key.slice(6);
    } else {
      // body-* tokens
      largeKey = smallKey = key;
    }
    const largeSize = getCSSVar(`--pt-typography-${largeKey}-font_size`);
    const largeLh   = getCSSVar(`--pt-typography-${largeKey}-line_height`);
    const smallSize = getCSSVar(`--pt-typography-${smallKey}-font_size`);
    const smallLh   = getCSSVar(`--pt-typography-${smallKey}-line_height`);

    // Wrapper provides the row border so the snippet panel sits between rows cleanly
    const rowWrap = document.createElement('div');
    rowWrap.className = 'type-row-wrap';

    const row = document.createElement('div');
    row.className = 'type-row';

    const meta = document.createElement('div');
    meta.className = 'type-meta';
    meta.innerHTML = `
      <div class="type-label">${label}</div>
      <div class="type-details">${size} / ${lh} lh</div>
    `;

    const sample = document.createElement('div');
    sample.className = 'type-sample';
    // Use var() references so the text re-renders correctly on theme toggle
    sample.style.cssText = `font-size:var(${sizeVar}); line-height:var(${lhVar});`;
    sample.textContent = 'The quick brown fox';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';
    toggleBtn.setAttribute('aria-label', 'Show code snippet');

    row.append(meta, sample, toggleBtn);

    // Composite text-style snippet panel — weight-aware, updates with filter
    // Body tokens (key: 'body-*') need the device prefix to form the full scale key
    const scaleKey = key.startsWith('body-') ? `${groupKey}-${key}` : key;
    const panel = buildTypeStylePanel(scaleKey, largeSize, largeLh, smallSize, smallLh);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    groupEl.appendChild(rowWrap);
  }

  return groupEl;
}

for (const [groupKey, tokens] of Object.entries(typeGroups)) {
  typeScaleEl.appendChild(buildTypeGroup(groupKey, tokens));
}

// Typography tab toggle (Desktop / Mobile only)
document.querySelectorAll('.type-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.group;
    document.querySelectorAll('.type-group').forEach(g => {
      g.classList.toggle('active', g.dataset.group === target);
    });
  });
});

// ─── Typography weight sub-filter ─────────────────────────────────────────────

const weightMap = {
  regular:  '--pt-typography-font_weight-regular',    // 500
  emphasis: '--pt-typography-font_weight-semibold',   // 700
  thin:     '--pt-typography-font_weight-extra_light', // 300
};

function applyWeight(weightKey) {
  const cssVar = weightMap[weightKey];
  document.querySelectorAll('.type-sample').forEach(el => {
    el.style.setProperty('font-weight', `var(${cssVar})`);
  });
  // Push new weight to all type-style snippet panels so they refresh live
  typeStylePanelUpdaters.forEach(updater => updater(weightKey));
}

document.querySelectorAll('.type-weight-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-weight-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyWeight(btn.dataset.weight);
  });
});

// Apply default Regular weight on load
applyWeight('regular');

// ─── Spacing scale ─────────────────────────────────────────────────────────────

const scaleKeys = [
  '0', 'quat', 'half', '3quat', '1', '1half',
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
];

const spacingEl = document.getElementById('spacingScale');

for (const key of scaleKeys) {
  const cssVar = `--pt-scale-${key}`;
  const val    = getCSSVar(cssVar);
  const px     = parseInt(val) || 0;

  const row = document.createElement('div');
  row.className = 'scale-row';
  row.innerHTML = `
    <div class="scale-bar" style="width:${Math.min(px * 3, 280)}px"></div>
    <span class="scale-info">scale.${key} = ${val}</span>
  `;
  spacingEl.appendChild(row);
}

// ─── Shadow snippet builder ────────────────────────────────────────────────────

/**
 * Parses the first layer of a resolved box-shadow value and returns
 * { offsetY, blur } as numbers (absolute px values).
 */
function parseShadowLayer(resolved) {
  const m = resolved.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px/);
  if (!m) return { offsetY: 2, blur: 4 };
  return { offsetY: Math.abs(parseInt(m[2], 10)), blur: parseInt(m[3], 10) };
}

/** Returns { web, ios, android } snippet strings for a shadow effect token. */
function buildShadowEffectSnippets(cssVar, groupKey) {
  const resolved = getCSSVar(cssVar);
  const { offsetY, blur } = parseShadowLayer(resolved);
  const swiftKey   = toCamel(cssVar.replace(/^--pt-shadow-/, ''));
  const androidKey = cssVar.replace(/^--/, '').replace(/-/g, '_');
  const isUpward   = groupKey === 'bottom_sheet';
  const iosOffsetY = isUpward ? -offsetY : offsetY;
  const iosRadius  = Math.max(1, Math.round(blur / 2));
  const elevation  = offsetY || Math.round(blur / 4) || 1;

  return {
    web:
`/* Requires: build/web/variables.css */
.element {
  box-shadow: var(${cssVar});
  /* resolves to: ${resolved} */
}`,
    ios:
`// Requires: build/ios/Tokens.swift
view.layer.shadowColor   = PT.Semantic.Shadow.normal.cgColor
view.layer.shadowOffset  = CGSize(width: 0, height: ${iosOffsetY})
view.layer.shadowOpacity = 1
view.layer.shadowRadius  = ${iosRadius}
// Token reference: PT.Shadow.${swiftKey}`,
    android:
`// Requires: build/android/compose/PTTheme.kt
Box(
    modifier = Modifier
        .shadow(elevation = ${elevation}.dp)
) { /* content */ }
// Token reference: @style/${androidKey}`,
  };
}

// ─── Shadows section ───────────────────────────────────────────────────────────

const shadowsSection = document.getElementById('shadows');

const SHADOW_GROUPS = [
  {
    key:   'gradient',
    label: 'Gradient',
    desc:  'Soft blurred elevation — use on cards, modals, and floating surfaces.',
  },
  {
    key:   'solid',
    label: 'Solid',
    desc:  'Crisp bottom-edge depth — use on buttons, inputs, and interactive controls.',
  },
  {
    key:   'bottom_sheet',
    label: 'Bottom Sheet',
    desc:  'Upward shadow — use on bottom sheets and slide-up drawers.',
  },
];
const SHADOW_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

for (const { key, label, desc } of SHADOW_GROUPS) {
  const group = document.createElement('div');
  group.className = 'shadow-group';
  group.innerHTML = `<h3>${label}</h3><p class="shadow-group-desc">${desc}</p>`;

  const grid = document.createElement('div');
  grid.className = 'shadow-grid';

  // Pre-compute snippets for all sizes in this group
  const allSnippets = {};
  for (const size of SHADOW_SIZES) {
    allSnippets[size] = buildShadowEffectSnippets(`--pt-shadow-${key}-${size}`, key);
  }

  // Single shared panel below the grid
  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'shadow-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn"        data-tab="ios">iOS</button>
      <button class="tab-btn"        data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs   = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode   = sharedPanel.querySelector('.snippet-text');
  const panelCopy   = sharedPanel.querySelector('.copy-btn');
  let   activeTab   = 'web';
  let   activeSize  = null;

  function showPanelFor(size) {
    panelCode.textContent = allSnippets[size][activeTab];
    panelCopy.textContent = 'Copy';
    sharedPanel.classList.add('open');
  }

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeSize) panelCode.textContent = allSnippets[activeSize][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeSize) return;
    navigator.clipboard.writeText(allSnippets[activeSize][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  for (const size of SHADOW_SIZES) {
    const cssVar = `--pt-shadow-${key}-${size}`;

    const card = document.createElement('div');
    card.className = 'shadow-preview-card';

    const box = document.createElement('div');
    box.className = 'shadow-preview-box';
    box.style.boxShadow = `var(${cssVar})`;

    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'shadow-preview-label';
    sizeLabel.textContent = size.toUpperCase();

    const snippetBtn = document.createElement('button');
    snippetBtn.className = 'sem-snippet-btn';
    snippetBtn.textContent = '▸ {}';

    snippetBtn.addEventListener('click', () => {
      const isAlreadyOpen = sharedPanel.classList.contains('open') && activeSize === size;
      // Deactivate all cards and buttons in this group
      grid.querySelectorAll('.sem-snippet-btn').forEach(b => {
        b.classList.remove('active');
        b.textContent = '▸ {}';
      });
      if (isAlreadyOpen) {
        sharedPanel.classList.remove('open');
        activeSize = null;
      } else {
        activeSize = size;
        snippetBtn.classList.add('active');
        snippetBtn.textContent = '▾ {}';
        showPanelFor(size);
      }
    });

    card.append(box, sizeLabel, snippetBtn);
    grid.appendChild(card);
  }

  group.append(grid, sharedPanel);
  shadowsSection.appendChild(group);
}


// ─── Gradients section ────────────────────────────────────────────────────────

const gradientsSection = document.getElementById('gradients');

const PAGE_WASH_TOKENS = [
  { token: '--pt-color-teal-100',                hex: '#ccebf4' },
  { token: '--pt-color-yellow-100',              hex: '#fdf1d9' },
  { token: '--pt-color-green-100',               hex: '#dfebdb' },
  { token: '--pt-semantic-surface-card_primary', hex: '#ffffff' },
];

const gradientCard = document.createElement('div');
gradientCard.className = 'gradient-pattern-card';
gradientCard.innerHTML = `
  <div class="gradient-pattern-preview"></div>
  <div class="gradient-pattern-meta">
    <div class="gradient-pattern-name">Page Wash</div>
    <div class="gradient-token-chips">
      ${PAGE_WASH_TOKENS.map(({ token, hex }) => `
        <span class="gradient-token-chip">
          <span class="gradient-token-chip-swatch" style="background:${hex};border:1px solid rgba(0,0,0,0.08)"></span>
          ${token}
        </span>
      `).join('')}
    </div>
  </div>
`;
gradientsSection.appendChild(gradientCard);

// Snippet panel
const gradientSnippetWrap = document.createElement('div');
gradientSnippetWrap.className = 'gradient-snippet-wrap';

const gradientToggleBtn = document.createElement('button');
gradientToggleBtn.className = 'snippet-toggle';
gradientToggleBtn.style.cssText = 'font-size:12px; padding:5px 12px; margin-bottom:10px;';
gradientToggleBtn.textContent = '▸ {} Show code snippet';

const pageWashWebSnippet = `/* Requires: build/web/variables.css */
.page-wash {
  position: relative;
  overflow: hidden;
}
.page-wash::before {
  content: '';
  position: absolute;
  inset: -120px;
  background: conic-gradient(
    from 200deg at 55% -10%,
    var(--pt-color-teal-100),
    var(--pt-color-yellow-100),
    var(--pt-color-green-100),
    var(--pt-semantic-surface-card_primary) 55%
  );
  filter: blur(120px);
  pointer-events: none;
}`;

const pageWashIosSnippet = `// Requires: build/ios/Tokens.swift
private func addPageWash(to view: UIView) {
    let gradient = CAGradientLayer()
    gradient.type = .conic
    gradient.colors = [
        PT.Color.Teal.c100.cgColor,
        PT.Color.Yellow.c100.cgColor,
        PT.Color.Green.c100.cgColor,
        UIColor.white.cgColor,
    ]
    gradient.startPoint = CGPoint(x: 0.55, y: 0)
    gradient.endPoint   = CGPoint(x: 0.55, y: 1)
    gradient.frame = view.bounds.insetBy(dx: -120, dy: -120)

    let blurView = UIVisualEffectView(effect: UIBlurEffect(style: .regular))
    blurView.frame = view.bounds

    let container = UIView(frame: view.bounds)
    container.clipsToBounds = true
    container.layer.insertSublayer(gradient, at: 0)
    view.insertSubview(container, at: 0)
}`;

const pageWashAndroidSnippet = `// Requires: build/android/compose/PTTheme.kt
@Composable
fun PageWashBackground(modifier: Modifier = Modifier) {
    val colors = MaterialTheme.ptColors
    Box(
        modifier = modifier
            .fillMaxSize()
            .drawBehind {
                drawRect(
                    brush = Brush.sweepGradient(
                        listOf(
                            Color(0xFFCCEBF4), // pt-color-teal-100
                            Color(0xFFFDF1D9), // pt-color-yellow-100
                            Color(0xFFDFEBDB), // pt-color-green-100
                            Color.White,
                        )
                    )
                )
            }
            .blur(120.dp)
    )
}

/* Note: Android's blur() modifier requires API 31+.
   For API 26–30, use RenderScript-based blur as a fallback. */`;

const gradientPanelEl = document.createElement('div');
gradientPanelEl.className = 'snippet-panel';
gradientPanelEl.style.cssText = 'position:static;width:100%;box-shadow:none;display:none;';
gradientPanelEl.innerHTML = `
  <div class="panel-tabs">
    <button class="panel-tab active" data-tab="web">Web</button>
    <button class="panel-tab" data-tab="ios">iOS</button>
    <button class="panel-tab" data-tab="android">Android</button>
  </div>
  <div class="panel-body">
    <pre class="panel-code" data-pane="web">${pageWashWebSnippet}</pre>
    <pre class="panel-code" data-pane="ios" style="display:none">${pageWashIosSnippet}</pre>
    <pre class="panel-code" data-pane="android" style="display:none">${pageWashAndroidSnippet}</pre>
    <button class="copy-btn">Copy</button>
  </div>
`;

gradientToggleBtn.addEventListener('click', () => {
  const open = gradientPanelEl.style.display !== 'none';
  gradientPanelEl.style.display = open ? 'none' : 'block';
  gradientToggleBtn.textContent  = open ? '▸ {} Show code snippet' : '▾ {} Hide code snippet';
  gradientToggleBtn.classList.toggle('active', !open);
});

gradientPanelEl.querySelectorAll('.panel-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const pane = tab.dataset.tab;
    gradientPanelEl.querySelectorAll('.panel-tab').forEach(t => t.classList.toggle('active', t === tab));
    gradientPanelEl.querySelectorAll('.panel-code').forEach(c => {
      c.style.display = c.dataset.pane === pane ? 'block' : 'none';
    });
  });
});

gradientPanelEl.querySelector('.copy-btn').addEventListener('click', function () {
  const activeCode = gradientPanelEl.querySelector('.panel-code:not([style*="display:none"])');
  navigator.clipboard.writeText(activeCode ? activeCode.textContent : '');
  this.textContent = 'Copied!';
  setTimeout(() => { this.textContent = 'Copy'; }, 1500);
});

gradientSnippetWrap.append(gradientToggleBtn, gradientPanelEl);
gradientsSection.appendChild(gradientSnippetWrap);

// ─── Sidebar — section toggle ─────────────────────────────────────────────────

[
  { toggleId: 'foundations-toggle',   itemsId: 'foundations-items',   iconId: 'foundations-icon'   },
  { toggleId: 'components-toggle',    itemsId: 'components-items',    iconId: 'components-icon'    },
  { toggleId: 'selection-sub-toggle', itemsId: 'selection-sub-items', iconId: 'selection-sub-icon' },
  { toggleId: 'input-sub-toggle',     itemsId: 'input-sub-items',     iconId: 'input-sub-icon'     },
].forEach(({ toggleId, itemsId, iconId }) => {
  const btn   = document.getElementById(toggleId);
  const items = document.getElementById(itemsId);
  const icon  = document.getElementById(iconId);
  if (!btn || !items || !icon) return;

  btn.addEventListener('click', () => {
    const isCollapsed = items.classList.toggle('collapsed');
    icon.textContent  = isCollapsed ? '+' : '−';
  });
});

// ─── Sidebar — active link on scroll ─────────────────────────────────────────

const navLinks    = document.querySelectorAll('.nav-link[data-section]');
const sectionIds  = [...navLinks].map(a => a.dataset.section);

function setActiveLink(id) {
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === id));
}

// Mark first link active on load
if (sectionIds.length) setActiveLink(sectionIds[0]);

const observer = new IntersectionObserver(
  entries => {
    // Find the topmost section currently intersecting
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setActiveLink(visible[0].target.id);
  },
  { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
);

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

// ─── Button playground ────────────────────────────────────────────────────────

const ICON_SIZE = { sm: 16, md: 20, lg: 24 };
let btnIconName = 'arrow-right';        // updated when user picks an icon in the gallery
let btnIconLinkEl = null;              // <code> element in the button controls status row

const btnState = { size: 'md', state: 'default', icon: 'none' };

const btnTypes = [
  { key: 'primary',   label: 'Primary'   },
  { key: 'secondary', label: 'Secondary' },
  { key: 'tertiary',  label: 'Tertiary'  },
];

const btnControls = [
  { key: 'size',  label: 'Size',  opts: [
    { val: 'sm', label: 'Small'      },
    { val: 'md', label: 'Default', active: true },
    { val: 'lg', label: 'Large'      },
  ]},
  { key: 'state', label: 'State', opts: [
    { val: 'default',        label: 'Default',       active: true },
    { val: 'hover',          label: 'Hover'          },
    { val: 'negative',       label: 'Negative'       },
    { val: 'negative_hover', label: 'Negative_hover'  },
    { val: 'disabled',       label: 'Disabled'       },
    { val: 'ai',             label: 'AI Default'     },
    { val: 'ai_hover',       label: 'AI Hover'       },
  ]},
  { key: 'icon',  label: 'Icon',  opts: [
    { val: 'none',     label: 'None',     active: true },
    { val: 'leading',  label: 'Leading'  },
    { val: 'trailing', label: 'Trailing' },
  ]},
];

function getBtnClasses(type, { size, state }) {
  const cls = ['pt-btn', `pt-btn-${type}`, `pt-btn-${size}`];
  if (['hover', 'ai_hover', 'negative_hover'].includes(state)) cls.push('pt-btn-is-hover');
  if (['negative', 'negative_hover'].includes(state))          cls.push('pt-btn-negative');
  if (['ai', 'ai_hover'].includes(state))                      cls.push('pt-btn-ai');
  return cls;
}

function buildBtnElement(type, { size, state, icon }) {
  const btn = document.createElement('button');
  btn.className = getBtnClasses(type, { size, state }).join(' ');
  if (state === 'disabled') btn.disabled = true;
  if (icon === 'leading')  btn.insertAdjacentHTML('beforeend', buildIconSvg(btnIconName, ICON_SIZE[size]));
  btn.insertAdjacentText('beforeend', 'Button');
  if (icon === 'trailing') btn.insertAdjacentHTML('beforeend', buildIconSvg(btnIconName, ICON_SIZE[size]));
  return btn;
}

// ─── Snippet generators ───────────────────────────────────────────────────────

// Token maps keyed by type × state
const BTN_BG = {
  primary:   { default: 'var(--pt-semantic-surface-action)', hover: 'var(--pt-semantic-surface-action_hover)', negative: 'var(--pt-semantic-surface-negative)', negative_hover: 'var(--pt-semantic-surface-negative_hover)', disabled: 'var(--pt-semantic-surface-disabled)', ai: 'linear-gradient(to right, var(--pt-color-green-400), var(--pt-color-teal-500))', ai_hover: 'linear-gradient(to right, var(--pt-color-green-500), var(--pt-color-teal-600))' },
  secondary: { default: 'var(--pt-semantic-surface-page)', hover: 'var(--pt-semantic-surface-card_primary)', negative: 'var(--pt-semantic-surface-page)', negative_hover: 'var(--pt-semantic-surface-card_primary)', disabled: 'var(--pt-semantic-surface-page)', ai: 'var(--pt-semantic-surface-page)', ai_hover: 'var(--pt-semantic-surface-page)' },
  tertiary:  { default: 'transparent', hover: 'transparent', negative: 'transparent', negative_hover: 'transparent', disabled: 'transparent', ai: 'transparent', ai_hover: 'transparent' },
};
const BTN_COLOR = {
  primary:   { default: 'var(--pt-semantic-typography-on_action)', hover: 'var(--pt-semantic-typography-on_action)', negative: 'var(--pt-semantic-typography-on_action)', negative_hover: 'var(--pt-semantic-typography-on_action)', disabled: 'var(--pt-semantic-typography-on_disabled)', ai: 'var(--pt-semantic-typography-on_action)', ai_hover: 'var(--pt-semantic-typography-on_action)' },
  secondary: { default: 'var(--pt-semantic-typography-action)', hover: 'var(--pt-semantic-typography-action_hover)', negative: 'var(--pt-semantic-typography-error)', negative_hover: 'var(--pt-semantic-typography-error)', disabled: 'var(--pt-semantic-typography-body_caption)', ai: 'var(--pt-semantic-typography-action)', ai_hover: 'var(--pt-semantic-typography-action_hover)' },
  tertiary:  { default: 'var(--pt-semantic-typography-action)', hover: 'var(--pt-semantic-typography-action_hover)', negative: 'var(--pt-semantic-typography-error)', negative_hover: 'var(--pt-semantic-typography-error)', disabled: 'var(--pt-semantic-typography-body_caption)', ai: 'var(--pt-semantic-typography-action)', ai_hover: 'var(--pt-semantic-typography-action_hover)' },
};
const BTN_BORDER = {
  primary:   { default: 'var(--pt-semantic-border-action)', hover: 'var(--pt-semantic-border-action_hover)', negative: 'var(--pt-semantic-border-negative)', negative_hover: 'var(--pt-semantic-border-negative_hover)', disabled: 'var(--pt-semantic-border-disabled)', ai: 'var(--pt-color-green-400)', ai_hover: 'var(--pt-color-green-500)' },
  secondary: { default: 'var(--pt-semantic-border-action)', hover: 'var(--pt-semantic-border-action_hover)', negative: 'var(--pt-semantic-border-negative)', negative_hover: 'var(--pt-semantic-border-negative_hover)', disabled: 'var(--pt-semantic-border-disabled)', ai: 'var(--pt-semantic-border-action)', ai_hover: 'var(--pt-semantic-border-action_hover)' },
  tertiary:  { default: 'transparent', hover: 'transparent', negative: 'transparent', negative_hover: 'transparent', disabled: 'transparent', ai: 'transparent', ai_hover: 'transparent' },
};
const BTN_PADDING = { sm: ['var(--pt-scale-2)', 'var(--pt-scale-4)'], md: ['var(--pt-scale-3)', 'var(--pt-scale-5)'], lg: ['var(--pt-scale-3)', 'var(--pt-scale-6)'] };
const BTN_FONT    = { sm: 'var(--pt-typography-body-sm-font_size)', md: 'var(--pt-typography-body-default-font_size)', lg: 'var(--pt-typography-body-lg-font_size)' };
const BTN_RADIUS  = { sm: 'var(--pt-scale-1half)', md: 'var(--pt-scale-2)', lg: 'var(--pt-scale-2)' };

// Swift token maps (no CSS-var syntax)
const BTN_BG_SWIFT = {
  primary:   { default: 'PT.Semantic.Surface.action', hover: 'PT.Semantic.Surface.actionHover', negative: 'PT.Semantic.Surface.negative', negative_hover: 'PT.Semantic.Surface.negativeHover', disabled: 'PT.Semantic.Surface.disabled', ai: '/* gradient — see note */', ai_hover: '/* gradient darker — see note */' },
  secondary: { default: 'PT.Semantic.Surface.page', hover: 'PT.Semantic.Surface.cardPrimary', negative: 'PT.Semantic.Surface.page', negative_hover: 'PT.Semantic.Surface.cardPrimary', disabled: 'PT.Semantic.Surface.disabled', ai: 'PT.Semantic.Surface.page', ai_hover: 'PT.Semantic.Surface.page' },
  tertiary:  { default: '.clear', hover: '.clear', negative: '.clear', negative_hover: '.clear', disabled: '.clear', ai: '.clear', ai_hover: '.clear' },
};
const BTN_COLOR_SWIFT = {
  primary:   { default: 'PT.Semantic.Typography.onAction', hover: 'PT.Semantic.Typography.onAction', negative: 'PT.Semantic.Typography.onAction', negative_hover: 'PT.Semantic.Typography.onAction', disabled: 'PT.Semantic.Typography.onDisabled', ai: 'PT.Semantic.Typography.onAction', ai_hover: 'PT.Semantic.Typography.onAction' },
  secondary: { default: 'PT.Semantic.Typography.action', hover: 'PT.Semantic.Typography.actionHover', negative: 'PT.Semantic.Typography.error', negative_hover: 'PT.Semantic.Typography.error', disabled: 'PT.Semantic.Typography.onDisabled', ai: 'PT.Semantic.Typography.action', ai_hover: 'PT.Semantic.Typography.actionHover' },
  tertiary:  { default: 'PT.Semantic.Typography.action', hover: 'PT.Semantic.Typography.actionHover', negative: 'PT.Semantic.Typography.error', negative_hover: 'PT.Semantic.Typography.error', disabled: 'PT.Semantic.Typography.disabled', ai: 'PT.Semantic.Typography.action', ai_hover: 'PT.Semantic.Typography.actionHover' },
};
const BTN_BORDER_SWIFT = {
  primary:   { default: 'PT.Semantic.Border.action', hover: 'PT.Semantic.Border.actionHover', negative: 'PT.Semantic.Border.negative', negative_hover: 'PT.Semantic.Border.negativeHover', disabled: 'PT.Semantic.Border.disabled', ai: 'PT.Color.Green.c400', ai_hover: 'PT.Color.Green.c500' },
  secondary: { default: 'PT.Semantic.Border.action', hover: 'PT.Semantic.Border.actionHover', negative: 'PT.Semantic.Border.negative', negative_hover: 'PT.Semantic.Border.negativeHover', disabled: 'PT.Semantic.Border.disabled', ai: 'PT.Semantic.Border.action', ai_hover: 'PT.Semantic.Border.actionHover' },
  tertiary:  { default: '.clear', hover: '.clear', negative: '.clear', negative_hover: '.clear', disabled: '.clear', ai: '.clear', ai_hover: '.clear' },
};
const BTN_PADDING_SWIFT = { sm: ['PT.Scale.s2', 'PT.Scale.s4'], md: ['PT.Scale.s3', 'PT.Scale.s5'], lg: ['PT.Scale.s3', 'PT.Scale.s6'] };
const BTN_RADIUS_SWIFT  = { sm: 'PT.Scale.s1half', md: 'PT.Scale.s2', lg: 'PT.Scale.s2' };

// Android Compose token maps
const BTN_BG_COMPOSE = {
  primary:   { default: 'colors.surfaceAction', hover: 'colors.surfaceActionHover', negative: 'colors.surfaceNegative', negative_hover: 'colors.surfaceNegativeHover', disabled: 'colors.surfaceDisabled', ai: '/* gradient — see note */', ai_hover: '/* gradient darker — see note */' },
  secondary: { default: 'colors.surfacePage', hover: 'colors.surfaceCardPrimary', negative: 'colors.surfacePage', negative_hover: 'colors.surfaceCardPrimary', disabled: 'colors.surfacePage', ai: 'colors.surfacePage', ai_hover: 'colors.surfacePage' },
  tertiary:  { default: 'Color.Transparent', hover: 'Color.Transparent', negative: 'Color.Transparent', negative_hover: 'Color.Transparent', disabled: 'Color.Transparent', ai: 'Color.Transparent', ai_hover: 'Color.Transparent' },
};
const BTN_COLOR_COMPOSE = {
  primary:   { default: 'colors.typographyOnAction', hover: 'colors.typographyOnAction', negative: 'colors.typographyOnAction', negative_hover: 'colors.typographyOnAction', disabled: 'colors.typographyOnDisabled', ai: 'colors.typographyOnAction', ai_hover: 'colors.typographyOnAction' },
  secondary: { default: 'colors.typographyAction', hover: 'colors.typographyActionHover', negative: 'colors.typographyError', negative_hover: 'colors.typographyError', disabled: 'colors.typographyOnDisabled', ai: 'colors.typographyAction', ai_hover: 'colors.typographyActionHover' },
  tertiary:  { default: 'colors.typographyAction', hover: 'colors.typographyActionHover', negative: 'colors.typographyError', negative_hover: 'colors.typographyError', disabled: 'colors.typographyDisabled', ai: 'colors.typographyAction', ai_hover: 'colors.typographyActionHover' },
};
const BTN_BORDER_COMPOSE = {
  primary:   { default: 'colors.borderAction', hover: 'colors.borderActionHover', negative: 'colors.borderNegative', negative_hover: 'colors.borderNegativeHover', disabled: 'colors.borderDisabled', ai: 'MaterialTheme.ptColors.colorGreen400', ai_hover: 'MaterialTheme.ptColors.colorGreen500' },
  secondary: { default: 'colors.borderAction', hover: 'colors.borderActionHover', negative: 'colors.borderNegative', negative_hover: 'colors.borderNegativeHover', disabled: 'colors.borderDisabled', ai: 'colors.borderAction', ai_hover: 'colors.borderActionHover' },
  tertiary:  { default: 'Color.Transparent', hover: 'Color.Transparent', negative: 'Color.Transparent', negative_hover: 'Color.Transparent', disabled: 'Color.Transparent', ai: 'Color.Transparent', ai_hover: 'Color.Transparent' },
};
const BTN_PADDING_COMPOSE = { sm: ['PTDimens.s2', 'PTDimens.s4'], md: ['PTDimens.s3', 'PTDimens.s5'], lg: ['PTDimens.s3', 'PTDimens.s6'] };
const BTN_RADIUS_COMPOSE  = { sm: 'PTDimens.s1half', md: 'PTDimens.s2', lg: 'PTDimens.s2' };

function getBtnShadowWeb(type, size, state) {
  if (type === 'tertiary' || state === 'disabled') return null;
  const isHover = ['hover', 'ai_hover', 'negative_hover'].includes(state);
  if (!isHover) return null;
  if (size === 'sm') return 'box-shadow: var(--pt-shadow-solid-xs);';
  if (size === 'md' || size === 'lg') return 'box-shadow: var(--pt-shadow-solid-sm);';
  return null;
}

function buildBtnWebSnippet(type, { size, state, icon }) {
  const bg     = BTN_BG[type][state];
  const color  = BTN_COLOR[type][state];
  const border = BTN_BORDER[type][state];
  const [pv, ph] = BTN_PADDING[size];
  const fs     = BTN_FONT[size];
  const radius = BTN_RADIUS[size];
  const shadow = getBtnShadowWeb(type, size, state);
  const dis    = state === 'disabled' ? '\ncursor: not-allowed;' : '';
  const iconPx   = ICON_SIZE[size] || 20;
  const iconNote = icon !== 'none' ? `\n/* tabler icon "${btnIconName}" (${iconPx}×${iconPx}px) — see Icons section */\n/* place ${icon === 'leading' ? 'before' : 'after'} label, stroke="currentColor" */` : '';
  const isGradientBorder = type === 'primary' && (state === 'ai' || state === 'ai_hover');
  const bgLine = isGradientBorder
    ? `background:\n  ${bg} padding-box,\n  ${bg} border-box;`
    : `background: ${bg};`;
  const borderLine = isGradientBorder
    ? `border: 1px solid transparent;`
    : `border: 1px solid ${border};`;
  return [
    `/* ${type[0].toUpperCase() + type.slice(1)} · ${state} · ${size} */`,
    bgLine,
    `color: ${color};`,
    borderLine,
    `padding: ${pv} ${ph};`,
    `font-size: ${fs};`,
    `border-radius: ${radius};`,
    shadow,
    `display: inline-flex; align-items: center; gap: var(--pt-scale-2);`,
    dis + iconNote,
  ].filter(Boolean).join('\n');
}

function buildBtnIOSSnippet(type, { size, state, icon }) {
  const bg     = BTN_BG_SWIFT[type][state];
  const color  = BTN_COLOR_SWIFT[type][state];
  const border = BTN_BORDER_SWIFT[type][state];
  const [pv, ph] = BTN_PADDING_SWIFT[size];
  const radius = BTN_RADIUS_SWIFT[size];
  const dis    = state === 'disabled' ? '\nbutton.isEnabled = false' : '';
  const iconNote = icon !== 'none' ? `\n// Add SF Symbol or custom SVG ${icon === 'leading' ? 'before' : 'after'} title` : '';
  const aiNote   = state === 'ai' ? '\n// AI gradient: apply CAGradientLayer with\n// colors: [PT.Color.Green.c400.cgColor, PT.Color.Teal.c500.cgColor]' : '';
  const borderLine = border === '.clear' ? '' : `\nbutton.layer.borderColor = ${border}.cgColor\nbutton.layer.borderWidth = 1`;
  let shadowLines = '';
  if (type !== 'tertiary' && state !== 'disabled') {
    const isHoverState = ['hover', 'ai_hover', 'negative_hover'].includes(state);
    const isSmHover = size === 'sm' && isHoverState;
    const isMdLg    = (size === 'md' || size === 'lg') && isHoverState;
    if (isSmHover || isMdLg) {
      const offsetY = isSmHover ? 'PT.Scale.shalf' : 'PT.Scale.s1';
      const blur    = isSmHover ? 'PT.Scale.s1'    : 'PT.Scale.s1half';
      shadowLines = [
        `\nbutton.layer.shadowColor   = PT.Semantic.Shadow.normal.cgColor`,
        `button.layer.shadowOffset  = CGSize(width: 0, height: ${offsetY})`,
        `button.layer.shadowOpacity = 1`,
        `button.layer.shadowRadius  = ${blur}`,
      ].join('\n');
    }
  }
  return [
    `// ${type[0].toUpperCase() + type.slice(1)} · ${state} · ${size}`,
    `button.backgroundColor = ${bg}`,
    `button.setTitleColor(${color}, for: .normal)`,
    borderLine,
    `button.layer.cornerRadius = ${radius}`,
    `button.contentEdgeInsets = UIEdgeInsets(`,
    `  top: ${pv}, left: ${ph},`,
    `  bottom: ${pv}, right: ${ph}`,
    `)`,
    shadowLines,
    dis + iconNote + aiNote,
  ].filter(Boolean).join('\n');
}

function buildBtnAndroidSnippet(type, { size, state, icon }) {
  const colors = 'val colors = MaterialTheme.ptColors';
  const bg     = BTN_BG_COMPOSE[type][state];
  const color  = BTN_COLOR_COMPOSE[type][state];
  const border = BTN_BORDER_COMPOSE[type][state];
  const [pv, ph] = BTN_PADDING_COMPOSE[size];
  const radius = BTN_RADIUS_COMPOSE[size];
  const dis    = state === 'disabled' ? '\n  enabled = false,' : '';
  const iconNote = icon !== 'none' ? `\n// Add Icon composable ${icon === 'leading' ? 'before' : 'after'} Text` : '';
  const aiNote   = state === 'ai' ? '\n// AI gradient: use Box with Modifier.background(Brush.horizontalGradient(\n//   listOf(PT.Color.Green.c400, PT.Color.Teal.c500)))' :
                   state === 'ai_hover' ? '\n// AI gradient hover: use Box with Modifier.background(Brush.horizontalGradient(\n//   listOf(MaterialTheme.ptColors.colorGreen500, MaterialTheme.ptColors.colorTeal600)))' : '';
  const borderLine = border === 'Color.Transparent' ? '' : `\n  border = BorderStroke(1.dp, ${border}),`;
  let shadowLine = '';
  if (type !== 'tertiary' && state !== 'disabled') {
    const isHoverState = ['hover', 'ai_hover', 'negative_hover'].includes(state);
    const isSmHover = size === 'sm' && isHoverState;
    const isMdLg    = (size === 'md' || size === 'lg') && isHoverState;
    if (isSmHover) shadowLine = `\n  // shadow: pt-shadow-solid-xs → elevation = PTDimens.shalf (2.dp)`;
    else if (isMdLg) shadowLine = `\n  // shadow: pt-shadow-solid-sm → elevation = PTDimens.s1 (4.dp)`;
  }
  return [
    `// ${type[0].toUpperCase() + type.slice(1)} · ${state} · ${size}`,
    colors,
    `Button(`,
    `  colors = ButtonDefaults.buttonColors(`,
    `    containerColor = ${bg},`,
    `    contentColor = ${color}`,
    `  ),`,
    borderLine,
    `  shape = RoundedCornerShape(${radius}),`,
    `  contentPadding = PaddingValues(horizontal = ${ph}, vertical = ${pv}),`,
    shadowLine,
    dis,
    `) { Text("Button") }`,
    iconNote + aiNote,
  ].filter(Boolean).join('\n');
}

// ─── Snippet panel (updates with controls) ────────────────────────────────────

const btnSnippetUpdaters = [];

function buildBtnSnippetPanel(type) {
  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');
  let activeTab = 'web';

  const generators = {
    web:     () => buildBtnWebSnippet(type, btnState),
    ios:     () => buildBtnIOSSnippet(type, btnState),
    android: () => buildBtnAndroidSnippet(type, btnState),
  };

  function refresh() { codeEl.textContent = generators[activeTab](); }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generators[activeTab]());
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  btnSnippetUpdaters.push(refresh);
  return panel;
}

// ─── Build playground ─────────────────────────────────────────────────────────

function updateBtnPreviews() {
  document.querySelectorAll('.btn-row-wrap').forEach(wrap => {
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildBtnElement(wrap.dataset.type, btnState));
  });
}

function buildBtnPlayground() {
  const container = document.getElementById('btnPlayground');
  if (!container) return;

  // Controls
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  btnControls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';
    const lbl = document.createElement('span');
    lbl.className = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className = 'btn-ctrl' + (active ? ' active' : '');
      btn.dataset.ctrl = key;
      btn.dataset.val  = val;
      btn.textContent  = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btnState[key] = val;
        updateBtnPreviews();
        btnSnippetUpdaters.forEach(fn => fn());
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  container.appendChild(ctrlsEl);

  // Icon-link status row
  const btnIconLinkRow = document.createElement('div');
  btnIconLinkRow.className = 'chip-icon-link';
  btnIconLinkRow.innerHTML =
    `<span class="chip-icon-link-label">Icon</span>` +
    `<code class="chip-icon-link-name">arrow-right</code>` +
    `<span class="chip-icon-link-hint">— pick any icon in the <a href="#icons" class="chip-icon-link-anchor">Icons ↑</a> section to swap</span>`;
  btnIconLinkEl = btnIconLinkRow.querySelector('.chip-icon-link-name');
  container.appendChild(btnIconLinkRow);

  // Preview rows (one per type — mirrors Typography rows)
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  btnTypes.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'btn-row-wrap';
    rowWrap.dataset.type = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildBtnElement(key, btnState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = buildBtnSnippetPanel(key);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

// ─── Icons gallery ───────────────────────────────────────────────────────────


const ICON_SIZES        = [12, 16, 20, 24, 32];
const ICON_DEFAULT_SIZE = 24;

const ICON_STROKE = { 12: 1, 16: 1.5, 20: 1.75, 24: 2, 32: 2.5 };

// Build SVG string from tabler node data
function buildIconSvg(name, size) {
  const nodes  = iconNodes[name];
  if (!nodes) return '';
  const stroke = ICON_STROKE[size] || 2;
  const paths  = nodes.map(([tag, attrs]) => {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<${tag} ${attrStr}/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function buildIconWebSnippet(name, size) {
  const stroke = ICON_STROKE[size] || 2;
  return [
    `<!-- ${name} -->`,
    `<svg`,
    `  xmlns="http://www.w3.org/2000/svg"`,
    `  width="var(--pt-icon-size-${size})"`,
    `  height="var(--pt-icon-size-${size})"`,
    `  viewBox="0 0 24 24"`,
    `  fill="none"`,
    `  stroke="currentColor"`,
    `  stroke-width="var(--pt-icon-stroke_weight-${size})"`,
    `  stroke-linecap="round"`,
    `  stroke-linejoin="round"`,
    `>`,
    `  <!-- paths from tabler SVG file: ${name}.svg -->`,
    `</svg>`,
    ``,
    `/* colour via parent or directly: */`,
    `color: var(--pt-semantic-icon-action);`,
  ].join('\n');
}

function buildIconIOSSnippet(name, size) {
  const assetName = 'pt-icon-' + name;
  return [
    `// Asset name: "${assetName}"`,
    `// Export from Tabler SVG and add to Xcode asset catalog`,
    ``,
    `let icon = UIImage(named: "${assetName}")?`,
    `    .withRenderingMode(.alwaysTemplate)`,
    `imageView.image = icon`,
    `imageView.tintColor = PT.Semantic.Icon.action`,
    `imageView.frame.size = CGSize(`,
    `    width: PT.Icon.size${size},`,
    `    height: PT.Icon.size${size}`,
    `)`,
  ].join('\n');
}

function buildIconAndroidSnippet(name, size) {
  const drawableName = 'pt_icon_' + name.replace(/-/g, '_');
  return [
    `<!-- Drawable name: ${drawableName} -->`,
    `<!-- Convert Tabler SVG to vector drawable via Android Studio -->`,
    ``,
    `<ImageView`,
    `    android:layout_width="@dimen/pt_icon_size_${size}"`,
    `    android:layout_height="@dimen/pt_icon_size_${size}"`,
    `    app:srcCompat="@drawable/${drawableName}"`,
    `    android:tint="@color/pt_semantic_icon_action" />`,
  ].join('\n');
}

function buildIconGallery() {
  const container = document.getElementById('iconGallery');
  if (!container) return;

  const allNames   = Object.keys(iconNodes);
  const allCats    = ['All', ...new Set(allNames.map(n => iconMeta[n]?.category).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));
  let   activeSize = ICON_DEFAULT_SIZE;
  let   query      = '';
  let   activecat  = 'All';
  let   selected   = null;

  // ── Controls ──
  const controls = document.createElement('div');
  controls.className = 'icon-controls';

  const search = document.createElement('input');
  search.type        = 'search';
  search.placeholder = 'Search icons…';
  search.className   = 'icon-search';

  const sizeSwitcher = document.createElement('div');
  sizeSwitcher.className = 'icon-size-switcher';

  const countEl = document.createElement('span');
  countEl.className = 'icon-count';

  ICON_SIZES.forEach(sz => {
    const btn = document.createElement('button');
    btn.className   = 'icon-size-btn' + (sz === ICON_DEFAULT_SIZE ? ' active' : '');
    btn.textContent = sz;
    btn.addEventListener('click', () => {
      sizeSwitcher.querySelectorAll('.icon-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSize = sz;
      renderGrid();
    });
    sizeSwitcher.appendChild(btn);
  });

  search.addEventListener('input', () => {
    query    = search.value.trim().toLowerCase();
    selected = null;
    renderGrid();
  });

  controls.append(search, sizeSwitcher, countEl);
  container.appendChild(controls);

  // ── Category chips ──
  const catRow = document.createElement('div');
  catRow.className = 'icon-categories';

  allCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className   = 'icon-cat-btn' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      catRow.querySelectorAll('.icon-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activecat = cat;
      selected  = null;
      renderGrid();
    });
    catRow.appendChild(btn);
  });

  container.appendChild(catRow);

  // ── Grid ──
  const grid = document.createElement('div');
  grid.className = 'icon-grid';
  container.appendChild(grid);

  // ── Snippet panel ──
  const snippetWrap = document.createElement('div');
  snippetWrap.className = 'icon-snippet-wrap';
  snippetWrap.style.display = 'none';

  const snippetPanel = document.createElement('div');
  snippetPanel.className = 'snippet-panel inline';
  snippetPanel.style.display = 'block';
  snippetPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const snippetTabs  = snippetPanel.querySelectorAll('.tab-btn');
  const snippetCode  = snippetPanel.querySelector('.snippet-text');
  const snippetCopy  = snippetPanel.querySelector('.copy-btn');
  let   snippetTab   = 'web';

  const snippetGens = {
    web:     () => selected ? buildIconWebSnippet(selected, activeSize)     : '',
    ios:     () => selected ? buildIconIOSSnippet(selected, activeSize)     : '',
    android: () => selected ? buildIconAndroidSnippet(selected, activeSize) : '',
  };

  function refreshSnippet() {
    snippetCode.textContent = snippetGens[snippetTab]();
  }

  snippetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      snippetTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      snippetTab = tab.dataset.tab;
      refreshSnippet();
    });
  });

  snippetCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(snippetGens[snippetTab]());
    snippetCopy.textContent = 'Copied!';
    setTimeout(() => { snippetCopy.textContent = 'Copy'; }, 1500);
  });

  snippetWrap.appendChild(snippetPanel);
  container.appendChild(snippetWrap);

  // ── Render ──
  function renderGrid() {
    grid.innerHTML = '';

    const filtered = allNames.filter(n => {
      const matchesCat   = activecat === 'All' || iconMeta[n]?.category === activecat;
      const matchesQuery = !query || n.includes(query) || (iconMeta[n]?.tags || []).some(t => String(t).includes(query));
      return matchesCat && matchesQuery;
    });

    countEl.textContent = `${filtered.length.toLocaleString()} icons`;

    if (filtered.length === 0) {
      const msg = document.createElement('p');
      msg.className   = 'icon-none-msg';
      msg.textContent = 'No icons match your search.';
      grid.appendChild(msg);
      snippetWrap.style.display = 'none';
      return;
    }

    filtered.forEach(name => {
      const tile = document.createElement('div');
      tile.className   = 'icon-tile' + (name === selected ? ' selected' : '');
      tile.innerHTML   = buildIconSvg(name, activeSize) +
        `<span class="icon-tile-name">${name}</span>`;

      tile.addEventListener('click', () => {
        grid.querySelectorAll('.icon-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selected = name;
        snippetWrap.style.display = 'block';
        refreshSnippet();
        snippetWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // ── Push selection into the Button playground ────────────────
        btnIconName = name;
        if (btnIconLinkEl) {
          btnIconLinkEl.textContent = name;
          btnIconLinkEl.classList.add('chip-icon-link-name--updated');
          setTimeout(() => btnIconLinkEl.classList.remove('chip-icon-link-name--updated'), 800);
        }
        updateBtnPreviews();
        btnSnippetUpdaters.forEach(fn => fn());

        // ── Push selection into the Button Icon Only playground ──────
        if (btnIconIconLinkEl) {
          btnIconIconLinkEl.textContent = name;
          btnIconIconLinkEl.classList.add('chip-icon-link-name--updated');
          setTimeout(() => btnIconIconLinkEl.classList.remove('chip-icon-link-name--updated'), 800);
        }
        updateBtnIconPreviews();
        btnIconSnippetUpdaters.forEach(fn => fn());

        // ── Push selection into the Filter Chip playground ──────────
        chipIconName = name;
        if (chipIconLinkEl) {
          chipIconLinkEl.textContent = name;
          chipIconLinkEl.classList.add('chip-icon-link-name--updated');
          setTimeout(() => chipIconLinkEl.classList.remove('chip-icon-link-name--updated'), 800);
        }
        updateChipPreviews();
        chipSnippetUpdaters.forEach(fn => fn());

        // ── Push selection into the Eyebrow Highlight playground ─────
        eyebrowIconName = name;
        if (eyebrowIconLinkEl) {
          eyebrowIconLinkEl.textContent = name;
          eyebrowIconLinkEl.classList.add('chip-icon-link-name--updated');
          setTimeout(() => eyebrowIconLinkEl.classList.remove('chip-icon-link-name--updated'), 800);
        }
        updateEyebrowPreviews();
        eyebrowSnippetUpdaters.forEach(fn => fn());

        // ── Push selection into the Tag playground ───────────────────
        tagIconName = name;
        if (tagIconLinkEl) {
          tagIconLinkEl.textContent = name;
          tagIconLinkEl.classList.add('chip-icon-link-name--updated');
          setTimeout(() => tagIconLinkEl.classList.remove('chip-icon-link-name--updated'), 800);
        }
        updateTagPreviews();
        tagSnippetUpdaters.forEach(fn => fn());
      });

      grid.appendChild(tile);
    });

    // Refresh snippet if size changed and something is selected
    if (selected) refreshSnippet();
  }

  renderGrid();
}

buildIconGallery();

// ─── SuperIcon playground ─────────────────────────────────────────────────────

// Container size (px) for each icon size — always larger than the icon
const SI_CONTAINER_PX    = { '12': 20,  '16': 24,  '20': 32,  '24': 40,  '32': 56  };
// Corresponding scale steps for token names
const SI_CONTAINER_SCALE = { '12': '5', '16': '6', '20': '8', '24': '10', '32': '14' };
// Icon size → matching scale step (12→3, 16→4, 20→5, 24→6, 32→8)
const SI_ICON_SCALE      = { '12': '3', '16': '4', '20': '5', '24': '6',  '32': '8'  };
// Square border-radius tokens per size
const SI_RADIUS_CSS      = { '12': '--pt-scale-half', '16': '--pt-scale-3quat', '20': '--pt-scale-1', '24': '--pt-scale-1half', '32': '--pt-scale-2' };
const SI_RADIUS_PX       = { '12': '2px', '16': '3px', '20': '4px', '24': '6px', '32': '8px' };
const SI_RADIUS_SWIFT    = { '12': 'PT.Scale.shalf', '16': 'PT.Scale.s3quat', '20': 'PT.Scale.s1', '24': 'PT.Scale.s1half', '32': 'PT.Scale.s2' };
const SI_RADIUS_COMPOSE  = { '12': 'PTDimens.shalf', '16': 'PTDimens.s3quat', '20': 'PTDimens.s1', '24': 'PTDimens.s1half', '32': 'PTDimens.s2' };

const SI_FILLS = [
  { val: 'default',         label: 'Default'         },
  { val: 'square-fill',     label: 'Square Fill'     },
  { val: 'circle-fill',     label: 'Circle Fill'     },
  { val: 'selected-square', label: 'Selected Square' },
  { val: 'selected-circle', label: 'Selected Circle' },
];

// Background tokens per fill variant
const SI_BG_CSS = {
  'default':         'transparent',
  'square-fill':     'var(--pt-semantic-surface-card_primary)',
  'circle-fill':     'var(--pt-semantic-surface-card_primary)',
  'selected-square': 'var(--pt-semantic-surface-action)',
  'selected-circle': 'var(--pt-semantic-surface-action)',
};
const SI_BG_OPACITY = {
  'default': 0, 'square-fill': 0.85, 'circle-fill': 0.85,
  'selected-square': 1, 'selected-circle': 1,
};
const SI_BG_SWIFT = {
  'default':         null,
  'square-fill':     'PT.Semantic.Surface.cardPrimary.withAlphaComponent(0.85)',
  'circle-fill':     'PT.Semantic.Surface.cardPrimary.withAlphaComponent(0.85)',
  'selected-square': 'PT.Semantic.Surface.action',
  'selected-circle': 'PT.Semantic.Surface.action',
};
const SI_BG_COMPOSE = {
  'default':         null,
  'square-fill':     'colors.surfaceCardPrimary.copy(alpha = 0.85f)',
  'circle-fill':     'colors.surfaceCardPrimary.copy(alpha = 0.85f)',
  'selected-square': 'colors.surfaceAction',
  'selected-circle': 'colors.surfaceAction',
};

// Icon color tokens per fill variant
const SI_ICON_CSS = {
  'default':         'var(--pt-semantic-icon-headings)',
  'square-fill':     'var(--pt-semantic-icon-headings)',
  'circle-fill':     'var(--pt-semantic-icon-headings)',
  'selected-square': 'var(--pt-semantic-icon-on_action)',
  'selected-circle': 'var(--pt-semantic-icon-on_action)',
};
const SI_ICON_SWIFT = {
  'default':         'PT.Semantic.Icon.headings',
  'square-fill':     'PT.Semantic.Icon.headings',
  'circle-fill':     'PT.Semantic.Icon.headings',
  'selected-square': 'PT.Semantic.Icon.onAction',
  'selected-circle': 'PT.Semantic.Icon.onAction',
};
const SI_ICON_COMPOSE = {
  'default':         'colors.iconHeadings',
  'square-fill':     'colors.iconHeadings',
  'circle-fill':     'colors.iconHeadings',
  'selected-square': 'colors.iconOnAction',
  'selected-circle': 'colors.iconOnAction',
};

// Shared playground state
const siState = { size: '32', icon: 'map-pin' };
const siSnippetUpdaters = [];

// ── DOM builder ──

function buildSuperIconEl(fill, { size, icon }) {
  const px       = SI_CONTAINER_PX[size];
  const isCircle = fill.includes('circle');
  const hasBg    = fill !== 'default';

  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative;display:inline-flex;align-items:center;justify-content:center;width:${px}px;height:${px}px;flex-shrink:0;`;

  // Background layer (separate element so icon inherits full opacity)
  const bg = document.createElement('div');
  bg.style.cssText = [
    'position:absolute;inset:0;',
    `border-radius:${!hasBg ? '0' : isCircle ? '999px' : SI_RADIUS_PX[size]};`,
    `background:${SI_BG_CSS[fill]};`,
    `opacity:${SI_BG_OPACITY[fill]};`,
  ].join('');
  wrap.appendChild(bg);

  // Icon layer
  const iconWrap = document.createElement('div');
  iconWrap.style.cssText = `position:relative;z-index:1;color:${SI_ICON_CSS[fill]};display:flex;align-items:center;justify-content:center;`;
  iconWrap.innerHTML = buildIconSvg(icon, parseInt(size));
  wrap.appendChild(iconWrap);

  return wrap;
}

// ── Snippet generators ──

function buildSIWebSnippet(fill, { size, icon }) {
  const cStep  = SI_CONTAINER_SCALE[size];
  const cPx    = SI_CONTAINER_PX[size];
  const hasBg  = fill !== 'default';
  const isCircle  = fill.includes('circle');
  const isSelected = fill.startsWith('selected');
  const bgColor    = SI_BG_CSS[fill];
  const radiusVal  = isCircle ? '999px' : `var(${SI_RADIUS_CSS[size]})`;
  const opacityNote = (!isSelected && hasBg) ? '\nopacity: 0.85; /* background layer only */' : '';

  const bgBlock = hasBg ? [
    '',
    '/* Background — use ::before or a nested <div> to isolate opacity */',
    `background: ${bgColor};`,
    opacityNote,
    `border-radius: ${radiusVal};`,
  ].filter(Boolean).join('\n') : '';

  return [
    `/* SuperIcon · ${fill} · ${size}px · ${icon} */`,
    '',
    '/* Container */',
    `width: var(--pt-scale-${cStep});   /* ${cPx}px */`,
    `height: var(--pt-scale-${cStep});`,
    'position: relative;',
    'display: inline-flex;',
    'align-items: center;',
    'justify-content: center;',
    bgBlock,
    '',
    '/* Icon */',
    `color: ${SI_ICON_CSS[fill]};`,
    `/* tabler icon "${icon}" (${size}×${size}px) — see Icons section */`,
  ].join('\n');
}

function buildSIIOSSnippet(fill, { size, icon }) {
  const cToken = `PT.Scale.s${SI_CONTAINER_SCALE[size]}`;
  const iToken = `PT.Scale.s${SI_ICON_SCALE[size]}`;
  const hasBg  = fill !== 'default';
  const isCircle = fill.includes('circle');
  const bgToken  = SI_BG_SWIFT[fill];
  const tintToken = SI_ICON_SWIFT[fill];
  const assetName = 'pt-icon-' + icon;

  const bgLines = hasBg ? [
    `container.backgroundColor = ${bgToken}`,
    isCircle
      ? `container.layer.cornerRadius = ${cToken} / 2`
      : `container.layer.cornerRadius = ${SI_RADIUS_SWIFT[size]}`,
  ] : [];

  return [
    `// SuperIcon · ${fill} · ${size}px · ${icon}`,
    '',
    'let container = UIView()',
    `container.frame.size = CGSize(width: ${cToken}, height: ${cToken})`,
    ...bgLines,
    '',
    'let iconView = UIImageView(image:',
    `    UIImage(named: "${assetName}")?`,
    '        .withRenderingMode(.alwaysTemplate)',
    ')',
    `iconView.tintColor = ${tintToken}`,
    `iconView.frame = CGRect(`,
    `    x: (${cToken} - ${iToken}) / 2,`,
    `    y: (${cToken} - ${iToken}) / 2,`,
    `    width: ${iToken}, height: ${iToken}`,
    ')',
    'container.addSubview(iconView)',
  ].join('\n');
}

function buildSIAndroidSnippet(fill, { size, icon }) {
  const cToken = `PTDimens.s${SI_CONTAINER_SCALE[size]}`;
  const hasBg  = fill !== 'default';
  const isCircle = fill.includes('circle');
  const bgToken  = SI_BG_COMPOSE[fill];
  const tintToken = SI_ICON_COMPOSE[fill];
  const drawable  = 'pt_icon_' + icon.replace(/-/g, '_');
  const shapePart = isCircle ? 'CircleShape' : `RoundedCornerShape(${SI_RADIUS_COMPOSE[size]})`;
  const bgMod = hasBg
    ? `\n        .background(\n            color = ${bgToken},\n            shape = ${shapePart}\n        )`
    : '';

  return [
    `// SuperIcon · ${fill} · ${size}px · ${icon}`,
    'val colors = MaterialTheme.ptColors',
    '',
    'Box(',
    '    contentAlignment = Alignment.Center,',
    '    modifier = Modifier',
    `        .size(${cToken})${bgMod}`,
    ') {',
    '    Icon(',
    `        painter = painterResource(R.drawable.${drawable}),`,
    '        contentDescription = null,',
    `        tint = ${tintToken},`,
    `        modifier = Modifier.size(${parseInt(size)}.dp)`,
    '    )',
    '}',
  ].join('\n');
}

// ── Build playground ──

function updateSIPreviews() {
  document.querySelectorAll('.si-row-wrap[data-fill]').forEach(wrap => {
    const fill = wrap.dataset.fill;
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildSuperIconEl(fill, siState));
  });
}

function buildSuperIconPlayground() {
  const container = document.getElementById('superIconPlayground');
  if (!container) return;

  // ── Size control ──
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  const sizeRow = document.createElement('div');
  sizeRow.className = 'btn-ctrl-row';
  const sizeLbl = document.createElement('span');
  sizeLbl.className = 'btn-ctrl-label';
  sizeLbl.textContent = 'Size';
  sizeRow.appendChild(sizeLbl);

  ['12', '16', '20', '24', '32'].forEach(sz => {
    const btn = document.createElement('button');
    btn.className   = 'btn-ctrl' + (sz === siState.size ? ' active' : '');
    btn.textContent = sz + 'px';
    btn.addEventListener('click', () => {
      sizeRow.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      siState.size = sz;
      updateSIPreviews();
      siSnippetUpdaters.forEach(fn => fn());
    });
    sizeRow.appendChild(btn);
  });

  ctrlsEl.appendChild(sizeRow);
  container.appendChild(ctrlsEl);

  // ── Icon picker (always visible — library swap) ──
  const pickerWrap = document.createElement('div');
  pickerWrap.className = 'si-icon-picker';

  const pickerHeader = document.createElement('div');
  pickerHeader.className = 'si-icon-picker-header';

  const pickerLbl = document.createElement('span');
  pickerLbl.className = 'btn-ctrl-label';
  pickerLbl.style.minWidth = 'auto';
  pickerLbl.textContent = 'Icon';

  const iconSearch = document.createElement('input');
  iconSearch.type        = 'search';
  iconSearch.placeholder = 'Search to swap icon…';
  iconSearch.className   = 'si-icon-search';

  const selectedNameEl = document.createElement('span');
  selectedNameEl.className   = 'si-selected-name';
  selectedNameEl.textContent = siState.icon;

  pickerHeader.append(pickerLbl, iconSearch, selectedNameEl);

  const iconGrid = document.createElement('div');
  iconGrid.className = 'si-icon-grid';

  pickerWrap.append(pickerHeader, iconGrid);
  container.appendChild(pickerWrap);

  // Render icon grid (initial: first 120 icons; filtered: all matches)
  let siQuery = '';

  function renderSIGrid() {
    iconGrid.innerHTML = '';
    const allNames = Object.keys(iconNodes);
    const filtered = siQuery
      ? allNames.filter(n => n.includes(siQuery) || (iconMeta[n]?.tags || []).some(t => String(t).includes(siQuery)))
      : allNames.slice(0, 120);

    if (!filtered.length) {
      const msg = document.createElement('p');
      msg.className   = 'si-no-results';
      msg.textContent = 'No icons match.';
      iconGrid.appendChild(msg);
      return;
    }

    filtered.forEach(name => {
      const tile = document.createElement('div');
      tile.className = 'si-icon-tile' + (name === siState.icon ? ' selected' : '');
      tile.title     = name;
      tile.innerHTML = buildIconSvg(name, 20) + `<span class="si-icon-tile-name">${name}</span>`;
      tile.addEventListener('click', () => {
        iconGrid.querySelectorAll('.si-icon-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        siState.icon = name;
        selectedNameEl.textContent = name;
        updateSIPreviews();
        siSnippetUpdaters.forEach(fn => fn());
      });
      iconGrid.appendChild(tile);
    });
  }

  iconSearch.addEventListener('input', () => {
    siQuery = iconSearch.value.trim().toLowerCase();
    renderSIGrid();
  });

  renderSIGrid();

  // ── Preview rows — one per fill variant ──
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  SI_FILLS.forEach(({ val, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'btn-row-wrap si-row-wrap';
    rowWrap.dataset.fill = val;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildSuperIconEl(val, siState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    // Snippet panel
    const panel = document.createElement('div');
    panel.className = 'snippet-panel inline';
    panel.innerHTML = `
      <div class="snippet-tabs">
        <button class="tab-btn active" data-tab="web">Web</button>
        <button class="tab-btn" data-tab="ios">iOS</button>
        <button class="tab-btn" data-tab="android">Android</button>
      </div>
      <div class="snippet-code-wrap">
        <code class="snippet-text"></code>
        <button class="copy-btn">Copy</button>
      </div>
    `;

    const tabs    = panel.querySelectorAll('.tab-btn');
    const codeEl  = panel.querySelector('.snippet-text');
    const copyBtn = panel.querySelector('.copy-btn');
    let activeTab = 'web';

    const generators = {
      web:     () => buildSIWebSnippet(val, siState),
      ios:     () => buildSIIOSSnippet(val, siState),
      android: () => buildSIAndroidSnippet(val, siState),
    };

    function refresh() { codeEl.textContent = generators[activeTab](); }
    refresh();

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        refresh();
      });
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(generators[activeTab]());
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });

    panel._toggleBtn = toggleBtn;
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    siSnippetUpdaters.push(refresh);
    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}


buildBtnPlayground();

// ─── Button Icon Only playground ─────────────────────────────────────────────

// Icon size per button-icon size key
const BTN_ICON_ICON_SIZE = { sm: 16, md: 20, lg: 24 };

// Fixed square dimensions (width = height)
const BTN_ICON_SIZE_CSS    = { sm: 'var(--pt-scale-9, 36px)',  md: 'var(--pt-scale-11, 44px)', lg: 'var(--pt-scale-13, 52px)' };
const BTN_ICON_RADIUS_CSS  = { sm: 'var(--pt-scale-1half, 6px)', md: 'var(--pt-scale-2, 8px)',   lg: 'var(--pt-scale-2, 8px)'   };
const BTN_ICON_SIZE_SWIFT  = { sm: 'PT.Scale.s9',    md: 'PT.Scale.s11',   lg: 'PT.Scale.s13'   };
const BTN_ICON_RADIUS_SWIFT = { sm: 'PT.Scale.s1half', md: 'PT.Scale.s2',  lg: 'PT.Scale.s2'    };
const BTN_ICON_SIZE_COMPOSE = { sm: 'PTDimens.s9',   md: 'PTDimens.s11',   lg: 'PTDimens.s13'   };
const BTN_ICON_RADIUS_COMPOSE = { sm: 'PTDimens.s1half', md: 'PTDimens.s2', lg: 'PTDimens.s2'   };

const btnIconState = { size: 'md', state: 'default' };
const btnIconTypes = [
  { key: 'primary',   label: 'Primary'   },
  { key: 'secondary', label: 'Secondary' },
  { key: 'tertiary',  label: 'Tertiary'  },
];
const btnIconControls = [
  { key: 'size', label: 'Size', opts: [
    { val: 'sm', label: 'Small'           },
    { val: 'md', label: 'Default', active: true },
    { val: 'lg', label: 'Large'           },
  ]},
  { key: 'state', label: 'State', opts: [
    { val: 'default',        label: 'Default',       active: true },
    { val: 'hover',          label: 'Hover'          },
    { val: 'negative',       label: 'Negative'       },
    { val: 'negative_hover', label: 'Negative_hover' },
    { val: 'disabled',       label: 'Disabled'       },
    { val: 'ai',             label: 'AI Default'     },
    { val: 'ai_hover',       label: 'AI Hover'       },
  ]},
];

// Reuse BTN_BG / BTN_COLOR / BTN_BORDER / BTN_BG_SWIFT etc. from the Button playground above.

function getBtnIconClasses(type, { size, state }) {
  const cls = ['pt-btn-icon', `pt-btn-icon-${size}`, `pt-btn-${type}`];
  if (['hover', 'ai_hover', 'negative_hover'].includes(state)) cls.push('pt-btn-is-hover');
  if (['negative', 'negative_hover'].includes(state))          cls.push('pt-btn-negative');
  if (['ai', 'ai_hover'].includes(state))                      cls.push('pt-btn-ai');
  return cls;
}

function buildBtnIconElement(type, { size, state }) {
  const btn = document.createElement('button');
  btn.className = getBtnIconClasses(type, { size, state }).join(' ');
  if (state === 'disabled') btn.disabled = true;
  btn.innerHTML = buildIconSvg(btnIconName, BTN_ICON_ICON_SIZE[size]);
  return btn;
}

// ── Snippet generators ────────────────────────────────────────────────────────

function getBtnIconShadowWeb(type, size, state) {
  if (type === 'tertiary' || state === 'disabled') return null;
  const isHover = ['hover', 'ai_hover', 'negative_hover'].includes(state);
  if (!isHover) return null;
  if (size === 'sm') return 'box-shadow: var(--pt-shadow-solid-xs);';
  return 'box-shadow: var(--pt-shadow-solid-sm);';
}

function buildBtnIconWebSnippet(type, { size, state }) {
  const bg     = BTN_BG[type][state];
  const color  = BTN_COLOR[type][state];
  const border = BTN_BORDER[type][state];
  const dim    = BTN_ICON_SIZE_CSS[size];
  const radius = BTN_ICON_RADIUS_CSS[size];
  const shadow = getBtnIconShadowWeb(type, size, state);
  const dis    = state === 'disabled' ? '\ncursor: not-allowed;' : '';
  const iconPx = BTN_ICON_ICON_SIZE[size];
  const isGradientBorder = type === 'primary' && (state === 'ai' || state === 'ai_hover');
  const bgLine = isGradientBorder
    ? `background:\n  ${bg} padding-box,\n  ${bg} border-box;`
    : `background: ${bg};`;
  const borderLine = isGradientBorder
    ? `border: 1px solid transparent;`
    : `border: 1px solid ${border};`;
  return [
    `/* Button Icon Only · ${type} · ${state} · ${size} */`,
    bgLine,
    `color: ${color};`,
    borderLine,
    `width: ${dim}; height: ${dim};`,
    `border-radius: ${radius};`,
    `display: inline-flex; align-items: center; justify-content: center;`,
    shadow,
    `/* tabler icon "${btnIconName}" (${iconPx}×${iconPx}px) — stroke="currentColor" */`,
    dis,
  ].filter(Boolean).join('\n');
}

function buildBtnIconIOSSnippet(type, { size, state }) {
  const bg     = BTN_BG_SWIFT[type][state];
  const color  = BTN_COLOR_SWIFT[type][state];
  const border = BTN_BORDER_SWIFT[type][state];
  const dim    = BTN_ICON_SIZE_SWIFT[size];
  const radius = BTN_ICON_RADIUS_SWIFT[size];
  const dis    = state === 'disabled' ? '\nbutton.isEnabled = false' : '';
  const aiNote = state === 'ai' ? '\n// AI gradient: apply CAGradientLayer with\n// colors: [PT.Color.Green.c400.cgColor, PT.Color.Teal.c500.cgColor]' : '';
  const borderLine = border === '.clear' ? '' : `\nbutton.layer.borderColor = ${border}.cgColor\nbutton.layer.borderWidth = 1`;
  const iconPx = BTN_ICON_ICON_SIZE[size];
  let shadowLines = '';
  if (type !== 'tertiary' && state !== 'disabled') {
    const isHoverState = ['hover', 'ai_hover', 'negative_hover'].includes(state);
    if (isHoverState) {
      const offsetY = size === 'sm' ? 'PT.Scale.shalf' : 'PT.Scale.s1';
      const blur    = size === 'sm' ? 'PT.Scale.s1'    : 'PT.Scale.s1half';
      shadowLines = [
        `\nbutton.layer.shadowColor   = PT.Semantic.Shadow.normal.cgColor`,
        `button.layer.shadowOffset  = CGSize(width: 0, height: ${offsetY})`,
        `button.layer.shadowOpacity = 1`,
        `button.layer.shadowRadius  = ${blur}`,
      ].join('\n');
    }
  }
  return [
    `// Button Icon Only · ${type} · ${state} · ${size}`,
    `button.backgroundColor = ${bg}`,
    `button.tintColor = ${color}`,
    borderLine,
    `button.layer.cornerRadius = ${radius}`,
    `// Fixed square: set width/height constraint to ${dim}`,
    `// Icon: pt-icon-${btnIconName} (${iconPx}pt) — UIImage.alwaysTemplate`,
    shadowLines,
    dis + aiNote,
  ].filter(Boolean).join('\n');
}

function buildBtnIconAndroidSnippet(type, { size, state }) {
  const colors = 'val colors = MaterialTheme.ptColors';
  const bg     = BTN_BG_COMPOSE[type][state];
  const color  = BTN_COLOR_COMPOSE[type][state];
  const border = BTN_BORDER_COMPOSE[type][state];
  const dim    = BTN_ICON_SIZE_COMPOSE[size];
  const radius = BTN_ICON_RADIUS_COMPOSE[size];
  const dis    = state === 'disabled' ? '\n  enabled = false,' : '';
  const iconPx = BTN_ICON_ICON_SIZE[size];
  const aiNote = state === 'ai'
    ? '\n// AI gradient: Brush.horizontalGradient(listOf(MaterialTheme.ptColors.colorGreen400, MaterialTheme.ptColors.colorTeal500))'
    : state === 'ai_hover'
    ? '\n// AI gradient hover: Brush.horizontalGradient(listOf(MaterialTheme.ptColors.colorGreen500, MaterialTheme.ptColors.colorTeal600))'
    : '';
  const borderLine = border === 'Color.Transparent' ? '' : `\n  border = BorderStroke(1.dp, ${border}),`;
  let shadowLine = '';
  if (type !== 'tertiary' && state !== 'disabled') {
    const isHoverState = ['hover', 'ai_hover', 'negative_hover'].includes(state);
    if (isHoverState) {
      shadowLine = size === 'sm'
        ? `\n  // shadow: pt-shadow-solid-xs → elevation = PTDimens.shalf (2.dp)`
        : `\n  // shadow: pt-shadow-solid-sm → elevation = PTDimens.s1 (4.dp)`;
    }
  }
  return [
    `// Button Icon Only · ${type} · ${state} · ${size}`,
    colors,
    `IconButton(`,
    `  modifier = Modifier.size(${dim}).clip(RoundedCornerShape(${radius}))`,
    `      .background(${bg}),`,
    borderLine,
    `  onClick = { /* handle click */ },`,
    dis,
    shadowLine,
    `) {`,
    `  Icon(`,
    `    // pt_icon_${btnIconName.replace(/-/g, '_')} (${iconPx}dp)`,
    `    tint = ${color}`,
    `  )`,
    `}`,
    aiNote,
  ].filter(Boolean).join('\n');
}

// ── Snippet panel ─────────────────────────────────────────────────────────────

const btnIconSnippetUpdaters = [];

function buildBtnIconSnippetPanel(type) {
  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';

  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');
  let activeTab = 'web';

  const generators = {
    web:     () => buildBtnIconWebSnippet(type, btnIconState),
    ios:     () => buildBtnIconIOSSnippet(type, btnIconState),
    android: () => buildBtnIconAndroidSnippet(type, btnIconState),
  };

  function refresh() { codeEl.textContent = generators[activeTab](); }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generators[activeTab]());
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  btnIconSnippetUpdaters.push(refresh);
  return panel;
}

// ── DOM builder ───────────────────────────────────────────────────────────────

let btnIconIconLinkEl = null;

function updateBtnIconPreviews() {
  document.querySelectorAll('.btn-icon-row-wrap').forEach(wrap => {
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildBtnIconElement(wrap.dataset.type, btnIconState));
  });
}

function buildBtnIconPlayground() {
  const container = document.getElementById('btnIconPlayground');
  if (!container) return;

  // Controls
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  btnIconControls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';
    const lbl = document.createElement('span');
    lbl.className = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className = 'btn-ctrl' + (active ? ' active' : '');
      btn.dataset.ctrl = key;
      btn.dataset.val  = val;
      btn.textContent  = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btnIconState[key] = val;
        updateBtnIconPreviews();
        btnIconSnippetUpdaters.forEach(fn => fn());
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  container.appendChild(ctrlsEl);

  // Icon-link status row (mirrors the Button playground link)
  const iconLinkRow = document.createElement('div');
  iconLinkRow.className = 'chip-icon-link';
  iconLinkRow.innerHTML =
    `<span class="chip-icon-link-label">Icon</span>` +
    `<code class="chip-icon-link-name">arrow-right</code>` +
    `<span class="chip-icon-link-hint">— pick any icon in the <a href="#icons" class="chip-icon-link-anchor">Icons ↑</a> section to swap</span>`;
  btnIconIconLinkEl = iconLinkRow.querySelector('.chip-icon-link-name');
  container.appendChild(iconLinkRow);

  // Preview rows — one per type
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  btnIconTypes.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'btn-row-wrap btn-icon-row-wrap';
    rowWrap.dataset.type = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildBtnIconElement(key, btnIconState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = buildBtnIconSnippetPanel(key);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

buildBtnIconPlayground();

// ─── Filter Chip playground ───────────────────────────────────────────────────

let chipIconName = 'map-pin';           // updated when user picks an icon in the gallery
let chipIconLinkEl = null;              // <code> element in the chip controls status row
const CHIP_ICON_SIZE = { sm: 12, regular: 16, lg: 16 };

const chipState = { size: 'regular', icon: true };

const chipStates = [
  { key: 'default',     label: 'Default'     },
  { key: 'highlighted', label: 'Highlighted' },
  { key: 'active',      label: 'Active'      },
  { key: 'outline',     label: 'Outline'     },
];

const chipControls = [
  { key: 'size', label: 'Size', opts: [
    { val: 'sm',      label: 'Small'             },
    { val: 'regular', label: 'Regular', active: true },
    { val: 'lg',      label: 'Large'             },
  ]},
  { key: 'icon', label: 'Icon', opts: [
    { val: true,  label: 'Show', active: true },
    { val: false, label: 'Hide'               },
  ]},
];

function buildChipElement(stateKey, { size, icon }) {
  const chip = document.createElement('div');
  chip.className = `pt-chip pt-chip-${size} pt-chip-${stateKey}`;
  if (icon) chip.insertAdjacentHTML('beforeend', buildIconSvg(chipIconName, CHIP_ICON_SIZE[size]));
  chip.insertAdjacentText('beforeend', 'Filter text');
  return chip;
}

// ── Snippet token maps ────────────────────────────────────────────────────────

const CHIP_BG = {
  default:     'var(--pt-semantic-surface-card_primary)',
  highlighted: 'var(--pt-semantic-surface-success)',
  active:      'var(--pt-semantic-surface-action)',
  outline:     'transparent',
};
const CHIP_COLOR = {
  default:     'var(--pt-semantic-typography-body)',
  highlighted: 'var(--pt-semantic-typography-success)',
  active:      'var(--pt-semantic-typography-on_action)',
  outline:     'var(--pt-semantic-typography-body)',
};
const CHIP_BORDER = {
  default:     'var(--pt-semantic-border-card_primary)',
  highlighted: 'var(--pt-semantic-border-action)',
  active:      'var(--pt-semantic-border-action)',
  outline:     'var(--pt-semantic-border-default)',
};
const CHIP_PADDING = {
  sm:      ['var(--pt-scale-1)', 'var(--pt-scale-3)'],
  regular: ['var(--pt-scale-2)', 'var(--pt-scale-4)'],
  lg:      ['var(--pt-scale-2)', 'var(--pt-scale-4)'],
};
const CHIP_FONT = {
  sm:      'var(--pt-typography-body-xs-font_size)',
  regular: 'var(--pt-typography-body-sm-font_size)',
  lg:      'var(--pt-typography-body-default-font_size)',
};
const CHIP_LINE_HEIGHT = {
  sm:      'var(--pt-typography-body-xs-line_height)',
  regular: 'var(--pt-typography-body-sm-line_height)',
  lg:      'var(--pt-scale-6)',
};
const CHIP_RADIUS = {
  sm:      'var(--pt-scale-2)',
  regular: 'var(--pt-scale-4)',
  lg:      'var(--pt-scale-4)',
};

const CHIP_BG_SWIFT = {
  default:     'PT.Semantic.Surface.cardPrimary',
  highlighted: 'PT.Semantic.Surface.success',
  active:      'PT.Semantic.Surface.action',
  outline:     '.clear',
};
const CHIP_COLOR_SWIFT = {
  default:     'PT.Semantic.Typography.body',
  highlighted: 'PT.Semantic.Typography.success',
  active:      'PT.Semantic.Typography.onAction',
  outline:     'PT.Semantic.Typography.body',
};
const CHIP_BORDER_SWIFT = {
  default:     'PT.Semantic.Border.cardPrimary',
  highlighted: 'PT.Semantic.Border.action',
  active:      'PT.Semantic.Border.action',
  outline:     'PT.Semantic.Border.default',
};
const CHIP_PADDING_SWIFT = {
  sm:      ['PT.Scale.s1', 'PT.Scale.s3'],
  regular: ['PT.Scale.s2', 'PT.Scale.s4'],
  lg:      ['PT.Scale.s2', 'PT.Scale.s4'],
};
const CHIP_RADIUS_SWIFT = {
  sm: 'PT.Scale.s2', regular: 'PT.Scale.s4', lg: 'PT.Scale.s4',
};
const CHIP_TEXT_STYLE_SWIFT = {
  sm:      'PT.TextStyle.Small.bodyXsRegular',
  regular: 'PT.TextStyle.Small.bodySmRegular',
  lg:      'PT.TextStyle.Small.bodyDefaultRegular',
};

const CHIP_BG_COMPOSE = {
  default:     'colors.surfaceCardPrimary',
  highlighted: 'colors.surfaceSuccess',
  active:      'colors.surfaceAction',
  outline:     'Color.Transparent',
};
const CHIP_COLOR_COMPOSE = {
  default:     'colors.typographyBody',
  highlighted: 'colors.typographySuccess',
  active:      'colors.typographyOnAction',
  outline:     'colors.typographyBody',
};
const CHIP_BORDER_COMPOSE = {
  default:     'colors.borderCardPrimary',
  highlighted: 'colors.borderAction',
  active:      'colors.borderAction',
  outline:     'colors.borderDefault',
};
const CHIP_PADDING_COMPOSE = {
  sm:      ['PTDimens.s1', 'PTDimens.s3'],
  regular: ['PTDimens.s2', 'PTDimens.s4'],
  lg:      ['PTDimens.s2', 'PTDimens.s4'],
};
const CHIP_RADIUS_COMPOSE = {
  sm: 'PTDimens.s2', regular: 'PTDimens.s4', lg: 'PTDimens.s4',
};
const CHIP_TEXT_STYLE_COMPOSE = {
  sm:      'PTTextStyles.smallBodyXsRegular',
  regular: 'PTTextStyles.smallBodySmRegular',
  lg:      'PTTextStyles.smallBodyDefaultRegular',
};

function buildChipWebSnippet(stateKey, { size, icon }) {
  const iconPx   = CHIP_ICON_SIZE[size];
  const iconNote = icon ? `\n/* leading icon: "${chipIconName}" (${iconPx}×${iconPx}px) — see Icons section */\n/* set stroke="currentColor" so it inherits color */` : '';
  return [
    `/* Filter Chip · ${stateKey} · ${size} */`,
    `background: ${CHIP_BG[stateKey]};`,
    `color: ${CHIP_COLOR[stateKey]};`,
    `border: 1px solid ${CHIP_BORDER[stateKey]};`,
    `padding: ${CHIP_PADDING[size][0]} ${CHIP_PADDING[size][1]};`,
    `font-size: ${CHIP_FONT[size]};`,
    `line-height: ${CHIP_LINE_HEIGHT[size]};`,
    `border-radius: ${CHIP_RADIUS[size]};`,
    `display: inline-flex; align-items: center; gap: var(--pt-scale-1);`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildChipIOSSnippet(stateKey, { size, icon }) {
  const bg     = CHIP_BG_SWIFT[stateKey];
  const color  = CHIP_COLOR_SWIFT[stateKey];
  const border = CHIP_BORDER_SWIFT[stateKey];
  const [pv, ph] = CHIP_PADDING_SWIFT[size];
  const radius = CHIP_RADIUS_SWIFT[size];
  const textStyle = CHIP_TEXT_STYLE_SWIFT[size];
  const borderLine = bg === '.clear' ? '' : `\nchip.layer.borderColor = ${border}.cgColor\nchip.layer.borderWidth = 1`;
  const iconNote = icon ? `\n// Leading icon: UIImageView tintColor = ${color}` : '';
  return [
    `// Filter Chip · ${stateKey} · ${size}`,
    `chip.backgroundColor = ${bg}`,
    `chip.setTitleColor(${color}, for: .normal)`,
    borderLine,
    `chip.layer.cornerRadius = ${radius}`,
    `chip.contentEdgeInsets = UIEdgeInsets(`,
    `  top: ${pv}, left: ${ph},`,
    `  bottom: ${pv}, right: ${ph}`,
    `)`,
    `chip.titleLabel?.font = ${textStyle}.uiFont`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildChipAndroidSnippet(stateKey, { size, icon }) {
  const bg     = CHIP_BG_COMPOSE[stateKey];
  const color  = CHIP_COLOR_COMPOSE[stateKey];
  const border = CHIP_BORDER_COMPOSE[stateKey];
  const [pv, ph] = CHIP_PADDING_COMPOSE[size];
  const radius = CHIP_RADIUS_COMPOSE[size];
  const textStyle = CHIP_TEXT_STYLE_COMPOSE[size];
  const selected = stateKey === 'active' ? 'true' : 'false';
  const borderLine = bg === 'Color.Transparent'
    ? ''
    : `\n  border = FilterChipDefaults.filterChipBorder(\n    borderColor = ${border}\n  ),`;
  const iconNote = icon
    ? `\n  leadingIcon = {\n    Icon(painterResource(R.drawable.pt_icon_map_pin),\n      tint = ${color}, contentDescription = null)\n  },`
    : '';
  return [
    `// Filter Chip · ${stateKey} · ${size}`,
    `val colors = MaterialTheme.ptColors`,
    `FilterChip(`,
    `  selected = ${selected},`,
    `  colors = FilterChipDefaults.filterChipColors(`,
    `    containerColor = ${bg},`,
    `    labelColor = ${color},`,
    `    selectedContainerColor = ${bg},`,
    `    selectedLabelColor = ${color},`,
    `  ),`,
    borderLine,
    `  shape = RoundedCornerShape(${radius}),`,
    `  label = { Text("Filter text", style = ${textStyle}) },`,
    iconNote,
    `) {}`,
  ].filter(Boolean).join('\n');
}

// ── Playground ────────────────────────────────────────────────────────────────

const chipSnippetUpdaters = [];

function buildChipSnippetPanel(stateKey) {
  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');
  let activeTab = 'web';

  const generators = {
    web:     () => buildChipWebSnippet(stateKey, chipState),
    ios:     () => buildChipIOSSnippet(stateKey, chipState),
    android: () => buildChipAndroidSnippet(stateKey, chipState),
  };

  function refresh() { codeEl.textContent = generators[activeTab](); }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generators[activeTab]());
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  chipSnippetUpdaters.push(refresh);
  return panel;
}

function updateChipPreviews() {
  document.querySelectorAll('.chip-row-wrap').forEach(wrap => {
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildChipElement(wrap.dataset.state, chipState));
  });
}

function buildChipPlayground() {
  const container = document.getElementById('chipPlayground');
  if (!container) return;

  // Controls — reuse btn-controls / btn-ctrl-row styles
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  chipControls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';

    const lbl = document.createElement('span');
    lbl.className   = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className   = 'btn-ctrl' + (active ? ' active' : '');
      btn.textContent = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chipState[key] = val;
        updateChipPreviews();
        chipSnippetUpdaters.forEach(fn => fn());
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  container.appendChild(ctrlsEl);

  // Icon-link status row — shows the currently active icon and links to the gallery
  const iconLinkRow = document.createElement('div');
  iconLinkRow.className = 'chip-icon-link';
  iconLinkRow.innerHTML =
    `<span class="chip-icon-link-label">Icon</span>` +
    `<code class="chip-icon-link-name">map-pin</code>` +
    `<span class="chip-icon-link-hint">— pick any icon in the <a href="#icons" class="chip-icon-link-anchor">Icons ↑</a> section to swap</span>`;
  chipIconLinkEl = iconLinkRow.querySelector('.chip-icon-link-name');
  container.appendChild(iconLinkRow);

  // One row per state — reuses btn-row-wrap / btn-row styles
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  chipStates.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className    = 'btn-row-wrap chip-row-wrap';
    rowWrap.dataset.state = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildChipElement(key, chipState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className   = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = buildChipSnippetPanel(key);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

buildChipPlayground();

// ─── Eyebrow Highlight playground ────────────────────────────────────────────

let eyebrowIconName = 'map-pin';       // updated when user picks an icon in the gallery
let eyebrowIconLinkEl = null;

const EYEBROW_STATES = [
  { key: 'positive',    label: 'Positive'    },
  { key: 'information', label: 'Information' },
  { key: 'warning',     label: 'Warning'     },
  { key: 'error',       label: 'Error'       },
  { key: 'neutral',     label: 'Neutral'     },
];

const eyebrowPlaygroundState = { type: 'light', icon: true };

const eyebrowControls = [
  { key: 'type', label: 'Type', opts: [
    { val: 'light', label: 'Light', active: true },
    { val: 'dark',  label: 'Dark'                },
  ]},
  { key: 'icon', label: 'Icon', opts: [
    { val: true,  label: 'Show', active: true },
    { val: false, label: 'Hide'               },
  ]},
];

function buildEyebrowElement(stateKey, { type, icon }) {
  const el = document.createElement('div');
  el.className = `pt-eyebrow pt-eyebrow-${stateKey}-${type}`;
  if (icon) el.insertAdjacentHTML('beforeend', buildIconSvg(eyebrowIconName, 12));
  el.insertAdjacentText('beforeend', 'Important');
  return el;
}

// ── Snippet token maps ────────────────────────────────────────────────────────

const EYEBROW_BG = {
  'positive-light':    'var(--pt-semantic-surface-success)',
  'information-light': 'var(--pt-semantic-surface-information)',
  'warning-light':     'var(--pt-semantic-surface-warning)',
  'error-light':       'var(--pt-semantic-surface-error)',
  'neutral-light':     'transparent',
  'positive-dark':     'var(--pt-semantic-surface-action)',
  'information-dark':  'var(--pt-semantic-surface-information_core)',
  'warning-dark':      'var(--pt-semantic-surface-warning_core)',
  'error-dark':        'var(--pt-semantic-surface-negative)',
  'neutral-dark':      'var(--pt-semantic-surface-disabled)',
};
const EYEBROW_BORDER = {
  'positive-light':    'var(--pt-semantic-border-success)',
  'information-light': 'var(--pt-semantic-border-information)',
  'warning-light':     'var(--pt-semantic-border-warning)',
  'error-light':       'var(--pt-semantic-border-error)',
  'neutral-light':     'var(--pt-semantic-border-divider)',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const EYEBROW_COLOR = {
  'positive-light':    'var(--pt-semantic-typography-success)',
  'information-light': 'var(--pt-semantic-typography-information)',
  'warning-light':     'var(--pt-semantic-typography-warning)',
  'error-light':       'var(--pt-semantic-typography-error)',
  'neutral-light':     'var(--pt-semantic-typography-body_secondary)',
  'positive-dark':     'var(--pt-semantic-typography-on_action)',
  'information-dark':  'var(--pt-semantic-typography-on_action)',
  'warning-dark':      'var(--pt-semantic-typography-warning)',
  'error-dark':        'var(--pt-semantic-typography-on_action)',
  'neutral-dark':      'var(--pt-semantic-typography-on_action)',
};

const EYEBROW_BG_SWIFT = {
  'positive-light':    'PT.Semantic.Surface.success',
  'information-light': 'PT.Semantic.Surface.information',
  'warning-light':     'PT.Semantic.Surface.warning',
  'error-light':       'PT.Semantic.Surface.error',
  'neutral-light':     '.clear',
  'positive-dark':     'PT.Semantic.Surface.action',
  'information-dark':  'PT.Semantic.Surface.informationCore',
  'warning-dark':      'PT.Semantic.Surface.warningCore',
  'error-dark':        'PT.Semantic.Surface.negative',
  'neutral-dark':      'PT.Semantic.Surface.disabled',
};
const EYEBROW_BORDER_SWIFT = {
  'positive-light':    'PT.Semantic.Border.success',
  'information-light': 'PT.Semantic.Border.information',
  'warning-light':     'PT.Semantic.Border.warning',
  'error-light':       'PT.Semantic.Border.error',
  'neutral-light':     'PT.Semantic.Border.divider',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const EYEBROW_COLOR_SWIFT = {
  'positive-light':    'PT.Semantic.Typography.success',
  'information-light': 'PT.Semantic.Typography.information',
  'warning-light':     'PT.Semantic.Typography.warning',
  'error-light':       'PT.Semantic.Typography.error',
  'neutral-light':     'PT.Semantic.Typography.bodySecondary',
  'positive-dark':     'PT.Semantic.Typography.onAction',
  'information-dark':  'PT.Semantic.Typography.onAction',
  'warning-dark':      'PT.Semantic.Typography.warning',
  'error-dark':        'PT.Semantic.Typography.onAction',
  'neutral-dark':      'PT.Semantic.Typography.onAction',
};

const EYEBROW_BG_COMPOSE = {
  'positive-light':    'colors.surfaceSuccess',
  'information-light': 'colors.surfaceInformation',
  'warning-light':     'colors.surfaceWarning',
  'error-light':       'colors.surfaceError',
  'neutral-light':     'Color.Transparent',
  'positive-dark':     'colors.surfaceAction',
  'information-dark':  'colors.surfaceInformationCore',
  'warning-dark':      'colors.surfaceWarningCore',
  'error-dark':        'colors.surfaceNegative',
  'neutral-dark':      'colors.surfaceDisabled',
};
const EYEBROW_BORDER_COMPOSE = {
  'positive-light':    'colors.borderSuccess',
  'information-light': 'colors.borderInformation',
  'warning-light':     'colors.borderWarning',
  'error-light':       'colors.borderError',
  'neutral-light':     'colors.borderDivider',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const EYEBROW_COLOR_COMPOSE = {
  'positive-light':    'colors.typographySuccess',
  'information-light': 'colors.typographyInformation',
  'warning-light':     'colors.typographyWarning',
  'error-light':       'colors.typographyError',
  'neutral-light':     'colors.typographyBodySecondary',
  'positive-dark':     'colors.typographyOnAction',
  'information-dark':  'colors.typographyOnAction',
  'warning-dark':      'colors.typographyWarning',
  'error-dark':        'colors.typographyOnAction',
  'neutral-dark':      'colors.typographyOnAction',
};

function buildEyebrowWebSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = EYEBROW_BG[key];
  const border = EYEBROW_BORDER[key];
  const color  = EYEBROW_COLOR[key];
  const borderLine = border ? `border: 1px solid ${border};` : `border: none;`;
  const iconNote = icon ? `\n/* leading icon: "${eyebrowIconName}" (12×12px) — see Icons section */\n/* set stroke="currentColor" so it inherits color */` : '';
  return [
    `/* Eyebrow Highlight · ${stateKey} · ${type} */`,
    `background: ${bg};`,
    borderLine,
    `color: ${color};`,
    `padding: var(--pt-scale-half) var(--pt-scale-1);`,
    `font-size: var(--pt-typography-body-xs-font_size);`,
    `line-height: var(--pt-typography-body-xs-line_height);`,
    `border-radius: var(--pt-scale-1);`,
    `display: inline-flex; align-items: center; gap: var(--pt-scale-1);`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildEyebrowIOSSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = EYEBROW_BG_SWIFT[key];
  const border = EYEBROW_BORDER_SWIFT[key];
  const color  = EYEBROW_COLOR_SWIFT[key];
  const borderLine = border
    ? `\nview.layer.borderColor = ${border}.cgColor\nview.layer.borderWidth = 1`
    : '';
  const iconNote = icon ? `\n// Leading icon: UIImageView tintColor = ${color}` : '';
  return [
    `// Eyebrow Highlight · ${stateKey} · ${type}`,
    `view.backgroundColor = ${bg}`,
    borderLine,
    `label.textColor = ${color}`,
    `label.font = PT.TextStyle.Small.bodyXsRegular.uiFont`,
    `view.layer.cornerRadius = PT.Scale.s1`,
    `// padding: PT.Scale.shalf (v) × PT.Scale.s1 (h)`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildEyebrowAndroidSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = EYEBROW_BG_COMPOSE[key];
  const border = EYEBROW_BORDER_COMPOSE[key];
  const color  = EYEBROW_COLOR_COMPOSE[key];
  const borderLine = border
    ? `  .border(1.dp, ${border}, RoundedCornerShape(PTDimens.s1))`
    : '';
  const iconNote = icon
    ? `  Icon(painterResource(R.drawable.pt_icon_${eyebrowIconName.replace(/-/g, '_')}),\n    tint = ${color}, contentDescription = null, modifier = Modifier.size(12.dp))`
    : '';
  return [
    `// Eyebrow Highlight · ${stateKey} · ${type}`,
    `val colors = MaterialTheme.ptColors`,
    `Row(`,
    `  modifier = Modifier`,
    `    .background(${bg}, RoundedCornerShape(PTDimens.s1))`,
    borderLine,
    `    .padding(vertical = PTDimens.shalf, horizontal = PTDimens.s1),`,
    `  horizontalArrangement = Arrangement.spacedBy(PTDimens.s1),`,
    `  verticalAlignment = Alignment.CenterVertically`,
    `) {`,
    iconNote,
    `  Text("Important", style = PTTextStyles.smallBodyXsRegular, color = ${color})`,
    `}`,
  ].filter(Boolean).join('\n');
}

// ── Playground ────────────────────────────────────────────────────────────────

const eyebrowSnippetUpdaters = [];

function buildEyebrowSnippetPanel(stateKey) {
  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;
  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');
  let activeTab = 'web';

  const generators = {
    web:     () => buildEyebrowWebSnippet(stateKey, eyebrowPlaygroundState),
    ios:     () => buildEyebrowIOSSnippet(stateKey, eyebrowPlaygroundState),
    android: () => buildEyebrowAndroidSnippet(stateKey, eyebrowPlaygroundState),
  };

  function refresh() { codeEl.textContent = generators[activeTab](); }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generators[activeTab]());
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  eyebrowSnippetUpdaters.push(refresh);
  return panel;
}

function updateEyebrowPreviews() {
  document.querySelectorAll('.eyebrow-row-wrap').forEach(wrap => {
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildEyebrowElement(wrap.dataset.state, eyebrowPlaygroundState));
  });
}

function buildEyebrowPlayground() {
  const container = document.getElementById('eyebrowPlayground');
  if (!container) return;

  // Controls
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  eyebrowControls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';
    const lbl = document.createElement('span');
    lbl.className   = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className   = 'btn-ctrl' + (active ? ' active' : '');
      btn.textContent = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        eyebrowPlaygroundState[key] = val;
        updateEyebrowPreviews();
        eyebrowSnippetUpdaters.forEach(fn => fn());
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  container.appendChild(ctrlsEl);

  // Icon-link status row
  const iconLinkRow = document.createElement('div');
  iconLinkRow.className = 'chip-icon-link';
  iconLinkRow.innerHTML =
    `<span class="chip-icon-link-label">Icon</span>` +
    `<code class="chip-icon-link-name">map-pin</code>` +
    `<span class="chip-icon-link-hint">— pick any icon in the <a href="#icons" class="chip-icon-link-anchor">Icons ↑</a> section to swap</span>`;
  eyebrowIconLinkEl = iconLinkRow.querySelector('.chip-icon-link-name');
  container.appendChild(iconLinkRow);

  // One row per semantic state
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  EYEBROW_STATES.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className     = 'btn-row-wrap eyebrow-row-wrap';
    rowWrap.dataset.state = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildEyebrowElement(key, eyebrowPlaygroundState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className   = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = buildEyebrowSnippetPanel(key);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

buildEyebrowPlayground();

// ─── Tag playground ───────────────────────────────────────────────────────────

let tagIconName = 'tag';               // updated when user picks an icon in the gallery
let tagIconLinkEl = null;

const TAG_STATES = [
  { key: 'positive',    label: 'Positive'    },
  { key: 'information', label: 'Information' },
  { key: 'warning',     label: 'Warning'     },
  { key: 'error',       label: 'Error'       },
  { key: 'neutral',     label: 'Neutral'     },
];

const tagPlaygroundState = { type: 'light', icon: false };

const tagControls = [
  { key: 'type', label: 'Type', opts: [
    { val: 'light', label: 'Light', active: true },
    { val: 'dark',  label: 'Dark'                },
  ]},
  { key: 'icon', label: 'Icon', opts: [
    { val: false, label: 'None', active: true },
    { val: true,  label: 'Show'               },
  ]},
];

function buildTagElement(stateKey, { type, icon }) {
  const el = document.createElement('div');
  el.className = `pt-tag pt-tag-${stateKey}-${type}`;
  if (icon) el.insertAdjacentHTML('beforeend', buildIconSvg(tagIconName, 16));
  el.insertAdjacentText('beforeend', 'Important');
  return el;
}

// ── Snippet token maps ────────────────────────────────────────────────────────

const TAG_BG = {
  'positive-light':    'var(--pt-semantic-surface-success)',
  'information-light': 'var(--pt-semantic-surface-information)',
  'warning-light':     'var(--pt-semantic-surface-warning)',
  'error-light':       'var(--pt-semantic-surface-error)',
  'neutral-light':     'transparent',
  'positive-dark':     'var(--pt-semantic-surface-action)',
  'information-dark':  'var(--pt-semantic-surface-information_core)',
  'warning-dark':      'var(--pt-semantic-surface-warning_core)',
  'error-dark':        'var(--pt-semantic-surface-negative)',
  'neutral-dark':      'var(--pt-semantic-surface-disabled)',
};
const TAG_BORDER = {
  'positive-light':    'var(--pt-semantic-border-success)',
  'information-light': 'var(--pt-semantic-border-information)',
  'warning-light':     'var(--pt-semantic-border-warning)',
  'error-light':       'var(--pt-semantic-border-error)',
  'neutral-light':     'var(--pt-semantic-border-divider)',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const TAG_COLOR = {
  'positive-light':    'var(--pt-semantic-typography-success)',
  'information-light': 'var(--pt-semantic-typography-information)',
  'warning-light':     'var(--pt-semantic-typography-warning)',
  'error-light':       'var(--pt-semantic-typography-error)',
  'neutral-light':     'var(--pt-semantic-typography-body_secondary)',
  'positive-dark':     'var(--pt-semantic-typography-on_action)',
  'information-dark':  'var(--pt-semantic-typography-on_action)',
  'warning-dark':      'var(--pt-semantic-typography-warning)',
  'error-dark':        'var(--pt-semantic-typography-on_action)',
  'neutral-dark':      'var(--pt-semantic-typography-on_action)',
};

const TAG_BG_SWIFT = {
  'positive-light':    'PT.Semantic.Surface.success',
  'information-light': 'PT.Semantic.Surface.information',
  'warning-light':     'PT.Semantic.Surface.warning',
  'error-light':       'PT.Semantic.Surface.error',
  'neutral-light':     '.clear',
  'positive-dark':     'PT.Semantic.Surface.action',
  'information-dark':  'PT.Semantic.Surface.informationCore',
  'warning-dark':      'PT.Semantic.Surface.warningCore',
  'error-dark':        'PT.Semantic.Surface.negative',
  'neutral-dark':      'PT.Semantic.Surface.disabled',
};
const TAG_BORDER_SWIFT = {
  'positive-light':    'PT.Semantic.Border.success',
  'information-light': 'PT.Semantic.Border.information',
  'warning-light':     'PT.Semantic.Border.warning',
  'error-light':       'PT.Semantic.Border.error',
  'neutral-light':     'PT.Semantic.Border.divider',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const TAG_COLOR_SWIFT = {
  'positive-light':    'PT.Semantic.Typography.success',
  'information-light': 'PT.Semantic.Typography.information',
  'warning-light':     'PT.Semantic.Typography.warning',
  'error-light':       'PT.Semantic.Typography.error',
  'neutral-light':     'PT.Semantic.Typography.bodySecondary',
  'positive-dark':     'PT.Semantic.Typography.onAction',
  'information-dark':  'PT.Semantic.Typography.onAction',
  'warning-dark':      'PT.Semantic.Typography.warning',
  'error-dark':        'PT.Semantic.Typography.onAction',
  'neutral-dark':      'PT.Semantic.Typography.onAction',
};

const TAG_BG_COMPOSE = {
  'positive-light':    'colors.surfaceSuccess',
  'information-light': 'colors.surfaceInformation',
  'warning-light':     'colors.surfaceWarning',
  'error-light':       'colors.surfaceError',
  'neutral-light':     'Color.Transparent',
  'positive-dark':     'colors.surfaceAction',
  'information-dark':  'colors.surfaceInformationCore',
  'warning-dark':      'colors.surfaceWarningCore',
  'error-dark':        'colors.surfaceNegative',
  'neutral-dark':      'colors.surfaceDisabled',
};
const TAG_BORDER_COMPOSE = {
  'positive-light':    'colors.borderSuccess',
  'information-light': 'colors.borderInformation',
  'warning-light':     'colors.borderWarning',
  'error-light':       'colors.borderError',
  'neutral-light':     'colors.borderDivider',
  'positive-dark':     null,
  'information-dark':  null,
  'warning-dark':      null,
  'error-dark':        null,
  'neutral-dark':      null,
};
const TAG_COLOR_COMPOSE = {
  'positive-light':    'colors.typographySuccess',
  'information-light': 'colors.typographyInformation',
  'warning-light':     'colors.typographyWarning',
  'error-light':       'colors.typographyError',
  'neutral-light':     'colors.typographyBodySecondary',
  'positive-dark':     'colors.typographyOnAction',
  'information-dark':  'colors.typographyOnAction',
  'warning-dark':      'colors.typographyWarning',
  'error-dark':        'colors.typographyOnAction',
  'neutral-dark':      'colors.typographyOnAction',
};

function buildTagWebSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = TAG_BG[key];
  const border = TAG_BORDER[key];
  const color  = TAG_COLOR[key];
  const borderLine = border ? `border: 1px solid ${border};` : `border: none;`;
  const iconNote = icon ? `\n/* optional leading icon: "${tagIconName}" (16×16px) — see Icons section */\n/* set stroke="currentColor" so it inherits color */` : '';
  return [
    `/* Tag · ${stateKey} · ${type} */`,
    `background: ${bg};`,
    borderLine,
    `color: ${color};`,
    `padding: var(--pt-scale-half) var(--pt-scale-3);`,
    `font-size: var(--pt-typography-body-sm-font_size);`,
    `line-height: var(--pt-typography-body-sm-line_height);`,
    `border-radius: var(--pt-scale-1);`,
    `display: inline-flex; align-items: center; gap: var(--pt-scale-1);`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildTagIOSSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = TAG_BG_SWIFT[key];
  const border = TAG_BORDER_SWIFT[key];
  const color  = TAG_COLOR_SWIFT[key];
  const borderLine = border
    ? `\nview.layer.borderColor = ${border}.cgColor\nview.layer.borderWidth = 1`
    : '';
  const iconNote = icon ? `\n// Optional leading icon: UIImageView tintColor = ${color}` : '';
  return [
    `// Tag · ${stateKey} · ${type}`,
    `view.backgroundColor = ${bg}`,
    borderLine,
    `label.textColor = ${color}`,
    `label.font = PT.TextStyle.Small.bodySmRegular.uiFont`,
    `view.layer.cornerRadius = PT.Scale.s1`,
    `// padding: PT.Scale.shalf (v) × PT.Scale.s3 (h)`,
    iconNote,
  ].filter(Boolean).join('\n');
}

function buildTagAndroidSnippet(stateKey, { type, icon }) {
  const key    = `${stateKey}-${type}`;
  const bg     = TAG_BG_COMPOSE[key];
  const border = TAG_BORDER_COMPOSE[key];
  const color  = TAG_COLOR_COMPOSE[key];
  const borderLine = border
    ? `  .border(1.dp, ${border}, RoundedCornerShape(PTDimens.s1))`
    : '';
  const iconNote = icon
    ? `  Icon(painterResource(R.drawable.pt_icon_${tagIconName.replace(/-/g, '_')}),\n    tint = ${color}, contentDescription = null, modifier = Modifier.size(16.dp))`
    : '';
  return [
    `// Tag · ${stateKey} · ${type}`,
    `val colors = MaterialTheme.ptColors`,
    `Row(`,
    `  modifier = Modifier`,
    `    .background(${bg}, RoundedCornerShape(PTDimens.s1))`,
    borderLine,
    `    .padding(vertical = PTDimens.shalf, horizontal = PTDimens.s3),`,
    `  horizontalArrangement = Arrangement.spacedBy(PTDimens.s1),`,
    `  verticalAlignment = Alignment.CenterVertically`,
    `) {`,
    iconNote,
    `  Text("Important", style = PTTextStyles.smallBodySmRegular, color = ${color})`,
    `}`,
  ].filter(Boolean).join('\n');
}

// ── Playground ────────────────────────────────────────────────────────────────

const tagSnippetUpdaters = [];

function buildTagSnippetPanel(stateKey) {
  const panel = document.createElement('div');
  panel.className = 'snippet-panel inline';
  panel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>
  `;
  const tabs    = panel.querySelectorAll('.tab-btn');
  const codeEl  = panel.querySelector('.snippet-text');
  const copyBtn = panel.querySelector('.copy-btn');
  let activeTab = 'web';

  const generators = {
    web:     () => buildTagWebSnippet(stateKey, tagPlaygroundState),
    ios:     () => buildTagIOSSnippet(stateKey, tagPlaygroundState),
    android: () => buildTagAndroidSnippet(stateKey, tagPlaygroundState),
  };

  function refresh() { codeEl.textContent = generators[activeTab](); }
  refresh();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      refresh();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generators[activeTab]());
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  tagSnippetUpdaters.push(refresh);
  return panel;
}

function updateTagPreviews() {
  document.querySelectorAll('.tag-row-wrap').forEach(wrap => {
    const preview = wrap.querySelector('.btn-row-preview');
    preview.innerHTML = '';
    preview.appendChild(buildTagElement(wrap.dataset.state, tagPlaygroundState));
  });
}

function buildTagPlayground() {
  const container = document.getElementById('tagPlayground');
  if (!container) return;

  // Controls
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  tagControls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';
    const lbl = document.createElement('span');
    lbl.className   = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className   = 'btn-ctrl' + (active ? ' active' : '');
      btn.textContent = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tagPlaygroundState[key] = val;
        updateTagPreviews();
        tagSnippetUpdaters.forEach(fn => fn());
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  container.appendChild(ctrlsEl);

  // Icon-link status row
  const iconLinkRow = document.createElement('div');
  iconLinkRow.className = 'chip-icon-link';
  iconLinkRow.innerHTML =
    `<span class="chip-icon-link-label">Icon</span>` +
    `<code class="chip-icon-link-name">tag</code>` +
    `<span class="chip-icon-link-hint">— pick any icon in the <a href="#icons" class="chip-icon-link-anchor">Icons ↑</a> section to swap</span>`;
  tagIconLinkEl = iconLinkRow.querySelector('.chip-icon-link-name');
  container.appendChild(iconLinkRow);

  // One row per semantic state
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  TAG_STATES.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className     = 'btn-row-wrap tag-row-wrap';
    rowWrap.dataset.state = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview';
    preview.appendChild(buildTagElement(key, tagPlaygroundState));

    const toggleBtn = document.createElement('button');
    toggleBtn.className   = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = buildTagSnippetPanel(key);
    panel._toggleBtn = toggleBtn;

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

buildTagPlayground();
buildSuperIconPlayground();

// ─── Map Pin playground ────────────────────────────────────────────────────────

const mpState = { number: '1' };
const mpSnippetUpdaters = [];

const PIN_STATES = [
  { key: 'default',  label: 'Default'  },
  { key: 'selected', label: 'Selected' },
  { key: 'visited',  label: 'Visited'  },
];

// ── Token maps ────────────────────────────────────────────────────────────────

const PIN_BODY_CSS = {
  default:  'var(--pt-semantic-typography-headings)',
  selected: 'var(--pt-semantic-typography-headings)',
  visited:  'var(--pt-semantic-icon-body_secondary)',
};
const PIN_BODY_SWIFT = {
  default:  'PT.Semantic.Typography.headings',
  selected: 'PT.Semantic.Typography.headings',
  visited:  'PT.Semantic.Icon.bodySecondary',
};
const PIN_BODY_COMPOSE = {
  default:  'colors.typographyHeadings',
  selected: 'colors.typographyHeadings',
  visited:  'colors.iconBodySecondary',
};

// Ring fill — Gradient/Default for selected, Surface/Success for default/visited
const PIN_RING_CSS = {
  default:  'var(--pt-semantic-surface-success)',
  selected: 'url(#pt-mp-sel-ring)',
  visited:  'var(--pt-semantic-surface-success)',
};
const PIN_RING_SWIFT = {
  default:  'PT.Semantic.Surface.success',
  selected: '/* apply pt-mp-sel-ring CAGradientLayer — see below */',
  visited:  'PT.Semantic.Surface.success',
};
const PIN_RING_COMPOSE = {
  default:  'colors.surfaceSuccess',
  selected: '/* Brush.linearGradient — see below */',
  visited:  'colors.surfaceSuccess',
};

const PIN_TEXT_CSS = {
  default:  'var(--pt-semantic-typography-headings)',
  selected: 'var(--pt-semantic-typography-on_action)',
  visited:  'var(--pt-semantic-typography-body_caption)',
};
const PIN_TEXT_SWIFT = {
  default:  'PT.Semantic.Typography.headings',
  selected: 'PT.Semantic.Typography.onAction',
  visited:  'PT.Semantic.Typography.bodyCaption',
};
const PIN_TEXT_COMPOSE = {
  default:  'colors.typographyHeadings',
  selected: 'colors.typographyOnAction',
  visited:  'colors.typographyBodyCaption',
};

const PIN_WEIGHT_CSS = {
  default:  'var(--pt-typography-font_weight-regular)',   // 500
  selected: 'var(--pt-typography-font_weight-semibold)',  // 700
  visited:  'var(--pt-typography-font_weight-regular)',
};
const PIN_WEIGHT_SWIFT = {
  default:  'PT.TextStyle.Small.BodyDefaultRegular',
  selected: 'PT.TextStyle.Small.BodyDefaultEmphasis',
  visited:  'PT.TextStyle.Small.BodyDefaultRegular',
};
const PIN_WEIGHT_COMPOSE = {
  default:  'PTTextStyles.smallBodyDefaultRegular',
  selected: 'PTTextStyles.smallBodyDefaultEmphasis',
  visited:  'PTTextStyles.smallBodyDefaultRegular',
};

// Shared SVG gradient defs — injected once into the page by buildMapPinPlayground
const MP_PIN_BODY_PATH = 'M18 3A13 13 0 0 0 5 16Q5 24 18 33Q31 24 31 16A13 13 0 0 0 18 3Z';
// Selected ring is slightly larger (r=11) to match Figma; default/visited use r=10
const MP_RING_R = { default: 10, selected: 11, visited: 10 };

function buildMapPinEl(stateKey, number) {
  const wrap = document.createElement('div');
  wrap.className = `pt-map-pin pt-map-pin-${stateKey}`;
  const r = MP_RING_R[stateKey];
  wrap.innerHTML = `
    <svg class="pt-map-pin-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path class="pin-body" d="${MP_PIN_BODY_PATH}"/>
      <circle class="pin-ring" cx="18" cy="16" r="${r}"/>
    </svg>
    <span class="pt-map-pin-number">${number}</span>
  `;
  return wrap;
}

// ── Snippet generators ────────────────────────────────────────────────────────

function buildMPWebSnippet(stateKey, number) {
  const ringR = MP_RING_R[stateKey];
  const gradDefsBlock = stateKey === 'selected' ? [
    '',
    '<!-- Gradient defs — add once anywhere in the page SVG or as a hidden <svg> -->',
    '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0" aria-hidden="true">',
    '  <defs>',
    '    <linearGradient id="pt-mp-sel-ring" x1="0" y1="0" x2="1" y2="0">',
    '      <stop offset="0%"   stop-color="#7db071"/>',  /* --pt-color-green-400 */
    '      <stop offset="100%" stop-color="#009bc8"/>',  /* --pt-color-teal-500  */
    '    </linearGradient>',
    '  </defs>',
    '</svg>',
  ] : [];

  return [
    `/* MapPin · ${stateKey} · number: "${number}" */`,
    '',
    '/* Container */',
    '.pt-map-pin {',
    '  position: relative;',
    '  display: inline-flex;',
    '  width: var(--pt-scale-9);   /* 36px */',
    '  height: var(--pt-scale-9);',
    '}',
    '',
    '/* Pin body (filled teardrop) */',
    `.pin-body { fill: ${PIN_BODY_CSS[stateKey]}; }`,
    '',
    stateKey === 'selected' ? '/* Inner ring — Gradient/Default: linear-gradient(to right, var(--pt-color-green-400), var(--pt-color-teal-500)) */' : '/* Inner ring */',
    `.pin-ring { fill: ${PIN_RING_CSS[stateKey]}; }`,
    '',
    '/* Number label — centred in the ring (cy=16, r=${ringR}) */',
    '.pt-map-pin-number {',
    '  position: absolute;',
    '  top: 6px; bottom: 10px;',
    '  left: 6px; right: 6px;',
    `  color: ${PIN_TEXT_CSS[stateKey]};`,
    `  font-weight: ${PIN_WEIGHT_CSS[stateKey]};`,
    '  font-family: var(--pt-typography-font_family-primary);',
    '  font-size: var(--pt-typography-body-default-font_size);',
    '  line-height: var(--pt-scale-6);',
    '  display: flex; align-items: center; justify-content: center;',
    '}',
    ...gradDefsBlock,
    '',
    '<!-- HTML -->',
    `<div class="pt-map-pin pt-map-pin-${stateKey}">`,
    '  <svg class="pt-map-pin-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    `    <path class="pin-body" d="${MP_PIN_BODY_PATH}"/>`,
    `    <circle class="pin-ring" cx="18" cy="16" r="${ringR}"/>`,
    '  </svg>',
    `  <span class="pt-map-pin-number">${number}</span>`,
    '</div>',
  ].join('\n');
}

function buildMPIOSSnippet(stateKey, number) {
  const ringR = MP_RING_R[stateKey];
  const ringSetup = stateKey === 'selected'
    ? [
        '// Inner ring — teal gradient (Gradient/Default)',
        'let ringLayer = CAGradientLayer()',
        `ringLayer.frame = CGRect(x: ${18 - ringR}, y: ${16 - ringR}, width: ${ringR * 2}, height: ${ringR * 2})`,
        'ringLayer.cornerRadius = ringLayer.frame.width / 2',
        'ringLayer.startPoint = CGPoint(x: 0, y: 0.5)',
        'ringLayer.endPoint   = CGPoint(x: 1, y: 0.5)',
        'ringLayer.colors = [PT.Color.Green.c400.cgColor,   // #7db071',
        '                    PT.Color.Teal.c500.cgColor]    // #009bc8',
        'container.layer.addSublayer(ringLayer)',
      ]
    : [
        '// Inner ring',
        'let ringView = UIView()',
        `let ringR: CGFloat = ${ringR}`,
        `ringView.frame = CGRect(x: ${18 - ringR}, y: ${16 - ringR}, width: ringR * 2, height: ringR * 2)`,
        'ringView.layer.cornerRadius = ringR',
        `ringView.backgroundColor = ${PIN_RING_SWIFT[stateKey]}`,
        'container.addSubview(ringView)',
      ];

  return [
    `// MapPin · ${stateKey} · number: "${number}"`,
    '',
    'let pinSize: CGFloat = PT.Scale.s9   // 36pt',
    '',
    '// Container',
    'let container = UIView()',
    'container.frame.size = CGSize(width: pinSize, height: pinSize)',
    '',
    '// Pin body — vector asset tinted with token',
    'let pinView = UIImageView(',
    '    image: UIImage(named: "pt_map_pin_body")?',
    '        .withRenderingMode(.alwaysTemplate)',
    ')',
    `pinView.tintColor = ${PIN_BODY_SWIFT[stateKey]}`,
    'pinView.frame = container.bounds',
    'container.addSubview(pinView)',
    '',
    ...ringSetup,
    '',
    '// Number label — centred in ring (cy=16)',
    'let label = UILabel()',
    `label.text = "${number}"`,
    `label.textColor = ${PIN_TEXT_SWIFT[stateKey]}`,
    `let style = ${PIN_WEIGHT_SWIFT[stateKey]}`,
    'label.attributedText = NSAttributedString(',
    '    string: label.text ?? "",',
    '    attributes: style.attributes()',
    ')',
    'label.textAlignment = .center',
    'label.frame = CGRect(x: 6, y: 6, width: pinSize - 12, height: 20)',
    'container.addSubview(label)',
  ].join('\n');
}

function buildMPAndroidSnippet(stateKey, number) {
  const ringR = MP_RING_R[stateKey];
  const ringBlock = stateKey === 'selected'
    ? [
        '        // Inner ring — teal gradient (Gradient/Default)',
        '        Box(',
        '            modifier = Modifier',
        `                .size((${ringR * 2}).dp)`,
        '                .background(',
        '                    brush = Brush.horizontalGradient(',
        '                        colors = listOf(PTColors.colorGreen400, PTColors.colorTeal500)',
        '                    ),',
        '                    shape = CircleShape',
        '                )',
        '        )',
      ]
    : [
        '        // Inner ring',
        '        Box(',
        '            modifier = Modifier',
        `                .size((${ringR * 2}).dp)`,
        `                .background(${PIN_RING_COMPOSE[stateKey]}, CircleShape)`,
        '        )',
      ];

  return [
    `// MapPin · ${stateKey} · number: "${number}"`,
    'val colors = MaterialTheme.ptColors',
    '',
    '@Composable',
    'fun MapPin(modifier: Modifier = Modifier) {',
    '    Box(',
    '        contentAlignment = Alignment.Center,',
    '        modifier = modifier.size(PTDimens.s9)  // 36.dp',
    '    ) {',
    '        // Pin body vector',
    '        Icon(',
    '            painter = painterResource(R.drawable.pt_map_pin_body),',
    '            contentDescription = null,',
    `            tint = ${PIN_BODY_COMPOSE[stateKey]},`,
    '            modifier = Modifier.fillMaxSize()',
    '        )',
    ...ringBlock,
    '        // Number — centred in ring (cy=16)',
    '        Text(',
    `            text = "${number}",`,
    `            style = ${PIN_WEIGHT_COMPOSE[stateKey]},`,
    `            color = ${PIN_TEXT_COMPOSE[stateKey]},`,
    '            textAlign = TextAlign.Center,',
    '            modifier = Modifier',
    '                .padding(bottom = 10.dp)  // align with ring centre at 16dp from top',
    '                .width(20.dp)',
    '        )',
    '    }',
    '}',
  ].join('\n');
}

// ── Update helpers ────────────────────────────────────────────────────────────

function updateMPPreviews() {
  // Update snippet-panel row previews
  document.querySelectorAll('.mp-pin-preview[data-state]').forEach(el => {
    el.innerHTML = '';
    el.appendChild(buildMapPinEl(el.dataset.state, mpState.number));
  });
  // Update live picker widget previews
  document.querySelectorAll('.mp-live-pin[data-state]').forEach(el => {
    el.innerHTML = '';
    el.appendChild(buildMapPinEl(el.dataset.state, mpState.number));
  });
}

// ── Build playground ──────────────────────────────────────────────────────────

function buildMapPinPlayground() {
  const container = document.getElementById('mapPinPlayground');
  if (!container) return;

  // ── Shared SVG gradient defs (referenced by all selected pin rings) ───────
  const gradDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  gradDefs.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  gradDefs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  gradDefs.setAttribute('aria-hidden', 'true');
  gradDefs.innerHTML = `
    <defs>
      <linearGradient id="pt-mp-sel-ring" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#7db071"/>
        <stop offset="100%" stop-color="#009bc8"/>
      </linearGradient>
    </defs>
  `;
  container.appendChild(gradDefs);

  // ── Number picker widget ──────────────────────────────────────────────────
  const picker = document.createElement('div');
  picker.className = 'mp-picker';

  const header = document.createElement('div');
  header.className = 'mp-picker-header';

  const lbl = document.createElement('span');
  lbl.className = 'mp-picker-label';
  lbl.textContent = 'Number';

  const stepper = document.createElement('div');
  stepper.className = 'mp-stepper';

  const decBtn = document.createElement('button');
  decBtn.className = 'mp-step-btn';
  decBtn.textContent = '−';
  decBtn.title = 'Decrement';

  const numInput = document.createElement('input');
  numInput.type = 'text';
  numInput.className = 'mp-number-input';
  numInput.value = mpState.number;
  numInput.maxLength = 3;
  numInput.setAttribute('aria-label', 'Pin number');

  const incBtn = document.createElement('button');
  incBtn.className = 'mp-step-btn';
  incBtn.textContent = '+';
  incBtn.title = 'Increment';

  stepper.append(decBtn, numInput, incBtn);

  const hint = document.createElement('span');
  hint.className = 'mp-picker-hint';
  hint.textContent = 'Type any value (1–2 digits recommended) — all three states update live';

  header.append(lbl, stepper, hint);

  // Live previews — all 3 states inside the widget
  const liveRow = document.createElement('div');
  liveRow.className = 'mp-live-preview';

  PIN_STATES.forEach(({ key, label }) => {
    const item = document.createElement('div');
    item.className = 'mp-pin-item';

    const pinWrap = document.createElement('div');
    pinWrap.className = 'mp-live-pin';
    pinWrap.dataset.state = key;
    pinWrap.appendChild(buildMapPinEl(key, mpState.number));

    const stateLbl = document.createElement('span');
    stateLbl.className = 'mp-pin-state-label';
    stateLbl.textContent = label;

    item.append(pinWrap, stateLbl);
    liveRow.appendChild(item);
  });

  picker.append(header, liveRow);
  container.appendChild(picker);

  // ── Input / stepper event logic ───────────────────────────────────────────
  function setNumber(val) {
    val = String(val).trim() || '0';
    mpState.number = val;
    numInput.value = val;
    updateMPPreviews();
    mpSnippetUpdaters.forEach(fn => fn());
  }

  numInput.addEventListener('input', () => setNumber(numInput.value || '0'));

  decBtn.addEventListener('click', () => {
    const n = parseInt(mpState.number, 10);
    setNumber(!isNaN(n) ? Math.max(0, n - 1) : 0);
  });

  incBtn.addEventListener('click', () => {
    const n = parseInt(mpState.number, 10);
    setNumber(!isNaN(n) ? n + 1 : 1);
  });

  // ── State rows with snippet panels ───────────────────────────────────────
  const rowsEl = document.createElement('div');
  rowsEl.className = 'btn-rows';

  PIN_STATES.forEach(({ key, label }) => {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'btn-row-wrap';
    rowWrap.dataset.state = key;

    const row = document.createElement('div');
    row.className = 'btn-row';

    const meta = document.createElement('div');
    meta.className = 'btn-row-meta';
    meta.innerHTML = `<div class="btn-row-label">${label}</div>`;

    const preview = document.createElement('div');
    preview.className = 'btn-row-preview mp-pin-preview';
    preview.dataset.state = key;
    preview.appendChild(buildMapPinEl(key, mpState.number));

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'snippet-toggle';
    toggleBtn.textContent = '▸ {}';

    row.append(meta, preview, toggleBtn);

    const panel = document.createElement('div');
    panel.className = 'snippet-panel inline';
    panel.innerHTML = `
      <div class="snippet-tabs">
        <button class="tab-btn active" data-tab="web">Web</button>
        <button class="tab-btn" data-tab="ios">iOS</button>
        <button class="tab-btn" data-tab="android">Android</button>
      </div>
      <div class="snippet-code-wrap">
        <code class="snippet-text"></code>
        <button class="copy-btn">Copy</button>
      </div>
    `;

    const tabs    = panel.querySelectorAll('.tab-btn');
    const codeEl  = panel.querySelector('.snippet-text');
    const copyBtn = panel.querySelector('.copy-btn');
    let activeTab = 'web';

    const generators = {
      web:     () => buildMPWebSnippet(key, mpState.number),
      ios:     () => buildMPIOSSnippet(key, mpState.number),
      android: () => buildMPAndroidSnippet(key, mpState.number),
    };

    function refresh() { codeEl.textContent = generators[activeTab](); }
    refresh();

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        refresh();
      });
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(generators[activeTab]());
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });

    panel._toggleBtn = toggleBtn;
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active', !panel.classList.contains('open'));
      togglePanel(panel);
    });

    mpSnippetUpdaters.push(refresh);
    rowWrap.append(row, panel);
    rowsEl.appendChild(rowWrap);
  });

  container.appendChild(rowsEl);
}

buildMapPinPlayground();

// ─── Selection shared helper ──────────────────────────────────────────────────

function buildSelectionPlayground({ containerId, states, controls, stateObj, buildElement, buildSnippets }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // ── Controls ──────────────────────────────────────────────────────────────
  const ctrlsEl = document.createElement('div');
  ctrlsEl.className = 'btn-controls';

  controls.forEach(({ key, label, opts }) => {
    const row = document.createElement('div');
    row.className = 'btn-ctrl-row';
    const lbl = document.createElement('span');
    lbl.className = 'btn-ctrl-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    opts.forEach(({ val, label: optLabel, active }) => {
      const btn = document.createElement('button');
      btn.className = 'btn-ctrl' + (active ? ' active' : '');
      btn.textContent = optLabel;
      btn.addEventListener('click', () => {
        row.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        stateObj[key] = val;
        // Rebuild each card preview and re-cache snippets
        grid.querySelectorAll('.sel-card').forEach((card, i) => {
          const stateKey = states[i].key;
          const prev = card.querySelector('.sel-card-preview');
          prev.innerHTML = '';
          prev.appendChild(buildElement(stateKey, stateObj));
          allSnippets[stateKey] = buildSnippets(stateKey, stateObj);
        });
        if (activeState && sharedPanel.classList.contains('open')) {
          panelCode.textContent = allSnippets[activeState][activeTab];
        }
      });
      row.appendChild(btn);
    });

    ctrlsEl.appendChild(row);
  });

  // ── Grid ──────────────────────────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'sel-grid';

  // ── Shared snippet panel ──────────────────────────────────────────────────
  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'sel-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn"        data-tab="ios">iOS</button>
      <button class="tab-btn"        data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode = sharedPanel.querySelector('.snippet-text');
  const panelCopy = sharedPanel.querySelector('.copy-btn');
  let activeTab   = 'web';
  let activeState = null;

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeState) panelCode.textContent = allSnippets[activeState][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeState) return;
    navigator.clipboard.writeText(allSnippets[activeState][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  // ── Build cards ───────────────────────────────────────────────────────────
  const allSnippets = {};

  states.forEach(({ key, label }) => {
    allSnippets[key] = buildSnippets(key, stateObj);

    const card = document.createElement('div');
    card.className = 'sel-card';

    const prevWrap = document.createElement('div');
    prevWrap.className = 'sel-card-preview';
    prevWrap.appendChild(buildElement(key, stateObj));

    const cardLabel = document.createElement('div');
    cardLabel.className = 'sel-card-label';
    cardLabel.textContent = label;

    const snippetBtn = document.createElement('button');
    snippetBtn.className = 'sem-snippet-btn';
    snippetBtn.textContent = '▸ {}';

    snippetBtn.addEventListener('click', () => {
      const alreadyOpen = sharedPanel.classList.contains('open') && activeState === key;
      grid.querySelectorAll('.sem-snippet-btn').forEach(b => { b.classList.remove('active'); b.textContent = '▸ {}'; });
      if (alreadyOpen) {
        sharedPanel.classList.remove('open');
        activeState = null;
      } else {
        activeState = key;
        snippetBtn.classList.add('active');
        snippetBtn.textContent = '▾ {}';
        panelCode.textContent = allSnippets[key][activeTab];
        panelCopy.textContent = 'Copy';
        sharedPanel.classList.add('open');
      }
    });

    card.append(prevWrap, cardLabel, snippetBtn);
    grid.appendChild(card);
  });

  container.append(ctrlsEl, grid, sharedPanel);
}

// ─── Selection helpers ────────────────────────────────────────────────────────

function buildCheckSvg(size) {
  const sw = size <= 16 ? '1.5' : '2';
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5L6.5 12L13.5 4.5" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function buildMinusSvg(size) {
  const sw = size <= 16 ? '1.5' : '2';
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none"><path d="M3 8H13" stroke="#fff" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
}

// ─── Checkbox playground ──────────────────────────────────────────────────────

const cbxState = { size: '24' };

const cbxStates = [
  { key: 'unselected',            label: 'Unselected'            },
  { key: 'unselected_neutral',    label: 'Unselected Neutral'    },
  { key: 'selected_color',        label: 'Selected Color'        },
  { key: 'selected_neutral',      label: 'Selected Neutral'      },
  { key: 'indeterminate',         label: 'Indeterminate'         },
  { key: 'indeterminate_neutral', label: 'Indeterminate Neutral' },
  { key: 'disabled',              label: 'Disabled'              },
];

const cbxControls = [
  { key: 'size', label: 'Size', opts: [
    { val: '16', label: '16px' },
    { val: '20', label: '20px' },
    { val: '24', label: '24px', active: true },
  ]},
];

function buildCbxElement(stateKey, { size }) {
  const el = document.createElement('div');
  el.className = `pt-checkbox pt-checkbox-${size} pt-checkbox-${stateKey}`;
  if (['selected_color', 'selected_neutral'].includes(stateKey)) {
    el.innerHTML = buildCheckSvg(parseInt(size));
  } else if (['indeterminate', 'indeterminate_neutral'].includes(stateKey)) {
    el.innerHTML = buildMinusSvg(parseInt(size));
  }
  return el;
}

// ── Checkbox token maps ───────────────────────────────────────────────────────

const CBX_BG = {
  unselected:            'transparent',
  unselected_neutral:    'transparent',
  selected_color:        'var(--pt-semantic-surface-action)',
  selected_neutral:      'var(--pt-semantic-typography-headings)',
  indeterminate:         'var(--pt-semantic-surface-action)',
  indeterminate_neutral: 'var(--pt-semantic-typography-headings)',
  disabled:              'var(--pt-semantic-surface-page)',
};
const CBX_BORDER = {
  unselected:            'var(--pt-semantic-border-divider)',
  unselected_neutral:    'var(--pt-semantic-border-default)',
  selected_color:        'var(--pt-semantic-border-action)',
  selected_neutral:      'var(--pt-semantic-border-default)',
  indeterminate:         'var(--pt-semantic-border-action)',
  indeterminate_neutral: 'var(--pt-semantic-border-default)',
  disabled:              'var(--pt-semantic-border-disabled)',
};
const CBX_SIZE_TOKEN = { '16': 'var(--pt-scale-4)', '20': 'var(--pt-scale-5)', '24': 'var(--pt-scale-6)' };
const CBX_RADIUS     = { '16': '2px', '20': '3px', '24': '3px' };

const CBX_BG_SWIFT = {
  unselected:            '.clear',
  unselected_neutral:    '.clear',
  selected_color:        'PT.Semantic.Surface.action',
  selected_neutral:      'PT.Semantic.Typography.headings',
  indeterminate:         'PT.Semantic.Surface.action',
  indeterminate_neutral: 'PT.Semantic.Typography.headings',
  disabled:              'PT.Semantic.Surface.page',
};
const CBX_BORDER_SWIFT = {
  unselected:            'PT.Semantic.Border.divider',
  unselected_neutral:    'PT.Semantic.Border.default',
  selected_color:        'PT.Semantic.Border.action',
  selected_neutral:      'PT.Semantic.Border.default',
  indeterminate:         'PT.Semantic.Border.action',
  indeterminate_neutral: 'PT.Semantic.Border.default',
  disabled:              'PT.Semantic.Border.disabled',
};

const CBX_BG_COMPOSE = {
  unselected:            'Color.Transparent',
  unselected_neutral:    'Color.Transparent',
  selected_color:        'colors.surfaceAction',
  selected_neutral:      'colors.typographyHeadings',
  indeterminate:         'colors.surfaceAction',
  indeterminate_neutral: 'colors.typographyHeadings',
  disabled:              'colors.surfacePage',
};
const CBX_BORDER_COMPOSE = {
  unselected:            'colors.borderDivider',
  unselected_neutral:    'colors.borderDefault',
  selected_color:        'colors.borderAction',
  selected_neutral:      'colors.borderDefault',
  indeterminate:         'colors.borderAction',
  indeterminate_neutral: 'colors.borderDefault',
  disabled:              'colors.borderDisabled',
};

// ── Checkbox snippet builders ─────────────────────────────────────────────────

function buildCbxWebSnippet(stateKey, { size }) {
  const hasIcon = ['selected_color', 'selected_neutral', 'indeterminate', 'indeterminate_neutral'].includes(stateKey);
  const iconComment = hasIcon
    ? `  /* ${stateKey.startsWith('indeterminate') ? 'Minus' : 'Checkmark'} icon: white SVG centered inside */\n`
    : '';
  return [
    `/* Checkbox · ${stateKey} · ${size}px */`,
    `.checkbox {`,
    `  width: ${CBX_SIZE_TOKEN[size]};`,
    `  height: ${CBX_SIZE_TOKEN[size]};`,
    `  border-radius: ${CBX_RADIUS[size]};`,
    `  border: 1.5px solid ${CBX_BORDER[stateKey]};`,
    `  background: ${CBX_BG[stateKey]};`,
    `  display: flex;`,
    `  align-items: center;`,
    `  justify-content: center;`,
    `}`,
    iconComment,
  ].filter(Boolean).join('\n');
}

function buildCbxIOSSnippet(stateKey, { size }) {
  const hasCheck  = ['selected_color', 'selected_neutral'].includes(stateKey);
  const hasMinus  = ['indeterminate', 'indeterminate_neutral'].includes(stateKey);
  const isDisabled = stateKey === 'disabled';
  const sizePt    = `${size}pt`;
  const radius    = CBX_RADIUS[size];
  const iconLine  = hasCheck
    ? `\n// Add SF Symbol "checkmark" (weight: medium) tinted with\n// PT.Semantic.Typography.onAction`
    : hasMinus
      ? `\n// Add SF Symbol "minus" (weight: medium) tinted with\n// PT.Semantic.Typography.onAction`
      : '';
  const disLine   = isDisabled ? `\nbox.isUserInteractionEnabled = false` : '';
  return [
    `// Checkbox · ${stateKey} · ${size}pt`,
    `let box = UIView()`,
    `box.frame.size = CGSize(width: ${size}, height: ${size})`,
    `box.layer.cornerRadius = ${radius.replace('px', '')}`,
    `box.layer.masksToBounds = true`,
    `box.backgroundColor = ${CBX_BG_SWIFT[stateKey]}`,
    `box.layer.borderColor = ${CBX_BORDER_SWIFT[stateKey]}.cgColor`,
    `box.layer.borderWidth = 1.5`,
    disLine,
    iconLine,
  ].filter(Boolean).join('\n');
}

function buildCbxAndroidSnippet(stateKey, { size }) {
  const hasCheck = ['selected_color', 'selected_neutral', 'indeterminate', 'indeterminate_neutral'].includes(stateKey);
  const isChecked = hasCheck ? 'true' : 'false';
  const isDisabled = stateKey === 'disabled';
  const disLine  = isDisabled ? `\n    android:enabled="false"` : '';
  return [
    `<!-- Checkbox · ${stateKey} · ${size}dp -->`,
    `<CheckBox`,
    `    android:layout_width="${size}dp"`,
    `    android:layout_height="${size}dp"`,
    `    android:checked="${isChecked}"`,
    disLine,
    `    app:buttonTint="@color/${CBX_BG_COMPOSE[stateKey].replace(/colors\.|Color\./, '').replace(/([A-Z])/g, c => '_' + c.toLowerCase()).replace(/^_/, 'pt_semantic_').replace(/^pt_semantic_transparent/, 'pt_semantic_surface_page')}" />`,
  ].filter(Boolean).join('\n');
}

// ── Checkbox playground ───────────────────────────────────────────────────────

function buildCbxSnippets(stateKey, state) {
  return {
    web:     buildCbxWebSnippet(stateKey, state),
    ios:     buildCbxIOSSnippet(stateKey, state),
    android: buildCbxAndroidSnippet(stateKey, state),
  };
}

buildSelectionPlayground({
  containerId:   'checkboxPlayground',
  states:        cbxStates,
  controls:      cbxControls,
  stateObj:      cbxState,
  buildElement:  buildCbxElement,
  buildSnippets: buildCbxSnippets,
});

// ─── Radio Button playground ──────────────────────────────────────────────────

const radioState = { size: '24' };

const radioStates = [
  { key: 'unselected',       label: 'Unselected'       },
  { key: 'unselected_hover', label: 'Unselected Hover' },
  { key: 'selected_color',   label: 'Selected Color'   },
  { key: 'selected_neutral', label: 'Selected Neutral' },
  { key: 'disabled',         label: 'Disabled'         },
];

const radioControls = [
  { key: 'size', label: 'Size', opts: [
    { val: '16', label: '16px' },
    { val: '20', label: '20px' },
    { val: '24', label: '24px', active: true },
  ]},
];

function buildRadioElement(stateKey, { size }) {
  const el = document.createElement('div');
  el.className = `pt-radio pt-radio-${size} pt-radio-${stateKey}`;
  const dot = document.createElement('div');
  dot.className = 'pt-radio-dot';
  el.appendChild(dot);
  return el;
}

// ── Radio token maps ──────────────────────────────────────────────────────────

const RADIO_BORDER = {
  unselected:       'var(--pt-semantic-border-divider)',
  unselected_hover: 'var(--pt-semantic-border-default)',
  selected_color:   'var(--pt-semantic-border-action)',
  selected_neutral: 'var(--pt-semantic-border-default)',
  disabled:         'var(--pt-semantic-border-disabled)',
};
const RADIO_DOT = {
  unselected:       'transparent',
  unselected_hover: 'transparent',
  selected_color:   'var(--pt-semantic-surface-action)',
  selected_neutral: 'var(--pt-semantic-typography-headings)',
  disabled:         'transparent',
};
const RADIO_SIZE_TOKEN = CBX_SIZE_TOKEN;

const RADIO_BORDER_SWIFT = {
  unselected:       'PT.Semantic.Border.divider',
  unselected_hover: 'PT.Semantic.Border.default',
  selected_color:   'PT.Semantic.Border.action',
  selected_neutral: 'PT.Semantic.Border.default',
  disabled:         'PT.Semantic.Border.disabled',
};
const RADIO_DOT_SWIFT = {
  unselected:       null,
  unselected_hover: null,
  selected_color:   'PT.Semantic.Surface.action',
  selected_neutral: 'PT.Semantic.Typography.headings',
  disabled:         null,
};

const RADIO_BORDER_COMPOSE = {
  unselected:       'colors.borderDivider',
  unselected_hover: 'colors.borderDefault',
  selected_color:   'colors.borderAction',
  selected_neutral: 'colors.borderDefault',
  disabled:         'colors.borderDisabled',
};
const RADIO_DOT_COMPOSE = {
  unselected:       null,
  unselected_hover: null,
  selected_color:   'colors.surfaceAction',
  selected_neutral: 'colors.typographyHeadings',
  disabled:         null,
};

// ── Radio snippet builders ────────────────────────────────────────────────────

function buildRadioWebSnippet(stateKey, { size }) {
  const hasDot = RADIO_DOT[stateKey] !== 'transparent';
  const dotSizeMap = { '16': '7px', '20': '9px', '24': '11px' };
  const dotLine = hasDot
    ? `\n.radio::after {\n  content: '';\n  width: ${dotSizeMap[size]};\n  height: ${dotSizeMap[size]};\n  border-radius: 50%;\n  background: ${RADIO_DOT[stateKey]};\n}`
    : '';
  return [
    `/* Radio · ${stateKey} · ${size}px */`,
    `.radio {`,
    `  width: ${RADIO_SIZE_TOKEN[size]};`,
    `  height: ${RADIO_SIZE_TOKEN[size]};`,
    `  border-radius: 50%;`,
    `  border: 2px solid ${RADIO_BORDER[stateKey]};`,
    `  display: flex;`,
    `  align-items: center;`,
    `  justify-content: center;`,
    `}`,
    dotLine,
  ].filter(Boolean).join('\n');
}

function buildRadioIOSSnippet(stateKey, { size }) {
  const hasDot = !!RADIO_DOT_SWIFT[stateKey];
  const dotSizeMap = { '16': '7', '20': '9', '24': '11' };
  const isDisabled = stateKey === 'disabled';
  const dotBlock = hasDot
    ? `\nlet dot = UIView()\ndot.layer.cornerRadius = ${Math.floor(parseInt(dotSizeMap[size]) / 2)}\ndot.backgroundColor = ${RADIO_DOT_SWIFT[stateKey]}\nlet d = ${dotSizeMap[size]}.0\ndot.frame = CGRect(x: (${size} - d) / 2, y: (${size} - d) / 2, width: d, height: d)\nradio.addSubview(dot)`
    : '';
  const disLine = isDisabled ? `\nradio.isUserInteractionEnabled = false\nradio.alpha = 0.5` : '';
  return [
    `// Radio · ${stateKey} · ${size}pt`,
    `let radio = UIView()`,
    `radio.frame.size = CGSize(width: ${size}, height: ${size})`,
    `radio.layer.cornerRadius = ${size / 2}`,
    `radio.layer.borderWidth = 2`,
    `radio.layer.borderColor = ${RADIO_BORDER_SWIFT[stateKey]}.cgColor`,
    disLine,
    dotBlock,
  ].filter(Boolean).join('\n');
}

function buildRadioAndroidSnippet(stateKey, { size }) {
  const isChecked = ['selected_color', 'selected_neutral'].includes(stateKey);
  const isDisabled = stateKey === 'disabled';
  const tintToken = isChecked
    ? (stateKey === 'selected_color' ? '@color/pt_semantic_border_action' : '@color/pt_semantic_border_default')
    : '@color/pt_semantic_border_divider';
  const disLine = isDisabled ? `\n    android:enabled="false"` : '';
  return [
    `<!-- Radio · ${stateKey} · ${size}dp -->`,
    `<RadioButton`,
    `    android:layout_width="${size}dp"`,
    `    android:layout_height="${size}dp"`,
    `    android:checked="${isChecked}"`,
    disLine,
    `    app:buttonTint="${tintToken}" />`,
  ].filter(Boolean).join('\n');
}

// ── Radio playground ──────────────────────────────────────────────────────────

function buildRadioSnippets(stateKey, state) {
  return {
    web:     buildRadioWebSnippet(stateKey, state),
    ios:     buildRadioIOSSnippet(stateKey, state),
    android: buildRadioAndroidSnippet(stateKey, state),
  };
}

buildSelectionPlayground({
  containerId:   'radioPlayground',
  states:        radioStates,
  controls:      radioControls,
  stateObj:      radioState,
  buildElement:  buildRadioElement,
  buildSnippets: buildRadioSnippets,
});

// ─── Toggle playground ────────────────────────────────────────────────────────

const tglState = { size: 'lg' };

const tglStates = [
  { key: 'false',    label: 'False'    },
  { key: 'true',     label: 'True'     },
  { key: 'disabled', label: 'Disabled' },
];

const tglControls = [
  { key: 'size', label: 'Size', opts: [
    { val: 'sm', label: 'Small'  },
    { val: 'md', label: 'Medium' },
    { val: 'lg', label: 'Large', active: true },
  ]},
];

function buildToggleElement(stateKey, { size }) {
  const el = document.createElement('div');
  el.className = `pt-toggle pt-toggle-${size} pt-toggle-${stateKey}`;
  const knob = document.createElement('div');
  knob.className = 'pt-toggle-knob';
  el.appendChild(knob);
  return el;
}

// ── Toggle token maps ─────────────────────────────────────────────────────────

const TGL_BG = {
  false:    'var(--pt-semantic-surface-disabled)',
  true:     'var(--pt-semantic-surface-action)',
  disabled: 'var(--pt-semantic-surface-page)',
};
const TGL_BORDER = {
  false:    'var(--pt-semantic-border-disabled)',
  true:     'var(--pt-semantic-border-action)',
  disabled: 'var(--pt-semantic-border-disabled)',
};
const TGL_WIDTH  = { sm: 'var(--pt-scale-8)',  md: 'var(--pt-scale-10)', lg: 'var(--pt-scale-12)' };
const TGL_HEIGHT = { sm: 'var(--pt-scale-4)',  md: 'var(--pt-scale-5)',  lg: 'var(--pt-scale-6)'  };
const TGL_KNOB   = { sm: '12px', md: '16px', lg: '20px' };

const TGL_BG_SWIFT = {
  false:    'PT.Semantic.Surface.disabled',
  true:     'PT.Semantic.Surface.action',
  disabled: 'PT.Semantic.Surface.page',
};
const TGL_BG_COMPOSE = {
  false:    'colors.surfaceDisabled',
  true:     'colors.surfaceAction',
  disabled: 'colors.surfacePage',
};
const TGL_SIZE_PT   = { sm: '32×16', md: '40×20', lg: '48×24' };
const TGL_SIZE_DP   = { sm: '32×16', md: '40×20', lg: '48×24' };

// ── Toggle snippet builders ───────────────────────────────────────────────────

function buildTglWebSnippet(stateKey, { size }) {
  const isTrue     = stateKey === 'true';
  const isDisabled = stateKey === 'disabled';
  const knobPos    = isTrue ? 'right: 2px;' : 'left: 2px;';
  const disLine    = isDisabled ? '\n  opacity: 0.7;\n  cursor: not-allowed;' : '';
  return [
    `/* Toggle · ${stateKey} · ${size.toUpperCase()} */`,
    `.toggle {`,
    `  width: ${TGL_WIDTH[size]};`,
    `  height: ${TGL_HEIGHT[size]};`,
    `  border-radius: 999px;`,
    `  background: ${TGL_BG[stateKey]};`,
    `  border: 1px solid ${TGL_BORDER[stateKey]};`,
    `  position: relative;`,
    disLine,
    `}`,
    `.toggle-knob {`,
    `  position: absolute;`,
    `  width: ${TGL_KNOB[size]};`,
    `  height: ${TGL_KNOB[size]};`,
    `  border-radius: 50%;`,
    `  background: #fff;`,
    `  top: 50%;`,
    `  transform: translateY(-50%);`,
    `  ${knobPos}`,
    `}`,
  ].filter(Boolean).join('\n');
}

function buildTglIOSSnippet(stateKey, { size }) {
  const isOn      = stateKey === 'true';
  const isDisabled = stateKey === 'disabled';
  const tintProp  = isOn ? 'onTintColor' : 'backgroundColor';
  const tintVal   = isOn ? 'PT.Semantic.Surface.action' : 'PT.Semantic.Surface.disabled';
  const disLine   = isDisabled ? `\ntgl.isEnabled = false` : '';
  return [
    `// Toggle · ${stateKey} · ${TGL_SIZE_PT[size]}pt`,
    `let tgl = UISwitch()`,
    `tgl.isOn = ${isOn}`,
    `tgl.onTintColor = PT.Semantic.Surface.action`,
    disLine,
    `// Note: UISwitch has a fixed intrinsic size (~51×31pt).`,
    `// Scale to match design spec using transform:`,
    `// tgl.transform = CGAffineTransform(scaleX: 0.94, y: 0.77)`,
  ].filter(Boolean).join('\n');
}

function buildTglAndroidSnippet(stateKey, { size }) {
  const isChecked  = stateKey === 'true';
  const isDisabled = stateKey === 'disabled';
  const disLine    = isDisabled ? `\n    android:enabled="false"` : '';
  return [
    `<!-- Toggle · ${stateKey} · ${TGL_SIZE_DP[size]}dp -->`,
    `<com.google.android.material.materialswitch.MaterialSwitch`,
    `    android:layout_width="wrap_content"`,
    `    android:layout_height="wrap_content"`,
    `    android:checked="${isChecked}"`,
    disLine,
    `    app:trackTint="@color/pt_semantic_surface_${stateKey === 'true' ? 'action' : stateKey === 'disabled' ? 'page' : 'disabled'}"`,
    `    app:thumbTint="@android:color/white" />`,
  ].filter(Boolean).join('\n');
}

// ── Toggle playground ─────────────────────────────────────────────────────────

function buildTglSnippets(stateKey, state) {
  return {
    web:     buildTglWebSnippet(stateKey, state),
    ios:     buildTglIOSSnippet(stateKey, state),
    android: buildTglAndroidSnippet(stateKey, state),
  };
}

buildSelectionPlayground({
  containerId:   'togglePlayground',
  states:        tglStates,
  controls:      tglControls,
  stateObj:      tglState,
  buildElement:  buildToggleElement,
  buildSnippets: buildTglSnippets,
});

// ─── Label playground ─────────────────────────────────────────────────────────

const LABEL_COMBOS = [
  { key: 'default-default',   sizeKey: 'default',  stateKey: 'default',  label: 'Default / Default'  },
  { key: 'default-error',     sizeKey: 'default',  stateKey: 'error',    label: 'Default / Error'    },
  { key: 'default-disabled',  sizeKey: 'default',  stateKey: 'disabled', label: 'Default / Disabled' },
  { key: 'eyebrow-default',   sizeKey: 'eyebrow',  stateKey: 'default',  label: 'Eyebrow / Default'  },
  { key: 'eyebrow-error',     sizeKey: 'eyebrow',  stateKey: 'error',    label: 'Eyebrow / Error'    },
  { key: 'eyebrow-disabled',  sizeKey: 'eyebrow',  stateKey: 'disabled', label: 'Eyebrow / Disabled' },
];

function buildLabelElement(sizeKey, stateKey) {
  const el = document.createElement('div');
  el.className = `pt-label pt-label-size-${sizeKey} pt-label-state-${stateKey}`;
  el.innerHTML = `<div class="pt-label-content"><span>*Label</span>${buildIconSvg('info-circle', sizeKey === 'eyebrow' ? 12 : 16)}</div>`;
  return el;
}

const LABEL_TEXT_COLOR = {
  'default-default':  'var(--pt-semantic-typography-body)',
  'default-error':    'var(--pt-semantic-typography-error)',
  'default-disabled': 'var(--pt-semantic-typography-disabled)',
  'eyebrow-default':  'var(--pt-semantic-typography-body_secondary)',
  'eyebrow-error':    'var(--pt-semantic-typography-body_secondary)',
  'eyebrow-disabled': 'var(--pt-semantic-typography-disabled)',
};
const LABEL_FONT_SIZE = { default: 'var(--pt-typography-body-default-font_size)', eyebrow: 'var(--pt-typography-body-sm-font_size)' };

function buildLabelWebSnippet(sizeKey, stateKey) {
  const key = `${sizeKey}-${stateKey}`;
  return [
    `/* Label · ${sizeKey} / ${stateKey} */`,
    `.label {`,
    `  display: inline-flex;`,
    `  align-items: center;`,
    `  gap: 4px;`,
    `  font-family: var(--pt-typography-font_family-primary), sans-serif;`,
    `  font-weight: 500;`,
    `  font-size: ${LABEL_FONT_SIZE[sizeKey]};`,
    `  line-height: ${sizeKey === 'eyebrow' ? 'var(--pt-scale-5)' : 'var(--pt-scale-6)'};`,
    `  color: ${LABEL_TEXT_COLOR[key]};`,
    `}`,
  ].join('\n');
}

function buildLabelIOSSnippet(sizeKey, stateKey) {
  const key = `${sizeKey}-${stateKey}`;
  const size = sizeKey === 'eyebrow' ? '14' : '16';
  const colorMap = {
    'default-default':  'PT.Semantic.Typography.body',
    'default-error':    'PT.Semantic.Typography.error',
    'default-disabled': 'PT.Semantic.Typography.disabled',
    'eyebrow-default':  'PT.Semantic.Typography.bodySecondary',
    'eyebrow-error':    'PT.Semantic.Typography.bodySecondary',
    'eyebrow-disabled': 'PT.Semantic.Typography.disabled',
  };
  return [
    `// Label · ${sizeKey} / ${stateKey}`,
    `let label = UILabel()`,
    `label.font = UIFont(name: "Poppins-Medium", size: ${size}) ?? .systemFont(ofSize: ${size}, weight: .medium)`,
    `label.textColor = ${colorMap[key]}`,
    `label.text = "*Label"`,
  ].join('\n');
}

function buildLabelAndroidSnippet(sizeKey, stateKey) {
  const colorMap = {
    'default-default':  'pt_semantic_typography_body',
    'default-error':    'pt_semantic_typography_error',
    'default-disabled': 'pt_semantic_typography_disabled',
    'eyebrow-default':  'pt_semantic_typography_body_secondary',
    'eyebrow-error':    'pt_semantic_typography_body_secondary',
    'eyebrow-disabled': 'pt_semantic_typography_disabled',
  };
  const styleMap = {
    default: 'PT.TextStyle.Small.BodyDefault.Regular',
    eyebrow: 'PT.TextStyle.Small.BodySm.Regular',
  };
  return [
    `<!-- Label · ${sizeKey} / ${stateKey} -->`,
    `<TextView`,
    `    android:layout_width="wrap_content"`,
    `    android:layout_height="wrap_content"`,
    `    android:text="*Label"`,
    `    android:textColor="@color/${colorMap[`${sizeKey}-${stateKey}`]}"`,
    `    android:textAppearance="@style/${styleMap[sizeKey]}" />`,
  ].join('\n');
}

function buildLabelPlayground() {
  const container = document.getElementById('labelPlayground');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'form-field-grid';

  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'form-field-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode = sharedPanel.querySelector('.snippet-text');
  const panelCopy = sharedPanel.querySelector('.copy-btn');
  let activeTab   = 'web';
  let activeKey   = null;
  let activeCard  = null;
  const allSnippets = {};

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeKey) panelCode.textContent = allSnippets[activeKey][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeKey) return;
    navigator.clipboard.writeText(allSnippets[activeKey][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  LABEL_COMBOS.forEach(({ key, sizeKey, stateKey, label }) => {
    allSnippets[key] = {
      web:     buildLabelWebSnippet(sizeKey, stateKey),
      ios:     buildLabelIOSSnippet(sizeKey, stateKey),
      android: buildLabelAndroidSnippet(sizeKey, stateKey),
    };

    const card = document.createElement('div');
    card.className = 'form-field-card';

    const preview = document.createElement('div');
    preview.className = 'form-field-card-preview';
    preview.style.minHeight = '40px';
    preview.appendChild(buildLabelElement(sizeKey, stateKey));

    const cardLabel = document.createElement('div');
    cardLabel.className = 'form-field-card-label';
    cardLabel.textContent = label;

    card.appendChild(preview);
    card.appendChild(cardLabel);

    card.addEventListener('click', () => {
      const wasActive = activeKey === key && sharedPanel.classList.contains('open');
      if (activeCard) activeCard.classList.remove('active');
      if (wasActive) {
        sharedPanel.classList.remove('open');
        activeKey  = null;
        activeCard = null;
      } else {
        card.classList.add('active');
        activeKey  = key;
        activeCard = card;
        panelCode.textContent = allSnippets[key][activeTab];
        sharedPanel.classList.add('open');
      }
    });

    grid.appendChild(card);
  });

  grid.appendChild(sharedPanel);
  container.appendChild(grid);
}

buildLabelPlayground();

// ─── Footnote playground ───────────────────────────────────────────────────────

const FOOTNOTE_STATES = [
  { key: 'default', label: 'Default' },
  { key: 'error',   label: 'Error'   },
];

function buildFootnoteElement(stateKey) {
  const el = document.createElement('div');
  el.className = `pt-footnote pt-footnote-${stateKey}`;
  el.innerHTML =
    buildIconSvg('square', 16) +
    `<span>Footnote sentence for the form field.</span>` +
    buildIconSvg('info-circle', 16);
  return el;
}

function buildFootnoteWebSnippet(stateKey) {
  const isError = stateKey === 'error';
  return [
    `/* Footnote · ${stateKey} */`,
    `.footnote {`,
    `  display: inline-flex;`,
    `  align-items: center;`,
    `  gap: var(--pt-scale-1);`,
    `  font-family: var(--pt-typography-font_family-primary), sans-serif;`,
    `  font-size: var(--pt-typography-body-sm-font_size);`,
    `  font-weight: 300;`,
    `  line-height: var(--pt-scale-6);`,
    `  color: ${isError ? 'var(--pt-semantic-typography-error)' : 'var(--pt-semantic-typography-body_caption)'};`,
    `}`,
  ].join('\n');
}

function buildFootnoteIOSSnippet(stateKey) {
  const isError = stateKey === 'error';
  return [
    `// Footnote · ${stateKey}`,
    `let footnote = UILabel()`,
    `footnote.font = UIFont(name: "Poppins-Light", size: 14) ?? .systemFont(ofSize: 14, weight: .light)`,
    `footnote.textColor = ${isError ? 'PT.Semantic.Typography.error' : 'PT.Semantic.Typography.bodyCaption'}`,
    `footnote.text = "Footnote sentence for the form field."`,
  ].join('\n');
}

function buildFootnoteAndroidSnippet(stateKey) {
  const isError = stateKey === 'error';
  return [
    `<!-- Footnote · ${stateKey} -->`,
    `<TextView`,
    `    android:layout_width="wrap_content"`,
    `    android:layout_height="wrap_content"`,
    `    android:text="Footnote sentence for the form field."`,
    `    android:textColor="@color/${isError ? 'pt_semantic_typography_error' : 'pt_semantic_typography_body_caption'}"`,
    `    android:textAppearance="@style/PT.TextStyle.Small.BodySm.Thin" />`,
  ].join('\n');
}

function buildFootnotePlayground() {
  const container = document.getElementById('footnotePlayground');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'form-field-grid';

  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'form-field-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode = sharedPanel.querySelector('.snippet-text');
  const panelCopy = sharedPanel.querySelector('.copy-btn');
  let activeTab   = 'web';
  let activeState = null;
  let activeCard  = null;
  const allSnippets = {};

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeState) panelCode.textContent = allSnippets[activeState][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeState) return;
    navigator.clipboard.writeText(allSnippets[activeState][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  FOOTNOTE_STATES.forEach(({ key, label }) => {
    allSnippets[key] = {
      web:     buildFootnoteWebSnippet(key),
      ios:     buildFootnoteIOSSnippet(key),
      android: buildFootnoteAndroidSnippet(key),
    };

    const card = document.createElement('div');
    card.className = 'form-field-card';

    const preview = document.createElement('div');
    preview.className = 'form-field-card-preview';
    preview.style.minHeight = '32px';
    preview.appendChild(buildFootnoteElement(key));

    const cardLabel = document.createElement('div');
    cardLabel.className = 'form-field-card-label';
    cardLabel.textContent = label;

    card.appendChild(preview);
    card.appendChild(cardLabel);

    card.addEventListener('click', () => {
      const wasActive = activeState === key && sharedPanel.classList.contains('open');
      if (activeCard) activeCard.classList.remove('active');
      if (wasActive) {
        sharedPanel.classList.remove('open');
        activeState = null;
        activeCard  = null;
      } else {
        card.classList.add('active');
        activeState = key;
        activeCard  = card;
        panelCode.textContent = allSnippets[key][activeTab];
        sharedPanel.classList.add('open');
      }
    });

    grid.appendChild(card);
  });

  grid.appendChild(sharedPanel);
  container.appendChild(grid);
}

buildFootnotePlayground();

// ─── Form Field playground ─────────────────────────────────────────────────────

const FF_STATES = [
  { key: 'default',  label: 'Default'  },
  { key: 'active',   label: 'Active'   },
  { key: 'error',    label: 'Error'    },
  { key: 'disabled', label: 'Disabled' },
  { key: 'hover',    label: 'Hover'    },
  { key: 'filled',   label: 'Filled'   },
];

const FF_BG = {
  default:  'var(--pt-semantic-surface-card_primary)',
  active:   'var(--pt-semantic-surface-card_primary)',
  error:    'var(--pt-semantic-surface-error)',
  disabled: 'var(--pt-semantic-surface-page)',
  hover:    'var(--pt-semantic-surface-success)',
  filled:   'var(--pt-semantic-surface-card_primary)',
};
const FF_BORDER = {
  default:  'var(--pt-semantic-border-card_primary)',
  active:   'var(--pt-semantic-border-action)',
  error:    'var(--pt-semantic-border-error)',
  disabled: 'var(--pt-semantic-border-card_primary)',
  hover:    'var(--pt-semantic-border-action)',
  filled:   'var(--pt-semantic-border-card_primary)',
};
const FF_BG_SWIFT = {
  default:  'PT.Semantic.Surface.cardPrimary',
  active:   'PT.Semantic.Surface.cardPrimary',
  error:    'PT.Semantic.Surface.error',
  disabled: 'PT.Semantic.Surface.page',
  hover:    'PT.Semantic.Surface.success',
  filled:   'PT.Semantic.Surface.cardPrimary',
};
const FF_BORDER_SWIFT = {
  default:  'PT.Semantic.Border.cardPrimary',
  active:   'PT.Semantic.Border.action',
  error:    'PT.Semantic.Border.error',
  disabled: 'PT.Semantic.Border.cardPrimary',
  hover:    'PT.Semantic.Border.action',
  filled:   'PT.Semantic.Border.cardPrimary',
};
const FF_BG_ANDROID = {
  default:  'pt_semantic_surface_card_primary',
  active:   'pt_semantic_surface_card_primary',
  error:    'pt_semantic_surface_error',
  disabled: 'pt_semantic_surface_page',
  hover:    'pt_semantic_surface_success',
  filled:   'pt_semantic_surface_card_primary',
};
const FF_BORDER_ANDROID = {
  default:  'pt_semantic_border_card_primary',
  active:   'pt_semantic_border_action',
  error:    'pt_semantic_border_error',
  disabled: 'pt_semantic_border_card_primary',
  hover:    'pt_semantic_border_action',
  filled:   'pt_semantic_border_card_primary',
};

function buildFormFieldElement(stateKey) {
  const wrap = document.createElement('div');
  wrap.className = `pt-form-field pt-form-field-${stateKey}`;

  const text = document.createElement('span');
  text.className = 'pt-form-field-text';
  text.textContent = 'Form input';

  const chevron = document.createElement('span');
  chevron.className = 'pt-form-field-chevron';
  chevron.innerHTML = buildIconSvg('chevron-down', 20);

  const label = document.createElement('div');
  label.className = 'pt-form-field-label';
  label.innerHTML = `<div class="pt-form-field-label-content"><span>*Label</span>${buildIconSvg('info-circle', 16)}</div>`;

  wrap.appendChild(text);
  wrap.appendChild(chevron);
  wrap.appendChild(label);
  return wrap;
}

function buildFFWebSnippet(stateKey) {
  const isFloating = ['active', 'filled', 'error'].includes(stateKey);
  const isDisabled = stateKey === 'disabled';
  const isHover    = stateKey === 'hover';
  const isError    = stateKey === 'error';
  const hasInput   = ['active', 'filled', 'error'].includes(stateKey);

  const labelBg    = isError
    ? 'var(--pt-semantic-surface-error)'
    : 'var(--pt-semantic-surface-card_primary)';
  const labelColor = isDisabled
    ? 'var(--pt-semantic-typography-disabled)'
    : isFloating
      ? 'var(--pt-semantic-typography-body_secondary)'
      : 'var(--pt-semantic-typography-body)';
  const inputColor = isError
    ? 'var(--pt-semantic-typography-error)'
    : 'var(--pt-semantic-typography-body)';

  return [
    `/* Form Field · ${stateKey} */`,
    `.form-field {`,
    `  position: relative;`,
    `  display: flex;`,
    `  align-items: center;`,
    `  gap: var(--pt-scale-2);`,
    `  padding: var(--pt-scale-5) var(--pt-scale-4);`,
    `  border: 1px solid ${FF_BORDER[stateKey]};`,
    `  border-radius: var(--pt-scale-1);`,
    `  background: ${FF_BG[stateKey]};`,
    `  min-height: 64px;`,
    isHover    ? `  box-shadow: var(--pt-shadow-solid-xs);` : null,
    isDisabled ? `  cursor: not-allowed;` : null,
    `}`,
    `.form-field-label {`,
    `  position: absolute;`,
    `  left: 7px;`,
    isFloating ? `  top: -1px; height: 10px; align-items: flex-end;` : `  top: 23px;`,
    `  padding: 0 var(--pt-scale-2);`,
    `  font-size: ${isFloating ? 'var(--pt-typography-body-sm-font_size)' : 'var(--pt-typography-body-default-font_size)'};`,
    `  line-height: ${isFloating ? 'var(--pt-scale-5)' : 'var(--pt-scale-6)'};`,
    `  color: ${labelColor};`,
    isFloating ? `  background: ${labelBg};` : null,
    `}`,
    hasInput ? [
      `.form-field-input {`,
      `  color: ${inputColor};`,
      `}`,
    ] : null,
  ].flat().filter(Boolean).join('\n');
}

function buildFFIOSSnippet(stateKey) {
  const isFloating = ['active', 'filled', 'error'].includes(stateKey);
  const isHover    = stateKey === 'hover';
  const isDisabled = stateKey === 'disabled';
  const isError    = stateKey === 'error';

  return [
    `// Form Field · ${stateKey}`,
    `let field = UIView()`,
    `field.backgroundColor = ${FF_BG_SWIFT[stateKey]}`,
    `field.layer.borderColor = ${FF_BORDER_SWIFT[stateKey]}.cgColor`,
    `field.layer.borderWidth = 1`,
    `field.layer.cornerRadius = PT.Scale.s1`,
    isHover ? `field.layer.shadowColor = PT.Semantic.Shadow.shadow.cgColor` : null,
    isHover ? `field.layer.shadowOffset = CGSize(width: 0, height: PT.Scale.shalf)` : null,
    isHover ? `field.layer.shadowOpacity = 0.2` : null,
    ``,
    `// Floating label`,
    `let label = UILabel()`,
    isFloating
      ? `label.font = UIFont(name: "Poppins-Medium", size: 14) ?? .systemFont(ofSize: 14, weight: .medium)`
      : `label.font = UIFont(name: "Poppins-Medium", size: 16) ?? .systemFont(ofSize: 16, weight: .medium)`,
    isDisabled
      ? `label.textColor = PT.Semantic.Typography.disabled`
      : isFloating
        ? `label.textColor = PT.Semantic.Typography.bodySecondary`
        : `label.textColor = PT.Semantic.Typography.body`,
    isError    ? `label.textColor = PT.Semantic.Typography.bodySecondary` : null,
    isDisabled ? `field.isUserInteractionEnabled = false` : null,
    isError    ? `` : null,
    isError    ? `// Input text` : null,
    isError    ? `inputLabel.textColor = PT.Semantic.Typography.error` : null,
  ].filter(v => v !== null).join('\n');
}

function buildFFAndroidSnippet(stateKey) {
  const isDisabled = stateKey === 'disabled';
  const isError    = stateKey === 'error';

  return [
    `<!-- Form Field · ${stateKey} -->`,
    `<com.google.android.material.textfield.TextInputLayout`,
    `    style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"`,
    `    android:layout_width="match_parent"`,
    `    android:layout_height="wrap_content"`,
    `    app:boxBackgroundColor="@color/${FF_BG_ANDROID[stateKey]}"`,
    `    app:boxStrokeColor="@color/${FF_BORDER_ANDROID[stateKey]}"`,
    `    app:boxStrokeWidth="1dp"`,
    `    app:boxCornerRadiusTopStart="@dimen/pt_scale_1"`,
    `    app:boxCornerRadiusTopEnd="@dimen/pt_scale_1"`,
    `    app:boxCornerRadiusBottomStart="@dimen/pt_scale_1"`,
    `    app:boxCornerRadiusBottomEnd="@dimen/pt_scale_1"`,
    `    app:hintTextColor="@color/pt_semantic_typography_body_secondary"`,
    `    android:hint="*Label"`,
    isDisabled ? `    android:enabled="false"` : null,
    isError    ? `    app:errorEnabled="true"` : null,
    `    app:endIconMode="dropdown_menu">`,
    `  <com.google.android.material.textfield.TextInputEditText`,
    `      android:layout_width="match_parent"`,
    `      android:layout_height="wrap_content"`,
    `      android:padding="@dimen/pt_scale_5"`,
    `      android:textColor="@color/${isError ? 'pt_semantic_typography_error' : 'pt_semantic_typography_body'}"`,
    `      android:fontFamily="@font/poppins_medium" />`,
    `</com.google.android.material.textfield.TextInputLayout>`,
  ].filter(Boolean).join('\n');
}

function buildFFSnippets(stateKey) {
  return {
    web:     buildFFWebSnippet(stateKey),
    ios:     buildFFIOSSnippet(stateKey),
    android: buildFFAndroidSnippet(stateKey),
  };
}

function buildFormFieldPlayground() {
  const container = document.getElementById('formFieldPlayground');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'form-field-grid';

  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'form-field-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode = sharedPanel.querySelector('.snippet-text');
  const panelCopy = sharedPanel.querySelector('.copy-btn');
  let activeTab   = 'web';
  let activeState = null;
  let activeCard  = null;
  const allSnippets = {};

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeState) panelCode.textContent = allSnippets[activeState][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeState) return;
    navigator.clipboard.writeText(allSnippets[activeState][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  FF_STATES.forEach(({ key, label }) => {
    allSnippets[key] = buildFFSnippets(key);

    const card = document.createElement('div');
    card.className = 'form-field-card';

    const preview = document.createElement('div');
    preview.className = 'form-field-card-preview';
    preview.appendChild(buildFormFieldElement(key));

    const cardLabel = document.createElement('div');
    cardLabel.className = 'form-field-card-label';
    cardLabel.textContent = label;

    card.appendChild(preview);
    card.appendChild(cardLabel);

    card.addEventListener('click', () => {
      const wasActive = activeState === key && sharedPanel.classList.contains('open');
      if (activeCard) activeCard.classList.remove('active');
      if (wasActive) {
        sharedPanel.classList.remove('open');
        activeState = null;
        activeCard  = null;
      } else {
        card.classList.add('active');
        activeState = key;
        activeCard  = card;
        panelCode.textContent = allSnippets[key][activeTab];
        sharedPanel.classList.add('open');
      }
    });

    grid.appendChild(card);
  });

  grid.appendChild(sharedPanel);
  container.appendChild(grid);
}

buildFormFieldPlayground();

// ─── Search playground ─────────────────────────────────────────────────────────

const SEARCH_STATES = [
  { key: 'default', label: 'Default' },
  { key: 'active',  label: 'Active'  },
];

function buildSearchElement(stateKey) {
  const wrap = document.createElement('div');
  wrap.className = `pt-search pt-search-${stateKey}`;

  const input = document.createElement('div');
  input.className = 'pt-search-input';
  input.textContent = 'Enter search query';

  const btn = document.createElement('div');
  btn.className = 'pt-search-button';
  btn.innerHTML = buildIconSvg('search', 20);

  wrap.appendChild(input);
  wrap.appendChild(btn);
  return wrap;
}

function buildSearchWebSnippet(stateKey) {
  const isActive    = stateKey === 'active';
  const borderToken = isActive ? 'var(--pt-semantic-border-action)' : 'var(--pt-semantic-border-card_primary)';
  const bgToken     = isActive ? 'var(--pt-semantic-surface-success)' : 'var(--pt-semantic-surface-card_primary)';

  return [
    `/* Search · ${stateKey} */`,
    `.search {`,
    `  display: flex;`,
    isActive ? `  box-shadow: var(--pt-shadow-solid-xs);` : null,
    `}`,
    `.search-input {`,
    `  flex: 1;`,
    `  padding: var(--pt-scale-3) var(--pt-scale-5);`,
    `  border: 1px solid ${borderToken};`,
    `  border-right: none;`,
    `  border-radius: var(--pt-scale-1) 0 0 var(--pt-scale-1);`,
    `  background: ${bgToken};`,
    `  color: ${isActive ? 'var(--pt-semantic-typography-body)' : 'var(--pt-semantic-typography-body_secondary)'};`,
    `  font-family: var(--pt-typography-font_family-primary), sans-serif;`,
    `  font-size: var(--pt-typography-body-default-font_size);`,
    `}`,
    `.search-button {`,
    `  width: 48px; height: 48px;`,
    `  display: flex; align-items: center; justify-content: center;`,
    `  border: 1px solid ${borderToken};`,
    `  border-radius: 0 var(--pt-scale-1) var(--pt-scale-1) 0;`,
    `  background: ${bgToken};`,
    `  color: ${isActive ? 'var(--pt-semantic-icon-action)' : 'var(--pt-semantic-icon-body_secondary)'};`,
    `  cursor: pointer;`,
    `}`,
  ].filter(Boolean).join('\n');
}

function buildSearchIOSSnippet(stateKey) {
  const isActive = stateKey === 'active';
  return [
    `// Search · ${stateKey}`,
    `let searchBar = UISearchBar()`,
    `searchBar.searchBarStyle = .minimal`,
    `searchBar.backgroundImage = UIImage()`,
    `searchBar.layer.borderWidth = 1`,
    `searchBar.layer.cornerRadius = PT.Scale.s1`,
    `searchBar.layer.borderColor = ${isActive ? 'PT.Semantic.Border.action' : 'PT.Semantic.Border.cardPrimary'}.cgColor`,
    `searchBar.backgroundColor = ${isActive ? 'PT.Semantic.Surface.success' : 'PT.Semantic.Surface.cardPrimary'}`,
    `searchBar.placeholder = "Enter search query"`,
    `searchBar.tintColor = PT.Semantic.Icon.action`,
  ].join('\n');
}

function buildSearchAndroidSnippet(stateKey) {
  const isActive    = stateKey === 'active';
  const borderColor = isActive ? 'pt_semantic_border_action' : 'pt_semantic_border_card_primary';
  const bgColor     = isActive ? 'pt_semantic_surface_success' : 'pt_semantic_surface_card_primary';

  return [
    `<!-- Search · ${stateKey} -->`,
    `<LinearLayout`,
    `    android:layout_width="match_parent"`,
    `    android:layout_height="48dp"`,
    `    android:orientation="horizontal">`,
    `  <com.google.android.material.textfield.TextInputLayout`,
    `      style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"`,
    `      android:layout_width="0dp"`,
    `      android:layout_height="match_parent"`,
    `      android:layout_weight="1"`,
    `      app:boxBackgroundColor="@color/${bgColor}"`,
    `      app:boxStrokeColor="@color/${borderColor}"`,
    `      android:hint="Enter search query">`,
    `    <com.google.android.material.textfield.TextInputEditText`,
    `        android:layout_width="match_parent"`,
    `        android:layout_height="match_parent" />`,
    `  </com.google.android.material.textfield.TextInputLayout>`,
    `  <ImageButton`,
    `      android:layout_width="48dp"`,
    `      android:layout_height="48dp"`,
    `      android:src="@drawable/ic_search"`,
    `      android:background="@color/${bgColor}"`,
    `      android:tint="@color/${isActive ? 'pt_semantic_icon_action' : 'pt_semantic_icon_body_secondary'}" />`,
    `</LinearLayout>`,
  ].join('\n');
}

function buildSearchSnippets(stateKey) {
  return {
    web:     buildSearchWebSnippet(stateKey),
    ios:     buildSearchIOSSnippet(stateKey),
    android: buildSearchAndroidSnippet(stateKey),
  };
}

function buildSearchPlayground() {
  const container = document.getElementById('searchPlayground');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'form-field-grid';

  const sharedPanel = document.createElement('div');
  sharedPanel.className = 'form-field-shared-panel';
  sharedPanel.innerHTML = `
    <div class="snippet-tabs">
      <button class="tab-btn active" data-tab="web">Web</button>
      <button class="tab-btn" data-tab="ios">iOS</button>
      <button class="tab-btn" data-tab="android">Android</button>
    </div>
    <div class="snippet-code-wrap">
      <code class="snippet-text"></code>
      <button class="copy-btn">Copy</button>
    </div>`;

  const panelTabs = sharedPanel.querySelectorAll('.tab-btn');
  const panelCode = sharedPanel.querySelector('.snippet-text');
  const panelCopy = sharedPanel.querySelector('.copy-btn');
  let activeTab   = 'web';
  let activeState = null;
  let activeCard  = null;
  const allSnippets = {};

  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      if (activeState) panelCode.textContent = allSnippets[activeState][activeTab];
    });
  });

  panelCopy.addEventListener('click', () => {
    if (!activeState) return;
    navigator.clipboard.writeText(allSnippets[activeState][activeTab]);
    panelCopy.textContent = 'Copied!';
    setTimeout(() => { panelCopy.textContent = 'Copy'; }, 1500);
  });

  SEARCH_STATES.forEach(({ key, label }) => {
    allSnippets[key] = buildSearchSnippets(key);

    const card = document.createElement('div');
    card.className = 'form-field-card';

    const preview = document.createElement('div');
    preview.className = 'form-field-card-preview';
    preview.appendChild(buildSearchElement(key));

    const cardLabel = document.createElement('div');
    cardLabel.className = 'form-field-card-label';
    cardLabel.textContent = label;

    card.appendChild(preview);
    card.appendChild(cardLabel);

    card.addEventListener('click', () => {
      const wasActive = activeState === key && sharedPanel.classList.contains('open');
      if (activeCard) activeCard.classList.remove('active');
      if (wasActive) {
        sharedPanel.classList.remove('open');
        activeState = null;
        activeCard  = null;
      } else {
        card.classList.add('active');
        activeState = key;
        activeCard  = card;
        panelCode.textContent = allSnippets[key][activeTab];
        sharedPanel.classList.add('open');
      }
    });

    grid.appendChild(card);
  });

  grid.appendChild(sharedPanel);
  container.appendChild(grid);
}

buildSearchPlayground();
