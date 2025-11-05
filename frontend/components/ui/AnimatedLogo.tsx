'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'futuristic';
}

export function AnimatedLogo({ size = 'md', showText = true, className = '', variant = 'default' }: AnimatedLogoProps) {
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
          {/* Outer glow ring */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br from-cyan-400 via-[#5383E8] to-cyan-400 opacity-40 blur-lg`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Main hexagon shape */}
          <motion.div
            className={`relative ${sizeClasses[size]} bg-gradient-to-br from-[#0a1628] via-[#5383E8]/30 to-[#0a1628] border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.4)]`}
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
            animate={{
              rotateY: [0, 360],
              borderColor: ['rgba(0,255,255,0.5)', 'rgba(83,131,232,0.8)', 'rgba(0,255,255,0.5)']
            }}
            transition={{
              rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 3, repeat: Infinity }
            }}
          >
            {/* Inner glow */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent`}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Tech corner brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
          </motion.div>

          {/* Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Zap className={`${iconSizes[size]} text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]`} fill="currentColor" />
          </motion.div>

          {/* Orbiting particles */}
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_4px_rgba(0,255,255,0.8)]"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: '0px 20px' }}
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

        {showText && (
          <div className="relative">
            {/* Text glow */}
            <motion.span 
              className={`absolute inset-0 ${textSizes[size]} font-black font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-[#5383E8] to-cyan-400 bg-clip-text text-transparent blur-sm`}
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              SQUADLINK
            </motion.span>
            
            {/* Main text */}
            <span className={`relative ${textSizes[size]} font-black font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-[#5383E8] to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]`}>
              SQUADLINK
            </span>
            
            {/* Tech underline */}
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{
                opacity: [0.3, 1, 0.3],
                scaleX: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </div>
        )}
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