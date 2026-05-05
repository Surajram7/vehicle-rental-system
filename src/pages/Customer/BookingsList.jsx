import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Car, Clock, User, MapPin, ChevronLeft, ChevronRight, Star, X, MessageSquare, Send } from 'lucide-react';
import { api } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import RentalAgreement from '../../components/Booking/RentalAgreement';

function MiniCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const imgs = images && images.length > 0 ? images : [];
  if (imgs.length === 0) return (
    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Car size={28} color="var(--accent-primary)" />
    </div>
  );
  return (
    <div style={{ width: '80px', height: '80px', position: 'relative', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={imgs[idx]} alt="vehicle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
      </AnimatePresence>
      {imgs.length > 1 && (
        <>
          <button onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)} style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}><ChevronLeft size={10} /></button>
          <button onClick={() => setIdx((idx + 1) % imgs.length)} style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}><ChevronRight size={10} /></button>
        </>
      )}
    </div>
  );
}

const statusColors = { active: 'var(--accent-primary)', completed: 'var(--success)', rejected: 'var(--danger)' };

const BookingsList = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [agreementModal, setAgreementModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const data = await api.getUserBookings(user.id);
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

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setSubmitting(true);
    try {
        await api.addReview({
            user_id: user.id,
            vehicle_id: reviewModal.vehicle_id,
            rating: reviewForm.rating,
            comment: reviewForm.comment
        });
        setReviewModal(null);
        setReviewForm({ rating: 5, comment: '' });
        alert('Review submitted successfully!');
    } catch (err) {
        alert('Failed to submit review: ' + err.message);
    } finally {
        setSubmitting(false);
    }
  };

  const days = (s, e) => Math.max(1, Math.ceil((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)));

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading your bookings...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1>My Bookings</h1>
        <p className="text-muted">A history of all your vehicle rentals.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: '64px' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No bookings yet</p>
          <p style={{ fontSize: '14px' }}>Browse vehicles and make your first booking!</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {bookings.map(b => {
            const numDays = days(b.start_date, b.end_date);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '20px' }}>
                <div className="flex items-center gap-5">
                  <MiniCarousel images={b.vehicle_images} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 3px', fontSize: '15px' }}>{b.vehicle_name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.vehicle_type}</span>
                      </div>
                      <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: (statusColors[b.status] || '#888') + '22', color: statusColors[b.status] || 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize', border: '1px solid ' + (statusColors[b.status] || '#888') + '44', whiteSpace: 'nowrap' }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>RENTAL PERIOD</div>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} color="var(--accent-primary)" />{b.start_date} → {b.end_date}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{numDays} day{numDays > 1 ? 's' : ''}</div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>OWNER</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><User size={11} color="var(--accent-primary)" />{b.owner_name || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} />{b.owner_city || ''}</div>
                      </div>

                      <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>TOTAL PAID</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>${b.total_price}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px', gap: '4px' }} onClick={() => setAgreementModal(b)}>
                        <FileText size={14} /> View Agreement
                      </button>
                      {b.status === 'completed' && (
                        <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px', gap: '4px' }} onClick={() => setReviewModal(b)}>
                          <Star size={14} color="var(--warning, #f59e0b)" /> Rate Experience
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Agreement Modal */}
      <AnimatePresence>
        {agreementModal && (
          <RentalAgreement 
            booking={agreementModal} 
            onClose={() => setAgreementModal(null)} 
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ maxWidth: '400px', width: '100%', padding: '28px', position: 'relative' }}>
               <button onClick={() => setReviewModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                 <X size={20} />
               </button>
               <h3 style={{ marginBottom: '8px' }}>Rate Your Trip</h3>
               <p className="text-muted" style={{ fontSize: '13px', marginBottom: '24px' }}>How was your experience with <strong>{reviewModal.vehicle_name}</strong>?</p>
               
               <form onSubmit={handleReview} className="flex-col gap-5">
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        size={32} 
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                        fill={star <= reviewForm.rating ? 'var(--warning, #f59e0b)' : 'transparent'}
                        color={star <= reviewForm.rating ? 'var(--warning, #f59e0b)' : 'var(--text-secondary)'}
                        onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                      />
                    ))}
                  </div>

                  <div className="flex-col gap-2">
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Share your thoughts (optional)</label>
                    <div style={{ position: 'relative' }}>
                      <MessageSquare size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <textarea 
                        rows={3} 
                        placeholder="What did you like or dislike?" 
                        value={reviewForm.comment} 
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        style={{ paddingLeft: '38px', paddingTop: '10px', fontSize: '14px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', gap: '8px' }} disabled={submitting}>
                    {submitting ? 'Submitting...' : <><Send size={16} /> Submit Review</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsList;
