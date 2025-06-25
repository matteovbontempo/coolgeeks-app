// backend/index.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');

// --- Passport config (Google OAuth) ---
require('./config/passport');

// --- Route handlers ---
const authRoutes              = require('./routes/authRoutes');
const ordersRoutes            = require('./routes/ordersRoutes');
const appointmentsRoutes      = require('./routes/appointmentsRoutes');
const trackingRoutes          = require('./routes/trackingRoutes');
const adminOrdersRoutes       = require('./routes/adminOrdersRoutes');
const adminAppointmentsRoutes = require('./routes/adminAppointmentsRoutes');

const app = express();

// --- CORS ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// --- Sessions & Passport ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Body parser ---
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/appointments', adminAppointmentsRoutes);

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    message: err.message,
    stack:   err.stack,
  });
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));