import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminActionError, setAdminActionError] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [apptDateFilter, setApptDateFilter] = useState('all');
  const [hoveredNote, setHoveredNote] = useState(null);
  const [modalNote, setModalNote] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      axios.get('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([ordersRes, apptsRes]) => {
        setOrders(ordersRes.data);
        setAppts(apptsRes.data);
      })
      .catch(err => {
        console.error('Admin fetch error:', err.response?.data || err.message);
        if ([401, 403].includes(err.response?.status)) {
          navigate('/dashboard');
        } else {
          setError(err.response?.data?.message || 'Error fetching admin data');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
      setAdminActionError('');
    } catch (err) {
      console.error('Failed to update order status:', err.response?.data || err.message);
      setAdminActionError('Failed to update order status');
    }
  };

  const updateApptStatus = async (apptId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/admin/appointments/${apptId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppts(prev => prev.map(a => (a._id === apptId ? { ...a, status: newStatus } : a)));
      setAdminActionError('');
    } catch (err) {
      console.error('Failed to update appointment status:', err.response?.data || err.message);
      setAdminActionError('Failed to update appointment status');
    }
  };

  // Eliminar orden
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setAdminActionError('');
    } catch (err) {
      console.error('Failed to delete order:', err.response?.data || err.message);
      setAdminActionError('Failed to delete order');
    }
  };

  // Eliminar cita
  const deleteAppt = async (apptId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/appointments/${apptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppts(prev => prev.filter(a => a._id !== apptId));
      setAdminActionError('');
    } catch (err) {
      console.error('Failed to delete appointment:', err.response?.data || err.message);
      setAdminActionError('Failed to delete appointment');
    }
  };

  function filterOrdersByDate(order) {
    const now = new Date();
    const created = new Date(order.createdAt);
    switch (orderDateFilter) {
      case 'today':
        return created.toDateString() === now.toDateString();
      case 'this_week': {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        return created >= firstDay && created <= lastDay;
      }
      case 'this_month':
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
      }
      default:
        return true;
    }
  }

  function filterApptsByDate(appt) {
    const now = new Date();
    const created = new Date(appt.createdAt);
    switch (apptDateFilter) {
      case 'today':
        return created.toDateString() === now.toDateString();
      case 'this_week': {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        return created >= firstDay && created <= lastDay;
      }
      case 'this_month':
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
      }
      default:
        return true;
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  return (
    <div
      className="page"
      style={{
        margin: 0,
        padding: '1rem',
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box',
        background: '#fff'
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Admin Dashboard</h2>
      {error && <p className="admin-error">{error}</p>}
      {adminActionError && <p className="admin-error">{adminActionError}</p>}

      <section className="admin-section">
        <h3>All Orders</h3>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="order-date-filter" style={{ marginRight: 8 }}>Filter by date:</label>
          <select
            id="order-date-filter"
            value={orderDateFilter}
            onChange={e => setOrderDateFilter(e.target.value)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 4 }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="last_month">Last month</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User (Name / Email)</th>
                <th>Item</th>
                <th>Details</th>
                <th style={{ maxWidth: 250, minWidth: 120 }}>Note</th>
                <th>Tracking #</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter(filterOrdersByDate).map(o => (
                <tr key={o._id}>
                  <td>{o._id}</td>
                  <td>{o.userId ? `${o.userId.name} / ${o.userId.email}` : '—'}</td>
                  <td>{o.item}</td>
                  <td>{o.details}</td>
                  <td
                    style={{
                      maxWidth: 250,
                      minWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      padding: '4px 8px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {o.note && o.note.length > 0 ? (
                      <>
                        {o.note.length > 30 ? (
                          <>
                            {o.note.slice(0, 30)}…
                            <span
                              style={{ cursor: 'pointer', marginLeft: 8, color: '#667eea', fontSize: 18 }}
                              title="Ver nota completa"
                              onClick={() => setModalNote(o.note)}
                            >
                              👁️
                            </span>
                          </>
                        ) : (
                          o.note
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td>{o.trackingNumber}</td>
                  <td>{o.status}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      style={{ color: '#fff', background: '#e53e3e', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer', minWidth: 60 }}
                      onClick={() => deleteOrder(o._id)}
                      title="Delete order"
                    >
                      Delete
                    </button>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h3>All Appointments</h3>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="appt-date-filter" style={{ marginRight: 8 }}>Filter by date:</label>
          <select
            id="appt-date-filter"
            value={apptDateFilter}
            onChange={e => setApptDateFilter(e.target.value)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 4 }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="last_month">Last month</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>User ID</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Note</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {appts.filter(filterApptsByDate).map(a => (
                <tr key={a._id}>
                  <td>{a._id}</td>
                  <td>{a.userId}</td>
                  <td>{a.service}</td>
                  <td>{new Date(a.when).toLocaleString()}</td>
                  <td>{a.note || '—'}</td>
                  <td>{a.status}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={e => updateApptStatus(a._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      style={{ marginLeft: 8, color: '#fff', background: '#e53e3e', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}
                      onClick={() => deleteAppt(a._id)}
                      title="Delete appointment"
                    >
                      Delete
                    </button>
                  </td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal for full note */}
      {modalNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onClick={() => setModalNote(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '32px 28px',
              minWidth: 320,
              maxWidth: 500,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              position: 'relative',
              fontSize: 17,
              color: '#222',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModalNote(null)}
              style={{
                position: 'absolute',
                top: 10,
                right: 14,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#888',
                cursor: 'pointer'
              }}
              title="Cerrar"
            >
              ×
            </button>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 18 }}>Full Note</div>
            <div>{modalNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}