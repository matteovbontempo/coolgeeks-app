// frontend/src/Orders.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

export default function Orders() {
  const navigate = useNavigate();

  const [item, setItem]         = useState('RAM Upgrade');
  const [details, setDetails]   = useState('');
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [editingId, setEditingId] = useState(null);

  // Keep track of previous statuses so we can alert when they change
  const prevStatuses = useRef({}); // e.g. { orderId1: 'Pending', orderId2: 'Ready for Pickup', ... }

  // 1) Fetch all orders from the server
  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      const fresh = res.data;

      // Check if any order’s status changed since the last fetch
      fresh.forEach(o => {
        const prev = prevStatuses.current[o._id];
        if (prev && prev !== o.status) {
          // Notify the user with an alert (you can swap in a toast/notification component if you wish)
          alert(`Order ${o.trackingNumber} status changed to “${o.status}”`);
        }
        // Update our stored previous status
        prevStatuses.current[o._id] = o.status;
      });

      setOrders(fresh);
    } catch (err) {
      console.error('fetchOrders error:', err);
    }
  };

  // On mount, load orders and then refetch every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset the form back to “create new order”
  const resetForm = () => {
    setItem('RAM Upgrade');
    setDetails('');
    setEditingId(null);
    setError('');
  };

  // 2) Create or update: item/details only
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please add details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingId) {
        // Update existing order
        await axios.patch(`/api/orders/${editingId}`, { item, details });
      } else {
        // Create new order (status starts as “Pending” by default)
        await axios.post('/api/orders', { item, details });
      }
      resetForm();
      await fetchOrders();
    } catch (err) {
      console.error('handleSubmit error:', err);
      setError(editingId ? 'Could not update order.' : 'Could not create order.');
    } finally {
      setLoading(false);
    }
  };

  // 3) Load an order into the form for editing
  const handleEdit = (order) => {
    setItem(order.item);
    setDetails(order.details);
    setEditingId(order._id);
    setError('');
  };

  // 4) Delete (cancel) an order
  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await axios.delete(`/api/orders/${id}`);
      if (editingId === id) resetForm();
      await fetchOrders();
    } catch (err) {
      console.error('handleDelete error:', err);
      alert('Could not cancel order.');
    }
  };

  // 5) Change status (Pending → Ready for Pickup → Completed)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      console.error('handleStatusChange error:', err);
      alert('Could not update status.');
    }
  };

  return (
    <div className="orders-card">
      <h2>Your Orders</h2>

      <form className="orders-form" onSubmit={handleSubmit}>
        <select value={item} onChange={e => setItem(e.target.value)}>
          <option>RAM Upgrade</option>
          <option>SSD Installation</option>
          <option>Screen Repair</option>
          <option>New Peripherals</option>
        </select>

        <input
          type="text"
          placeholder="Details (model, notes…) *"
          value={details}
          onChange={e => setDetails(e.target.value)}
          disabled={loading}
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? (editingId ? 'Saving…' : 'Placing…')
            : (editingId ? 'Save' : 'Place Order')}
        </button>

        {editingId && (
          <button
            type="button"
            className="btn-cancel"
            onClick={resetForm}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="orders-error">{error}</p>}

      {orders.length > 0 && (
        <ul className="orders-list">
          {orders.map(o => (
            <li key={o._id}>
              <div className="order-main">
                <div className="order-info">
                  <strong>{o.item}</strong> — {o.details}
                  <br/>
                  <small>
                    Tracking #:&nbsp;
                    <button
                      className="link-button"
                      onClick={() => navigate(`/tracking?number=${o.trackingNumber}`)}
                    >
                      {o.trackingNumber}
                    </button>
                  </small>
                  <br/>

                  {/* Show and allow changing English‐only status */}
                  <label className="status-label">
                    Status:&nbsp;
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                </div>

                <div className="order-actions">
                  <button onClick={() => handleEdit(o)}>Edit</button>
                  <button onClick={() => handleDelete(o._id)}>Delete</button>
                </div>
              </div>
              <span className="order-date">
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
