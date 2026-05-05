import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Car, MapPin, Zap, ShieldCheck, Trash2, Calendar, X, ChevronLeft, ChevronRight, ImagePlus, Link } from 'lucide-react';

const PAKISTAN_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const imgs = images && images.length > 0 ? images : [];
  if (imgs.length === 0) return (
    <div style={{ height: '160px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
      <Car size={48} color="var(--text-secondary)" opacity={0.2} />
    </div>
  );
  return (
    <div style={{ height: '160px', position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={imgs[idx]} alt="vehicle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
      </AnimatePresence>
      {imgs.length > 1 && (
        <>
          <button onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><ChevronLeft size={14} /></button>
          <button onClick={() => setIdx((idx + 1) % imgs.length)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><ChevronRight size={14} /></button>
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {imgs.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />)}
          </div>
        </>
      )}
    </div>
  );
}

const emptyForm = { name: '', type: 'Car', engine_type: 'Petrol', condition: 'Good', city: '', location: '', registration_no: '', price_per_day: '', description: '', available_from: '', available_to: '', images: [], year: new Date().getFullYear(), transmission: 'Automatic', seating_capacity: 4, is_insured: false, features: [] };

const MyVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageInput, setImageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.getVehiclesByOwner(user.id);
      setVehicles(data.map(v => ({ ...v, images: typeof v.images === 'string' ? JSON.parse(v.images) : (v.images || []) })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, images: [...f.images, reader.result] }));
      };
      if (file) reader.readAsDataURL(file);
    });
  };

  const toggleFeature = (feature) => {
    setForm(f => ({
      ...f,
      features: f.features.includes(feature)
        ? f.features.filter(feat => feat !== feature)
        : [...f.features, feature]
    }));
  };

  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) { setError('Please add at least one image URL.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const result = await api.addVehicle({ ...form, owner_id: user.id });
      if (result.success) {
        setShowForm(false);
        setForm(emptyForm);
        setImageInput('');
        loadVehicles();
      } else {
        setError(result.error || 'Failed to add vehicle.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteVehicle(id);
      setDeleteConfirm(null);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading your listings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '28px' }}>
        <div>
          <h1>My Listings</h1>
          <p className="text-muted">Vehicles you have listed for rent on the marketplace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <PlusCircle size={18} /> List a Vehicle
        </button>
      </div>

      {vehicles.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center text-muted" style={{ padding: '64px' }}>
          <Car size={56} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No listings yet</p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>List your first vehicle to start earning!</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><PlusCircle size={16} /> List a Vehicle</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {vehicles.map(v => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <ImageCarousel images={v.images} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`badge ${v.status}`}>{v.status}</span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px' }}>{v.name}</h3>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}><Zap size={10} />{v.engine_type}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}><ShieldCheck size={10} />{v.condition}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} />{v.city}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Reg: {v.registration_no || 'N/A'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={10} />{v.available_from} → {v.available_to}
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>${v.price_per_day}<span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--text-secondary)' }}>/day</span></span>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => setDeleteConfirm(v.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ width: '640px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setError(''); }} style={{ position: 'absolute', right: '20px', top: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>

              <h2 style={{ marginBottom: '6px' }}>List a Vehicle</h2>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Fill in all the details for renters to see.</p>

              {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

              <form onSubmit={handleSubmit} className="flex-col gap-4">

                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Vehicle Name *</label>
                    <input type="text" required placeholder="e.g. Toyota Corolla 2022" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Type *</label>
                    <select value={form.type} onChange={e => handleChange('type', e.target.value)}>
                      <option value="Car">Car</option><option value="SUV">SUV</option><option value="Bike">Bike</option><option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Engine Type *</label>
                    <select value={form.engine_type} onChange={e => handleChange('engine_type', e.target.value)}>
                      <option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Condition *</label>
                    <select value={form.condition} onChange={e => handleChange('condition', e.target.value)}>
                      <option>Excellent</option><option>Good</option><option>Fair</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>City *</label>
                    <select value={form.city} onChange={e => handleChange('city', e.target.value)} required>
                      <option value="">Select City</option>
                      {PAKISTAN_CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Rent / Day (USD) *</label>
                    <input type="number" required min="1" placeholder="e.g. 50" value={form.price_per_day} onChange={e => handleChange('price_per_day', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Year *</label>
                    <input type="number" required min="1990" max={new Date().getFullYear() + 1} value={form.year} onChange={e => handleChange('year', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Transmission *</label>
                    <select value={form.transmission} onChange={e => handleChange('transmission', e.target.value)}>
                      <option>Automatic</option><option>Manual</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Seats *</label>
                    <input type="number" required min="1" max={15} value={form.seating_capacity} onChange={e => handleChange('seating_capacity', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Insurance Status *</label>
                    <select value={form.is_insured ? 'Yes' : 'No'} onChange={e => handleChange('is_insured', e.target.value === 'Yes')}>
                      <option>Yes</option><option>No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Registration Number *</label>
                    <input type="text" required placeholder="e.g. LEC-1234" value={form.registration_no} onChange={e => handleChange('registration_no', e.target.value)} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Specific Location / Area *</label>
                    <input type="text" required placeholder="e.g. Gulberg III, near Liberty Market" value={form.location} onChange={e => handleChange('location', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Available From *</label>
                    <input type="date" required value={form.available_from} onChange={e => handleChange('available_from', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Available To *</label>
                    <input type="date" required value={form.available_to} onChange={e => handleChange('available_to', e.target.value)} min={form.available_from || new Date().toISOString().split('T')[0]} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Features</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                      {['Air Conditioning', 'Bluetooth', 'GPS / Navigation', 'Sunroof', 'Backup Camera', 'Child Seat', 'Heated Seats'].map(feat => (
                        <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={form.features.includes(feat)} onChange={() => toggleFeature(feat)} />
                          {feat}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Description</label>
                    <textarea rows={3} placeholder="Describe your vehicle — mileage, special notes..." value={form.description} onChange={e => handleChange('description', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
                  </div>
                </div>

                {/* Local Image Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Vehicle Images * <span style={{ fontWeight: 400, fontSize: '11px' }}>(Upload directly from your device)</span>
                  </label>
                  <div style={{ marginBottom: '10px' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <ImagePlus size={16} style={{ marginRight: '6px' }} /> Choose Images
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {form.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                      {form.images.map((url, i) => (
                        <div key={i} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowForm(false); setForm(emptyForm); setError(''); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>{submitting ? 'Listing...' : 'List Vehicle'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ padding: '32px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
              <Trash2 size={40} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: '8px' }}>Remove Listing?</h3>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>This vehicle will be removed from the marketplace. Active bookings may be affected.</p>
              <div className="flex gap-3">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyVehicles;
