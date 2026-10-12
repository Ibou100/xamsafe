import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Original vector shield logo */}
      <svg
        className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105 duration-200`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Shield with Night Blue fill and Security Green stroke */}
        <path
          d="M24 4L7 11V22C7 32.5 14.3 42.1 24 44.5C33.7 42.1 41 32.5 41 22V11L24 4Z"
          fill="#0C2438"
          stroke="#12B981"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inner Shield Facet */}
        <path
          d="M24 8L11 13.5V22C11 30.2 16.6 37.8 24 40C31.4 37.8 37 30.2 37 22V13.5L24 8Z"
          fill="#15334D"
          opacity="0.8"
        />
        {/* Security Checkmark in Emerald Green */}
        <path
          d="M17 24L22 29L31 18"
          stroke="#12B981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wisdom Star in Vigilance Amber */}
        <circle cx="24" cy="13" r="2.2" fill="#F59E0B" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`${textSizes[size]} font-extrabold leading-none text-slate-900 dark:text-white`}>
            Xam<span className="text-emerald-500">Safe</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
            Prévention Sénégal
          </span>
        </div>
      )}
    </div>
  );
};
