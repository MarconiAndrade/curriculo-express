const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const handleError = (res, err) => res.status(500).json({ error: err.message });

app.get('/api/profiles', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profiles');
    res.json(rows);
  } catch (err) { handleError(res, err); }
});

app.post('/api/profiles', async (req, res) => {
  const { name, title, summary, email } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO profiles (name, title, summary, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, title, summary, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) { handleError(res, err); }
});

app.put('/api/profiles/:id', async (req, res) => {
  const { name, title, summary, email } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE profiles SET name = $1, title = $2, summary = $3, email = $4 WHERE id = $5 RETURNING *',
      [name, title, summary, email, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { handleError(res, err); }
});

app.delete('/api/profiles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM profiles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Perfil deletado com sucesso' });
  } catch (err) { handleError(res, err); }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
}

module.exports = app;