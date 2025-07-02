/*
This sets up a reusable connection to your 
PostgreSQL database using your env.production config.
server/db.js
*/

const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({
  path: path.join(__dirname, 'env.production')
});

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

module.exports = pool; // ✅ pool must be defined before this