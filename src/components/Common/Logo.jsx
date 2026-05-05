import React from 'react';

const Logo = ({ size = 'md' }) => {
  const scaleMapping = {
    sm: 0.6,
    md: 0.85,
    lg: 1.4
  };
  const scale = scaleMapping[size] || 0.85;
  const baseSize = 80 * scale;

  return (
    <div 
      style={{ 
        width: `${baseSize}px`, 
        height: `${baseSize}px`, 
        background: 'white', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1.5px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        flexShrink: 0
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      <svg width={60 * scale} height={60 * scale} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* The Key - Perfectly tilted as gm1460865445 */}
        <g transform="rotate(-30, 40, 40)">
          {/* Key Head */}
          <circle cx="30" cy="40" r="14" fill="black" />
          <circle cx="30" cy="40" r="4.5" fill="white" />
          {/* Key Shaft */}
          <rect x="44" y="36.5" width="30" height="7" fill="black" />
          {/* Key Teeth */}
          <path d="M58 43.5L62 48H66L62 43.5H58Z" fill="black" />
          <path d="M66 43.5L70 48H74L70 43.5H66Z" fill="black" />
        </g>

        {/* Keychain Ring */}
        <path d="M26 48C20 55 20 65 28 68" stroke="black" strokeWidth="4" strokeLinecap="round" />

        {/* The Price Tag - sloped side shape */}
        <path d="M28 68L38 58H76C78.2091 58 80 59.7909 80 62V80C80 82.2091 78.2091 84 76 84H38L28 74V68Z" fill="black" />
        
        {/* Tag Hole */}
        <circle cx="34" cy="71" r="3" fill="white" />

        {/* RENT Text */}
        <text x="44" y="76.5" fill="white" fontWeight="900" fontSize="12" fontFamily="Arial, sans-serif">RENT</text>
      </svg>
    </div>
  );
};

export default Logo;
