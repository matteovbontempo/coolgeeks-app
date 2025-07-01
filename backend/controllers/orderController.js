// backend/controllers/orderController.js
const Order = require('../models/Order');
const { customAlphabet } = require('nanoid');
// generate 8 uppercase alphanumerics
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Service pricing
const SERVICE_PRICES = {
  'Screen Repair': 150,
  'RAM Upgrade': 80,
  'Virus/Malware Removal': 60,
  'New Computer Install': 100,
  'Other': 50
};

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

// — List only the current user's orders
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
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required.' });
    }
    
    // Validate items and add pricing
    const itemsWithPricing = items.map(item => {
      if (!item.item || !item.details) {
        throw new Error('Each item must have item and details.');
      }
      
      const price = SERVICE_PRICES[item.item] || SERVICE_PRICES['Other'];
      return {
        ...item,
        price
      };
    });

    // Calculate total amount
    const totalAmount = itemsWithPricing.reduce((sum, item) => sum + item.price, 0);
    
    const trackingNumber = nanoid();
    const order = await Order.create({
      userId: req.userId,
      items: itemsWithPricing,
      totalAmount,
      trackingNumber
    });
    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Could not create order.' });
  }
}

// — Get service pricing
async function getServicePricing(req, res) {
  try {
    res.json(SERVICE_PRICES);
  } catch (err) {
    console.error('getServicePricing error:', err);
    res.status(500).json({ message: 'Could not fetch pricing.' });
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

// — Mark order as cash payment
async function payCash(req, res) {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.paymentMethod = 'cash';
  order.paymentStatus = 'cash_pending';
  await order.save();

  res.json({ message: 'Order marked for cash payment' });
}

module.exports = {
  listOrders,
  listUserOrders,
  createOrder,
  getServicePricing,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  payCash
};
