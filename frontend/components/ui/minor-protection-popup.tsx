'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, X } from 'lucide-react';

interface MinorProtectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MinorProtectionPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel 
}: MinorProtectionPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div 
              className="relative bg-gradient-to-br from-[#0a1628]/95 to-[#0f1f3a]/95 backdrop-blur-xl border-2 border-orange-500/30 shadow-[0_0_50px_rgba(251,146,60,0.3)] overflow-hidden"
              style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
            >
              {/* Corner brackets - Orange theme */}
              <motion.div 
                className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500 z-10"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500 z-10"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500 z-10"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500 z-10"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />

              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 border-b border-orange-500/20">
                <button
                  onClick={onCancel}
                  className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center border-2 border-orange-500/30 bg-[#0f1f3a]/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all z-20"
                  style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="p-2 bg-orange-500/20 border-2 border-orange-500/40"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                  >
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-black font-mono uppercase tracking-wider text-orange-400">
                    Minor Protection Notice
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-orange-400/80">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-bold font-mono uppercase tracking-wider">Age Verification Required</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3 text-sm leading-relaxed">
                  <p className="text-gray-100 font-semibold">
                    We've detected that you may be under 18 years old.
                  </p>
                  
                  <div 
                    className="bg-orange-500/5 border-2 border-orange-500/30 p-4 space-y-2"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <h4 className="font-black font-mono uppercase tracking-wider text-orange-400 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Important Safety Information
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400 font-mono">
                      <li>• Online gaming platforms may contain mature content</li>
                      <li>• You may encounter inappropriate language or behavior</li>
                      <li>• Some players may not follow community guidelines</li>
                      <li>• We recommend parental supervision for minors</li>
                    </ul>
                  </div>
                  
                  <div 
                    className="bg-red-500/5 border-2 border-red-500/30 p-4"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <p className="text-xs text-red-400 font-mono">
                      <strong className="text-red-400">DISCLAIMER:</strong> SquadLink does not take responsibility for interactions 
                      with other players. Please be cautious when sharing personal information and 
                      report any inappropriate behavior immediately.
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-500 font-mono">
                    By proceeding, you acknowledge that you understand these risks and 
                    have permission from a parent or guardian to use this platform.
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border-2 border-gray-500/30 bg-transparent text-gray-300 hover:bg-gray-500/10 hover:border-gray-400/50 font-bold font-mono uppercase tracking-wider text-sm transition-all"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="relative flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black font-mono uppercase tracking-wider text-sm transition-all overflow-hidden group"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">I Understand & Agree</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}