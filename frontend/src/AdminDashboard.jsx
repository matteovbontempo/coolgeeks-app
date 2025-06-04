// frontend/src/AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Llamadas simultáneas a /api/admin/orders y /api/admin/appointments
    Promise.all([
      axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([ordersRes, apptsRes]) => {
        setOrders(ordersRes.data);
        setAppts(apptsRes.data);
      })
      .catch(err => {
        console.error('Admin fetch error:', err.response?.data || err.message);
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/dashboard');
        } else {
          setError(err.response?.data?.message || 'Error fetching admin data');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      {error && <p className="admin-error">{error}</p>}

      {/* ======= TABLA DE ÓRDENES ======= */}
      <section className="admin-section">
        <h3>All Orders</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User (Name / Email)</th>
              <th>Item</th>
              <th>Details</th>
              <th>Tracking #</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td>
                  {o.userId
                    ? `${o.userId.name} / ${o.userId.email}`
                    : '—'}
                </td>
                <td>{o.item}</td>
                <td>{o.details}</td>
                <td>{o.trackingNumber}</td>
                <td>{o.status}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ======= TABLA DE CITAS ======= */}
      <section className="admin-section">
        <h3>All Appointments</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Appt ID</th>
              <th>User ID</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Note</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {appts.map(a => (
              <tr key={a._id}>
                <td>{a._id}</td>
                <td>{a.userId}</td>
                <td>{a.service}</td>
                <td>{new Date(a.when).toLocaleString()}</td>
                <td>{a.note || '—'}</td>
                <td>{a.status}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {appts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
