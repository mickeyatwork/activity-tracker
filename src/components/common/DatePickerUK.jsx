import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateUK, parseDateUK } from '../../utils/date';

export function DatePickerUK({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(() => formatDateUK(value));
  
  // Parse initial view year and month from value (YYYY-MM-DD)
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

  const containerRef = useRef(null);

  // Sync text when external value changes
  useEffect(() => {
    setInputText(formatDateUK(value));
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle typing DD/MM/YYYY
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    // If matches complete DD/MM/YYYY
    if (text.length === 10) {
      const parsed = parseDateUK(text);
      if (parsed) {
        onChange(parsed);
      }
    }
  };

  const handleInputBlur = () => {
    const parsed = parseDateUK(inputText);
    if (parsed) {
      onChange(parsed);
    } else {
      // Revert to valid value
      setInputText(formatDateUK(value));
    }
  };

  const handleSelectDay = (day) => {
    const yyyy = String(viewYear).padStart(4, '0');
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    onChange(iso);
    setIsOpen(false);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Calendar calculations (UK Monday-based)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  const mondayOffset = (firstDayOfWeek + 6) % 7; // 0 for Mon, 6 for Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Current selected day comparison
  const selectedParts = value ? value.split('-').map(Number) : [];
  const isSelected = (day) => {
    if (selectedParts.length !== 3) return false;
    return selectedParts[0] === viewYear && (selectedParts[1] - 1) === viewMonth && selectedParts[2] === day;
  };

  const today = new Date();
  const isToday = (day) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <input 
          type="text" 
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          className="w-full bg-white border border-gray-300 rounded-lg p-3 pr-10 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open calendar"
          className="absolute right-3 p-1 text-gray-500 hover:text-indigo-600 rounded-md transition cursor-pointer"
        >
          <Calendar size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-72 animate-in fade-in slide-in-from-top-2">
          {/* Quick Shortcuts */}
          <div className="flex space-x-2 mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(-1)}
              className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition cursor-pointer"
            >
              Yesterday
            </button>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-sm text-gray-800">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map(d => (
              <span key={d} className="text-2xs font-bold text-gray-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset days */}
            {Array.from({ length: mondayOffset }).map((_, i) => (
              <span key={`blank-${i}`} className="w-8 h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const currentDay = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : currentDay
                      ? 'border border-indigo-400 text-indigo-700 hover:bg-indigo-50 font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
