'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050a15]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050a15]">
      {/* Animated grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]"></div>
      
      {/* Large glowing orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#5383E8]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Scan lines effect */}
      <div className="fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      
      {/* Diagonal tech lines */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5383E8]/30 to-transparent"></div>
        <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
        <div className="absolute bottom-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5383E8]/30 to-transparent"></div>
        <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
      </div>
      
      {/* Circuit pattern overlay in corners */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-cyan-400"></div>
        <div className="absolute top-10 right-10 w-32 h-32 border-r-2 border-t-2 border-cyan-400"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 border-l-2 border-b-2 border-cyan-400"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-cyan-400"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: (i % 5) + 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}