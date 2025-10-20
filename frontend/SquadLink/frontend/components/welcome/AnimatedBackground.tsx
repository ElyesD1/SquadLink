'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Generate consistent particles (not random)
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: (i * 7) % 100,
    y: (i * 11) % 100,
    size: (i % 4) + 1,
    duration: (i % 20) + 10,
    delay: (i % 5),
  }));

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-blue-900/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-blue-900/20" />
      
      {/* Animated Grid Pattern */}
      <motion.div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </motion.div>

      {/* Mouse-following spotlight */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-radial from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Floating Orbs with 3D effect */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 opacity-60"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-blue-500/30 rounded-full blur-3xl shadow-2xl shadow-violet-500/20" />
      </motion.div>
      
      <motion.div
        className="absolute top-3/4 right-1/4 w-96 h-96 opacity-50"
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 50, -100, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-teal-500/30 rounded-full blur-3xl shadow-2xl shadow-blue-500/20" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/4 left-1/2 w-72 h-72 opacity-40"
        animate={{
          x: [0, -80, 80, 0],
          y: [0, -60, 60, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-lime-500/30 rounded-full blur-3xl shadow-2xl shadow-emerald-500/20" />
      </motion.div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            opacity: [0, 1, 0],
            scale: [0, particle.size, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-1/3 right-1/3 w-4 h-4 border-2 border-violet-400/50 rotate-45"
        animate={{
          rotate: [45, 405],
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 left-1/5 w-6 h-6 border-2 border-blue-400/50 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-2/3 left-2/3 w-5 h-5 bg-gradient-to-br from-purple-400/50 to-pink-400/50 rotate-12"
        animate={{
          rotate: [12, 372],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Radial gradients for depth */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-transparent via-violet-900/5 to-purple-900/10" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-transparent via-blue-900/5 to-cyan-900/10" />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-noise-texture" />
    </div>
  );
}