'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Zap, Sparkles, Brain, Rocket, Globe, Lock, Heart } from 'lucide-react';
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
      title: "Team Collaboration",
      description: "Connect and collaborate with your team members seamlessly in real-time.",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      hoverGradient: "from-blue-400 via-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      shadowColor: "shadow-blue-500/25"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your data is protected with military-grade encryption and security protocols.",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      hoverGradient: "from-emerald-400 via-green-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      shadowColor: "shadow-emerald-500/25"
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      description: "Optimized for speed with cutting-edge technology and global CDN delivery.",
      gradient: "from-yellow-500 via-orange-600 to-red-600",
      hoverGradient: "from-yellow-400 via-orange-500 to-red-500",
      bgGradient: "from-yellow-500/10 to-red-500/10",
      shadowColor: "shadow-yellow-500/25"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent analytics and recommendations powered by machine learning.",
      gradient: "from-purple-500 via-violet-600 to-indigo-600",
      hoverGradient: "from-purple-400 via-violet-500 to-indigo-500",
      bgGradient: "from-purple-500/10 to-indigo-500/10",
      shadowColor: "shadow-purple-500/25"
    },
    {
      icon: Rocket,
      title: "Rapid Deployment",
      description: "Deploy and scale your projects instantly with our cloud infrastructure.",
      gradient: "from-pink-500 via-rose-600 to-red-600",
      hoverGradient: "from-pink-400 via-rose-500 to-red-500",
      bgGradient: "from-pink-500/10 to-red-500/10",
      shadowColor: "shadow-pink-500/25"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect teams across the world with low-latency, high-availability infrastructure.",
      gradient: "from-cyan-500 via-teal-600 to-blue-600",
      hoverGradient: "from-cyan-400 via-teal-500 to-blue-500",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
      shadowColor: "shadow-cyan-500/25"
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
                  Enterprise-Grade Features
                </span>
              </div>
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Why Teams Choose
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              SquadLink?
            </span>
          </h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Built for modern teams who demand excellence, security, and performance. 
            <span className="text-violet-400 font-semibold"> Experience the difference.</span>
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -20, 
                rotateY: 5,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className="relative group perspective-1000"
            >
              {/* Glow Effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={false}
                whileHover={{ scale: 1.1 }}
              />
              
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${feature.gradient} p-[1px] rounded-3xl ${feature.shadowColor} shadow-2xl group-hover:shadow-3xl transition-all duration-500`}>
                <Card className="bg-background/90 backdrop-blur-xl rounded-3xl border-0 overflow-hidden h-full group-hover:bg-background/95 transition-all duration-500">
                  <CardContent className="p-8">
                    {/* Icon Container */}
                    <motion.div
                      className="mb-6 relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadowColor} relative overflow-hidden`}>
                        <feature.icon className="w-8 h-8 text-white relative z-10" />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      
                      {/* Floating particles around icon */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-1 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                          animate={{
                            x: [0, 20, -20, 0],
                            y: [0, -20, 20, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                          }}
                          style={{
                            left: `${20 + i * 15}px`,
                            top: `${20 + i * 10}px`,
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    <motion.h3 
                      className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {feature.description}
                    </p>
                    
                    {/* Bottom accent line */}
                    <motion.div
                      className={`mt-6 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      viewport={{ once: true }}
                    />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-lg font-medium">
              Trusted by <span className="text-violet-400 font-bold">50,000+</span> teams worldwide
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}