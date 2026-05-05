import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, Users, LogOut, Search, PlusCircle, BookMarked, MapPin, Phone, UserCircle, ChevronRight, History, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../constants';
import Logo from '../Common/Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => { 
    e.stopPropagation();
    logout(); 
    window.location.href = '/login'; 
  };

  const adminLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/manage-vehicles', icon: <Car size={16} />, label: 'Vehicles' },
    { to: '/manage-bookings', icon: <CalendarDays size={16} />, label: 'Bookings' },
    { to: '/manage-users', icon: <Users size={16} />, label: 'Users' },
    { to: '/audit-logs', icon: <History size={16} />, label: 'Audit Logs' },
  ];

  const userLinks = [
    { to: '/', icon: <Home size={16} />, label: 'Home' },
    { to: '/vehicles', icon: <Search size={16} />, label: 'Browse Vehicles' },
    { to: '/my-bookings', icon: <CalendarDays size={16} />, label: 'My Bookings' },
    { to: '/my-vehicles', icon: <PlusCircle size={16} />, label: 'My Listings' },
    { to: '/received-bookings', icon: <BookMarked size={16} />, label: 'Received Bookings' },
    { to: '/profile', icon: <UserCircle size={16} />, label: 'My Profile' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: '24px', gap: '16px' }}>
        <Logo size="md" />
        <div>
          <div className="sidebar-logo-text" style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>{APP_NAME}</div>
          <div className="sidebar-logo-sub" style={{ fontSize: '11px', color: '#94a3b8' }}>Premium Marketplace</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">{user?.role === 'admin' ? 'Administration' : 'Main Menu'}</div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* User card - Clickable to Profile */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
        <div 
          onClick={() => navigate('/profile')}
          style={{ 
            background: 'rgba(255,255,255,0.04)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '10px', 
            padding: '12px', 
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '34px', 
                height: '34px', 
                background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--accent)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: 800, 
                fontSize: '13px', 
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-light)' }}>{user?.role === 'admin' ? 'Administrator' : 'View Profile'}</div>
            </div>
            <ChevronRight size={14} color="var(--sidebar-text)" />
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost w-full" style={{ fontSize: '13px', padding: '8px', color: '#64748b', borderRadius: '8px', justifyContent: 'flex-start', gap: '8px' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
