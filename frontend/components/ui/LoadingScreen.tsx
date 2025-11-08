"use client";

import { AnimatedLogo } from './AnimatedLogo';

export default function LoadingScreen({ variant = 'futuristic' }: { variant?: 'default' | 'futuristic' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-gradient-to-br from-[#0a1628] via-[#050a15] to-[#0f1f3a]">
      {/* Subtle backdrop - matches app background */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 flex items-center justify-center">
        {/* Use the animated logo without text */}
        <AnimatedLogo size="lg" variant={variant} showText={false} />
      </div>
    </div>
  );
}
