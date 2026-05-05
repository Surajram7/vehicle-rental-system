import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, X, CheckCircle2, Car, MapPin, Zap, ShieldCheck, Phone, User, ChevronLeft, ChevronRight, Calendar, Star, ArrowRight } from 'lucide-react';
import { api } from '../../api';
import { PAKISTAN_CITIES } from '../../constants';

const FILTER_CITIES = ['All Cities', ...PAKISTAN_CITIES];

function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const imgs = images && images.length > 0 ? images : [];
  if (imgs.length === 0) {
    return (
      <div style={{ height: '180px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Car size={56} color="var(--text-secondary)" opacity={0.2} />
      </div>
    );
  }
  return (
    <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={imgs[idx]}
          alt="vehicle"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        />
      </AnimatePresence>
      {imgs.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + imgs.length) % imgs.length); }}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % imgs.length); }}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
            <ChevronRight size={16} />
          </button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 2 }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const VehicleGrid = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterFuel, setFilterFuel] = useState('All');
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [withDriver, setWithDriver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data.map(v => ({ ...v, images: typeof v.images === 'string' ? JSON.parse(v.images) : (v.images || []) })));
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  }, []);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      setLoadingReviews(true);
      api.getVehicleReviews(selectedVehicle.id)
        .then(data => setReviews(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingReviews(false));
    } else {
      setReviews([]);
    }
  }, [selectedVehicle]);

  const handleBook = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedVehicle || !agreedToTerms) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    // Calculate total price: vehicle price + driver price if selected
    const dailyPrice = selectedVehicle.price_per_day + (withDriver ? 15 : 0); // $15/day for driver
    const rentalAmount = days * dailyPrice;
    const securityDeposit = Math.round(rentalAmount * 0.2); // 20%
    const taxes = Math.round(rentalAmount * 0.05); // 5% tax
    const totalPrice = rentalAmount + securityDeposit + taxes;
    
    navigate('/payment', { 
      state: { 
        vehicle: selectedVehicle, 
        startDate, 
        endDate, 
        totalPrice,
        withDriver,
        rentalAmount,
        securityDeposit,
        taxes
      } 
    });
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'All' || v.type === filterType;
    const matchCity = filterCity === 'All Cities' || v.city === filterCity;
    const matchMinPrice = filterMinPrice === '' || v.price_per_day >= parseFloat(filterMinPrice);
    const matchMaxPrice = filterMaxPrice === '' || v.price_per_day <= parseFloat(filterMaxPrice);
    const matchFuel = filterFuel === 'All' || v.engine_type === filterFuel;
    const matchTransmission = filterTransmission === 'All' || v.transmission === filterTransmission;
    
    return matchSearch && matchType && matchCity && matchMinPrice && matchMaxPrice && matchFuel && matchTransmission;
  });

  const totalDays = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const currentDailyPrice = selectedVehicle ? selectedVehicle.price_per_day + (withDriver ? 15 : 0) : 0;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1>Browse Vehicles</h1>
        <p className="text-muted">Find and book your perfect ride from local owners.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4" style={{ marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search vehicles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '44px', width: '100%' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ paddingLeft: '38px', width: '120px', cursor: 'pointer' }}>
            <option value="All">All Types</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Bike">Bike</option>
            <option value="Van">Van</option>
          </select>
        </div>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} style={{ paddingLeft: '38px', width: '140px', cursor: 'pointer' }}>
            {FILTER_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        {/* Advanced Filters */}
        <div style={{ position: 'relative' }}>
          <select value={filterFuel} onChange={(e) => setFilterFuel(e.target.value)} style={{ width: '120px', cursor: 'pointer' }}>
            <option value="All">Any Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterTransmission} onChange={(e) => setFilterTransmission(e.target.value)} style={{ width: '120px', cursor: 'pointer' }}>
            <option value="All">Any Trans</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <input type="number" placeholder="Min $" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} style={{ width: '80px', padding: '8px' }} />
           <span>-</span>
           <input type="number" placeholder="Max $" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} style={{ width: '80px', padding: '8px' }} />
        </div>
      </div>

      {/* Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: '64px' }}>
          <Car size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No vehicles found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card flex-col"
              style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={{ position: 'relative' }}>
                <ImageCarousel images={vehicle.images} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 3 }}>
                  <span className={`badge ${vehicle.status}`}>{vehicle.status}</span>
                </div>
              </div>

              <div style={{ padding: '18px' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>{vehicle.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{vehicle.type}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--warning, #f59e0b)' }}>
                      <Star size={11} fill="var(--warning, #f59e0b)" /> {vehicle.rating || 'New'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3" style={{ marginBottom: '10px', flexWrap: 'wrap' }}>
                  {vehicle.year && (
                    <span style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      {vehicle.year}
                    </span>
                  )}
                  {vehicle.transmission && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {vehicle.transmission}
                    </span>
                  )}
                  {vehicle.seating_capacity && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={11} />{vehicle.seating_capacity} Seats
                    </span>
                  )}
                  {vehicle.engine_type && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={11} />{vehicle.engine_type}
                    </span>
                  )}
                  {vehicle.city && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} />{vehicle.city}
                    </span>
                  )}
                  {vehicle.is_insured === 1 && (
                    <span style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      <ShieldCheck size={11} />Insured
                    </span>
                  )}
                </div>

                <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {vehicle.description}
                </p>

                {vehicle.available_from && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} /> Available: {vehicle.available_from} → {vehicle.available_to}
                  </div>
                )}

                {/* Owner */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Owner</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} color="var(--accent-primary)" />{vehicle.owner_name}
                  </div>
                  {vehicle.owner_city && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={11} />{vehicle.owner_city}</div>}
                  {vehicle.owner_phone && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={11} />{vehicle.owner_phone}</div>}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>${vehicle.price_per_day}</span>
                    <span className="text-muted" style={{ fontSize: '12px' }}>/day</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    disabled={vehicle.status !== 'available' || vehicle.owner_id === user?.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    {vehicle.owner_id === user?.id ? 'Your Car' : vehicle.status === 'available' ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="card" style={{ width: '560px', maxWidth: '100%', padding: '0', overflow: 'hidden', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Vehicle Images in Modal */}
              <div style={{ height: '220px', position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
                <ImageCarousel images={selectedVehicle.images} />
              </div>

              <div style={{ padding: '28px' }}>
                <button onClick={() => { setSelectedVehicle(null); setBookingStatus(null); setStartDate(''); setEndDate(''); }}
                  style={{ position: 'absolute', right: '20px', top: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
                  <X size={18} />
                </button>

                {bookingStatus === 'success' ? (
                  <div className="flex-col items-center justify-center text-center" style={{ padding: '32px 0' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--success)', marginBottom: '16px' }}>
                      <CheckCircle2 size={64} />
                    </motion.div>
                    <h2>Booking Confirmed!</h2>
                    <p className="text-muted">Your booking for <strong>{selectedVehicle.name}</strong> has been submitted.</p>
                  </div>
                ) : (
                  <>
                    {/* Vehicle Details */}
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ marginBottom: '6px' }}>{selectedVehicle.name}</h2>
                      <div className="flex gap-3" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '20px' }}>{selectedVehicle.type}</span>
                        {selectedVehicle.engine_type && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={11} />{selectedVehicle.engine_type}</span>}
                        {selectedVehicle.registration_no && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={11} />{selectedVehicle.registration_no}</span>}
                      </div>
                      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>{selectedVehicle.description}</p>
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>SPECIFIC LOCATION</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--accent-primary)" />{selectedVehicle.location || selectedVehicle.city || 'N/A'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>AVAILABILITY</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} color="var(--accent-primary)" />{selectedVehicle.available_from || 'Anytime'} → {selectedVehicle.available_to || 'Anytime'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>OWNER</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedVehicle.owner_name}
                          {selectedVehicle.owner_verified === 1 && <CheckCircle2 size={14} color="var(--success)" title="Verified CNIC" />}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} />{selectedVehicle.owner_city}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>CONTACT</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} color="var(--accent-primary)" />{selectedVehicle.owner_phone || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Features List */}
                    {selectedVehicle.features && (typeof selectedVehicle.features === 'string' ? JSON.parse(selectedVehicle.features) : selectedVehicle.features).length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>VEHICLE FEATURES</h3>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                          {(typeof selectedVehicle.features === 'string' ? JSON.parse(selectedVehicle.features) : selectedVehicle.features).map((feat, i) => (
                            <span key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{feat}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {bookingStatus === 'error' && (
                      <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        Failed to create booking. Please try again.
                      </div>
                    )}

                    <form onSubmit={handleBook} className="flex-col gap-4">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Start Date</label>
                          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} min={selectedVehicle.available_from || new Date().toISOString().split('T')[0]} max={selectedVehicle.available_to || undefined} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>End Date</label>
                          <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || selectedVehicle.available_from || new Date().toISOString().split('T')[0]} max={selectedVehicle.available_to || undefined} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input type="checkbox" id="withDriver" checked={withDriver} onChange={e => setWithDriver(e.target.checked)} style={{ width: 'auto' }} />
                        <label htmlFor="withDriver" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>Include Driver (+$15/day)</label>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                           <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rental Amount ({totalDays} days {withDriver ? '+ driver' : ''})</div>
                           <div style={{ fontWeight: 600 }}>${totalDays * currentDailyPrice}</div>
                        </div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                           <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Security Deposit (20%)</div>
                           <div style={{ fontWeight: 600 }}>${Math.round(totalDays * currentDailyPrice * 0.2)}</div>
                        </div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                           <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Taxes (5%)</div>
                           <div style={{ fontWeight: 600 }}>${Math.round(totalDays * currentDailyPrice * 0.05)}</div>
                        </div>
                        <div className="flex justify-between items-center" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                           <div style={{ fontWeight: 700 }}>Total Payable</div>
                           <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                             ${Math.round(totalDays * currentDailyPrice) + Math.round(totalDays * currentDailyPrice * 0.2) + Math.round(totalDays * currentDailyPrice * 0.05)}
                           </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
                        <input type="checkbox" id="agreedToTerms" required checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ width: 'auto', marginTop: '4px' }} />
                        <label htmlFor="agreedToTerms" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                          I have read and agree to the <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Rental Agreement</a> and confirm my provided information is accurate.
                        </label>
                      </div>

                      <button type="submit" className="btn btn-primary w-full" disabled={totalDays === 0 || !agreedToTerms}>
                        Continue to Payment <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                      </button>
                    </form>

                    {/* Reviews Section */}
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Star size={18} fill="var(--warning, #f59e0b)" color="var(--warning, #f59e0b)" /> 
                         Reviews ({reviews.length})
                      </h3>
                      
                      {loadingReviews ? (
                        <div className="spinner" style={{ margin: '20px auto' }} />
                      ) : reviews.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: '13px', fontStyle: 'italic' }}>No reviews yet for this vehicle.</p>
                      ) : (
                        <div className="flex-col gap-4">
                          {reviews.map(r => (
                            <div key={r.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                              <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: r.user_avatar ? `url(${r.user_avatar}) center/cover` : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    {!r.user_avatar && r.user_name?.charAt(0)}
                                  </div>
                                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.user_name}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= r.rating ? 'var(--warning, #f59e0b)' : 'transparent'} color={s <= r.rating ? 'var(--warning, #f59e0b)' : 'var(--text-muted)'} />)}
                                </div>
                              </div>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{r.comment}</p>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleGrid;
