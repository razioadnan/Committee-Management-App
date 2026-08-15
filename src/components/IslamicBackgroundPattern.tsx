import React from 'react';

export const IslamicBackgroundPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-[0.035] ${className}`}
    >
      <svg
        className="w-full h-full text-emerald-950"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="islamic-star-grid"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star rosette tile */}
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              {/* Outer octagram lines */}
              <polygon points="60,10 74,46 110,60 74,74 60,110 46,74 10,60 46,46" />
              {/* Interlocking square 1 */}
              <rect x="25" y="25" width="70" height="70" />
              {/* Interlocking square 2 rotated 45 deg */}
              <rect
                x="25"
                y="25"
                width="70"
                height="70"
                transform="rotate(45 60 60)"
              />
              {/* Central inner star */}
              <polygon
                points="60,35 67,53 85,60 67,67 60,85 53,67 35,60 53,53"
                strokeWidth="0.8"
              />
              {/* Corner connector segments */}
              <path d="M0,0 L30,30 M120,0 L90,30 M120,120 L90,90 M0,120 L30,90" />
              <circle cx="60" cy="60" r="14" strokeWidth="0.6" strokeDasharray="2 2" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-grid)" />
      </svg>
    </div>
  );
};
