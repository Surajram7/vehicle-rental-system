import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Bell, LogOut } from 'lucide-react';
import { APP_NAME } from '../../constants';

const pageTitles = {
  '/': 'Browse Vehicles',
  '/my-bookings': 'My Bookings',
  '/my-vehicles': 'My Listings',
  '/received-bookings': 'Received Bookings',
  '/profile': 'My Profile',
  '/dashboard': 'Dashboard',
  '/manage-vehicles': 'Manage Vehicles',
  '/manage-bookings': 'Manage Bookings',
  '/manage-users': 'Manage Users',
};

const pageSubtitles = {
  '/': `Find and book your perfect vehicle on ${APP_NAME}.`,
  '/my-bookings': 'Track all your active and past rentals.',
  '/my-vehicles': 'Manage your listed vehicles for rent.',
  '/received-bookings': 'Review and manage incoming booking requests.',
  '/profile': 'View and update your personal information.',
  '/dashboard': 'Overview of all system activity.',
  '/manage-vehicles': 'Add, edit or remove vehicle listings.',
  '/manage-bookings': 'Review and manage all bookings.',
  '/manage-users': 'Manage user accounts and access.',
};

const MainLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const title = pageTitles[location.pathname] || 'VRS Auto';
  const subtitle = pageSubtitles[location.pathname] || '';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>
              {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button style={{ width: '34px', height: '34px', background: 'var(--bg-gray)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative', flexShrink: 0 }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: '#4f46e5', borderRadius: '50%', border: '1.5px solid white' }} />
            </button>
            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '5px 12px 5px 5px', 
                background: 'var(--bg-gray)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'white'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-gray)'}
            >
              <div 
                style={{ 
                  width: '26px', 
                  height: '26px', 
                  background: user?.avatar ? `url(${user.avatar}) center/cover` : '#4f46e5', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  color: 'white',
                  overflow: 'hidden'
                }}
              >
                {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{user?.role === 'admin' ? 'Admin' : 'Customer'}</div>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              title="Log Out"
              style={{ 
                width: '34px', height: '34px', background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: 'var(--danger)', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' 
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
