// frontend/src/Orders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Orders.css';

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

  useEffect(() => {
    fetchOrders();
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
    setCart([...cart, { item, details }]);
    setDetails('');
  }

  function handleRemoveFromCart(idx) {
    setCart(cart.filter((_, i) => i !== idx));
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
      // Enviar todos los items del carrito como pedidos individuales
      for (const c of cart) {
        await axios.post(
          '/api/orders',
          { item: c.item, details: c.details },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success('All orders placed!', { id: toastId });
      setCart([]);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Could not place order.';
      toast.error(message, { id: toastId });
    } finally {
      setLoadingCreate(false);
    }
  }

  return (
    <div className="orders-card">
      <h2>Your Orders</h2>

      <form className="orders-form" onSubmit={handleAddToCart}>
        <select
          value={item}
          onChange={e => setItem(e.target.value)}
          disabled={loadingCreate}
        >
          <option value="Screen Repair">Screen Repair</option>
          <option value="RAM Upgrade">RAM Upgrade</option>
          <option value="Virus/Malware Removal">
            Virus / Malware Removal
          </option>
          <option value="New Computer Install">
            New Computer Installation
          </option>
          <option value="Other">Other Service</option>
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

      {/* Carrito */}
      {cart.length > 0 && (
        <div className="cart-section">
          <h3>Your Cart</h3>
          <ul className="cart-list">
            {cart.map((c, idx) => (
              <li key={idx} className="cart-item">
                <span><strong>{c.item}</strong> — {c.details}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleRemoveFromCart(idx)}
                  style={{ marginLeft: 8 }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            className="btn-primary"
            onClick={handleSubmitCart}
            disabled={loadingCreate}
            style={{ marginTop: 8 }}
          >
            Confirm Order ({cart.length})
          </button>
        </div>
      )}

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
                  <strong>{o.item}</strong> — {o.details}
                  <br />
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
