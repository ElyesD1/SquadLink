'use client';

import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Navigation() {
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-cyan-400/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-[#5383E8]" style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }} />
              <span className="text-2xl font-black font-mono bg-gradient-to-r from-cyan-400 to-[#5383E8] bg-clip-text text-transparent">
                SQUADLINK
              </span>
            </div>
            <div className="w-32 h-10 bg-gradient-to-r from-cyan-400/20 to-[#5383E8]/20 border border-cyan-400/40" style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }} />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-[#0a1628]/80 backdrop-blur-xl border-b border-cyan-400/20 shadow-2xl shadow-cyan-400/10' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <AnimatedLogo size="sm" variant="futuristic" />
          </motion.div>
          
          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div 
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400/20 to-[#5383E8]/20 border border-cyan-400/40 hover:border-cyan-400/60 transition-all duration-300"
                  style={{
                    clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                  }}
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                  
                  <span className="relative z-10 flex items-center font-mono text-sm uppercase tracking-wider text-cyan-400">
                    GET STARTED
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}