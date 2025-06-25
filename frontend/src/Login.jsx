import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import logo from './assets/logo.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Logging in...');

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Welcome back!', { id: toastId });
    } else {
      toast.error(result.message, { id: toastId });
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="auth-card">
      <img src={logo} alt="CoolGeeks Logo" className="logo" />
      <h2>Welcome back!</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <button onClick={handleGoogleLogin} className="btn btn-google">
        Continue with Google
      </button>

      <div className="auth-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <span className="link-separator">|</span>
        <Link to="/signup">Sign up here</Link>
      </div>
    </div>
  );
}