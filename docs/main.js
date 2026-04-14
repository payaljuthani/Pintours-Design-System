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

  // --pt-shadow-{key} → PT.Shadow.{key}
  const shadowMatch = name.match(/^pt-shadow-(.+)$/);
  if (shadowMatch) {
    return `PT.Shadow.${shadowMatch[1]}`;
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

// ─── Shadows section ───────────────────────────────────────────────────────────

const shadowsSection = document.getElementById('shadows');

// Preview card
const shadowCard = document.createElement('div');
shadowCard.className = 'shadow-card';
shadowCard.innerHTML = `
  <div class="shadow-card-dot"></div>
  <div>
    <div class="shadow-card-label">Elevation · Large</div>
    <div class="shadow-card-token">--pt-shadow-lg</div>
  </div>
`;
shadowsSection.appendChild(shadowCard);

// Snippet panel for --pt-shadow-lg
const shadowSnippetWrap = document.createElement('div');
shadowSnippetWrap.className = 'shadow-snippet-wrap';

const shadowToggleBtn = document.createElement('button');
shadowToggleBtn.className = 'snippet-toggle';
shadowToggleBtn.style.cssText = 'font-size:12px; padding:5px 12px; margin-bottom:10px;';
shadowToggleBtn.textContent = '▸ {} Show code snippet';

const shadowPanel = buildPanel('--pt-shadow-lg', { inline: true });
shadowPanel._toggleBtn = shadowToggleBtn;

shadowToggleBtn.addEventListener('click', () => {
  shadowToggleBtn.classList.toggle('active', !shadowPanel.classList.contains('open'));
  // Manually toggle (no floating panel interference)
  shadowPanel.classList.toggle('open');
});

shadowSnippetWrap.append(shadowToggleBtn, shadowPanel);
shadowsSection.appendChild(shadowSnippetWrap);

// Semantic shadow color tiles (shadow color tokens)
const shadowColorGroup = document.createElement('div');
shadowColorGroup.className = 'sem-group';
shadowColorGroup.style.marginTop = '36px';
shadowColorGroup.innerHTML = '<h3>Shadow Color Tokens</h3>';

const shadowGrid = document.createElement('div');
shadowGrid.className = 'semantic-grid';

for (const [tokenKey, label] of [
  ['shadow',        'Shadow (overlay)'],
  ['shadow-normal', 'Shadow (normal)'],
]) {
  const cssVar = `--pt-semantic-${tokenKey}`;
  const hexVal = getCSSVar(cssVar);

  const tile = document.createElement('div');
  tile.className = 'sem-tile';

  const swatch = document.createElement('div');
  swatch.className = 'sem-swatch';
  swatch.style.background = `var(${cssVar})`;
  swatch.dataset.cssvar = cssVar;

  const name = document.createElement('div');
  name.className = 'sem-name';
  name.textContent = label;

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

  tile.append(swatch, name, valueEl, snippetBtn, panel);
  shadowGrid.appendChild(tile);
}

shadowColorGroup.appendChild(shadowGrid);
shadowsSection.appendChild(shadowColorGroup);

// ─── Sidebar — section toggle ─────────────────────────────────────────────────

[
  { toggleId: 'foundations-toggle', itemsId: 'foundations-items', iconId: 'foundations-icon' },
  { toggleId: 'components-toggle',  itemsId: 'components-items',  iconId: 'components-icon'  },
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
const BTN_ICON_NAME = 'arrow-right';

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
    { val: 'default',  label: 'Default',    active: true },
    { val: 'hover',    label: 'Hover'       },
    { val: 'negative', label: 'Negative'    },
    { val: 'disabled', label: 'Disabled'    },
    { val: 'ai',       label: 'AI Default'  },
  ]},
  { key: 'icon',  label: 'Icon',  opts: [
    { val: 'none',     label: 'None',     active: true },
    { val: 'leading',  label: 'Leading'  },
    { val: 'trailing', label: 'Trailing' },
  ]},
];

function getBtnClasses(type, { size, state }) {
  const cls = ['pt-btn', `pt-btn-${type}`, `pt-btn-${size}`];
  if (state === 'hover')    cls.push('pt-btn-is-hover');
  if (state === 'negative') cls.push('pt-btn-negative');
  if (state === 'ai')       cls.push('pt-btn-ai');
  return cls;
}

function buildBtnElement(type, { size, state, icon }) {
  const btn = document.createElement('button');
  btn.className = getBtnClasses(type, { size, state }).join(' ');
  if (state === 'disabled') btn.disabled = true;
  if (icon === 'leading')  btn.insertAdjacentHTML('beforeend', buildIconSvg(BTN_ICON_NAME, ICON_SIZE[size]));
  btn.insertAdjacentText('beforeend', 'Button');
  if (icon === 'trailing') btn.insertAdjacentHTML('beforeend', buildIconSvg(BTN_ICON_NAME, ICON_SIZE[size]));
  return btn;
}

