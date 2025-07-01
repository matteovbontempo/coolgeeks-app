# Payment Integration Setup Guide

## Stripe Configuration

### 1. Backend Environment Variables
Add these to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Frontend Environment Variables
Create a `frontend/.env` file with:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Backend API URL (for development)
REACT_APP_API_URL=http://localhost:4000
```

## Getting Your Stripe Keys

1. **Sign up for Stripe**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get your API keys**: 
   - Go to Dashboard → Developers → API keys
   - Copy your "Publishable key" (starts with `pk_test_`)
   - Copy your "Secret key" (starts with `sk_test_`)

## Setting Up Webhooks (Optional for Production)

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to your backend `.env`

## Testing the Payment System

### Test Card Numbers
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test CVC and Expiry
- **CVC**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)

## Service Pricing

The current pricing is set in `backend/controllers/orderController.js`:

```javascript
const SERVICE_PRICES = {
  'Screen Repair': 150,
  'RAM Upgrade': 80,
  'Virus/Malware Removal': 60,
  'New Computer Install': 100,
  'Other': 50
};
```

You can modify these prices as needed.

## Features Included

✅ **Secure Payment Processing** - Stripe Elements for PCI compliance
✅ **Real-time Payment Status** - Updates order status automatically
✅ **Payment History** - Track payment status in order list
✅ **Mobile Responsive** - Works on all devices
✅ **Error Handling** - Graceful error messages
✅ **Webhook Support** - Real-time payment confirmations

## Security Notes

- Never expose your Stripe secret key in frontend code
- Always use HTTPS in production
- Validate payment amounts on the backend
- Use webhooks for reliable payment status updates

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your Stripe keys are correct
2. **"Payment failed"**: Use test card numbers, not real ones
3. **"Cannot create payment intent"**: Ensure backend is running and connected to Stripe
4. **"Webhook errors"**: Check webhook URL and secret in production

### Development Tips:

- Use Stripe's test mode for development
- Check Stripe Dashboard for payment logs
- Use browser dev tools to debug API calls
- Test with different card scenarios 