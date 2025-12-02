'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Menu, 
  X, 
  User, 
  Trophy, 
  Settings,
  LogOut,
  Gamepad2,
  TrendingUp,
  History,
  Zap
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

interface NavigationDrawerProps {
  children: React.ReactNode;
}

export default function NavigationDrawer({ children }: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const currentTheme = theme || 'dark';

  const navigationItems = [
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      description: 'Account & Games'
    },
    {
      href: '/parties',
      label: 'Find Parties',
      icon: Gamepad2,
      description: 'Join or Create Squads'
    },
    {
      href: '/match-history',
      label: 'Match History',
      icon: History,
      description: 'Your Recent Games'
    },
    {
      href: '/esports',
      label: 'eSports News',
      icon: Trophy,
      description: 'League of Legends'
    }
  ];

  const handleSignOut = async () => {
    // Clear all client-side storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Sign out and redirect to login
    await signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    });
  };

  return (
    <>
      {/* Futuristic Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-[60] group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Button glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Button container */}
        <div className="relative bg-gradient-to-br from-[#0a1628] to-[#1a2f4a] p-3 border-2 border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
          
          <Menu className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
        </div>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* Futuristic Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] border-l-2 border-cyan-400/30 shadow-[0_0_50px_rgba(0,255,255,0.3)] z-[60] overflow-hidden"
          >
            {/* Tech grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50"></div>
            
            {/* Animated scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            
            {/* Side accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00ffff]"></div>
            
            {/* Header */}
            <div className="relative z-10 p-6 border-b border-cyan-400/20">
              {/* Top tech line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-4">
                <AnimatedLogo size="sm" variant="futuristic" showText={false} />
                
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 group"
                >
                  {/* Button glow */}
                  <div className="absolute inset-0 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <X className="relative w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
                </motion.button>
              </div>
              
              <div className="relative">
                <h2 className="text-xl font-black font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-[#5383E8] to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                  SQUADLINK
                </h2>
                <p className="text-sm text-gray-400 font-mono mt-1">Gaming Community Hub</p>
                
                {/* Underline tech effect */}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
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
            </div>

            {/* Navigation Items */}
            <div className="relative z-10 p-6 space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className={`relative flex items-center gap-4 p-4 transition-all duration-200 overflow-hidden group ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400/20 to-[#5383E8]/20'
                          : 'hover:bg-cyan-400/10'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-[#5383E8] shadow-[0_0_10px_#00ffff]"
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                      )}
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Corner brackets */}
                      {isActive && (
                        <>
                          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/50"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/50"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/50"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/50"></div>
                        </>
                      )}
                      
                      {/* Icon with glow */}
                      <div className="relative">
                        <Icon className={`w-5 h-5 relative z-10 ${
                          isActive 
                            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' 
                            : 'text-[#5383E8] group-hover:text-cyan-400'
                        } transition-colors`} />
                        {isActive && (
                          <div className="absolute inset-0 bg-cyan-400/30 blur-md"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <div className={`font-bold font-mono ${
                          isActive 
                            ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' 
                            : 'text-white group-hover:text-cyan-400'
                        } transition-colors`}>
                          {item.label}
                        </div>
                        <div className={`text-xs font-mono ${
                          isActive 
                            ? 'text-cyan-400/70' 
                            : 'text-gray-500 group-hover:text-cyan-400/70'
                        } transition-colors`}>
                          {item.description}
                        </div>
                      </div>
                      
                      {/* Arrow indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="text-cyan-400"
                        >
                          <Zap className="w-4 h-4" fill="currentColor" />
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-cyan-400/20 bg-gradient-to-t from-[#0a1628]/95 to-transparent backdrop-blur-sm">
              {/* Top tech line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
              
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-3 w-full p-3 overflow-hidden group"
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/0 group-hover:border-red-500/50 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/0 group-hover:border-red-500/50 transition-colors"></div>
                
                <LogOut className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] relative z-10" />
                <span className="relative z-10 text-white font-mono font-bold group-hover:text-red-400 transition-colors">Sign Out</span>
              </motion.button>
            </div>

            {/* Animated particles */}
            <motion.div 
              className="absolute top-32 -left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <motion.div 
              className="absolute bottom-40 -right-10 w-24 h-24 bg-[#5383E8]/10 rounded-full blur-3xl"
              animate={{
                scale: [1.3, 1, 1.3],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="min-h-screen">
        {children}
      </div>
    </>
  );
}