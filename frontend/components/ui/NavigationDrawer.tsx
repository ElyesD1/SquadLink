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
  TrendingUp
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
      href: '/esports',
      label: 'eSports News',
      icon: Trophy,
      description: 'League of Legends'
    }
  ];

  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <>
      {/* Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className={`w-6 h-6 ${getTextClass(currentTheme)}`} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 h-full w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
            
            {/* Header */}
            <div className="relative z-10 p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <AnimatedLogo size="sm" />
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className={`w-5 h-5 ${getTextClass(currentTheme)}`} />
                </motion.button>
              </div>
              <div>
                <h2 className={`${getTextClass(currentTheme)} text-xl font-bold`}>SquadLink</h2>
                <p className={`${getSecondaryTextClass(currentTheme)} text-sm`}>Gaming Community Hub</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="relative z-10 p-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                          : `hover:bg-white/10 ${getTextClass(currentTheme)}`
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-500'}`} />
                      <div className="flex-1">
                        <div className={`font-medium ${isActive ? 'text-white' : getTextClass(currentTheme)}`}>
                          {item.label}
                        </div>
                        <div className={`text-sm ${isActive ? 'text-white/70' : getSecondaryTextClass(currentTheme)}`}>
                          {item.description}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-card/50">
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 ${getTextClass(currentTheme)}`}
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Sign Out</span>
              </motion.button>
            </div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute top-32 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <motion.div 
              className="absolute bottom-40 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 0.3, 0.6],
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