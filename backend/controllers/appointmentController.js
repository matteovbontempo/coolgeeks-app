// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');

// 1) Crear una nueva cita
async function createAppointment(req, res) {
  try {
    const { service, when, note } = req.body;
    const userId = req.userId;

    if (!service || !when) {
      return res
        .status(400)
        .json({ message: 'Los campos service y when son obligatorios.' });
    }

    // Validar formato y rango manualmente
    const [datePart, timePart] = when.split('T');
    if (!datePart || !timePart) {
      return res.status(400).json({ message: 'Formato de fecha/hora inválido.' });
    }
    const [hour, minute] = timePart.split(':').map(Number);
    if (hour < 11 || hour >= 16) {
      return res.status(400).json({ message: 'La hora debe ser entre las 11:00 y las 16:00.' });
    }
    if (minute !== 0 && minute !== 30) {
      return res.status(400).json({ message: 'Los minutos deben ser 00 o 30.' });
    }

    // Validar que no sea fecha pasada
    const now = new Date();
    const selected = new Date(`${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    if (selected < now) {
      return res.status(400).json({ message: 'No puedes agendar citas en fechas pasadas.' });
    }

    const appt = await Appointment.create({
      userId,
      service,
      when, // guardar el string tal cual
      note: note || '',
      status: 'Pending'
    });

    return res.status(201).json(appt);
  } catch (err) {
    console.error('Error en createAppointment:', err);
    return res
      .status(500)
      .json({ message: 'Error del servidor al crear la cita.' });
  }
}

// 2) Listar solo las citas del usuario logueado
async function listUserAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ userId: req.userId }).sort({
      createdAt: -1
    });
    return res.json(appointments);
  } catch (err) {
    console.error('Error en listUserAppointments:', err);
    return res
      .status(500)
      .json({ message: 'No se pudieron obtener las citas.' });
  }
}

// 3) Listar TODAS las citas (para Admin)
async function listAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    console.error('Error en listAllAppointments:', err);
    return res
      .status(500)
      .json({ message: 'No se pudieron obtener las citas de todos los usuarios.' });
  }
}

// 4) Editar / reprogramar una cita existente
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { service, when, note, status } = req.body;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Cita no encontrada.' });

    // Sólo el dueño o admin
    if (appt.userId.toString() !== req.userId && !req.userIsAdmin) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }

    // Si reprograma, validar de nuevo fechas/hora
    if (when) {
      const [datePart, timePart] = when.split('T');
      if (!datePart || !timePart) {
        return res.status(400).json({ message: 'Formato de fecha/hora inválido.' });
      }
      const [hour, minute] = timePart.split(':').map(Number);
      if (hour < 11 || hour >= 16) {
        return res.status(400).json({ message: 'La hora debe ser entre las 11:00 y las 16:00.' });
      }
      if (minute !== 0 && minute !== 30) {
        return res.status(400).json({ message: 'Los minutos deben ser 00 o 30.' });
      }
      // Validar que no sea fecha pasada
      const now = new Date();
      const selected = new Date(`${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      if (selected < now) {
        return res.status(400).json({ message: 'No puedes reprogramar a una fecha pasada.' });
      }
      appt.when = when; // guardar el string tal cual
    }

    if (service) appt.service = service;
    if (note !== undefined) appt.note = note;
    if (status) {
      const allowed = ['Pending', 'Completed', 'Canceled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Status inválido.' });
      }
      appt.status = status;
    }

    await appt.save();
    return res.json(appt);
  } catch (err) {
    console.error('Error en updateAppointment:', err);
    return res
      .status(500)
      .json({ message: 'Error del servidor al actualizar la cita.' });
  }
}

// 5) Eliminar una cita
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);

    if (!appt) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }

    if (appt.userId.toString() !== req.userId && !req.userIsAdmin) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    if (appt.status === 'Completed') {
      return res
        .status(400)
        .json({ message: 'No puedes eliminar una cita ya completada.' });
    }

    await Appointment.findByIdAndDelete(id);

    return res.json({ message: 'Cita eliminada correctamente.' });
  } catch (err) {
    console.error('Error en deleteAppointment:', err);
    return res
      .status(500)
      .json({ message: 'Error del servidor al eliminar la cita.' });
  }
}

// 6) Actualizar estado de una cita (solo ADMIN)
async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // El middleware de admin ya ha verificado los permisos
    
    const appt = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appt) return res.status(404).json({ message: 'Cita no encontrada.' });

    return res.json({ message: 'Estado de cita actualizado.', appointment: appt });
  } catch (err) {
    console.error('Error en updateAppointmentStatus:', err);
    return res
      .status(500)
      .json({ message: 'No se pudo actualizar el estado de la cita.' });
  }
}

module.exports = {
  createAppointment,
  listUserAppointments,
  listAllAppointments,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus
};
