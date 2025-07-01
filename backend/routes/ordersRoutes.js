// backend/routes/ordersRoutes.js
const router = require('express').Router();
const {
  listUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getServicePricing,
  payCash
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Get service pricing (no auth required)
router.get('/pricing', getServicePricing);

router.use(protect);

router
  .route('/')
  .get(listUserOrders)
  .post(createOrder);

router
  .route('/:id')
  .patch(updateOrder)
  .delete(deleteOrder);

router.post('/pay-cash', payCash);

module.exports = router;
