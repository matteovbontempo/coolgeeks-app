import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tracking.css';
import { toast } from 'react-hot-toast';

export default function Tracking() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [number, setNumber] = useState(paramId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // This useEffect now only runs once to fetch data if the page is loaded directly with a URL param
  useEffect(() => {
    if (paramId && !result) { // Fetch only if there isn't already a result
      handleSubmit(null, paramId);
    }
  }, [paramId]);

  const handleSubmit = async (e, directNumber) => {
    if (e) e.preventDefault();
    
    const trackingNumber = (directNumber || number).trim();
    if (!trackingNumber) {
      setError('Please enter a tracking number.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    navigate(`/tracking/${trackingNumber}`, { replace: true });

    try {
      const res = await axios.get(`/api/tracking/${trackingNumber}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No tracking information found.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNumber(text.trim());
      } else {
        toast.error('Failed to read clipboard.');
      }
    } catch (error) {
      toast.error('Could not access clipboard.');
      console.error('Clipboard error:', error);
    }
  };

  useEffect(() => {
    const enterListener = (e) => {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', enterListener);
    return () => {
      window.removeEventListener('keydown', enterListener);
    };
  }, [handleSubmit]);

  // User‐friendly messages by status
  const getMessage = status => {
    switch (status) {
      case 'Pending':
        return 'Right now we are inspecting your device to start working on it.';
      case 'Ready for Pickup':
        return 'Your device is now ready for pickup.';
      case 'Completed':
        return 'Your order is completed.';
      case 'Cancelled':
        return 'Your order has been cancelled.';
      default:
        return `Status: ${status}`;
    }
  };

  return (
    <div className="tracking-card">
      <h2>Order Tracking</h2>
      <p>Enter your tracking number below:</p>

      <form className="tracking-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="tracking-input"
          placeholder="Tracking number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button
          type="button"
          className="paste-tracking-btn"
          onClick={handlePaste}
          title="Paste from clipboard"
        >
          Paste
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Tracking…' : 'Track'}
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="tracking-error">{error}</p>}

      {result && (
        <div className="tracking-result">
          <p><strong>Tracking #:</strong> {result.trackingNumber}</p>
          <p><strong>Item:</strong> {result.item}</p>
          <p><strong>Details:</strong> {result.details}</p>
          <p><strong>Placed:</strong> {new Date(result.createdAt).toLocaleString()}</p>
          <p><strong>Last Update:</strong> {new Date(result.updatedAt).toLocaleString()}</p>
          <div className="tracking-message">
            {getMessage(result.status)}
          </div>
        </div>
      )}
    </div>
  );
}
