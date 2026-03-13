#!/usr/bin/env node
'use strict';

/**
 * Determinism guard — hashes build/ and compares to a stored snapshot.
 *
 * Usage:
 *   node scripts/diff-check.js           — check (used in CI)
 *   node scripts/diff-check.js --write   — store current hash (run after build)
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const BUILD_DIR  = path.resolve(__dirname, '../build');
const HASH_FILE  = path.resolve(__dirname, '../.build-hash');

function hashBuildDir(dir) {
  const h = crypto.createHash('sha256');

  function walk(d) {
    if (!fs.existsSync(d)) return;
    const entries = fs.readdirSync(d, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else {
        // Hash file path (relative) + contents for stability
        h.update(path.relative(BUILD_DIR, full));
        h.update(fs.readFileSync(full));
      }
    }
  }

  walk(dir);
  return h.digest('hex');
}

const currentHash = hashBuildDir(BUILD_DIR);

// --write: store hash after a successful build
if (process.argv.includes('--write')) {
  fs.writeFileSync(HASH_FILE, currentHash + '\n', 'utf-8');
  console.log(`  ✓ Build hash stored (${currentHash.slice(0, 12)}…)`);
  process.exit(0);
}

// CI check: compare against stored hash
if (!fs.existsSync(HASH_FILE)) {
  console.warn('\n  ⚠  No .build-hash found. Run "npm run build" and commit build/ + .build-hash.\n');
  process.exit(0); // non-fatal on first run
}

const storedHash = fs.readFileSync(HASH_FILE, 'utf-8').trim();
if (currentHash !== storedHash) {
  console.error('\n  ✗  Build outputs are stale — tokens.json was updated but build/ was not regenerated.');
  console.error('     Run "npm run build" and commit the changes.\n');
  process.exit(1);
}

console.log(`  ✓ Build outputs are up to date (${currentHash.slice(0, 12)}…)`);
