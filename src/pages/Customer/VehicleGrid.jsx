import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, Filter, X, CheckCircle2, Car, MapPin, Zap, 
  ShieldCheck, Phone, User, ChevronLeft, ChevronRight, 
  Calendar, Star, ArrowRight, Layout, Info 
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
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

  const handleBook = (vehicle) => {
    navigate(`/vehicle/${vehicle.id}`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <input type="number" placeholder="Min $" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} style={{ width: '80px', padding: '8px' }} />
           <span>-</span>
           <input type="number" placeholder="Max $" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} style={{ width: '80px', padding: '8px' }} />
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <p className="text-muted">{filteredVehicles.length} vehicles available</p>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Layout size={16} /> Grid
          </button>
          <button onClick={() => setViewMode('map')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'map' ? 'var(--accent-primary)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <MapPin size={16} /> Map
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="vehicle-grid">
            {filteredVehicles.map(vehicle => (
              <motion.div key={vehicle.id} className="card" whileHover={{ y: -8 }} style={{ overflow: 'hidden', padding: 0 }}>
                <ImageCarousel images={vehicle.images} />
                <div style={{ padding: '20px' }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{vehicle.name}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <MapPin size={12} /> {vehicle.city}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>${vehicle.price_per_day}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>per day</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <div className="flex items-center gap-2">
                       <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: vehicle.owner_avatar ? `url(${vehicle.owner_avatar}) center/cover` : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          {!vehicle.owner_avatar && vehicle.owner_name?.charAt(0)}
                       </div>
                       <span style={{ fontSize: '12px' }}>{vehicle.owner_name}</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} disabled={vehicle.status !== 'available' || vehicle.owner_id === user?.id} onClick={() => handleBook(vehicle)}>
                      {vehicle.owner_id === user?.id ? 'Your Car' : 'View Details'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ height: '600px', padding: 0, overflow: 'hidden', position: 'relative', background: '#1a1d2e' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000) center/cover' }} />
            {filteredVehicles.map((v, i) => {
              const seed = v.id * 12345;
              const x = 10 + (seed % 80);
              const y = 10 + ((seed / 100) % 80);
              return (
                <motion.div key={v.id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, cursor: 'pointer', zIndex: 5 }}>
                  <div onClick={() => handleBook(v)} style={{ background: v.status === 'available' ? 'var(--accent-primary)' : 'var(--danger)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    <Car size={14} style={{ marginRight: '4px' }} /> ${v.price_per_day}
                  </div>
                </motion.div>
              );
            })}
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '12px 24px', borderRadius: '30px', color: 'white', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={16} color="var(--accent-primary)" /> Click a price pin to view vehicle details
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleGrid;
