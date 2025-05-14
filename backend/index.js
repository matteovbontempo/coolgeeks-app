const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// In-memory orders store
const orders = [];

// Health-check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK' });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Place a new order
app.post('/api/orders', (req, res) => {
  const { item, quantity } = req.body;
  if (!item || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid item/quantity' });
  }
  const id = orders.length + 1;
  const newOrder = { id, item, quantity, status: 'pending' };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});