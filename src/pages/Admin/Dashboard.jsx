import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, CalendarDays, Key, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../../api';

const StatCard = ({ title, value, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card flex items-center justify-between"
  >
    <div>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>{title}</p>
      <h2 style={{ fontSize: '32px', margin: 0 }}>{value}</h2>
    </div>
    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
      {icon}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0, active: 0, earnings: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Admin Dashboard</h1>
        <p className="text-muted">Overview of your rental business.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value={stats.vehicles} icon={<Car size={28} />} delay={0} />
        <StatCard title="Total Bookings" value={stats.bookings} icon={<CalendarDays size={28} />} delay={0.1} />
        <StatCard title="Active Rentals" value={stats.active} icon={<Key size={28} />} delay={0.2} />
        <StatCard title="Total Earnings" value={`$${Math.round(stats.earnings)}`} icon={<DollarSign size={28} />} delay={0.3} />
      </div>

      <div className="mt-6 flex gap-6">
          <div className="card w-full text-center" style={{ padding: '64px' }}>
             <TrendingUp size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)', opacity: 0.5 }} />
             <h3>Ready to Scale</h3>
             <p className="text-muted text-sm mt-2">More extensive charts and analytics can be added in future updates.</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
