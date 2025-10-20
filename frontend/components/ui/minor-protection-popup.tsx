'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="relative bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-2xl shadow-orange-500/10 overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 border-b border-orange-500/20">
                <button
                  onClick={onCancel}
                  className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Minor Protection Notice
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-orange-500/80">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Age Verification Required</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p className="text-foreground font-medium">
                    We've detected that you may be under 18 years old.
                  </p>
                  
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-orange-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Important Safety Information
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Online gaming platforms may contain mature content</li>
                      <li>• You may encounter inappropriate language or behavior</li>
                      <li>• Some players may not follow community guidelines</li>
                      <li>• We recommend parental supervision for minors</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <p className="text-xs text-red-400 font-medium">
                      <strong>Disclaimer:</strong> SquadLink does not take responsibility for interactions 
                      with other players. Please be cautious when sharing personal information and 
                      report any inappropriate behavior immediately.
                    </p>
                  </div>
                  
                  <p className="text-xs">
                    By proceeding, you acknowledge that you understand these risks and 
                    have permission from a parent or guardian to use this platform.
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 border-muted-foreground/20 hover:bg-muted/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                >
                  I Understand & Agree
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}