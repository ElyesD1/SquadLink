'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subYears, startOfDay, differenceInYears, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getYear, getMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select your birth date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  
  // Use useMemo to create stable date values that won't cause hydration mismatches
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => subYears(today, 120), [today]); // 120 years ago
  const maxDate = useMemo(() => subYears(today, 13), [today]); // 13 years ago (minimum age)
  const defaultMonth = useMemo(() => subYears(today, 25), [today]);
  
  const [currentMonth, setCurrentMonth] = useState<Date>(defaultMonth);
  
  // Sync with prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    // Check if date is within valid range
    if (date >= minDate && date <= maxDate) {
      setSelectedDate(date);
      onChange(date);
      setIsOpen(false);
    }
  };

  const getAge = (birthDate: Date) => {
    return differenceInYears(startOfDay(today), startOfDay(birthDate));
  };

  // Get days for the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get starting day of week (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before month starts
  const emptyCells = Array(startDayOfWeek).fill(null);
  
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 120 - 13 + 1 },
    (_, i) => today.getFullYear() - 13 - i
  );

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate || date > maxDate;
  };

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
        <div 
          className="pl-12 pr-4 py-3 h-12 bg-[#0f1f3a]/50 border-2 border-cyan-400/30 flex items-center hover:border-cyan-400/50 transition-colors duration-200"
          style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
        >
          {selectedDate ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-gray-100 font-mono">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </span>
              <span className="text-sm text-cyan-400">
                Age: {getAge(selectedDate)}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Date Picker Modal - Fixed positioning to center on screen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div 
                className="relative border-2 border-cyan-400/30 shadow-[0_0_50px_rgba(0,255,255,0.2)] backdrop-blur-xl p-6 bg-gradient-to-br from-[#0a1628]/95 to-[#0f1f3a]/95"
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

                {/* Header */}
                <div className="mb-4 space-y-2">
                  <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">
                    Select Your Birth Date
                  </h3>
                  <p className="text-sm text-gray-400">
                    We need your age to ensure appropriate content
                  </p>
                </div>
                
                {/* Month/Year Selectors */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <select
                    value={getMonth(currentMonth)}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    className="px-3 py-2 bg-[#0f1f3a]/50 border-2 border-cyan-400/30 text-cyan-400 font-mono text-sm focus:border-cyan-400 focus:outline-none"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index} className="bg-[#0a1628] text-cyan-400">
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={getYear(currentMonth)}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="px-3 py-2 bg-[#0f1f3a]/50 border-2 border-cyan-400/30 text-cyan-400 font-mono text-sm focus:border-cyan-400 focus:outline-none"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year} className="bg-[#0a1628] text-cyan-400">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all"
                    style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-base font-bold font-mono uppercase tracking-wider text-cyan-400">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all"
                    style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-2">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-bold font-mono text-cyan-400/60 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {emptyCells.map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}
                    {daysInMonth.map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, today);
                      const isDisabled = isDateDisabled(day);
                      
                      return (
                        <motion.button
                          key={day.toISOString()}
                          onClick={() => !isDisabled && handleDateSelect(day)}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.1 } : {}}
                          whileTap={!isDisabled ? { scale: 0.95 } : {}}
                          className={`
                            relative aspect-square flex items-center justify-center text-sm font-mono
                            transition-all duration-200
                            ${isDisabled 
                              ? 'text-gray-600 cursor-not-allowed opacity-30' 
                              : 'text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-400 cursor-pointer'
                            }
                            ${isSelected 
                              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-[#0a1628] font-bold' 
                              : ''
                            }
                            ${isToday && !isSelected 
                              ? 'border border-cyan-400/50' 
                              : ''
                            }
                          `}
                          style={
                            !isDisabled
                              ? { clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }
                              : {}
                          }
                        >
                          {format(day, 'd')}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-cyan-400/20">
                  <p className="text-xs text-gray-500 text-center font-mono">
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
