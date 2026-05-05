import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { api } from '../../api';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status, vehicle_id) => {
    if (confirm(`Are you sure you want to mark this booking as ${status}?`)) {
      try {
        await api.updateBookingStatus({ id, status, vehicle_id });
        loadBookings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Manage Bookings</h1>
        <p className="text-muted">Review, approve, or reject customer rentals.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Vehicle</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Dates</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>#{b.id}</td>
                <td style={{ padding: '16px 24px' }}>
                    <div>{b.user_name}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>{b.user_email}</div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{b.vehicle_name}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                    <div>{b.start_date}</div>
                    <div className="text-muted">to {b.end_date}</div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>${b.total_price}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`badge ${b.status}`}>{b.status}</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {b.status === 'active' && (
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => updateStatus(b.id, 'completed', b.vehicle_id)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px', borderRadius: '4px' }} title="Mark Completed">
                            <Check size={16} />
                        </button>
                        <button onClick={() => updateStatus(b.id, 'rejected', b.vehicle_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px', borderRadius: '4px' }} title="Reject">
                            <X size={16} />
                        </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
                <tr>
                    <td colSpan="7" className="text-center text-muted" style={{ padding: '32px' }}>No bookings found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManager;
