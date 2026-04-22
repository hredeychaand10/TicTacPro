const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/players', require('./routes/players'));
app.use('/api/games',   require('./routes/games'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

const PORT = parseInt(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`TicTac Pro  →  http://localhost:${PORT}`);
  console.log(`Database    →  SQLite (tictacpro.db)`);
});
