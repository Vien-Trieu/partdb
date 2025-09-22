/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Sets up a reusable connection to Supabase using env.production config, patches global fetch, and exports the client.
*/

// === Module Imports =====================================================
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const https = require('https');
const fetch = require('node-fetch'); // ✅ v2.6.7 supports CommonJS

// === Environment Configuration =========================================
// Load environment variables from env.production
require('dotenv').config({
  path: path.join(__dirname, 'env.production')
});

// === Fetch Agent Patch =================================================
// Patch global fetch to use HTTPS agent ignoring unauthorized TLS
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
globalThis.fetch = (url, options = {}) =>
  fetch(url, { agent: httpsAgent, ...options });

// === Environment Verification ==========================================
// Log Supabase URL and anon key prefix for verification
console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('🔍 SUPABASE_ANON_KEY starts with:', process.env.SUPABASE_ANON_KEY.slice(0, 15));

// === Supabase Client Initialization ====================================
// Create Supabase client with URL and anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// === Initialization Confirmation ======================================
// Log that the Supabase client has been initialized
console.log('✅ Supabase client initialized');

// === Export ============================================================
module.exports = supabase;