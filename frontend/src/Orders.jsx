// frontend/src/Orders.jsx
import React, { useState, useEffect } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch existing orders on mount
  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

  // Handle new order submissions
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, quantity: Number(quantity) }),
    });
    if (!res.ok) {
      alert('Failed to place order');
      return;
    }
    const newOrder = await res.json();
    setOrders(prev => [...prev, newOrder]);
    setItem('');
    setQuantity(1);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Orders</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-x-2">
        <input
          className="border p-1"
          value={item}
          onChange={e => setItem(e.target.value)}
          placeholder="Item name"
          required
        />
        <input
          type="number"
          className="border p-1 w-20"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          min="1"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Place Order
        </button>
      </form>
      <ul className="list-disc pl-5">
        {orders.map(o => (
          <li key={o.id}>
            {o.item} (x{o.quantity}) — {o.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
