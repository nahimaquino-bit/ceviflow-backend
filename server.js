const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// In production (Railway), store db.json in a writable temp path
// In development, store next to server.js
const DB_FILE = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'db.json')
  : path.join(__dirname, 'db.json');

// Seed db.json if it doesn't exist (first run on Railway)
const SEED_DATA = { dishes: [], sales: [] };
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2));
}

app.use(cors());
app.use(bodyParser.json());

// Helper to read DB
const readDB = () => {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- DISHES ROUTES ---

// Get all dishes
app.get('/api/dishes', (req, res) => {
  try {
    const db = readDB();
    res.json(db.dishes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// Add a new dish
app.post('/api/dishes', (req, res) => {
  try {
    const db = readDB();
    const newDish = {
      id: Date.now(),
      name: req.body.name,
      price: parseFloat(req.body.price)
    };
    db.dishes.push(newDish);
    writeDB(db);
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save dish' });
  }
});

// Update a dish
app.put('/api/dishes/:id', (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id);
    const index = db.dishes.findIndex(d => d.id === id);

    if (index !== -1) {
      db.dishes[index] = {
        ...db.dishes[index],
        name: req.body.name || db.dishes[index].name,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : db.dishes[index].price
      };
      writeDB(db);
      res.json(db.dishes[index]);
    } else {
      res.status(404).json({ error: 'Dish not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

// Delete a dish
app.delete('/api/dishes/:id', (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id);
    db.dishes = db.dishes.filter(d => d.id !== id);
    writeDB(db);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`CeviFlow Backend running on port ${PORT}`);
});
