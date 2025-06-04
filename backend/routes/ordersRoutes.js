// backend/routes/ordersRoutes.js

const express = require('express');
const router  = express.Router();

const {
  createOrder,
  listUserOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Todas estas rutas requieren autenticación (protect)

// POST   /api/orders        → crear orden del usuario logueado
router.post('/', protect, createOrder);

// GET    /api/orders        → listar solo las órdenes de este usuario
router.get('/', protect, listUserOrders);

// PATCH  /api/orders/:id    → editar un campo de la orden
router.patch('/:id', protect, updateOrder);

// DELETE /api/orders/:id    → cancelar (borrar) una orden
router.delete('/:id', protect, deleteOrder);

module.exports = router;
