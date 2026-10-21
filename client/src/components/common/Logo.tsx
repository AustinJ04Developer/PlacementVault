import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'admin' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  subtitle = 'Drive Q&A Repository',
  className = '',
  variant = 'default',
}) => {
  const sizeMap = {
    sm: { px: 32, text: 'text-base', sub: 'text-[9px]' },
    md: { px: 40, text: 'text-lg', sub: 'text-[10px]' },
    lg: { px: 48, text: 'text-xl', sub: 'text-xs' },
    xl: { px: 60, text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* PlacementVault Brand SVG Emblem */}
      <div
        style={{
          width: `${currentSize.px}px`,
          height: `${currentSize.px}px`,
          minWidth: `${currentSize.px}px`,
          maxWidth: `${currentSize.px}px`,
        }}
        className={`relative flex-shrink-0 flex items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105 ${
          variant === 'admin'
            ? 'shadow-amber-500/20'
            : 'shadow-blue-500/25'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          width={currentSize.px}
          height={currentSize.px}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id={`pv-bg-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {variant === 'admin' ? (
                <>
                  <stop offset="0%" stop-color="#D97706" />
                  <stop offset="50%" stop-color="#B45309" />
                  <stop offset="100%" stop-color="#78350F" />
                </>
              ) : (
                <>
                  <stop offset="0%" stop-color="#2563EB" />
                  <stop offset="50%" stop-color="#4F46E5" />
                  <stop offset="100%" stop-color="#7C3AED" />
                </>
              )}
            </linearGradient>
            <linearGradient id="pv-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FDE047" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
            <linearGradient id="pv-white" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* Rounded Hex-Shield Frame */}
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#pv-bg-${variant})`} />

          {/* Vault Outer Ring with Dial Accents */}
          <circle cx="32" cy="33" r="18" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="3.5 3.5" />
          <circle cx="32" cy="33" r="21" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.2" />

          {/* Placement Graduation Cap */}
          <polygon points="32,15 48,22 32,29 16,22" fill="url(#pv-white)" />
          <path d="M22 25.5 V30 C22 33 26.5 35.5 32 35.5 C37.5 35.5 42 33 42 30 V25.5" fill="none" stroke="url(#pv-white)" stroke-width="2" stroke-linecap="round" />
          
          {/* Golden Tassel */}
          <path d="M44 23.5 L46 29.5 L47 34" stroke="url(#pv-gold)" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="47" cy="34.5" r="1.5" fill="url(#pv-gold)" />

          {/* Vault Safe Chamber & Keyhole */}
          <rect x="25" y="36" width="14" height="15" rx="3.5" fill="#0F172A" stroke="url(#pv-gold)" stroke-width="2" />
          <circle cx="32" cy="41.5" r="2" fill="url(#pv-gold)" />
          <polygon points="31,41.5 33,41.5 33.5,46.5 30.5,46.5" fill="url(#pv-gold)" />

          {/* Subtle Bolt Details */}
          <circle cx="11" cy="11" r="1.8" fill="#FFFFFF" fill-opacity="0.45" />
          <circle cx="53" cy="11" r="1.8" fill="#FFFFFF" fill-opacity="0.45" />
          <circle cx="11" cy="53" r="1.8" fill="#FFFFFF" fill-opacity="0.45" />
          <circle cx="53" cy="53" r="1.8" fill="#FFFFFF" fill-opacity="0.45" />
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight leading-none ${currentSize.text} ${
              variant === 'light'
                ? 'text-white'
                : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent'
            }`}
          >
            Placement<span className={variant === 'admin' ? 'text-amber-500' : 'text-blue-600'}>Vault</span>
          </span>
          {subtitle && (
            <span
              className={`font-bold tracking-widest uppercase mt-0.5 ${currentSize.sub} ${
                variant === 'light' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
