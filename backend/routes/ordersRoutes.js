// backend/routes/ordersRoutes.js
const router = require('express').Router();
const {
  listUserOrders,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(listUserOrders)
  .post(createOrder);

router
  .route('/:id')
  .patch(updateOrder)
  .delete(deleteOrder);

module.exports = router;
