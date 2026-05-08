#!/usr/bin/env node
'use strict';

/**
 * PinTours token validation
 * Run: npm run validate
 *
 * Checks:
 *  1. Key naming convention (lowercase, no units in names)
 *  2. Reference resolution (no broken {refs})
 *  3. Circular reference detection
 *  4. Semantic category coverage
 *  5. Dark-mode coverage report
 *  6. Semantic file — no raw hex values (primitive leak detection)
 */

const fs   = require('fs');
const path = require('path');

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
  fs.readFileSync(path.resolve(__dirname, '../tokens/primitives.json'), 'utf-8')
);
const raw = deepMerge(
  primTokens,
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../tokens/semantic.json'), 'utf-8'))
);

const errors   = [];
const warnings = [];

// ── Flatten tokens into { 'dot.path': tokenObject } ─────────────────────────
function flatten(obj, parts = [], result = {}) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;          // skip $metadata etc.
    const next = [...parts, key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('value' in val) {
        result[next.join('.')] = val;
      } else {
        flatten(val, next, result);
      }
    }
  }
  return result;
}

const flat    = flatten(raw);
const allKeys = new Set(Object.keys(flat));

// ── 1. Key naming ────────────────────────────────────────────────────────────
// Rules: lowercase letters, digits, underscores, hyphens — no unit suffixes
const VALID_KEY   = /^[a-z0-9_-]+$/;
const UNIT_SUFFIX = /(px|rem|em|sp|dp|pt)$/i;

for (const dotPath of allKeys) {
  for (const seg of dotPath.split('.')) {
    if (!VALID_KEY.test(seg)) {
      errors.push(`NAMING  "${dotPath}" — segment "${seg}" must be lowercase alphanumeric / underscore / hyphen`);
    }
    if (UNIT_SUFFIX.test(seg)) {
      errors.push(`NAMING  "${dotPath}" — segment "${seg}" must not contain a unit suffix`);
    }
  }
}

// ── 2. Reference resolution ──────────────────────────────────────────────────
const REF_RE = /\{([^}]+)\}/g;

function extractRefs(value) {
  // Recursively collect only the string leaves — avoids matching JSON braces
  function strings(v) {
    if (typeof v === 'string') return [v];
    if (Array.isArray(v))      return v.flatMap(strings);
    if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
    return [];
  }
  return strings(value).flatMap(s => [...s.matchAll(REF_RE)].map(m => m[1]));
}

for (const [dotPath, token] of Object.entries(flat)) {
  for (const ref of extractRefs(token.value)) {
    if (!allKeys.has(ref)) {
      errors.push(`BROKEN REF  "${dotPath}" references {${ref}} which does not exist`);
    }
  }
}

// ── 3. Circular reference detection ─────────────────────────────────────────
function detectCycle(start, visited = new Set(), stack = []) {
  if (stack.includes(start)) {
    const loopStart = stack.indexOf(start);
    return [...stack.slice(loopStart), start];
  }
  if (visited.has(start)) return null;
  visited.add(start);
  const token = flat[start];
  if (!token) return null;
  for (const ref of extractRefs(token.value)) {
    const cycle = detectCycle(ref, visited, [...stack, start]);
    if (cycle) return cycle;
  }
  return null;
}

const seenCycles = new Set();
for (const dotPath of allKeys) {
  const cycle = detectCycle(dotPath);
  if (cycle) {
    const sig = cycle.slice().sort().join('|');
    if (!seenCycles.has(sig)) {
      seenCycles.add(sig);
      errors.push(`CIRCULAR REF  ${cycle.join(' → ')}`);
    }
  }
}

// ── 4. Semantic category coverage ────────────────────────────────────────────
const EXPECTED_SEMANTIC = ['typography', 'icon', 'surface', 'border', 'shadow'];
const foundSemantic = new Set(
  Object.keys(flat)
    .filter(k => k.startsWith('semantic.'))
    .map(k => k.split('.')[1])
);
for (const cat of EXPECTED_SEMANTIC) {
  if (!foundSemantic.has(cat)) {
    warnings.push(`COVERAGE  Expected semantic category "semantic.${cat}" not found`);
  }
}

// ── 5. Dark mode coverage ────────────────────────────────────────────────────
const lightTokens   = Object.keys(flat).filter(k => k.includes('.light.'));
const darkTokenSet  = new Set(Object.keys(flat).filter(k => k.includes('.dark.')));
const missingDark   = [];

for (const lp of lightTokens) {
  const dp = lp.replace('.light.', '.dark.');
  if (!darkTokenSet.has(dp)) {
    missingDark.push(lp);
    warnings.push(`DARK MODE  No dark value for: ${lp}`);
  }
}

const covered  = lightTokens.length - missingDark.length;
const coverage = lightTokens.length
  ? Math.round((covered / lightTokens.length) * 100)
  : 100;

// ── 6. Semantic file — no raw hex values ─────────────────────────────────────
// rgba() values are exempt (opacity variants that can't be expressed as refs).
const HEX_RE  = /^#[0-9a-fA-F]{3,8}$/;
const RGBA_RE = /^rgba?\(/i;

for (const [dotPath, token] of Object.entries(flat)) {
  if (!dotPath.startsWith('semantic.')) continue;
  const val = typeof token.value === 'string' ? token.value.trim() : null;
  if (val && HEX_RE.test(val) && !RGBA_RE.test(val)) {
    errors.push(`PRIMITIVE LEAK  "${dotPath}" has raw hex "${val}" — use a {color.*} reference`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const DIVIDER = '─'.repeat(60);
console.log(`\n${DIVIDER}`);
console.log('  PinTours Token Validation Report');
console.log(DIVIDER);
console.log(`  Total tokens  : ${allKeys.size}`);
console.log(`  Dark coverage : ${covered}/${lightTokens.length} semantic tokens (${coverage}%)`);
console.log(DIVIDER);

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s) — build will be blocked:\n`);
  errors.forEach(e => console.error(`  • ${e}`));
} else {
  console.log('\n✓ No errors');
}

if (warnings.length) {
  console.warn(`\n⚠  ${warnings.length} warning(s):\n`);
  warnings.forEach(w => console.warn(`  • ${w}`));
}

console.log(`\n${DIVIDER}\n`);

if (errors.length > 0) process.exit(1);
