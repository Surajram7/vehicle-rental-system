import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_NAME, APP_TAGLINE, PAKISTAN_CITIES } from '../../constants';
import Logo from '../../components/Common/Logo';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', phone: '', cnic: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(form);
    if (result.success) navigate('/');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      {/* Left Brand */}
      <div className="auth-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
          <Logo size="lg" />
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>{APP_NAME}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Premium Rental Service</div>
          </div>
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '38px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '16px' }}>
          Pakistan's Most Trusted<br />
          <span style={{ color: 'var(--accent-light)' }}>Rental Network.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '36px', maxWidth: '380px' }}>
          {APP_TAGLINE}
        </p>
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', maxWidth: '380px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Why {APP_NAME}?</div>
          {['Verified local vehicle owners','Flexible daily pricing','Your data is always secure','List & earn from your driveway'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--accent-light)', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-wrapper" style={{ width: '520px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%' }}>
          <div className="auth-form-card">
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>Create account</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fill in your details to get started on {APP_NAME}.</p>
            </div>

            {error && (
              <div style={{ padding: '11px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--danger-border)' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ali Hassan" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div>
                <label>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="ali@example.com" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>City</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <select value={form.city} onChange={e => set('city', e.target.value)} style={{ paddingLeft: '32px' }}>
                      <option value="">Select city</option>
                      {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label>CNIC Number *</label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" required value={form.cnic} onChange={e => set('cnic', e.target.value)} placeholder="xxxxx-xxxxxxx-x" style={{ paddingLeft: '32px' }} />
                  </div>
                </div>
              </div>
              <div>
                <label>Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="03xx-xxxxxxx" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div>
                <label>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: '4px', fontSize: '14px' }} disabled={loading}>
                {loading ? <span className="spinner" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link></span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
