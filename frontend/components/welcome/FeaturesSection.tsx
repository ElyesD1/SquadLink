'use client';

import { motion } from 'framer-motion';
import { Users, Gamepad2, MessageSquare, Sparkles, Search, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Squad Formation",
      description: "Create or join gaming squads based on your favorite games and skill level.",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-400/20 to-blue-500/20",
      shadowColor: "shadow-cyan-400/30",
      textColor: "text-cyan-400"
    },
    {
      icon: Search,
      title: "Player Matching",
      description: "Find players with similar gaming preferences, skill levels, and availability.",
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-500/20 to-cyan-400/20",
      shadowColor: "shadow-blue-500/30",
      textColor: "text-blue-400"
    },
    {
      icon: MessageSquare,
      title: "Communication",
      description: "Chat with your squad members and coordinate your gaming sessions effectively.",
      gradient: "from-cyan-400 to-blue-400",
      bgGradient: "from-cyan-400/20 to-blue-400/20",
      shadowColor: "shadow-cyan-400/30",
      textColor: "text-cyan-400"
    },
    {
      icon: Gamepad2,
      title: "Multi-Game Support",
      description: "Connect across multiple gaming platforms and discover new games with friends.",
      gradient: "from-blue-400 to-cyan-500",
      bgGradient: "from-blue-400/20 to-cyan-500/20",
      shadowColor: "shadow-blue-400/30",
      textColor: "text-blue-400"
    },
    {
      icon: UserPlus,
      title: "Friend Network",
      description: "Build lasting gaming friendships and expand your gaming network.",
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
      shadowColor: "shadow-cyan-500/30",
      textColor: "text-cyan-400"
    }
  ];

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <motion.div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 mb-6"
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
                  Gaming Community Features
                </span>
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-black font-mono mb-6 leading-tight uppercase tracking-wider"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              Built for
            </span>
            <span className="block bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(83,131,232,0.3)]">
              Gamers
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need to connect with fellow gamers, form lasting friendships, 
            and dominate your favorite games together.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <motion.div
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="h-full"
              >
                <div className={`relative h-full bg-gradient-to-br ${feature.bgGradient} p-[2px] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300`}
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                >
                  <div className="h-full bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 backdrop-blur-xl p-8 relative"
                    style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                  >
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 ${feature.shadowColor} group-hover:shadow-lg`}
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-black" />
                    </motion.div>

                    {/* Content */}
                    <h3 className={`text-2xl font-mono font-bold mb-4 uppercase tracking-wider ${feature.textColor} transition-colors duration-300`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Background Elements - Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
}

export default FeaturesSection;
