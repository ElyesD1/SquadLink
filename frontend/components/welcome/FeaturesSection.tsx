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
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      hoverGradient: "from-blue-400 via-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      shadowColor: "shadow-blue-500/25"
    },
    {
      icon: Search,
      title: "Player Matching",
      description: "Find players with similar gaming preferences, skill levels, and availability.",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      hoverGradient: "from-emerald-400 via-green-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      shadowColor: "shadow-emerald-500/25"
    },
    {
      icon: MessageSquare,
      title: "Communication",
      description: "Chat with your squad members and coordinate your gaming sessions effectively.",
      gradient: "from-yellow-500 via-orange-600 to-red-600",
      hoverGradient: "from-yellow-400 via-orange-500 to-red-500",
      bgGradient: "from-yellow-500/10 to-red-500/10",
      shadowColor: "shadow-yellow-500/25"
    },
    {
      icon: Gamepad2,
      title: "Multi-Game Support",
      description: "Connect across multiple gaming platforms and discover new games with friends.",
      gradient: "from-purple-500 via-violet-600 to-indigo-600",
      hoverGradient: "from-purple-400 via-violet-500 to-indigo-500",
      bgGradient: "from-purple-500/10 to-indigo-500/10",
      shadowColor: "shadow-purple-500/25"
    },
    {
      icon: UserPlus,
      title: "Friend Network",
      description: "Build lasting gaming friendships and expand your gaming network.",
      gradient: "from-pink-500 via-rose-600 to-red-600",
      hoverGradient: "from-pink-400 via-rose-500 to-red-500",
      bgGradient: "from-pink-500/10 to-red-500/10",
      shadowColor: "shadow-pink-500/25"
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
            <div className="bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Gaming Community Features
                </span>
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Built for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Gamers
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
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
                  rotateY: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="h-full"
              >
                <Card className={`h-full bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-white/10 overflow-hidden group-hover:border-white/20 transition-all duration-500 ${feature.shadowColor} group-hover:shadow-xl`}>
                  <CardContent className="p-8 relative">
                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 ${feature.shadowColor} group-hover:shadow-lg`}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1,
                        background: `linear-gradient(135deg, ${feature.hoverGradient})`
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-white transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.1 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Background Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"
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
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
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