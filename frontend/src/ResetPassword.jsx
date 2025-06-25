import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from './assets/logo.png';
import './Login.css'; // Reutilizamos el CSS de Login

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setMessage('');
    const toastId = toast.loading('Resetting password...');

    try {
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || 'Password has been reset successfully!', { id: toastId });
      setMessage('Your password has been updated. You can now log in with your new password.');
      setTimeout(() => navigate('/login'), 3000); // Redirige a login después de 3 seg
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred. The link may be invalid or expired.';
      toast.error(errorMsg, { id: toastId });
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <img src={logo} alt="CoolGeeks Logo" className="logo" />
      <h2>Reset Your Password</h2>
      <p>Enter your new password below.</p>
      
      {!message ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      ) : (
        <div>
          <p className="success-message">{message}</p>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </div>
  );
} 