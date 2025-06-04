// frontend/src/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // ← Importa los estilos de Dashboard

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });

  // fetch profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('/api/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
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
