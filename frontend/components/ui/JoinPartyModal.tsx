'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import RoleSelector, { Position } from './RoleSelector';
import { API_URL } from '@/lib/constants';

interface JoinPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyId: string;
  partyName: string;
  gameMode: string;
  userEmail: string;
  onSuccess: () => void;
  theme?: string;
}

export default function JoinPartyModal({
  isOpen,
  onClose,
  partyId,
  partyName,
  gameMode,
  userEmail,
  onSuccess,
  theme = 'dark',
}: JoinPartyModalProps) {
  const [selectedRole, setSelectedRole] = useState<Position | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Position[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresRole = gameMode !== 'aram';

  useEffect(() => {
    if (isOpen && requiresRole) {
      fetchAvailableRoles();
    } else {
      setSelectedRole(null);
      setMessage('');
      setError(null);
    }
  }, [isOpen, partyId, requiresRole]);

  const fetchAvailableRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await fetch(`${API_URL}/party/${partyId}/available-positions`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    if (requiresRole && !selectedRole) {
      alert('Please select a role');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/party/${partyId}/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || 'I would like to join your party!',
          requestedPosition: selectedRole,
          userEmail,
        }),
      });

      if (response.ok) {
        setError(null);
        alert('✅ Join request sent successfully!');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      setError('Failed to send join request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl p-6 bg-gradient-to-br from-[#0a1628]/95 to-[#0f1f3a]/95 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] relative"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400"></div>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono uppercase tracking-wider">
                    JOIN PARTY
                  </h2>
                  <p className="text-sm text-white/60 mt-1 font-mono">
                    {partyName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-cyan-400/10 border border-cyan-400/30 transition-all duration-300 hover:border-cyan-400/60 relative group"
                >
                  {/* Corner Brackets for Close Button */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/40 group-hover:border-cyan-400"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/40 group-hover:border-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/40 group-hover:border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/40 group-hover:border-cyan-400"></div>
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-2 border-red-500/30 bg-red-500/10 relative"
                  >
                    {/* Corner Brackets for Error */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-400"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-400"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-400"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-400"></div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1 text-red-400 font-mono uppercase text-sm tracking-wider">UNABLE TO JOIN PARTY</h4>
                        <p className="text-sm text-red-300 font-mono">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="flex-shrink-0 p-1 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Role Selection */}
                {requiresRole && (
                  <div className="p-6 bg-gradient-to-br from-[#0a1628]/30 to-[#0f1f3a]/30 border border-cyan-400/20 relative">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400/40"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400/40"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400/40"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40"></div>
                    
                    {isLoadingRoles ? (
                      <div className="text-center py-8">
                        <div className="text-sm text-cyan-400 font-mono uppercase tracking-wider animate-pulse">
                          LOADING AVAILABLE ROLES...
                        </div>
                      </div>
                    ) : availableRoles.length === 0 ? (
                      <div className="p-4 bg-red-500/10 text-red-400 text-center border border-red-500/30 relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-red-400/50"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-red-400/50"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-red-400/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-red-400/50"></div>
                        <p className="font-mono uppercase text-sm tracking-wider">
                          NO ROLES AVAILABLE - PARTY FULL
                        </p>
                      </div>
                    ) : (
                      <RoleSelector
                        selectedRole={selectedRole}
                        onRoleSelect={setSelectedRole}
                        availableRoles={availableRoles}
                        theme={theme}
                      />
                    )}
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                    MESSAGE (OPTIONAL)
                  </label>
                  <div className="relative">
                    {/* Corner Brackets for Textarea */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/40 pointer-events-none z-10"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/40 pointer-events-none z-10"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/40 pointer-events-none z-10"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/40 pointer-events-none z-10"></div>
                    
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Introduce yourself or add a message for the party leader..."
                      rows={4}
                      className="w-full px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 bg-gradient-to-r from-[#0a1628]/80 to-[#0f1f3a]/80 border border-cyan-400/30 text-white placeholder:text-white/40 font-mono hover:border-cyan-400/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-400/30 text-white font-bold font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 relative group"
                  disabled={isSubmitting}
                >
                  {/* Corner Brackets for Cancel Button */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-400/40 group-hover:border-red-400"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-400/40 group-hover:border-red-400"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-400/40 group-hover:border-red-400"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-400/40 group-hover:border-red-400"></div>
                  CANCEL
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (requiresRole && !selectedRole) || (requiresRole && availableRoles.length === 0)}
                  className={`
                    flex-1 font-bold font-mono uppercase tracking-wider relative group transition-all duration-300
                    ${
                      isSubmitting || (requiresRole && !selectedRole) || (requiresRole && availableRoles.length === 0)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500/30'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]'
                    }
                  `}
                >
                  {!(isSubmitting || (requiresRole && !selectedRole) || (requiresRole && availableRoles.length === 0)) && (
                    <>
                      {/* Corner Brackets for Send Button */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/40 group-hover:border-cyan-400"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/40 group-hover:border-cyan-400"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/40 group-hover:border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/40 group-hover:border-cyan-400"></div>
                    </>
                  )}
                  {isSubmitting ? 'SENDING...' : 'SEND REQUEST'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
