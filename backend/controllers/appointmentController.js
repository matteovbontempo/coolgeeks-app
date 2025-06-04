// backend/controllers/appointmentController.js

const Appointment = require('../models/Appointment');

// 1) Crear una nueva cita
async function createAppointment(req, res) {
  try {
    const { service, when, note } = req.body;
    const userId = req.userId; // Viene del middleware protect()

    if (!service || !when) {
      return res.status(400).json({ message: 'Los campos service y when son obligatorios.' });
    }

    const appt = await Appointment.create({
      userId,
      service,
      when: new Date(when),
      note: note || '',
      status: 'Pending'
    });

    return res.status(201).json(appt);
  } catch (err) {
    console.error('Error en createAppointment:', err);
    return res.status(500).json({ message: 'Error del servidor al crear la cita.' });
  }
}

// 2) Listar solo las citas del usuario logueado
async function listUserAppointments(req, res) {
  try {
    const userId = req.userId;
    const appointments = await Appointment.find({ userId }).sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    console.error('Error en listUserAppointments:', err);
    return res.status(500).json({ message: 'No se pudieron obtener las citas.' });
  }
}

// 3) Listar TODAS las citas (para Admin)
async function listAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    console.error('Error en listAllAppointments:', err);
    return res.status(500).json({ message: 'No se pudieron obtener las citas de todos los usuarios.' });
  }
}

// 4) Editar una cita existente (PATCH /api/appointments/:id)
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { service, when, note, status } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }
    if (appt.userId.toString() !== userId && !req.userIsAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: no es tu cita.' });
    }

    const allowedStatuses = ['Pending', 'Completed', 'Canceled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    if (service) appt.service = service;
    if (when) appt.when = new Date(when);
    if (note !== undefined) appt.note = note;
    if (status) appt.status = status;

    const updated = await appt.save();
    return res.json(updated);
  } catch (err) {
    console.error('Error en updateAppointment:', err);
    return res.status(500).json({ message: 'Error del servidor al actualizar la cita.' });
  }
}

// 5) Eliminar una cita (DELETE /api/appointments/:id)
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }
    if (appt.userId.toString() !== userId && !req.userIsAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: no es tu cita.' });
    }
    if (appt.status === 'Completed') {
      return res.status(400).json({ message: 'No puedes eliminar una cita ya completada.' });
    }

    await appt.remove();
    return res.json({ message: 'Cita eliminada correctamente.' });
  } catch (err) {
    console.error('Error en deleteAppointment:', err);
    return res.status(500).json({ message: 'Error del servidor al eliminar la cita.' });
  }
}

module.exports = {
  createAppointment,
  listUserAppointments,
  listAllAppointments,
  updateAppointment,
  deleteAppointment
};
