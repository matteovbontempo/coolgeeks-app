// Load .env as early as possible
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes              = require('./routes/authRoutes');
const ordersRoutes            = require('./routes/ordersRoutes');
const appointmentsRoutes      = require('./routes/appointmentsRoutes');
const trackingRoutes          = require('./routes/trackingRoutes');

const adminOrdersRoutes       = require('./routes/adminOrdersRoutes');
const adminAppointmentsRoutes = require('./routes/adminAppointmentsRoutes');

const app = express();

// --- CORS ---
// solo permitir el origen de la app React
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// --- MongoDB ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Rutas de Autenticación ---
app.use('/api/auth', authRoutes);

// --- Rutas de Usuario Regular ---
app.use('/api/orders', ordersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tracking', trackingRoutes);

// --- Rutas de Administrador ---
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/appointments', adminAppointmentsRoutes);

// --- Global error handler (opcional) ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
