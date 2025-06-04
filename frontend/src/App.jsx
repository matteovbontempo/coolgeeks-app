// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout         from './Layout';
import Dashboard      from './Dashboard';
import Orders         from './Orders';
import Appointments   from './Appointments';
import Tracking       from './Tracking';
import Login          from './Login';
import Signup         from './Signup';
import AdminDashboard from './AdminDashboard'; // (opcional si ya tienes AdminDashboard)

export default function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />}
      />

      <Route element={<Layout />}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/orders"       element={<Orders />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/tracking"     element={<Tracking />} />
        <Route path="/admin"        element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
