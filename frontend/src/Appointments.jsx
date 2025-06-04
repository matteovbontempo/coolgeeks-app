// frontend/src/Appointments.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Appointments.css';

export default function Appointments() {
  // --- Estado para el formulario de nueva cita ---
  const [service, setService] = useState('System Tune');
  const [when, setWhen]       = useState('');
  const [note, setNote]       = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate]     = useState('');

  // --- Estado para la lista de citas del usuario ---
  const [appointments, setAppointments]   = useState([]);
  const [loadingList, setLoadingList]     = useState(false);
  const [errorList, setErrorList]         = useState('');

  // --- Campos para edición en línea ---
  const [editingId, setEditingId] = useState(null);       // id de la cita que estamos editando
  const [editService, setEditService] = useState('');
  const [editWhen, setEditWhen]       = useState('');
  const [editNote, setEditNote]       = useState('');
  const [editStatus, setEditStatus]   = useState('');

  // 1) Cuando el componente monta, cargamos las citas del usuario
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Función para obtener citas del usuario
  const fetchAppointments = async () => {
    setLoadingList(true);
    setErrorList('');
    try {
      const res = await axios.get('/api/appointments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data); // Asume un array de objetos { _id, service, when, note, status, ... }
    } catch (err) {
      console.error('Error fetching appointments:', err.response?.data || err.message);
      setErrorList(err.response?.data?.message || 'No se pudieron cargar las citas.');
    } finally {
      setLoadingList(false);
    }
  };

  // 2) Crear nueva cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorCreate('');

    if (!when) {
      setErrorCreate('Por favor elige fecha y hora.');
      return;
    }

    setLoadingCreate(true);
    try {
      await axios.post('/api/appointments',
        { service, when, note },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Limpiamos el formulario
      setWhen('');
      setNote('');
      // Refrescamos la lista
      await fetchAppointments();
    } catch (err) {
      console.error('Error creating appointment:', err.response?.data || err.message);
      setErrorCreate(err.response?.data?.message || 'No se pudo crear la cita.');
    } finally {
      setLoadingCreate(false);
    }
  };

  // 3) Comenzar edición en línea: precargamos campos
  const startEditing = (appt) => {
    setEditingId(appt._id);
    setEditService(appt.service);
    setEditWhen(new Date(appt.when).toISOString().slice(0,16)); 
      /* Ejemplo: "2025-06-05T14:30" para <input type="datetime-local" /> */
    setEditNote(appt.note || '');
    setEditStatus(appt.status);
  };

  // 4) Cancelar edición (reset de variables)
  const cancelEditing = () => {
    setEditingId(null);
    setEditService('');
    setEditWhen('');
    setEditNote('');
    setEditStatus('');
  };

  // 5) Guardar cambios (o cancelar la cita mediante status = 'Canceled')
  const saveEditing = async (id) => {
    // Validamos que haya algo en editWhen
    if (!editWhen) {
      alert('Por favor ingresa una fecha y hora válidas.');
      return;
    }

    try {
      await axios.patch(
        `/api/appointments/${id}`,
        {
          service: editService,
          when: editWhen,
          note: editNote,
          status: editStatus
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      cancelEditing();
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'No se pudo actualizar la cita.');
    }
  };

  // 6) Eliminar cita (solo si está Pendiente o Cancelada)
  const deleteAppointment = async (id, status) => {
    if (status === 'Completed') {
      alert('No puedes eliminar una cita ya completada.');
      return;
    }
    if (!window.confirm('¿Seguro que deseas eliminar esta cita?')) {
      return;
    }
    try {
      await axios.delete(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'No se pudo eliminar la cita.');
    }
  };

  return (
    <div className="page">
      <h2>Your Appointments</h2>

      {/* ————————— FORMULARIO PARA CREAR NUEVA CITA ————————— */}
      <form className="appointments-form" onSubmit={handleSubmit}>
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          disabled={loadingCreate}
        >
          <option value="System Tune">System Tune-up</option>
          <option value="New Computer Install">New Computer Installation</option>
          <option value="Screen Replacement">Screen Replacement</option>
          <option value="Virus/Malware Removal">Virus / Malware Removal</option>
          <option value="Other">Other Service</option>
        </select>

        <input
          type="datetime-local"
          value={when}
          onChange={e => setWhen(e.target.value)}
          disabled={loadingCreate}
          required
        />

        <input
          type="text"
          placeholder="Notes (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          disabled={loadingCreate}
        />

        <button type="submit" disabled={loadingCreate}>
          {loadingCreate ? 'Scheduling…' : 'Schedule'}
        </button>
      </form>

      {errorCreate && <p className="appointments-error">{errorCreate}</p>}


      {/* ————————— LISTADO DE CITAS EXISTENTES ————————— */}
      {loadingList
        ? <p>Loading appointments…</p>
        : errorList
          ? <p className="appointments-error">{errorList}</p>
          : (
            <ul className="appointments-list">
              {appointments.map(appt => (
                <li key={appt._id} className={`appointment-item status-${appt.status}`}>
                  {/** Si está en modo edición (editingId === appt._id) mostramos inputs **/}
                  {editingId === appt._id ? (
                    <div className="edit-form">
                      <select
                        value={editService}
                        onChange={e => setEditService(e.target.value)}
                      >
                        <option value="System Tune">System Tune-up</option>
                        <option value="New Computer Install">New Computer Installation</option>
                        <option value="Screen Replacement">Screen Replacement</option>
                        <option value="Virus/Malware Removal">Virus / Malware Removal</option>
                        <option value="Other">Other Service</option>
                      </select>

                      <input
                        type="datetime-local"
                        value={editWhen}
                        onChange={e => setEditWhen(e.target.value)}
                        required
                      />

                      <input
                        type="text"
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="Notes (optional)"
                      />

                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>

                      <button onClick={() => saveEditing(appt._id)}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </div>
                  ) : (
                    <div className="appointments-view">
                      <p><strong>Service:</strong> {appt.service}</p>
                      <p>
                        <strong>Date:</strong> {new Date(appt.when).toLocaleString()}
                      </p>
                      <p><strong>Notes:</strong> {appt.note || '-'}</p>
                      <p>
                        <strong>Status:</strong> <span className={`status-text`}>{appt.status}</span>
                      </p>

                      <div className="appointments-actions">
                        {appt.status === 'Pending' && (
                          <>
                            <button onClick={() => startEditing(appt)}>Edit</button>
                            <button onClick={() => deleteAppointment(appt._id, appt.status)}>Cancel</button>
                          </>
                        )}

                        {appt.status === 'Completed' && (
                          <button disabled>Completed</button>
                        )}

                        {appt.status === 'Canceled' && (
                          <button disabled>Canceled</button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )
      }
    </div>
  );
}
