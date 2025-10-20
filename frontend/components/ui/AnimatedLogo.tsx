'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function AnimatedLogo({ size = 'md', showText = true, className = '' }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
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