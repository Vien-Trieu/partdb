/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Express server setup with Supabase integration, providing health-check, CRUD endpoints for parts, and error handling.
*/

/* === Module Imports ===================================================== */
const path = require('path');
const express = require('express');
const cors = require('cors');
const supabase = require('./db');

/* === Environment Configuration ========================================= */
console.log('✅ Manually setting .env values');
SUPABASE_URL='https://usgdhmzuqkfuauytbwdw.supabase.co';
SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
// require('dotenv').config({
//   path: path.join(__dirname, 'env.production')
// });

// Optional: uncomment if you get TLS certificate errors during development
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

/* === App Initialization ================================================= */
const app = express();
app.use(cors());
app.use(express.json());

/* === Server Port ======================================================== */
const PORT = process.env.PORT || 3001;

/* === Routes: Health Check =============================================== */
// Health check endpoint to verify Supabase connectivity
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('parts').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase fetch error:', error);
      return res.status(500).json({ error: 'Supabase unreachable', details: error });
    }
    res.json({ message: '✅ Supabase connected!', data });
  } catch (err) {
    console.error('🔥 Unexpected error in /test-supabase:', err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

/* === Routes: Parts CRUD with Pagination ================================= */
// Search parts by name or number, with pagination
app.get('/parts', async (req, res) => {
  const { name, number } = req.query;
  let { page = '1', limit = '5' } = req.query;
  if (!name && !number) {
    return res.status(400).json({ error: 'Please provide a name or number query parameter' });
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;
  let queryBuilder = supabase.from('parts').select('*', { count: 'exact' });
  if (name) {
    queryBuilder = queryBuilder.ilike('name', `%${name}%`);
  } else {
    queryBuilder = queryBuilder.eq('part_number', number);
  }
  queryBuilder = queryBuilder.order('id', { ascending: false }).range(offset, offset + limitNum - 1);
  const { data, error, count } = await queryBuilder;
  if (error) {
    console.error('❌ Error fetching parts from Supabase:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
  const totalPages = Math.ceil((count || 0) / limitNum);
  return res.json({ results: data, totalPages });
});

// Add a new part
app.post('/parts', async (req, res) => {
  const { name, part_number, location } = req.body;
  console.log('🚀 POST /parts received', req.body);
  if (!name || !part_number || !location) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const { data, error } = await supabase.from('parts').insert([{ name, part_number, location }]).select();
    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error });
    }
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

// Update an existing part
app.put('/parts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, part_number, location } = req.body;
  console.log('➡️ Updating ID:', id, 'with', req.body);
  if (!name || !part_number || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const { data, error } = await supabase.from('parts').update({ name, part_number, location }).eq('id', id).select();
  if (error) {
    console.error('❌ Error updating part:', error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data[0]);
});

// Delete a part
app.delete('/parts/:id', async (req, res) => {
  const { id } = req.params;
  console.log('➡️ Deleting ID:', id);
  const { data, error } = await supabase.from('parts').delete().eq('id', id).select();
  if (error) {
    console.error('❌ Error deleting part:', error);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Part not found' });
  }
  return res.sendStatus(204);
});

/* === Routes: Miscellaneous ============================================= */
// Hello test endpoint
app.get('/api/hello', (req, res) => {
  res.send({ message: 'Backend is working!' });
});

// Debug connection endpoint
app.get('/debug-connection', async (req, res) => {
  try {
    const { data, error } = await supabase.from('parts').select('*').limit(1);
    if (error) throw error;
    res.json({ message: '✅ Supabase connected', data });
  } catch (err) {
    console.error('🚨 Supabase debug error:', err);
    res.status(500).json({ error: 'Supabase fetch failed', details: err.message });
  }
});

/* === Server Startup ==================================================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* === Global Error Handlers ============================================= */
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});
