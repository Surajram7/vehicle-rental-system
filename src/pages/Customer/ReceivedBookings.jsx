import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { motion } from 'framer-motion';
import { BookMarked, Car, MapPin, Phone, Mail, Clock, CheckCircle2, XCircle, User } from 'lucide-react';

const statusColors = {
  active: 'var(--accent-primary)',
  completed: 'var(--success)',
  rejected: 'var(--danger)',
};

const ReceivedBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadBookings = useCallback(async () => {
    try {
      const data = await api.getOwnerBookings(user.id);
      setBookings(data.map(b => ({
        ...b,
        vehicle_images: typeof b.vehicle_images === 'string' ? JSON.parse(b.vehicle_images) : (b.vehicle_images || []),
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleStatus = async (booking, status) => {
    try {
      await api.updateBookingStatus({ id: booking.id, status, vehicle_id: booking.vehicle_id });
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter);
  const counts = { active: bookings.filter(b => b.status === 'active').length, completed: bookings.filter(b => b.status === 'completed').length, rejected: bookings.filter(b => b.status === 'rejected').length };

  const days = (s, e) => Math.max(1, Math.ceil((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)));

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading received bookings...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1>Received Bookings</h1>
        <p className="text-muted">Booking requests from renters on your listed vehicles.</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Pending Requests', count: counts.active, color: 'var(--accent-primary)', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Completed Rentals', count: counts.completed, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Rejected', count: counts.rejected, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', background: s.bg, borderColor: s.color + '33' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '20px' }}>
        {['all', 'active', 'completed', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '6px 16px', fontSize: '13px', textTransform: 'capitalize' }}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: '64px' }}>
          <BookMarked size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p>No {filter === 'all' ? '' : filter} bookings found.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {filtered.map(b => {
            const thumbs = b.vehicle_images;
            const numDays = days(b.start_date, b.end_date);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '160px' }}>
                  {/* Vehicle Thumb */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', position: 'relative' }}>
                    {thumbs.length > 0 ? (
                      <img src={thumbs[0]} alt={b.vehicle_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={40} color="var(--text-secondary)" opacity={0.2} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ padding: '20px' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{b.vehicle_name}</h3>
                        <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>Booking #{b.id}</span>
                      </div>
                      <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: (statusColors[b.status] || 'rgba(255,255,255,0.1)') + '22', color: statusColors[b.status] || 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize', border: '1px solid ' + (statusColors[b.status] || 'rgba(255,255,255,0.1)') + '44' }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                      {/* Renter Info */}
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.5px' }}>RENTER</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}><User size={12} color="var(--accent-primary)" />{b.renter_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} />{b.renter_city || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={10} />{b.renter_phone || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Mail size={10} />{b.renter_email}</div>
                      </div>
                      {/* Dates */}
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.5px' }}>RENTAL PERIOD</div>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><Clock size={11} color="var(--accent-primary)" />{b.start_date}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '15px' }}>to</div>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Clock size={11} color="var(--accent-secondary)" />{b.end_date}</div>
                        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>{numDays} day{numDays > 1 ? 's' : ''}</div>
                      </div>
                      {/* Payment */}
                      <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.5px' }}>TOTAL EARNINGS</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>${b.total_price}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>for {numDays} day{numDays > 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {b.status === 'active' && (
                      <div className="flex gap-3">
                        <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '13px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleStatus(b, 'rejected')}>
                          <XCircle size={15} /> Reject
                        </button>
                        <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px', background: 'var(--success)', borderColor: 'transparent' }} onClick={() => handleStatus(b, 'completed')}>
                          <CheckCircle2 size={15} /> Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReceivedBookings;
