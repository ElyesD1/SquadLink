'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/25">
                <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-xl" />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                SquadLink
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl" />
              <div className="w-24 h-10 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-xl" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with stunning animation */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/25"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              />
              <motion.div
                className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              SquadLink
            </span>
          </motion.div>
          
          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.5 }}
                >
                  {theme === 'dark' ? 
                    <Sun className="w-4 h-4 text-yellow-400" /> : 
                    <Moon className="w-4 h-4 text-purple-400" />
                  }
                </motion.div>
              </Button>
            </motion.div>
            
            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300"
                  size="sm"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}