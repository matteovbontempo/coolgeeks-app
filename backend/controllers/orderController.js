// backend/controllers/orderController.js
const Order = require('../models/Order');
const { customAlphabet } = require('nanoid');
// generate 8 uppercase alphanumerics
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// — List all orders (admin)
async function listOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('userId','name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('listOrders error:', err);
    res.status(500).json({ message: 'Could not fetch orders.' });
  }
}

// — List only the current user’s orders
async function listUserOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('listUserOrders error:', err);
    res.status(500).json({ message: 'Could not fetch your orders.' });
  }
}

// — Create a new order
async function createOrder(req, res) {
  try {
    const { item, details } = req.body;
    if (!item || !details) {
      return res.status(400).json({ message: 'Item and details are required.' });
    }

    const trackingNumber = nanoid();
    const order = await Order.create({
      userId: req.userId,
      item,
      details,
      trackingNumber
    });

    // returns { ..., trackingNumber: "A1B2C3D4", ... }
    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Could not create order.' });
  }
}

// — Update an existing order (item/details/status)
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.item    !== undefined) updateData.item    = req.body.item;
    if (req.body.details !== undefined) updateData.details = req.body.details;
    if (req.body.status  !== undefined) updateData.status  = req.body.status;

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    console.error('updateOrder error:', err);
    res.status(500).json({ message: 'Could not update order.' });
  }
}

// — Delete (cancel) an order
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Order canceled.' });
  } catch (err) {
    console.error('deleteOrder error:', err);
    res.status(500).json({ message: 'Could not cancel order.' });
  }
}

// — Update only the status (admin)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated.', order });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ message: 'Could not update status.' });
  }
}

module.exports = {
  listOrders,
  listUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus
};
