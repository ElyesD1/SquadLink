'use client';

import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({ 
  checked, 
  onCheckedChange, 
  label, 
  description, 
  className = '' 
}: SwitchProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="space-y-0.5">
        {label && (
          <label className="text-sm font-medium text-foreground cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => onCheckedChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 
          focus:ring-offset-2 focus:ring-offset-background
          ${checked 
            ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
            : 'bg-muted-foreground/20'
          }
        `}
        aria-checked={checked}
        role="switch"
      >
        <motion.span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 
            transition duration-200 ease-in-out
          `}
          animate={{
            x: checked ? 20 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: checked ? 0.9 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.span>
      </button>
    </div>
  );
}