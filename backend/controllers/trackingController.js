// backend/controllers/trackingController.js

const Order = require('../models/Order');

async function getTracking(req, res) {
  try {
    const { number } = req.params;

    // Find the order by its trackingNumber (case‐insensitive assumption removed—
    // if you store them uppercase, you can also do: { trackingNumber: number.toUpperCase() })
    const order = await Order.findOne({ trackingNumber: number });
    if (!order) {
      return res.status(404).json({ message: 'Tracking number not found.' });
    }

    // Instead of faking a “shipment timeline,” we’ll return your order’s own `status`
    // (which can be 'Pending', 'Ready for Pickup', or 'Completed'), plus timestamps.

    return res.json({
      trackingNumber: order.trackingNumber,
      item: order.item,
      details: order.details,
      status: order.status,                // real status from the database
      createdAt: order.createdAt,          // when the order was placed
      updatedAt: order.updatedAt           // last time `status` (or any field) changed
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error looking up tracking.' });
  }
}

module.exports = { getTracking };
