require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Faltan las credenciales de Supabase en el archivo .env');
  console.error('\x1b[33m%s\x1b[0m', 'Asegúrate de configurar SUPABASE_URL y SUPABASE_KEY en /backend/.env');
  process.exit(1);
}

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
        { 
          name: req.body.name, 
          price: parseFloat(req.body.price),
          category: req.body.category || 'Plato'
        }
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
        price: parseFloat(req.body.price),
        category: req.body.category
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

// --- SALES ROUTES (SUPABASE) ---

// Get all sales
app.get('/api/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new sale
app.post('/api/sales', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .insert([
        {
          items: req.body.items,
          subtotal: parseFloat(req.body.subtotal),
          togo_fee: parseFloat(req.body.togo_fee),
          total: parseFloat(req.body.total),
          payment_method: req.body.payment_method || 'Efectivo',
          amount_paid: parseFloat(req.body.amount_paid) || 0,
          change_given: parseFloat(req.body.change_given) || 0
        }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`CeviFlow Backend (Supabase) running on port ${PORT}`);
});
