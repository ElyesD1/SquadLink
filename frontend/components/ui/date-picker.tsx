'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, subYears, startOfDay, differenceInYears } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select your birth date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  const today = new Date();
  const minDate = subYears(today, 120); // 120 years ago
  const maxDate = subYears(today, 13); // 13 years ago (minimum age)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onChange(date);
    setIsOpen(false);
  };

  const getAge = (birthDate: Date) => {
    return differenceInYears(startOfDay(today), startOfDay(birthDate));
  };

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <div className="pl-12 pr-4 py-3 h-12 bg-background border border-border rounded-lg hover:border-violet-500/50 transition-colors duration-200 flex items-center">
          {selectedDate ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-foreground">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </span>
              <span className="text-sm text-muted-foreground">
                Age: {getAge(selectedDate)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Date Picker Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-violet-500/10 p-6 backdrop-blur-xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Select Your Birth Date
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We need your age to ensure appropriate content
                  </p>
                </div>
                
                <style jsx global>{`
                  .rdp {
                    --rdp-cell-size: 40px;
                    --rdp-accent-color: rgb(139 92 246);
                    --rdp-background-color: rgb(139 92 246 / 0.1);
                    --rdp-outline: 2px solid var(--rdp-accent-color);
                    margin: 0;
                  }
                  
                  .rdp-months {
                    display: flex;
                    justify-content: center;
                  }
                  
                  .rdp-month {
                    margin: 0;
                  }
                  
                  .rdp-table {
                    margin: 0;
                    max-width: none;
                  }
                  
                  .rdp-head_row {
                    margin-bottom: 0.5rem;
                  }
                  
                  .rdp-head_cell {
                    color: rgb(var(--muted-foreground));
                    font-weight: 600;
                    font-size: 0.875rem;
                  }
                  
                  .rdp-cell {
                    padding: 0;
                  }
                  
                  .rdp-button {
                    border: none;
                    background: none;
                    color: rgb(var(--foreground));
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s;
                  }
                  
                  .rdp-button:hover {
                    background-color: rgb(139 92 246 / 0.1);
                    color: rgb(139 92 246);
                  }
                  
                  .rdp-day_selected {
                    background-color: rgb(139 92 246);
                    color: white;
                  }
                  
                  .rdp-day_selected:hover {
                    background-color: rgb(124 58 237);
                    color: white;
                  }
                  
                  .rdp-day_today {
                    font-weight: bold;
                    color: rgb(139 92 246);
                  }
                  
                  .rdp-day_outside {
                    color: rgb(var(--muted-foreground));
                    opacity: 0.5;
                  }
                  
                  .rdp-nav {
                    margin-bottom: 1rem;
                  }
                  
                  .rdp-nav_button {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgb(139 92 246 / 0.1);
                    color: rgb(139 92 246);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                  }
                  
                  .rdp-nav_button:hover {
                    background: rgb(139 92 246 / 0.2);
                  }
                  
                  .rdp-caption_label {
                    color: rgb(var(--foreground));
                    font-weight: 600;
                    font-size: 1rem;
                  }
                `}</style>
                
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={{ after: maxDate, before: minDate }}
                  defaultMonth={subYears(today, 25)}
                  captionLayout="dropdown"
                  fromYear={today.getFullYear() - 120}
                  toYear={today.getFullYear() - 13}
                />
                
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Must be between 13 and 120 years old
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}