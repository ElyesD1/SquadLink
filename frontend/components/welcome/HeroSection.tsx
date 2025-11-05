'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad2, Shield, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <motion.div className="container mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center space-x-2 mb-8"
        >
          <div className="relative bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-cyan-400/10 backdrop-blur-sm border border-cyan-400/30 px-6 py-2"
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-sm font-mono uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Connect with gamers worldwide
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-black font-mono leading-tight mb-6 uppercase tracking-wider">
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              Find Your
            </span>
            <span className="block bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(83,131,232,0.3)]">
              Gaming
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              Squad
            </span>
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Connect with like-minded gamers, form squads, and dominate your favorite games together. 
          <span className="text-cyan-400 font-semibold"> Build lasting gaming friendships.</span>
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Link href="/auth/register">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 p-[2px] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
              >
                <div className="bg-[#0a1628] px-8 py-4 relative overflow-hidden group"
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                >
                  <span className="relative z-10 flex items-center text-lg font-mono uppercase tracking-wider text-cyan-400">
                    <Users className="w-6 h-6 mr-3" />
                    Join Community
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          </Link>
          
          <Link href="/auth/login">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-cyan-400/20 p-[2px] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
              >
                <div className="bg-[#0a1628]/80 backdrop-blur-sm px-8 py-4"
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                >
                  <span className="flex items-center text-lg font-mono uppercase tracking-wider text-gray-300">
                    <Gamepad2 className="w-6 h-6 mr-3" />
                    Sign In
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Core Values Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="relative bg-gradient-to-br from-cyan-400/20 to-blue-500/20 p-[2px] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300"
              style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
            >
              <div className="bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 backdrop-blur-xl p-6 h-full"
                style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>
                
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-400/50"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-6 h-6 text-black" />
                  </motion.div>
                </div>
                <p className="text-lg font-mono font-bold text-center uppercase tracking-wider text-cyan-400">Find Your Team</p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Connect with players who share your gaming style
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-400/20 p-[2px] hover:shadow-[0_0_30px_rgba(83,131,232,0.3)] transition-all duration-300"
              style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
            >
              <div className="bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 backdrop-blur-xl p-6 h-full"
                style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/60"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/60"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/60"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/60"></div>
                
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/50"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Gamepad2 className="w-6 h-6 text-black" />
                  </motion.div>
                </div>
                <p className="text-lg font-mono font-bold text-center uppercase tracking-wider text-blue-400">Play Together</p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Form squads and dominate your favorite games
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="relative bg-gradient-to-br from-cyan-400/20 to-blue-400/20 p-[2px] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300"
              style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
            >
              <div className="bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 backdrop-blur-xl p-6 h-full"
                style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>
                
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center shadow-lg shadow-cyan-400/50"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Shield className="w-6 h-6 text-black" />
                  </motion.div>
                </div>
                <p className="text-lg font-mono font-bold text-center uppercase tracking-wider text-cyan-400">Safe Environment</p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Secure platform with community guidelines
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Elements - Floating particles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400"
        style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500"
        style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400"
        style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/5 w-2 h-2 bg-blue-400"
        style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-cyan-500"
        style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          delay: 1.5,
        }}
      />
    </section>
  );
}