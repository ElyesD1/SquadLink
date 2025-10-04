'use client';

import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Globe, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TestimonialsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { number: '50K+', label: 'Active Teams', icon: Users },
    { number: '99.9%', label: 'Uptime', icon: TrendingUp },
    { number: '180+', label: 'Countries', icon: Globe },
    { number: '4.9/5', label: 'User Rating', icon: Award },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TechFlow',
      avatar: '👩‍💼',
      content: 'SquadLink transformed how our remote team collaborates. The intuitive design and powerful features make it indispensable.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Lead Developer, Innovative Labs',
      avatar: '👨‍💻',
      content: 'The best team collaboration platform I\'ve ever used. Clean, fast, and incredibly well-designed.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Project Manager, StartupXYZ',
      avatar: '👩‍🔬',
      content: 'Game-changer for project management. Our productivity increased by 40% after switching to SquadLink.',
      rating: 5
    }
  ];

  if (!mounted) {
    return (
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-32">
            <h2 className="text-5xl md:text-7xl font-black mb-16 leading-tight">
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Trusted Globally
              </span>
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <motion.div className="container mx-auto relative z-10">
        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-16 leading-tight">
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Trusted Globally
            </span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2"
                  >
                    {stat.number}
                  </motion.div>
                  <p className="text-muted-foreground font-semibold">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-6xl font-black mb-8">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              What Teams Say
            </span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of teams who've transformed their collaboration with SquadLink
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -15, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              {/* Card Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
                whileHover={{ scale: 1.1 }}
              />
              
              <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-purple-500/10">
                {/* Quote Icon */}
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                >
                  <Quote className="w-6 h-6 text-white" />
                </motion.div>

                {/* Review Content */}
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex items-center mb-6 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    </motion.div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-2xl mr-4 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}