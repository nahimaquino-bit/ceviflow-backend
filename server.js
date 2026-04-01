const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(bodyParser.json());

// --- DISHES ROUTES (SUPABASE) ---

// Get all dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new dish
app.post('/api/dishes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dishes')
      .insert([
        { name: req.body.name, price: parseFloat(req.body.price) }
      ])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a dish
app.put('/api/dishes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from('dishes')
      .update({
        name: req.body.name,
        price: parseFloat(req.body.price)
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a dish
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`CeviFlow Backend (Supabase) running on port ${PORT}`);
});
