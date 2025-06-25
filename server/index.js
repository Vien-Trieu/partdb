const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const pool = require('./db');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Example route to test connection
app.get('/test-db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Database connection error:', err);  // Add this
      res.status(500).send('Database error');
    }
  });

  app.get('/parts', async (req, res) => {
    const { name, number, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      let baseQuery = '';
      let countQuery = '';
      let values = [];
      let countValues = [];
  
      if (name) {
        baseQuery = 'SELECT * FROM parts WHERE LOWER(name) LIKE LOWER($1) LIMIT $2 OFFSET $3';
        countQuery = 'SELECT COUNT(*) FROM parts WHERE LOWER(name) LIKE LOWER($1)';
        values = [`%${name}%`, limit, offset];
        countValues = [`%${name}%`];
      } else if (number) {
        baseQuery = 'SELECT * FROM parts WHERE part_number = $1 LIMIT $2 OFFSET $3';
        countQuery = 'SELECT COUNT(*) FROM parts WHERE part_number = $1';
        values = [number, limit, offset];
        countValues = [number];
      } else {
        return res.status(400).json({ error: 'Please provide a name or number query parameter' });
      }
  
      const result = await pool.query(baseQuery, values);
      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count, 10);
  
      res.json({ results: result.rows, total });
    } catch (err) {
      console.error('Error fetching parts:', err);
      res.status(500).send('Internal server error');
    }
  });

app.post('/parts', async (req, res) => {
  const { name, part_number, location } = req.body;

  if (!name || !part_number || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO parts (name, part_number, location) VALUES ($1, $2, $3) RETURNING *',
      [name, part_number, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting part:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/parts/:id', async (req, res) => {
  const { name, part_number, location } = req.body;
  const { id } = req.params;

  if (!name || !part_number || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE parts SET name = $1, part_number = $2, location = $3 WHERE id = $4 RETURNING *',
      [name, part_number, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating part:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});