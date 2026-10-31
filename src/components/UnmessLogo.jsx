import React from 'react';

/**
 * UNMESS Brand Logo - 3 Stacked Isometric Rhombus / Diamond Plates
 * Matches the official competition identity provided by the user.
 */
export default function UnmessLogo({ className = "w-6 h-6", size = 24 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="unmess-grad-top" x1="3" y1="2" x2="21" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="unmess-grad-mid" x1="3" y1="8" x2="21" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="unmess-grad-bot" x1="3" y1="14" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* Top Diamond Plate (Full rhombus) */}
      <path 
        d="M12 2.5L20.8 7L12 11.5L3.2 7L12 2.5Z" 
        fill="url(#unmess-grad-top)"
      />

      {/* Middle Isometric Plate Flap */}
      <path 
        d="M3.2 9.5L12 14L20.8 9.5V11.8L12 16.3L3.2 11.8V9.5Z" 
        fill="url(#unmess-grad-mid)"
      />

      {/* Bottom Isometric Plate Flap */}
      <path 
        d="M3.2 14.8L12 19.3L20.8 14.8V17.1L12 21.6L3.2 17.1V14.8Z" 
        fill="url(#unmess-grad-bot)"
      />
    </svg>
  );
}
