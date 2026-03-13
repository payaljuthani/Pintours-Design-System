/**
 * PinTours Design System — Token Reference · main.js
 * Builds the full token gallery: colors, semantic, typography, spacing, shadows.
 */

// Load the design token CSS variables via Vite's module resolution.
// Using an import (not a <link> tag) ensures Vite correctly resolves the path
// relative to this file, even though Vite's web root is the docs/ directory.
import '../build/web/variables.css';
import '../build/web/text-styles.css';

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
      `// regular: ${lSz}pt · ${weightValue} · lh ${lLh}`,
      `// compact: ${sSz}pt · ${weightValue} · lh ${sLh}`,
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
