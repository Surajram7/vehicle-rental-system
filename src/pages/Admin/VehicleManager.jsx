import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, CheckCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api';

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Car', price_per_day: '', description: '', image_url: '' });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addVehicle({
        ...formData,
        price_per_day: parseFloat(formData.price_per_day)
      });
      setShowModal(false);
      setFormData({ name: '', type: 'Car', price_per_day: '', description: '', image_url: '' });
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.deleteVehicle(id);
        loadVehicles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.updateVehicleStatus({ id, status: 'available' });
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      await api.updateVehicleVerification({ id, is_verified: currentStatus ? 0 : 1 });
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Manage Vehicles</h1>
          <p className="text-muted">Add, edit, or remove fleet inventory.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Vehicle</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Price/Day</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                  <div className="flex items-center gap-2">
                    {v.name}
                    {v.is_verified === 1 && <ShieldCheck size={14} color="var(--success)" title="Verified" />}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{v.type}</td>
                <td style={{ padding: '16px 24px' }}>${v.price_per_day}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`badge ${v.status}`}>{v.status}</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div className="flex gap-3 justify-end">
                    {v.status === 'pending' && (
                      <button onClick={() => handleApprove(v.id)} style={{ background: 'none', color: 'var(--success)', padding: '4px' }} title="Approve Vehicle">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleVerify(v.id, v.is_verified)} style={{ background: 'none', color: v.is_verified ? 'var(--warning)' : 'var(--text-muted)', padding: '4px' }} title={v.is_verified ? "Unverify Vehicle" : "Verify Vehicle"}>
                      {v.is_verified ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                    </button>
                    <button onClick={() => handleDelete(v.id)} style={{ background: 'none', color: 'var(--danger)', padding: '4px' }} title="Delete Vehicle">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '32px' }}>No vehicles found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="card" style={{ width: '500px', padding: '32px' }}
            >
              <h2 style={{ marginBottom: '24px' }}>Add New Vehicle</h2>
              <form onSubmit={handleAddSubmit} className="flex-col gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Vehicle Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Toyota Corolla" />
                </div>
                <div className="flex gap-4">
                    <div className="w-full">
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="Car">Car</option>
                            <option value="SUV">SUV</option>
                            <option value="Bike">Bike</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price/Day ($)</label>
                        <input type="number" required min="1" step="0.01" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} placeholder="45.00" />
                    </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Image URL (Optional)</label>
                  <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/car.jpg" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                  <textarea rows="3" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Details about the vehicle..." style={{ resize: 'none' }}></textarea>
                </div>
                <div className="flex justify-between mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Vehicle</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleManager;
