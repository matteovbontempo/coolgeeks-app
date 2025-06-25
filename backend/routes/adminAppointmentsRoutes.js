// backend/routes/adminAppointmentsRoutes.js

const express = require('express');
const router  = express.Router();

const {
  listAllAppointments,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');

const { protectAdmin } = require('../middleware/adminMiddleware');

// GET /api/admin/appointments → todas las citas (admin)
router.get('/', protectAdmin, listAllAppointments);

// PATCH /api/admin/appointments/:id/status → cambiar estado
router.patch('/:id/status', protectAdmin, updateAppointmentStatus);

// DELETE /api/admin/appointments/:id → elimina una cita (admin)
router.delete('/:id', protectAdmin, deleteAppointment);

module.exports = router;

