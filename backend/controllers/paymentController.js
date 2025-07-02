const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment system not configured. Please add STRIPE_SECRET_KEY to environment variables.' });
    }

    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: order.currency,
      metadata: {
        orderId: order._id.toString(),
        userId: req.userId
      }
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment system not configured. Please add STRIPE_SECRET_KEY to environment variables.' });
    }

    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
      
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
        
        res.json({ 
          success: true, 
          message: 'Payment confirmed',
          order: order
        });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Payment system not configured. Please add STRIPE_WEBHOOK_SECRET to environment variables.' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        let order = await Order.findOne({ 
          stripePaymentIntentId: paymentIntent.id 
        }).populate('userId');
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
          console.log(`Order ${order._id} payment confirmed via webhook`);
          // Log before sending email
          console.log('About to send email to:', order.userId && order.userId.email);
          if (order.userId && order.userId.email) {
            await sendEmail({
              email: order.userId.email,
              subject: 'Your order has been paid!',
              text: `Thank you for your payment. Your order ${order._id} is confirmed and being processed.`,
              html: `<p>Thank you for your payment. Your order <b>${order._id}</b> is confirmed and being processed.</p>`
            });
            // Log after sending email
            console.log('Order payment email sent to:', order.userId.email);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrder = await Order.findOne({ 
          stripePaymentIntentId: failedPayment.id 
        });
        
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
          console.log(`Order ${failedOrder._id} payment failed via webhook`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}; 