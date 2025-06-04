// backend/routes/adminAppointmentsRoutes.js

const express = require('express');
const router  = express.Router();

const { listAllAppointments } = require('../controllers/appointmentController');
const { protectAdmin }        = require('../middleware/adminMiddleware');

// GET /api/admin/appointments
// → Devuelve TODAS las citas (para Admin)
router.get('/', protectAdmin, listAllAppointments);

module.exports = router;
