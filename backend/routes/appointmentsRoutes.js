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

// Todas estas rutas requieren estar autenticado (protect)

// POST   /api/appointments         → crear nueva cita
router.post('/', protect, createAppointment);

// GET    /api/appointments         → listar citas del usuario logueado
router.get('/', protect, listUserAppointments);

// PATCH  /api/appointments/:id     → editar o cancelar una cita
router.patch('/:id', protect, updateAppointment);

// DELETE /api/appointments/:id     → eliminar una cita (solo si no está completada)
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
