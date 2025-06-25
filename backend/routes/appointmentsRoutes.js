// backend/routes/appointmentsRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  listUserAppointments,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Rutas de usuario
router.get('/', listUserAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
