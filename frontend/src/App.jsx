// src/App.jsx
import React from 'react';
import Orders from './Orders';
import './App.css';

function App() {
  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">CoolGeeks Dashboard</h1>
      <Orders />
    </div>
  );
}

export default App;
