import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from './assets/logo.png';
import './Login.css'; // Reutilizamos el CSS de Login

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const toastId = toast.loading('Sending reset link...');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset link sent!', { id: toastId });
      setMessage('If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).');
      setEmail('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMsg, { id: toastId });
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <img src={logo} alt="CoolGeeks Logo" className="logo" />
      <h2>Forgot Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
      
      {!message ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <p className="success-message">{message}</p>
      )}

      <div className="switch-auth" style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
} 