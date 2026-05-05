import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Star, MapPin, Zap, User, 
  ShieldCheck, Phone, Calendar, ArrowRight, CheckCircle2, 
  Clock, Info, Car, Shield
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

function ImageGallery({ images }) {
  const [idx, setIdx] = useState(0);
  const imgs = images || [];

  if (imgs.length === 0) {
    return (
      <div style={{ height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Car size={80} color="var(--text-secondary)" opacity={0.2} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '450px', background: 'rgba(0,0,0,0.2)' }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={imgs[idx]}
          alt="vehicle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AnimatePresence>

      {imgs.length > 1 && (
        <>
          <button onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setIdx((idx + 1) % imgs.length)}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
            <ChevronRight size={24} />
          </button>
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const VehicleDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const vehicles = await api.getVehicles();
        const found = vehicles.find(v => v.id === parseInt(id));
        if (found) {
          setVehicle({
            ...found,
            images: typeof found.images === 'string' ? JSON.parse(found.images) : (found.images || []),
            features: typeof found.features === 'string' ? JSON.parse(found.features) : (found.features || [])
          });
          
          const revs = await api.getVehicleReviews(found.id);
          setReviews(revs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!vehicle) return <div className="card text-center" style={{ padding: '80px' }}><h2>Vehicle not found</h2><button className="btn btn-primary" onClick={() => navigate('/vehicles')}>Back to Browse</button></div>;

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const currentDailyPrice = vehicle.price_per_day + (withDriver ? 15 : 0);
  const rentalAmount = days * currentDailyPrice;
  const securityDeposit = Math.round(rentalAmount * 0.2);
  const taxes = Math.round(rentalAmount * 0.05);
  const grandTotal = rentalAmount + securityDeposit + taxes;

  const handleBook = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !agreedToTerms) return;
    navigate('/payment', { 
      state: { vehicle, startDate, endDate, totalPrice: rentalAmount, withDriver, rentalAmount, securityDeposit, taxes } 
    });
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Breadcrumb / Back */}
      <button onClick={() => navigate('/vehicles')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: '15px' }}>
        <ChevronLeft size={20} /> Back to Search
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Content */}
        <div className="flex-col gap-8">
          <ImageGallery images={vehicle.images} />

          <div className="card" style={{ padding: '32px' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
              <div>
                <h1 style={{ marginBottom: '8px' }}>{vehicle.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}><MapPin size={16} color="var(--accent-primary)" /> {vehicle.city}, {vehicle.location || 'Central'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--warning, #f59e0b)' }}><Star size={16} fill="var(--warning, #f59e0b)" /> {vehicle.rating || 'New'} ({reviews.length} reviews)</span>
                  {vehicle.is_verified === 1 && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: '20px' }}><CheckCircle2 size={16} /> Verified Vehicle</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-primary)' }}>${vehicle.price_per_day}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>per day</div>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '32px', fontSize: '16px' }}>{vehicle.description}</p>

            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>TYPE</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16} /> {vehicle.type}</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>YEAR</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {vehicle.year || 'N/A'}</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>FUEL</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} /> {vehicle.engine_type}</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>TRANS.</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> {vehicle.transmission || 'Manual'}</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SEATS</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> {vehicle.seating_capacity || '5'} Seats</div>
              </div>
            </div>

            {vehicle.features.length > 0 && (
              <>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Features</h3>
                <div className="flex gap-3" style={{ flexWrap: 'wrap', marginBottom: '32px' }}>
                  {vehicle.features.map((f, i) => (
                    <span key={i} style={{ padding: '8px 16px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', borderRadius: '10px', fontSize: '14px', fontWeight: 500 }}>{f}</span>
                  ))}
                </div>
              </>
            )}

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
               <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Hosted by</h3>
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: vehicle.owner_avatar ? `url(${vehicle.owner_avatar}) center/cover` : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--accent-primary)', fontWeight: 800 }}>
                     {!vehicle.owner_avatar && vehicle.owner_name?.charAt(0)}
                   </div>
                   <div>
                     <div style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       {vehicle.owner_name}
                       {vehicle.owner_verified === 1 && <CheckCircle2 size={18} color="var(--success)" />}
                     </div>
                     <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Member since 2024</div>
                   </div>
                 </div>
                 <div className="flex-col items-end">
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {vehicle.owner_phone}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><MapPin size={14} /> {vehicle.owner_city}</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Star size={24} fill="var(--warning, #f59e0b)" color="var(--warning, #f59e0b)" /> 
              Reviews ({reviews.length})
            </h2>
            
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet for this vehicle.</p>
            ) : (
              <div className="flex-col gap-6">
                {reviews.map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: r.user_avatar ? `url(${r.user_avatar}) center/cover` : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          {!r.user_avatar && r.user_name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.user_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? 'var(--warning, #f59e0b)' : 'transparent'} color={s <= r.rating ? 'var(--warning, #f59e0b)' : 'var(--text-muted)'} />)}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Booking Form */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div className="card" style={{ padding: '28px', border: '1px solid var(--accent-primary)', boxShadow: '0 12px 40px rgba(99,102,241,0.15)' }}>
            <h3 style={{ marginBottom: '24px' }}>Book This Vehicle</h3>
            
            <form onSubmit={handleBook} className="flex-col gap-5">
              <div className="flex-col gap-2">
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Rental Dates</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" id="driver" checked={withDriver} onChange={e => setWithDriver(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="driver" style={{ cursor: 'pointer', fontSize: '14px' }}>
                    <strong>Include Professional Driver</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Additional $15 / day</div>
                  </label>
                </div>
              </div>

              {days > 0 && (
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <span className="text-secondary">Rental ({days} days)</span>
                    <span style={{ fontWeight: 600 }}>${rentalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <span className="text-secondary">Security Deposit (20%)</span>
                    <span style={{ fontWeight: 600 }}>${securityDeposit}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <span className="text-secondary">Taxes (5%)</span>
                    <span style={{ fontWeight: 600 }}>${taxes}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 700 }}>Total Payable</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-primary)' }}>${grandTotal}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                <input type="checkbox" id="terms" required checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: '4px' }} />
                <label htmlFor="terms" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer' }}>
                  I agree to the Rental Agreement and confirm that my provided information is accurate.
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '16px' }} disabled={days === 0 || !agreedToTerms || vehicle.owner_id === user?.id}>
                {vehicle.owner_id === user?.id ? 'This is your vehicle' : <>Continue to Payment <ArrowRight size={20} /></>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--success)', fontSize: '13px' }}>
                <ShieldCheck size={16} /> Free Cancellation up to 24h
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} color="var(--accent-primary)" />
              <h4 style={{ margin: 0 }}>Rental Guarantee</h4>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Full refund if vehicle not as described.</li>
              <li>24/7 roadside assistance included.</li>
              <li>Verified ownership and documents.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VehicleDetails;
