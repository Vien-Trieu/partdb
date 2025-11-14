/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Sets up a reusable connection to Supabase using env.production config, patches global fetch, and exports the client.
*/

/* server/db.js
   Robust Supabase client for both dev and packaged exe (pkg).
   Keeps TLS bypass per your requirement.
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Statically require node-fetch v2 so packagers include it.
// Make sure package.json depends on "node-fetch": "2.6.7"
const fetch = require('node-fetch');

for (const k of ['SUPABASE_URL', 'SUPABASE_ANON_KEY']) {
  if (process.env[k]) {
    process.env[k] = process.env[k].replace(/^\uFEFF/, '').trim();
  }
}

// Helper: read a file safely, supporting pkg snapshot (__dirname inside snapshot)
function readFileIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  } catch (e) {
    return null;
  }
}

// Detect if running inside a pkg snapshot
const isPackaged = typeof process.pkg !== 'undefined';
if (isPackaged) {
  console.log('📦 Running inside packaged executable (pkg mode detected).');
} else {
  console.log('🧰 Running in normal (unpackaged) mode.');
}

// Attempt to load env.production:
// - If packaged, try to read from snapshot (relative to __dirname).
// - Otherwise, read from project directory.
// We also accept an env override (process.env.SUPABASE_URL etc.)
function loadDotEnvFromPossibleLocations() {
  const candidates = [];
  // If packaged, __dirname points inside snapshot where we included asset paths,
  // so try to load relative to __dirname first.
  candidates.push(path.join(__dirname, 'env.production'));

  // Also try executable sibling location (if you packaged but placed env.production next to exe)
  if (process.execPath) {
    candidates.push(path.join(path.dirname(process.execPath), 'env.production'));
  }

  // Also try project-root style (useful in dev)
  candidates.push(path.join(process.cwd(), 'server', 'env.production'));
  candidates.push(path.join(process.cwd(), 'env.production'));

  for (const candidate of candidates) {
    const txt = readFileIfExists(candidate);
    if (txt) {
      console.log('📥 Loaded env.production from', candidate);
      // strip BOM if present
      const cleaned = txt.charCodeAt(0) === 0xFEFF ? txt.slice(1) : txt;
      return cleaned;
    }
  }
  console.warn('⚠️ No env.production found in snapshot or filesystem; falling back to process.env values.');
  return null;
}

// Parse dotenv-style content into process.env (simple parser)
function applyDotEnvContent(content) {
  if (!content) return;
  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.substring(0, eq).trim();
    let val = line.substring(eq + 1).trim();
    // remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

// Try to load env.production content and apply it
const envContent = loadDotEnvFromPossibleLocations();
applyDotEnvContent(envContent);

// Make sure keys are present (may still be in process.env from build-time)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY are missing from env. They must be present for Supabase to work.');
}

// === TLS bypass (per your instruction) ===
// Force global OpenSSL skip (same effect as NODE_TLS_REJECT_UNAUTHORIZED=0)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
console.log('⚠️ NODE_TLS_REJECT_UNAUTHORIZED =', process.env.NODE_TLS_REJECT_UNAUTHORIZED);

// Create an https.Agent that also disables verification (per-agent bypass)
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

// Build a fetch wrapper that always passes our https agent (node-fetch v2 supports agent)
const safeFetch = (url, opts = {}) => {
  // node-fetch v2 wants 'agent' and accepts it.
  const merged = Object.assign({}, opts, { agent: httpsAgent });
  return fetch(url, merged);
};

// Create the Supabase client using safeFetch
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: safeFetch },
  auth: { persistSession: false },
});

console.log('✅ Supabase client initialized (TLS bypass mode).');

module.exports = supabase;
