import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_NAME, APP_TAGLINE } from '../../constants';
import Logo from '../../components/Common/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    if (result.success) navigate('/');
    else setError(result.error);
    setLoading(false);
  };

  const features = [
    'Browse 1000+ verified vehicles across Pakistan',
    'Filter by city, engine type & availability',
    'List your own car and earn daily income',
    'Secure bookings with owner contact details',
  ];

  return (
    <div className="auth-wrapper">
      {/* Left Brand Panel */}
      <div className="auth-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
          <Logo size="lg" />
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>{APP_NAME}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Premium Rental Service</div>
          </div>
        </div>

        <div style={{ display: 'inline-block', background: 'rgba(58, 119, 255, 0.15)', border: '1px solid rgba(58, 119, 255, 0.3)', borderRadius: '20px', padding: '5px 14px', marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 600 }}>🚗 {APP_TAGLINE}</span>
        </div>

        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '40px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '16px' }}>
          Rent a car.<br />
          <span style={{ color: 'var(--accent-light)' }}>Or earn from yours.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px', maxWidth: '400px' }}>
          Pakistan's easiest way to rent vehicles from verified local owners — or list your own and start earning from day one.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '22px', height: '22px', background: 'rgba(35, 229, 219, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={13} color="var(--accent-light)" />
              </div>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-wrapper">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%' }}>
          <div className="auth-form-card">
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>Sign in</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Welcome back to {APP_NAME}.</p>
            </div>

            {error && (
              <div style={{ padding: '11px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: '4px', fontSize: '14px' }} disabled={loading}>
                {loading ? <span className="spinner" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one free →</Link></span>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--bg-gray)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo Access</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Admin: <code style={{ color: 'var(--accent)', background: 'var(--accent-bg)', padding: '1px 5px', borderRadius: '4px' }}>admin@rental.com</code> / <code style={{ color: 'var(--accent)', background: 'var(--accent-bg)', padding: '1px 5px', borderRadius: '4px' }}>admin123</code></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