// ─── Snippet generators ───────────────────────────────────────────────────────

// Token maps keyed by type × state
const BTN_BG = {
  primary:   { default: 'var(--pt-semantic-surface-action)', hover: 'var(--pt-semantic-surface-action_hover)', negative: 'var(--pt-semantic-surface-negative)', disabled: 'var(--pt-semantic-surface-disabled)', ai: 'linear-gradient(to right, var(--pt-color-green-400), var(--pt-color-teal-500))' },
  secondary: { default: 'var(--pt-semantic-surface-page)', hover: 'var(--pt-semantic-surface-card_primary)', negative: 'var(--pt-semantic-surface-page)', disabled: 'var(--pt-semantic-surface-page)', ai: 'var(--pt-semantic-surface-page)' },
  tertiary:  { default: 'transparent', hover: 'transparent', negative: 'transparent', disabled: 'transparent', ai: 'transparent' },
};
const BTN_COLOR = {
  primary:   { default: 'var(--pt-semantic-typography-on_action)', hover: 'var(--pt-semantic-typography-on_action)', negative: 'var(--pt-semantic-typography-on_action)', disabled: 'var(--pt-semantic-typography-on_disabled)', ai: 'var(--pt-semantic-typography-on_action)' },
  secondary: { default: 'var(--pt-semantic-typography-action)', hover: 'var(--pt-semantic-typography-action_hover)', negative: 'var(--pt-semantic-typography-error)', disabled: 'var(--pt-semantic-typography-body_caption)', ai: 'var(--pt-semantic-typography-action)' },
  tertiary:  { default: 'var(--pt-semantic-typography-action)', hover: 'var(--pt-semantic-typography-action_hover)', negative: 'var(--pt-semantic-typography-error)', disabled: 'var(--pt-semantic-typography-body_caption)', ai: 'var(--pt-semantic-typography-action)' },
};
const BTN_BORDER = {
  primary:   { default: 'var(--pt-semantic-border-action)', hover: 'var(--pt-semantic-border-action_hover)', negative: 'var(--pt-semantic-border-negative)', disabled: 'var(--pt-semantic-border-disabled)', ai: 'var(--pt-color-green-400)' },
  secondary: { default: 'var(--pt-semantic-border-action)', hover: 'var(--pt-semantic-border-action_hover)', negative: 'var(--pt-semantic-border-negative)', disabled: 'var(--pt-semantic-border-disabled)', ai: 'var(--pt-semantic-border-action)' },
  tertiary:  { default: 'transparent', hover: 'transparent', negative: 'transparent', disabled: 'transparent', ai: 'transparent' },
};
const BTN_PADDING = { sm: ['var(--pt-scale-2)', 'var(--pt-scale-4)'], md: ['var(--pt-scale-3)', 'var(--pt-scale-5)'], lg: ['var(--pt-scale-3)', 'var(--pt-scale-6)'] };
const BTN_FONT    = { sm: 'var(--pt-typography-body-sm-font_size)', md: 'var(--pt-typography-body-default-font_size)', lg: 'var(--pt-typography-body-lg-font_size)' };
const BTN_RADIUS  = { sm: 'var(--pt-scale-1half)', md: 'var(--pt-scale-2)', lg: 'var(--pt-scale-2)' };

// Swift token maps (no CSS-var syntax)
const BTN_BG_SWIFT = {
  primary:   { default: 'PT.Semantic.Surface.action', hover: 'PT.Semantic.Surface.actionHover', negative: 'PT.Semantic.Surface.negative', disabled: 'PT.Semantic.Surface.disabled', ai: '/* gradient — see note */' },
  secondary: { default: 'PT.Semantic.Surface.page', hover: 'PT.Semantic.Surface.cardPrimary', negative: 'PT.Semantic.Surface.page', disabled: 'PT.Semantic.Surface.disabled', ai: 'PT.Semantic.Surface.page' },
  tertiary:  { default: '.clear', hover: '.clear', negative: '.clear', disabled: '.clear', ai: '.clear' },
};
const BTN_COLOR_SWIFT = {
  primary:   { default: 'PT.Semantic.Typography.onAction', hover: 'PT.Semantic.Typography.onAction', negative: 'PT.Semantic.Typography.onAction', disabled: 'PT.Semantic.Typography.onDisabled', ai: 'PT.Semantic.Typography.onAction' },
  secondary: { default: 'PT.Semantic.Typography.action', hover: 'PT.Semantic.Typography.actionHover', negative: 'PT.Semantic.Typography.error', disabled: 'PT.Semantic.Typography.onDisabled', ai: 'PT.Semantic.Typography.action' },
  tertiary:  { default: 'PT.Semantic.Typography.action', hover: 'PT.Semantic.Typography.actionHover', negative: 'PT.Semantic.Typography.error', disabled: 'PT.Semantic.Typography.disabled', ai: 'PT.Semantic.Typography.action' },
};
const BTN_BORDER_SWIFT = {
  primary:   { default: 'PT.Semantic.Border.action', hover: 'PT.Semantic.Border.actionHover', negative: 'PT.Semantic.Border.negative', disabled: 'PT.Semantic.Border.disabled', ai: 'PT.Color.Green.c400' },
  secondary: { default: 'PT.Semantic.Border.action', hover: 'PT.Semantic.Border.actionHover', negative: 'PT.Semantic.Border.negative', disabled: 'PT.Semantic.Border.disabled', ai: 'PT.Semantic.Border.action' },
  tertiary:  { default: '.clear', hover: '.clear', negative: '.clear', disabled: '.clear', ai: '.clear' },
};
const BTN_PADDING_SWIFT = { sm: ['PT.Scale.s2', 'PT.Scale.s4'], md: ['PT.Scale.s3', 'PT.Scale.s5'], lg: ['PT.Scale.s3', 'PT.Scale.s6'] };
const BTN_RADIUS_SWIFT  = { sm: 'PT.Scale.s1half', md: 'PT.Scale.s2', lg: 'PT.Scale.s2' };

