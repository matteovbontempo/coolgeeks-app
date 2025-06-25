// frontend/src/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    // 1) Si vengo con ?token=XYZ lo guardo en localStorage
    const params = new URLSearchParams(search);
    const tokenFromGoogle = params.get('token');
    if (tokenFromGoogle) {
      localStorage.setItem('token', tokenFromGoogle);

      // Quitar el ?token=XYZ de la URL
      navigate('/dashboard', { replace: true });
      return; // salimos aquí para que el siguiente efecto no corra con search todavía
    }

    // 2) Validar que ya tengamos un token, si no, vuelvo a /login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 3) Fetch del perfil
    axios
      .get('/api/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => {
        // Si algo falla, limpiar y volver a login
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [search, navigate]);

  return (
    <div className="dashboard-container">
      <div className="orders-card">
        <h2>Welcome to CoolGeeks, {user.name}!</h2>
        <p>
          Here at CoolGeeks we make it effortless to manage your tech life:
          book one-on-one appointments with our experts, place and track orders,
          and get real-time updates on your shipments — all from one spot.
        </p>
        <p>
          Tap the menu above (Orders, Appointments, Tracking) to get started.
          Enjoy!
        </p>
      </div>
    </div>
  );
}
