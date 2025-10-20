'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad2, Shield, Sparkles } from 'lucide-react';
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
          <div className="bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                ✨ Connect with gamers worldwide
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
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Find Your
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Gaming
            </span>
            <span className="block bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-clip-text text-transparent">
              Squad
            </span>
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Connect with like-minded gamers, form squads, and dominate your favorite games together. 
          <span className="text-violet-400 font-semibold"> Build lasting gaming friendships.</span>
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
              <Button 
                size="lg" 
                className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-white border-0 shadow-2xl shadow-purple-500/25 px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                <span className="relative z-10 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Join the Community
                  <ArrowRight className="w-6 h-6 ml-3" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5"
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </Button>
            </motion.div>
          </Link>
          
          <Link href="/auth/login">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/5 backdrop-blur-sm border-2 border-white/20 hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300"
              >
                <Gamepad2 className="w-6 h-6 mr-3" />
                Sign In
              </Button>
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
              rotateY: 5,
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-[1px] rounded-2xl">
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 h-full">
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <p className="text-lg font-bold text-center">Find Your Team</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
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
              rotateY: 5,
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-[1px] rounded-2xl">
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 h-full">
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <p className="text-lg font-bold text-center">Play Together</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
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
              rotateY: 5,
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-[1px] rounded-2xl">
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 h-full">
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <p className="text-lg font-bold text-center">Safe Environment</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Secure platform with community guidelines
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-400 rounded-full"
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
        className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400 rounded-full"
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
        className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400 rounded-full"
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
    </section>
  );
}