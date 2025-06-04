// backend/controllers/orderController.js

const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

// 1) Listar TODAS las órdenes (para Admin)
async function listOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email') // Incluye nombre y email del usuario
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('listOrders error:', err);
    res.status(500).json({ message: 'Could not fetch orders.' });
  }
}

// 2) Listar solo las órdenes del usuario autenticado
async function listUserOrders(req, res) {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('listUserOrders error:', err);
    res.status(500).json({ message: 'Could not fetch your orders.' });
  }
}

// 3) Crear nueva orden (asocia userId)
async function createOrder(req, res) {
  try {
    const { item, details } = req.body;
    const userId = req.userId; // Viene del middleware protect()

    const trackingNumber = uuidv4().split('-')[0].toUpperCase();
    const order = await Order.create({ userId, item, details, trackingNumber });
    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Could not create order.' });
  }
}

// 4) Actualizar (editar) una orden
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.item !== undefined)    updateData.item = req.body.item;
    if (req.body.details !== undefined) updateData.details = req.body.details;
    if (req.body.status !== undefined)  updateData.status = req.body.status;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    console.error('updateOrder error:', err);
    res.status(500).json({ message: 'Could not update order.' });
  }
}

// 5) Eliminar (cancelar) una orden
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ message: 'Order canceled.' });
  } catch (err) {
    console.error('deleteOrder error:', err);
    res.status(500).json({ message: 'Could not delete order.' });
  }
}

module.exports = {
  listOrders,
  listUserOrders,
  createOrder,
  updateOrder,
  deleteOrder
};
