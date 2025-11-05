'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Github, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const footerLinks = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Integrations']
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Blog', 'Press']
    },
    {
      title: 'Resources',
      links: ['Documentation', 'API', 'Help Center', 'Community']
    }
  ];

  return (
    <footer className="relative border-t border-cyan-400/20 bg-[#050a15]/95 backdrop-blur-xl overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-blue-500/5 to-cyan-400/5" />
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-32 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 blur-3xl"
        animate={{
          x: [0, 100, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-400 shadow-lg shadow-cyan-400/25"
                  style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity }
                  }}
                >
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-black" />
                </motion.div>
              </div>
              <span className="text-2xl font-black font-mono uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                SquadLink
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              The next-generation gaming community platform that transforms how you connect and play together.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="relative w-10 h-10 bg-cyan-400/10 backdrop-blur-sm border border-cyan-400/20 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 group"
                  style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-mono font-bold mb-6 uppercase tracking-wider text-cyan-400">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: linkIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.a
                      href="#"
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 relative group"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link}
                      <motion.div
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300"
                      />
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          className="pt-8 border-t border-cyan-400/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© 2025 SquadLink.</span>
              <span>Built with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-cyan-400 fill-current" />
              </motion.div>
              <span>for better gaming.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Terms of Service
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Cookie Policy
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-cyan-400"
          style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute bottom-4 left-8 w-1 h-1 bg-blue-400"
          style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </div>
    </footer>
  );
}