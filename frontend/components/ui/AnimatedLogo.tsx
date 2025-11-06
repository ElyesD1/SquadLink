'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'futuristic';
}

export function AnimatedLogo({ size = 'md', showText = true, className = '', variant = 'default' }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const imageSizes = {
    sm: 80,
    md: 96,
    lg: 128
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Futuristic variant for match history and tech screens
  if (variant === 'futuristic') {
    return (
      <motion.div
        className={`flex items-center space-x-4 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Outer blue neon glow */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full`}
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)',
              filter: 'blur(12px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Secondary neon pulse */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full`}
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 60%)',
              filter: 'blur(8px)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          {/* Main logo container with neon border */}
          <motion.div
            className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(96, 165, 250, 0.6)',
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(10, 22, 40, 0.95) 70%)'
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)',
                '0 0 30px rgba(96, 165, 250, 0.8), 0 0 60px rgba(96, 165, 250, 0.5), inset 0 0 30px rgba(96, 165, 250, 0.3)',
                '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Logo Image */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/Logo-Photoroom.png"
                alt="SquadLink Logo"
                width={imageSizes[size]}
                height={imageSizes[size]}
                className="relative z-10"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Orbiting blue particles */}
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full"
            style={{
              boxShadow: '0 0 6px rgba(96, 165, 250, 0.9), 0 0 12px rgba(59, 130, 246, 0.6)',
              transformOrigin: '0px 20px'
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-1 bg-[#5383E8] rounded-full shadow-[0_0_4px_rgba(83,131,232,0.8)]"
            animate={{
              rotate: [180, 540],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: '0px 20px' }}
          />
        </div>
      </motion.div>
    );
  }

  // Default variant (original purple design)
  return (
    <motion.div
      className={`flex items-center space-x-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className={`${sizeClasses[size]} bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/25`}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        />
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br from-white/20 to-white/5 rounded-xl`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${iconSizes[size]} text-white`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent`}>
          SquadLink
        </span>
      )}
    </motion.div>
  );
}