// frontend/src/Orders.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaymentForm from './PaymentForm';
import './Orders.css';

// Initialize Stripe (Vite env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

export default function Orders() {
  const [item, setItem]               = useState('RAM Upgrade');
  const [details, setDetails]         = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  const [orders, setOrders]     = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList]     = useState('');

  // Carrito
  const [cart, setCart] = useState([]);
  const [pricing, setPricing] = useState({});
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    fetchOrders();
    fetchPricing();
  }, []);

  useEffect(() => {
    if (copied) {
      toast.success('Copied to clipboard!');
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  async function fetchOrders() {
    setLoadingList(true);
    setErrorList('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setErrorList(err.response?.data?.message || 'Could not load orders.');
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchPricing() {
    try {
      const res = await axios.get('/api/orders/pricing');
      setPricing(res.data);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }
  }

  function handleAddToCart(e) {
    e.preventDefault();
    if (!details.trim()) {
      toast.error('Please enter order details.');
      return;
    }
    const price = pricing[item] || pricing['Other'] || 0;
    setCart([...cart, { item, details, price }]);
    setDetails('');
  }

  function handleRemoveFromCart(idx) {
    setCart(cart.filter((_, i) => i !== idx));
  }

  function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  async function handleSubmitCart() {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setLoadingCreate(true);
    const toastId = toast.loading('Placing your order...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/orders',
        { items: cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed!', { id: toastId });
      setCart([]);
      await fetchOrders();
      
      // Show payment form for the new order
      setSelectedOrder(response.data);
      setShowPayment(true);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Could not place order.';
      toast.error(message, { id: toastId });
    } finally {
      setLoadingCreate(false);
    }
  }

  function handlePaymentSuccess(paymentIntent) {
    setShowPayment(false);
    setSelectedOrder(null);
    fetchOrders(); // Refresh orders to show updated payment status
    toast.success('Payment completed successfully!');
  }

  function handlePaymentCancel() {
    setShowPayment(false);
    setSelectedOrder(null);
  }

  const handleCashPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/orders/pay-cash',
        { orderId: selectedOrder._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Pedido registrado para pago en efectivo');
      handlePaymentSuccess();
    } catch (error) {
      toast.error('Error al registrar pago en efectivo');
    }
  };

  if (showPayment && selectedOrder) {
    return (
      <div>
        <div className="payment-method-selector" style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <button
            type="button"
            className={paymentMethod === 'card' ? 'method-btn selected' : 'method-btn'}
            onClick={() => setPaymentMethod('card')}
          >
            Card
          </button>
          <button
            type="button"
            className={paymentMethod === 'cash' ? 'method-btn selected' : 'method-btn'}
            onClick={() => setPaymentMethod('cash')}
          >
            Cash
          </button>
        </div>
        {paymentMethod === 'card' && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              order={selectedOrder}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </Elements>
        )}
        {paymentMethod === 'cash' && (
          <div style={{ textAlign: 'center' }}>
            <button
              className="btn-primary"
              style={{ marginTop: 24, minWidth: 200 }}
              onClick={handleCashPayment}
            >
              Confirm cash payment
            </button>
            <button
              className="btn-secondary"
              style={{ marginTop: 12, minWidth: 200 }}
              onClick={handlePaymentCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="orders-card">
      {/* Cart icon with counter */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 28, marginRight: 8 }}>🛒</span>
        <span style={{
          background: '#667eea',
          color: 'white',
          borderRadius: '50%',
          padding: '4px 10px',
          fontWeight: 'bold',
          fontSize: 16,
          minWidth: 28,
          textAlign: 'center'
        }}>
          {cart.length}
        </span>
      </div>
      <h2>Your Orders</h2>
      <form className="orders-form" onSubmit={handleAddToCart}>
        <select
          value={item}
          onChange={e => setItem(e.target.value)}
          disabled={loadingCreate}
        >
          <option value="Screen Repair">Screen Repair - ${pricing['Screen Repair'] || 0}</option>
          <option value="RAM Upgrade">RAM Upgrade - ${pricing['RAM Upgrade'] || 0}</option>
          <option value="Virus/Malware Removal">
            Virus / Malware Removal - ${pricing['Virus/Malware Removal'] || 0}
          </option>
          <option value="New Computer Install">
            New Computer Installation - ${pricing['New Computer Install'] || 0}
          </option>
          <option value="Other">Other Service - ${pricing['Other'] || 0}</option>
        </select>

        <input
          type="text"
          placeholder="Details (model, notes…) *"
          value={details}
          onChange={e => setDetails(e.target.value)}
          disabled={loadingCreate}
        />

        <button
          type="submit"
          className="btn-primary"
          disabled={loadingCreate}
        >
          Add to Cart
        </button>
      </form>

      {/* Improved Cart Section */}
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Your Cart</h3>
        {cart.length === 0 ? (
          <p style={{ color: '#888' }}>Cart is empty.</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cart.map((c, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: idx < cart.length - 1 ? '1px solid #ddd' : 'none'
                }}>
                  <span>
                    <strong>{c.item}</strong> — {c.details}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                      ${c.price || 0}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(idx)}
                      style={{
                        background: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 16px',
                        fontWeight: 'bold',
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        transition: 'background 0.2s',
                      }}
                      title="Remove from cart"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '2px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong style={{ fontSize: 18 }}>Total: ${calculateTotal()}</strong>
              <button
                onClick={handleSubmitCart}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Place Order & Pay
              </button>
            </div>
          </>
        )}
      </div>

      {loadingList ? (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Loading orders…</p>
        </div>
      ) : errorList ? (
        <p className="orders-error">{errorList}</p>
      ) : (
        <ul className="orders-list">
          {orders.map(o => (
            <li key={o._id} className="order-item">
              <div className="order-main">
                <div className="order-info">
                  <strong>Order Items:</strong>
                  <ul style={{ margin: '8px 0 8px 0', paddingLeft: 18 }}>
                    {o.items && o.items.map((prod, idx) => (
                      <li key={idx}>
                        <strong>{prod.item}</strong> — {prod.details}
                        {prod.price && <span style={{ color: '#667eea', fontWeight: 'bold' }}> - ${prod.price}</span>}
                      </li>
                    ))}
                  </ul>
                  {o.totalAmount && (
                    <div style={{ margin: '8px 0', padding: '8px', background: '#f0f8ff', borderRadius: 4 }}>
                      <strong>Total: ${o.totalAmount}</strong>
                      <span style={{ 
                        marginLeft: 12, 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12,
                        fontWeight: 'bold',
                        background: o.paymentStatus === 'paid' ? '#48bb78' : '#ed8936',
                        color: 'white'
                      }}>
                        {o.paymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
                      </span>
                    </div>
                  )}
                  <div className="tracking-section">
                    <small>Tracking #: {o.trackingNumber}</small>
                    <button
                      type="button"
                      className="copy-tracking-btn"
                      onClick={() => copyToClipboard(o.trackingNumber)}
                      title="Copy tracking number"
                    >
                      Copy
                    </button>
                  </div>
                  <br />
                  <span className="order-date">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                  <br />
                  <span className="status-label">Status: {o.status}</span>
                  
                  {/* Payment button for unpaid orders */}
                  {o.paymentStatus !== 'paid' && o.totalAmount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setShowPayment(true);
                      }}
                      style={{
                        marginTop: 8,
                        background: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
