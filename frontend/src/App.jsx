import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './Layout';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './Dashboard';
import Appointments from './Appointments';
import Orders from './Orders';
import Tracking from './Tracking';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        {/* Rutas públicas que NO usan el Layout principal */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rutas protegidas que SÍ usan el Layout principal */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="tracking/:id" element={<Tracking />} />
            <Route path="profile" element={<Profile />} />

            {/* Sub-ruta protegida para Administradores */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Redirección para cualquier ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
