import React, { useState }   from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios                  from 'axios';
import logo                   from './assets/logo.png';  // your logo
import './Login.css';                              // your existing styles

export default function Login() {
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [error,   setError]   = useState('');
  const navigate              = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-card">
      <img src={logo} alt="CoolGeeks" className="logo" />
      <h2>Welcome to CoolGeeks</h2>

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
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Log In
        </button>
      </form>

      <div className="social-buttons">
        <a href="/api/auth/google" className="btn btn-google">
          Continue with Google
        </a>
        <a href="/api/auth/apple" className="btn btn-apple">
          Continue with Apple
        </a>
      </div>

      <p className="switch-auth">
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}