// Android Compose token maps
const BTN_BG_COMPOSE = {
  primary:   { default: 'colors.surfaceAction', hover: 'colors.surfaceActionHover', negative: 'colors.surfaceNegative', disabled: 'colors.surfaceDisabled', ai: '/* gradient — see note */' },
  secondary: { default: 'colors.surfacePage', hover: 'colors.surfaceCardPrimary', negative: 'colors.surfacePage', disabled: 'colors.surfacePage', ai: 'colors.surfacePage' },
  tertiary:  { default: 'Color.Transparent', hover: 'Color.Transparent', negative: 'Color.Transparent', disabled: 'Color.Transparent', ai: 'Color.Transparent' },
};
const BTN_COLOR_COMPOSE = {
  primary:   { default: 'colors.typographyOnAction', hover: 'colors.typographyOnAction', negative: 'colors.typographyOnAction', disabled: 'colors.typographyOnDisabled', ai: 'colors.typographyOnAction' },
  secondary: { default: 'colors.typographyAction', hover: 'colors.typographyActionHover', negative: 'colors.typographyError', disabled: 'colors.typographyOnDisabled', ai: 'colors.typographyAction' },
  tertiary:  { default: 'colors.typographyAction', hover: 'colors.typographyActionHover', negative: 'colors.typographyError', disabled: 'colors.typographyDisabled', ai: 'colors.typographyAction' },
};
const BTN_BORDER_COMPOSE = {
  primary:   { default: 'colors.borderAction', hover: 'colors.borderActionHover', negative: 'colors.borderNegative', disabled: 'colors.borderDisabled', ai: 'MaterialTheme.ptColors.colorGreen400' },
  secondary: { default: 'colors.borderAction', hover: 'colors.borderActionHover', negative: 'colors.borderNegative', disabled: 'colors.borderDisabled', ai: 'colors.borderAction' },
  tertiary:  { default: 'Color.Transparent', hover: 'Color.Transparent', negative: 'Color.Transparent', disabled: 'Color.Transparent', ai: 'Color.Transparent' },
};
const BTN_PADDING_COMPOSE = { sm: ['PTDimens.s2', 'PTDimens.s4'], md: ['PTDimens.s3', 'PTDimens.s5'], lg: ['PTDimens.s3', 'PTDimens.s6'] };
const BTN_RADIUS_COMPOSE  = { sm: 'PTDimens.s1half', md: 'PTDimens.s2', lg: 'PTDimens.s2' };

function buildBtnWebSnippet(type, { size, state, icon }) {
  const bg     = BTN_BG[type][state];
  const color  = BTN_COLOR[type][state];
  const border = BTN_BORDER[type][state];
  const [pv, ph] = BTN_PADDING[size];
  const fs     = BTN_FONT[size];
  const radius = BTN_RADIUS[size];
  const dis    = state === 'disabled' ? '\ncursor: not-allowed;' : '';
  const iconPx   = ICON_SIZE[size] || 20;
  const iconNote = icon !== 'none' ? `\n/* tabler icon "${BTN_ICON_NAME}" (${iconPx}×${iconPx}px) — see Icons section */\n/* place ${icon === 'leading' ? 'before' : 'after'} label, stroke="currentColor" */` : '';
  return [
    `/* ${type[0].toUpperCase() + type.slice(1)} · ${state} · ${size} */`,
    `background: ${bg};`,
    `color: ${color};`,
    `border: 1px solid ${border};`,
    `padding: ${pv} ${ph};`,
    `font-size: ${fs};`,
    `border-radius: ${radius};`,
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
  const aiNote   = state === 'ai' ? '\n// AI gradient: use Box with Modifier.background(Brush.horizontalGradient(\n//   listOf(PT.Color.Green.c400, PT.Color.Teal.c500)))' : '';
  const borderLine = border === 'Color.Transparent' ? '' : `\n  border = BorderStroke(1.dp, ${border}),`;
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
buildSuperIconPlayground();
