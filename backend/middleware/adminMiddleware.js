// backend/middleware/adminMiddleware.js

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

async function protectAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: requires ADMIN role.' });
    }
    // Para que quede disponible si quisieras usarla (ej. en updateAppointment):
    req.userIsAdmin = true;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
}

module.exports = { protectAdmin };
