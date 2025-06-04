// backend/routes/adminOrdersRoutes.js

const express = require('express');
const router  = express.Router();

const { listOrders } = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// GET /api/admin/orders  → lista TODAS las órdenes (para Admin)
router.get('/', protectAdmin, listOrders);

module.exports = router;
