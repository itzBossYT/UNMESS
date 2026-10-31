import React, { useRef, useEffect } from 'react';

export default function TelevisionGlitchBackground({ active = true, isDark = true }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (active) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [active]);

  return (
    <div 
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background Video (Television Glitch Texture) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src="/television-glitch.mp4"
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isDark 
            ? 'opacity-30 mix-blend-screen filter contrast-125 brightness-110' 
            : 'opacity-10 mix-blend-multiply filter contrast-100'
        }`}
      />

      {/* Cybernetic Grid & CRT Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark 
            ? 'linear-gradient(rgba(167, 139, 250, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.04) 1px, transparent 1px)' 
            : 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Vignette Gradient Overlay for Text Contrast */}
      <div 
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#09090b]/60 via-[#09090b]/80 to-[#09090b]/95'
            : 'bg-gradient-to-b from-[#f8fafc]/50 via-[#f8fafc]/75 to-[#f8fafc]/90'
        }`}
      />

      {/* Radiant Floating Aurora Glow Orbs */}
      <div className="absolute top-[-15%] left-[25%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-violet-600/15 via-primary/10 to-transparent blur-[140px] pointer-events-none animate-float" />
      <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-emerald-500/15 via-tertiary/10 to-transparent blur-[140px] pointer-events-none animate-float-delayed" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-500/10 via-purple-600/10 to-transparent blur-[130px] pointer-events-none animate-float" />
    </div>
  );
}
