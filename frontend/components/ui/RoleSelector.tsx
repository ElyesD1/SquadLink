'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export type Position = 'top' | 'jungle' | 'mid' | 'bot' | 'support';

interface RoleSelectorProps {
  selectedRole: Position | null;
  onRoleSelect: (role: Position) => void;
  availableRoles?: Position[];
  disabled?: boolean;
  theme?: string;
  compact?: boolean;
}

const roleIcons: Record<Position, string> = {
  top: '/Position_Challenger-Top.png',
  jungle: '/Position_Challenger-Jungle.png',
  mid: '/Position_Challenger-Mid.png',
  bot: '/Position_Challenger-Bot.png',
  support: '/Position_Challenger-Support.png',
};

const roleLabels: Record<Position, string> = {
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  bot: 'Bot',
  support: 'Support',
};

export default function RoleSelector({
  selectedRole,
  onRoleSelect,
  availableRoles,
  disabled = false,
  theme = 'dark',
  compact = false,
}: RoleSelectorProps) {
  const allRoles: Position[] = ['top', 'jungle', 'mid', 'bot', 'support'];

  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  const isRoleAvailable = (role: Position) => {
    return !availableRoles || availableRoles.includes(role);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {allRoles.map((role) => {
          const available = isRoleAvailable(role);
          const isSelected = selectedRole === role;

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => {
                if (!disabled && available) {
                  onRoleSelect(role);
                }
              }}
              disabled={disabled || !available}
              className={`
                relative w-10 h-10 rounded-lg overflow-hidden
                transition-all duration-200
                ${
                  isSelected
                    ? 'ring-2 ring-yellow-500'
                    : available
                    ? 'hover:ring-2 hover:ring-yellow-500/50'
                    : 'opacity-30 cursor-not-allowed'
                }
                ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200'
                    : 'bg-white/5 border border-white/10'
                }
              `}
              whileHover={available && !disabled ? { scale: 1.05 } : {}}
              whileTap={available && !disabled ? { scale: 0.95 } : {}}
              title={roleLabels[role]}
            >
              <div className="relative w-full h-full p-1.5">
                <Image
                  src={roleIcons[role]}
                  alt={roleLabels[role]}
                  fill
                  className="object-contain"
                />
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-bl-lg flex items-center justify-center"
                >
                  <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              {!available && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`text-sm font-medium ${getTextClass(theme)}`}>
        Select Your Role
      </div>
      
      <div className="flex gap-3 justify-center">
        {allRoles.map((role) => {
          const available = isRoleAvailable(role);
          const isSelected = selectedRole === role;

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => {
                if (!disabled && available) {
                  onRoleSelect(role);
                }
              }}
              disabled={disabled || !available}
              className={`
                relative flex flex-col items-center gap-1.5
                transition-all duration-200
                ${disabled || !available ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={available && !disabled ? { y: -2 } : {}}
              whileTap={available && !disabled ? { scale: 0.95 } : {}}
            >
              <div
                className={`
                  relative w-14 h-14 rounded-lg overflow-hidden
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'ring-2 ring-yellow-500 scale-105'
                      : available
                      ? 'hover:ring-2 hover:ring-yellow-500/50'
                      : 'opacity-30'
                  }
                  ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200'
                      : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                <div className="relative w-full h-full p-2">
                  <Image
                    src={roleIcons[role]}
                    alt={roleLabels[role]}
                    fill
                    className="object-contain"
                  />
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {!available && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>

              <span className={`text-xs font-medium ${getTextClass(theme)} ${!available ? 'opacity-30' : ''}`}>
                {roleLabels[role]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {availableRoles && availableRoles.length === 0 && (
        <div className={`text-sm text-center py-2 ${getSecondaryTextClass(theme)}`}>
          No roles available
        </div>
      )}
    </div>
  );
}
