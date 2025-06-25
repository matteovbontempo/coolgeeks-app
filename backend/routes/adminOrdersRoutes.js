// backend/routes/adminOrdersRoutes.js

const express = require('express');
const router  = express.Router();

const {
  listOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

const { protectAdmin } = require('../middleware/adminMiddleware');

// GET /api/admin/orders  → lista TODAS las órdenes (para Admin)
router.get('/', protectAdmin, listOrders);

// PATCH /api/admin/orders/:id/status  → actualiza solo el estado
router.patch('/:id/status', protectAdmin, updateOrderStatus);

// DELETE /api/admin/orders/:id  → elimina una orden (admin)
router.delete('/:id', protectAdmin, deleteOrder);

module.exports = router;

