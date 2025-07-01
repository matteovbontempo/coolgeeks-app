import React, { useState, useEffect } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PaymentForm.css';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function PaymentForm({ order, onPaymentSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    if (order && order._id) {
      createPaymentIntent();
    }
  }, [order]);

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/payments/create-payment-intent',
        { orderId: order._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Error setting up payment. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Processing payment...');

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed', { id: toastId });
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const token = localStorage.getItem('token');
        await axios.post(
          '/api/payments/confirm-payment',
          { paymentIntentId: paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Payment successful!', { id: toastId });
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div>No order selected for payment.</div>;
  }

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h2>Complete Payment</h2>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.item}</span>
                <span className="item-price">${item.price}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${order.totalAmount}</strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form" autoComplete="off">
        <div className="card-element-container">
          <label htmlFor="cardholder-name">Cardholder Name</label>
          <input
            id="cardholder-name"
            type="text"
            value={cardholderName}
            onChange={e => setCardholderName(e.target.value)}
            placeholder="Name on card"
            autoComplete="off"
            required
          />
        </div>
        <div className="card-element-container">
          <label htmlFor="card-number">Card Number</label>
          <CardNumberElement id="card-number" options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="card-element-row">
          <div className="card-element-container">
            <label htmlFor="card-expiry">Expiry</label>
            <CardExpiryElement id="card-expiry" options={CARD_ELEMENT_OPTIONS} />
          </div>
          <div className="card-element-container">
            <label htmlFor="card-cvc">CVC</label>
            <CardCvcElement id="card-cvc" options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="payment-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={!stripe || loading}
          >
            {loading ? 'Processing...' : `Pay $${order.totalAmount}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 