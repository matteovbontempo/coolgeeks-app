// src/Tracking.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Tracking.css';

export default function Tracking() {
  const { search } = useLocation();
  const [number, setNumber]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [result, setResult]       = useState(null);

  // our fetch logic extracted so we can call it on param-change
  const fetchTracking = useCallback(async num => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`/api/tracking/${num}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No tracking info found.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 1) On mount, read ?number= and kick off fetch
  useEffect(() => {
    const params = new URLSearchParams(search);
    const num = params.get('number');
    if (num) {
      setNumber(num);
      fetchTracking(num);
    }
  }, [search, fetchTracking]);

  // 2) On manual submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!number.trim()) {
      setError('Please enter a tracking number.');
      return;
    }
    fetchTracking(number.trim());
  };

  return (
    <div className="tracking-card">
      <h2>Shipment Tracking</h2>
      <p>Track your active shipments right here.</p>

      <form className="tracking-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter tracking number"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tracking…' : 'Track'}
        </button>
      </form>

      {error && <p className="tracking-error">{error}</p>}

      {result && (
        <div className="tracking-result">
          {/* ... render your result as before ... */}
          <p><strong>Status:</strong> {result.status}</p>
          {/* etc. */}
        </div>
      )}
    </div>
  );
}

