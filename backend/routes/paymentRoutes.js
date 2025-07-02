const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Payment routes (require authentication)
router.post('/create-payment-intent', express.json(), protect, paymentController.createPaymentIntent);
router.post('/confirm-payment', express.json(), protect, paymentController.confirmPayment);

// Webhook route (no authentication required - Stripe handles security)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router; 