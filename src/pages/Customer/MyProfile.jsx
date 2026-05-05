import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Edit3, Check, X, Car, CalendarDays, BookMarked, Camera, Save, Image as ImageIcon, ShieldCheck, FileText } from 'lucide-react';
import { PAKISTAN_CITIES, APP_NAME } from '../../constants';

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ width: '36px', height: '36px', background: 'var(--accent-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 16, color: 'var(--accent)' })}
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}</div>
    </div>
  </div>
);

const MyProfile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    city: user?.city || '',
    avatar: user?.avatar || '',
    cnic: user?.cnic || '',
    driving_license: user?.driving_license || ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1MB limit check
    if (file.size > 1 * 1024 * 1024) {
      setError(
        <span>
          Max size of image should be 1MB. Greater size is not allowed. Use{' '}
          <a href="https://www.iloveimg.com/compress-image" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}>
            this Image Reducer
          </a>{' '}
          to reduce your image size and then upload.
        </span>
      );
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      set('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError('Max size of driving license image should be 1MB.');
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      set('driving_license', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await api.updateProfile({ id: user.id, ...form });
      if (result.success && result.user) {
        const updatedUser = result.user;
        localStorage.setItem('vrs_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Update failed. Server returned inconsistent data.');
      }
    } catch (err) {
      console.error("Profile Update Error:", err);
      if (err.message.includes('JSON')) {
        setError("Network error: Server response was invalid. Please check if the server is running on port 3001.");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    
    setChangingPassword(true);
    setPassError('');
    try {
      const result = await api.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      if (result.success) {
        setPassSuccess('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => {
            setShowPasswordModal(false);
            setPassSuccess('');
        }, 2000);
      } else {
        setPassError(result.error || 'Failed to change password');
      }
    } catch (err) {
      setPassError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = [
    { icon: <Car />, label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Customer', color: 'var(--accent)', bg: 'var(--accent-bg)' },
    { icon: <Shield />, label: 'Account Status', value: 'Active & Verified', color: 'var(--success)', bg: 'var(--success-bg)' },
    { icon: <CalendarDays />, label: 'Member Since', value: 'April 2026', color: 'var(--info)', bg: 'var(--info-bg)' },
    { icon: <BookMarked />, label: 'City', value: user?.city || 'Not Set', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>View and manage your personal information on {APP_NAME}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Left: Details / Edit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Info Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Personal Information</h3>
              {!editing ? (
                <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => { setEditing(true); setError(''); }}>
                  <Edit3 size={15} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => { setEditing(false); setError(''); setForm({ name: user?.name||'', phone: user?.phone||'', city: user?.city||'', avatar: user?.avatar||'', cnic: user?.cnic||'', driving_license: user?.driving_license||'' }); }}>
                    <X size={15} /> Cancel
                  </button>
                  <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>

            {success && (
              <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={16} /> Profile updated successfully! Changes are synced across your account.
              </div>
            )}
            {error && (
              <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', border: '1px solid var(--danger-border)', lineHeight: '1.5' }}>
                ⚠️ {error}
              </div>
            )}

            {!editing ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <InfoRow icon={<User />} label="Full Name" value={user?.name} />
                <InfoRow icon={<Mail />} label="Email Address" value={user?.email} />
                <InfoRow icon={<ShieldCheck />} label="CNIC Number" value={user?.cnic} />
                <InfoRow icon={<FileText />} label="Driving License" value={user?.driving_license ? 'Uploaded' : 'Not Uploaded'} />
                <InfoRow icon={<Phone />} label="Phone Number" value={user?.phone} />
                <InfoRow icon={<MapPin />} label="City" value={user?.city} />
                <InfoRow icon={<Shield />} label="Account Role" value={user?.role === 'admin' ? 'Administrator' : 'Verified Customer'} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Photo Upload Section */}
                <div style={{ border: '1.5px dashed var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg-gray)', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
                    <div style={{ width: '80px', height: '80px', background: form.avatar ? `url(${form.avatar}) center/cover` : 'var(--border)', borderRadius: '20px', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Camera size={14} />
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Change Profile Photo</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Max size: 1MB. Recommended square aspect ratio.</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <label className="btn btn-ghost" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '12px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                       <ImageIcon size={14} style={{ marginRight: '6px' }} /> Gallery
                       <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <label className="btn btn-ghost" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '12px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                       <Camera size={14} style={{ marginRight: '6px' }} /> Camera
                       <input type="file" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button className="btn btn-ghost" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '12px', height: '38px', borderRadius: '8px' }} onClick={() => {
                        const url = prompt("Paste direct Image URL here:");
                        if (url) set('avatar', url);
                    }}>
                       <Edit3 size={14} style={{ marginRight: '6px' }} /> Link
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" value={form.name} onChange={e => set('name', e.target.value)} style={{ paddingLeft: '38px' }} placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label>CNIC Number</label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" value={form.cnic} onChange={e => set('cnic', e.target.value)} style={{ paddingLeft: '38px' }} placeholder="xxxxx-xxxxxxx-x" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} style={{ paddingLeft: '38px' }} placeholder="03xx-xxxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label>City</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select value={form.city} onChange={e => set('city', e.target.value)} style={{ paddingLeft: '38px' }}>
                        <option value="">Select your city</option>
                        {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Driving License Document</label>
                  {form.driving_license ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-gray)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <FileText size={24} color="var(--accent-primary)" />
                      <div style={{ flex: 1, fontSize: '13px' }}>Document uploaded</div>
                      <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--danger)' }} onClick={() => set('driving_license', '')}>Remove</button>
                    </div>
                  ) : (
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderStyle: 'dashed', cursor: 'pointer' }}>
                      <Camera size={16} style={{ marginRight: '8px' }} /> Upload Driving License (Max 1MB)
                      <input type="file" accept="image/*" onChange={handleLicenseChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Security Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h3 style={{ marginBottom: '16px' }}>Account Security</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-gray)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: 'var(--success-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="var(--success)" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Password</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last changed: At registration</div>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => { setShowPasswordModal(true); setPassError(''); setPassSuccess(''); }}>
                Change Password
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Avatar Card */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 20px' }}>
              <div 
                style={{ 
                  width: '110px', 
                  height: '110px', 
                  background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--accent)', 
                  borderRadius: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '44px', 
                  fontWeight: 800, 
                  color: 'white', 
                  boxShadow: '0 12px 30px var(--accent-bg)',
                  border: '4px solid white',
                  overflow: 'hidden'
                }}
              >
                {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{user?.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'active' : 'available'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
              {user?.role === 'admin' ? '⚙️ Administrator' : '👤 Customer'}
            </span>

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              {user?.city && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <MapPin size={14} color="var(--accent)" /> {user.city}
                </div>
              )}
              {user?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Phone size={14} color="var(--accent)" /> {user.phone}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ background: s.bg, border: '1px solid ' + s.color + '33', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  {React.cloneElement(s.icon, { size: 18 })}
                </div>
                <div style={{ fontSize: '11px', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '400px', maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {passSuccess && <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{passSuccess}</div>}
            {passError && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{passError}</div>}
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Current Password</label>
                <input type="password" required value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>New Password</label>
                <input type="password" required value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} style={{ width: '100%' }} minLength={6} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                <input type="password" required value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} style={{ width: '100%' }} minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }} disabled={changingPassword}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
