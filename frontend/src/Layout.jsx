// frontend/src/Layout.jsx

import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Layout.css'; // ← Importa los estilos de la barra de navegación

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);   // { name, email, isAdmin }
  const [loading, setLoading] = useState(true);

  // Al montarse, obtenemos el perfil para saber si el usuario es admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('/api/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  return (
    <>
      <header className="navbar">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Home
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Orders
        </NavLink>
        <NavLink
          to="/appointments"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Appointments
        </NavLink>
        <NavLink
          to="/tracking"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Tracking
        </NavLink>

        {user?.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Admin
          </NavLink>
        )}

        <button className="nav-item logout" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </>
  );
}
