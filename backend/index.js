// backend/index.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// In-memory stores
const orders = [];
const appointments = [];

// Health-check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK' });
});

//
// ORDERS
//
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

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

//
// APPOINTMENTS
//
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
  const { client, datetime } = req.body;
  if (!client || !datetime) {
    return res.status(400).json({ error: 'Missing client or datetime' });
  }
  const id = appointments.length + 1;
  const newAppt = { id, client, datetime, status: 'scheduled' };
  appointments.push(newAppt);
  res.status(201).json(newAppt);
});

//
// TRACKING
//
app.get('/api/orders/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ id: order.id, status: order.status });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
