// frontend/src/Appointments.jsx
import React, { useState, useEffect } from 'react';

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [client, setClient] = useState('');
  const [datetime, setDatetime] = useState('');

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(setAppts)
      .catch(console.error);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client, datetime }),
    });
    if (!res.ok) {
      alert('Failed to schedule');
      return;
    }
    const newAppt = await res.json();
    setAppts(prev => [...prev, newAppt]);
    setClient('');
    setDatetime('');
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Appointments</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-x-2">
        <input
          className="border p-1"
          value={client}
          onChange={e => setClient(e.target.value)}
          placeholder="Client name"
          required
        />
        <input
          type="datetime-local"
          className="border p-1"
          value={datetime}
          onChange={e => setDatetime(e.target.value)}
          required
        />
        <button className="bg-green-500 text-white px-3 py-1 rounded">
          Schedule
        </button>
      </form>
      <ul className="list-disc pl-5">
        {appts.map(a => (
          <li key={a.id}>
            {a.client} @ {new Date(a.datetime).toLocaleString()} — {a.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
