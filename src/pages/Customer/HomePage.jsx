import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Car, ShieldCheck, Clock, Star } from 'lucide-react';
import { PAKISTAN_CITIES } from '../../constants';

const HomePage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('All Cities');
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/vehicles');
  };

  const steps = [
    { icon: <MapPin size={32} />, title: 'Choose Location', desc: 'Select your city to find local vehicles.' },
    { icon: <Calendar size={32} />, title: 'Pick Dates', desc: 'Select your rental dates and duration.' },
    { icon: <Car size={32} />, title: 'Book Your Ride', desc: 'Confirm your booking and hit the road.' }
  ];

  const testimonials = [
    { name: 'Ali Khan', role: 'Frequent Traveler', text: 'Amazing service! Rented a car for a weekend trip to Murree and it was flawless.', rating: 5 },
    { name: 'Ayesha Ahmed', role: 'Business User', text: 'Very professional owners. The vehicle was clean and well maintained.', rating: 5 },
    { name: 'Usman Tariq', role: 'Customer', text: 'Loved the transparency with prices. No hidden charges!', rating: 4 }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div style={{ 
        position: 'relative', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '60px'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px', maxWidth: '800px' }}>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', color: 'white' }}>
            Drive Your Dreams Today
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px' }}>
            Discover the best local vehicles for rent. Secure, affordable, and flexible.
          </motion.p>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)', 
              padding: '16px', 
              borderRadius: '16px', 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <MapPin size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '15px' }}
              >
                <option value="All Cities">Where are you going?</option>
                {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 32px', fontSize: '16px', borderRadius: '8px' }}>
              Search Vehicles
            </button>
          </motion.form>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(99,102,241,0.05)' }}>
          <ShieldCheck size={40} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Verified Owners</h3>
          <p className="text-muted" style={{ fontSize: '14px' }}>All vehicles belong to ID-verified owners for your safety.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(99,102,241,0.05)' }}>
          <Car size={40} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Variety of Vehicles</h3>
          <p className="text-muted" style={{ fontSize: '14px' }}>From economy cars to luxury SUVs and bikes.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(99,102,241,0.05)' }}>
          <Clock size={40} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Flexible Timings</h3>
          <p className="text-muted" style={{ fontSize: '14px' }}>Rent by day or week with flexible pickup/drop-off.</p>
        </div>
      </div>

      {/* How it Works */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ flex: '1', minWidth: '220px', maxWidth: '280px' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative' }}>
                {step.icon}
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {i + 1}
                </div>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{step.title}</h3>
              <p className="text-muted" style={{ fontSize: '15px' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>What Our Users Say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {testimonials.map((test, i) => (
            <motion.div 
              key={i} 
              className="card" 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} fill={j < test.rating ? "var(--warning, #f59e0b)" : "transparent"} color={j < test.rating ? "var(--warning, #f59e0b)" : "var(--border)"} />
                ))}
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>"{test.text}"</p>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{test.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{test.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
