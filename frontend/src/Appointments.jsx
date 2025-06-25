// frontend/src/Appointments.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Appointments.css';

export default function Appointments() {
  // — Estado formulario —
  const [service, setService]             = useState('System Tune');
  const [note, setNote]                   = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // — Estado lista de citas —
  const [appointments, setAppointments] = useState([]);
  const [loadingList, setLoadingList]   = useState(false);
  const [errorList, setErrorList]       = useState('');

  // — Edición en línea —
  const [editingId, setEditingId]     = useState(null);
  const [editService, setEditService] = useState('');
  const [editWhen, setEditWhen]       = useState('');
  const [editNote, setEditNote]       = useState('');
  const [editStatus, setEditStatus]   = useState('');

  // Edit form states for date, hour, minute
  const [editDate, setEditDate] = useState('');
  const [editHour, setEditHour] = useState('11');
  const [editMinute, setEditMinute] = useState('00');

  // Nuevos estados para fecha, hora y minutos
  const [date, setDate] = useState('');
  const [apptHour, setApptHour] = useState('11');
  const [apptMinute, setApptMinute] = useState('00');

  // Pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Min para datetime-local en **hora local**
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  
  // Ajustar a los intervalos de 30 minutos
  const minutes = now.getMinutes();
  if (minutes < 30) {
    now.setMinutes(30);
  } else {
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
  }
  
  // Asegurar que la hora esté entre 11 AM y 4 PM
  const hour = now.getHours();
  if (hour < 11) {
    now.setHours(11);
    now.setMinutes(0);
  } else if (hour >= 16) {
    now.setDate(now.getDate() + 1);
    now.setHours(11);
    now.setMinutes(0);
  }
  
  const minDateTimeLocal = now.toISOString().slice(0,16);

  // Función para validar y ajustar la fecha/hora seleccionada
  function validateAndAdjustDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Validar hora entre 11 AM y 4 PM
    if (hours < 11 || hours >= 16) {
      return null;
    }

    // Ajustar minutos a intervalos de 30
    if (minutes < 30) {
      date.setMinutes(0);
    } else {
      date.setMinutes(30);
    }

    return date.toISOString().slice(0,16);
  }

  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await fetchAppointments();
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pull to refresh handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (container.scrollTop === 0) {
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance * 0.5, 100));
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 50) {
        setIsRefreshing(true);
        await fetchAppointments();
        setIsRefreshing(false);
      }
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance]);

  async function fetchAppointments() {
    setLoadingList(true);
    setErrorList('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorList('Please log in to view appointments.');
        return;
      }
      const res = await axios.get('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      setErrorList(err.response?.data?.message || 'No se pudieron cargar las citas.');
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a date.');
      return;
    }

    // Validar hora y minutos
    const h = parseInt(apptHour, 10);
    const m = parseInt(apptMinute, 10);
    if (h < 11 || h >= 16) {
      toast.error('Hour must be between 11:00 and 16:00.');
      return;
    }
    if (m !== 0 && m !== 30) {
      toast.error('Minutes must be 00 or 30.');
      return;
    }

    // Combinar fecha, hora y minutos
    const whenStr = `${date}T${apptHour.padStart(2, '0')}:${apptMinute.padStart(2, '0')}`;

    if (note.length > 500) {
      toast.error('Notes cannot exceed 500 characters.');
      return;
    }

    setLoadingCreate(true);
    const toastId = toast.loading('Scheduling appointment...');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/appointments',
        { service, when: whenStr, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Appointment scheduled!', { id: toastId });
      setDate('');
      setApptHour('11');
      setApptMinute('00');
      setNote('');
      await fetchAppointments();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not schedule appointment.';
      toast.error(message, { id: toastId });
    } finally {
      setLoadingCreate(false);
    }
  }

  function startEditing(appt) {
    setEditingId(appt._id);
    setEditService(appt.service);
    // Parse appt.when (YYYY-MM-DDTHH:mm)
    if (appt.when) {
      const [d, t] = appt.when.split('T');
      const [h, m] = t.split(':');
      setEditDate(d);
      setEditHour(h);
      setEditMinute(m);
      setEditWhen(appt.when);
    } else {
      setEditDate('');
      setEditHour('11');
      setEditMinute('00');
      setEditWhen('');
    }
    setEditNote(appt.note || '');
    setEditStatus(appt.status);
  }
  function cancelEditing() {
    setEditingId(null);
    setEditService('');
    setEditWhen('');
    setEditNote('');
    setEditStatus('');
  }

  async function saveEditing(id) {
    if (!editDate) {
      toast.error('Please select a date.');
      return;
    }

    setLoadingEdit(true);
    const toastId = toast.loading('Saving changes...');

    try {
      const token = localStorage.getItem('token');
      const whenStr = `${editDate}T${editHour.padStart(2, '0')}:${editMinute.padStart(2, '0')}`;
      await axios.patch(
        `/api/appointments/${id}`,
        {
          service: editService,
          when: whenStr,
          note: editNote,
          status: editStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Appointment updated!', { id: toastId });
      cancelEditing();
      await fetchAppointments();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update appointment.';
      toast.error(message, { id: toastId });
    } finally {
      setLoadingEdit(false);
    }
  }

  async function deleteAppointment(id, status) {
    if (status === 'Completed') {
      toast.error('You cannot delete a completed appointment.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    setLoadingDelete(true);
    const toastId = toast.loading('Canceling appointment...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete appointments.');
        return;
      }
      await axios.delete(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Appointment canceled.', { id: toastId });
      await fetchAppointments();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not delete appointment.';
      toast.error(message, { id: toastId });
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="appointments-card" ref={containerRef}>
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="pull-refresh-indicator"
          style={{ 
            transform: `translateY(${pullDistance}px)`,
            opacity: pullDistance / 100
          }}
        >
          {isRefreshing ? (
            <span>🔄 Refreshing...</span>
          ) : (
            <span>⬇️ Pull to refresh</span>
          )}
        </div>
      )}

      <h2>Your Appointments</h2>

      <form className="appointments-form" onSubmit={handleSubmit}>
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          disabled={loadingCreate}
        >
          <option value="System Tune">System Tune-up</option>
          <option value="New Computer Install">New Computer Installation</option>
          <option value="Screen Replacement">Screen Replacement</option>
          <option value="Virus/Malware Removal">Virus/Malware Removal</option>
          <option value="Other">Other Service</option>
        </select>

        <div className="field-wrapper">
          <label htmlFor="appt-date" className="visually-hidden">
            Choose date
          </label>
          <input
            id="appt-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().slice(0,10)}
            disabled={loadingCreate}
            required
          />
          <select value={apptHour} onChange={e => setApptHour(e.target.value)} disabled={loadingCreate} required>
            {[11,12,13,14,15].map(h => (
              <option key={h} value={h.toString().padStart(2,'0')}>{h.toString().padStart(2,'0')}</option>
            ))}
          </select>
          <select value={apptMinute} onChange={e => setApptMinute(e.target.value)} disabled={loadingCreate} required>
            <option value="00">00</option>
            <option value="30">30</option>
          </select>
          <span> (Available: 11:00 to 15:30, only in 30-minute intervals)</span>
        </div>

        <input
          type="text"
          placeholder="Notes (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          disabled={loadingCreate}
        />

        <button type="submit" disabled={loadingCreate}>
          {loadingCreate ? (
            <>
              <span className="loading-spinner"></span>
              Scheduling…
            </>
          ) : (
            'Schedule'
          )}
        </button>
      </form>

      {loadingList ? (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Loading appointments…</p>
        </div>
      ) : errorList ? (
        <p className="appointments-error">{errorList}</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map(appt => (
            <li key={appt._id} className={`appointment-item status-${appt.status}`}>
              {editingId === appt._id ? (
                <div className="edit-form">
                  <select
                    value={editService}
                    onChange={e => setEditService(e.target.value)}
                    disabled={loadingEdit}
                  >
                    <option value="System Tune">System Tune-up</option>
                    <option value="New Computer Install">New Computer Installation</option>
                    <option value="Screen Replacement">Screen Replacement</option>
                    <option value="Virus/Malware Removal">Virus/Malware Removal</option>
                    <option value="Other">Other Service</option>
                  </select>

                  <div className="field-wrapper">
                    <label htmlFor="edit-date" className="visually-hidden">
                      Choose date
                    </label>
                    <input
                      id="edit-date"
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      min={new Date().toISOString().slice(0,10)}
                      disabled={loadingEdit}
                      required
                    />
                    <select value={editHour} onChange={e => setEditHour(e.target.value)} disabled={loadingEdit} required>
                      {[11,12,13,14,15].map(h => (
                        <option key={h} value={h.toString().padStart(2,'0')}>{h.toString().padStart(2,'0')}</option>
                      ))}
                    </select>
                    <select value={editMinute} onChange={e => setEditMinute(e.target.value)} disabled={loadingEdit} required>
                      <option value="00">00</option>
                      <option value="30">30</option>
                    </select>
                    <span> (Available: 11:00 to 15:30, only in 30-minute intervals)</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    disabled={loadingEdit}
                    maxLength={500}
                  />

                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>Status:</strong> <span className="status-text">{editStatus}</span>
                  </div>
                  
                  <button onClick={() => saveEditing(appt._id)} disabled={loadingEdit}>
                    {loadingEdit ? (
                      <>
                        <span className="loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button onClick={cancelEditing} disabled={loadingEdit} className="btn-secondary">Cancel</button>
                </div>
              ) : (
                <div className="appointments-view">
                  <p><strong>Service:</strong> {appt.service}</p>
                  <p><strong>Date:</strong> {appt.when ? appt.when.replace('T', ' ') : '-'}</p>
                  <p><strong>Notes:</strong> {appt.note || '-'}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="status-text">{appt.status}</span>
                  </p>
                  <div className="appointments-actions">
                    {appt.status === 'Pending' && (
                      <>
                        <button onClick={() => startEditing(appt)} disabled={loadingDelete}>
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteAppointment(appt._id, appt.status)}
                          disabled={loadingDelete}
                          className="btn-secondary"
                        >
                          {loadingDelete ? (
                            <>
                              <span className="loading-spinner"></span>
                              Canceling...
                            </>
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      </>
                    )}
                    {appt.status === 'Completed' && <button disabled>Completed</button>}
                    {appt.status === 'Canceled'  && <button disabled>Canceled</button>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
