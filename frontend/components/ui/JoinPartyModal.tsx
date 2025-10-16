'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import RoleSelector, { Position } from './RoleSelector';

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

  const requiresRole = gameMode !== 'aram';

  useEffect(() => {
    if (isOpen && requiresRole) {
      fetchAvailableRoles();
    } else {
      setSelectedRole(null);
      setMessage('');
    }
  }, [isOpen, partyId, requiresRole]);

  const fetchAvailableRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/available-positions`);
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
      const response = await fetch(`http://localhost:3001/party/${partyId}/request-join`, {
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
        alert('✅ Join request sent successfully!');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      alert('Failed to send join request');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`
                w-full max-w-2xl rounded-2xl p-6
                ${
                  theme === 'light'
                    ? 'bg-white shadow-2xl'
                    : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${getTextClass(theme)}`}>
                    Join Party
                  </h2>
                  <p className={`text-sm ${getSecondaryTextClass(theme)} mt-1`}>
                    {partyName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${
                      theme === 'light'
                        ? 'hover:bg-gray-100'
                        : 'hover:bg-white/10'
                    }
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Role Selection */}
                {requiresRole && (
                  <div>
                    {isLoadingRoles ? (
                      <div className="text-center py-8">
                        <div className={`text-sm ${getSecondaryTextClass(theme)}`}>
                          Loading available roles...
                        </div>
                      </div>
                    ) : availableRoles.length === 0 ? (
                      <div
                        className={`
                          p-4 rounded-lg text-center
                          ${
                            theme === 'light'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-red-500/10 text-red-400'
                          }
                        `}
                      >
                        No roles available. This party is full or all roles are taken.
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
                  <label className={`block text-sm font-medium ${getTextClass(theme)} mb-2`}>
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself or add a message for the party leader..."
                    rows={4}
                    className={`
                      w-full px-4 py-3 rounded-xl resize-none
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50
                      ${
                        theme === 'light'
                          ? 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                          : 'bg-white/5 border border-white/10 text-white placeholder:text-white/40'
                      }
                    `}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (requiresRole && !selectedRole) || (requiresRole && availableRoles.length === 0)}
                  className={`
                    flex-1 font-semibold
                    ${
                      isSubmitting || (requiresRole && !selectedRole) || (requiresRole && availableRoles.length === 0)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    }
                  `}
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
