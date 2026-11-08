import React, { useState, useEffect, useRef } from 'react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAYS,
  toPersianDigits,
  toEnglishDigits,
  getTodayJalali,
  jalaliToGregorianISO,
  formatJalali,
  parseDateInput,
  getJalaliMonthDays,
  getJalaliMonthStartWeekday,
} from '../../services/jalali';

export interface JalaliDatePickerProps {
  value?: string; // Jalali (1403/08/25), Gregorian ISO (2024-11-15), or empty
  onChange: (shamsiNumeric: string, gregorianISO: string, displayLong: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  id?: string;
  helperText?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ شمسی...',
  label,
  required = false,
  disabled = false,
  theme = 'dark',
  className = '',
  id,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => getTodayJalali().jy);
  const [viewMonth, setViewMonth] = useState<number>(() => getTodayJalali().jm);
  const [selectedJalali, setSelectedJalali] = useState<{ jy: number; jm: number; jd: number } | null>(null);
  const [pickerView, setPickerView] = useState<'days' | 'months' | 'years'>('days');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop value
  useEffect(() => {
    if (value) {
      const parsed = parseDateInput(value);
      if (parsed) {
        setSelectedJalali({ jy: parsed.jy, jm: parsed.jm, jd: parsed.jd });
        setViewYear(parsed.jy);
        setViewMonth(parsed.jm);
        return;
      }
    }
    // If empty or unparseable
    setSelectedJalali(null);
  }, [value]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setPickerView('days');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const today = getTodayJalali();

  const handleSelectDay = (day: number) => {
    const jy = viewYear;
    const jm = viewMonth;
    const jd = day;

    setSelectedJalali({ jy, jm, jd });
    const numericStr = formatJalali(jy, jm, jd, 'numeric', false); // e.g. 1403/08/25
    const gIso = jalaliToGregorianISO(jy, jm, jd); // e.g. 2024-11-15
    const longStr = formatJalali(jy, jm, jd, 'long', true); // e.g. ۲۵ آبان ۱۴۰۳

    onChange(numericStr, gIso, longStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    setViewYear(today.jy);
    setViewMonth(today.jm);
    handleSelectDay(today.jd);
  };

  const handleClear = () => {
    setSelectedJalali(null);
    onChange('', '', '');
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const startWeekday = getJalaliMonthStartWeekday(viewYear, viewMonth); // 0 = شنبه

  // Display text in input
  const displayText = selectedJalali
    ? `${toPersianDigits(selectedJalali.jy)}/${toPersianDigits(
        String(selectedJalali.jm).padStart(2, '0')
      )}/${toPersianDigits(String(selectedJalali.jd).padStart(2, '0'))}`
    : '';

  // Generate list of selectable years (e.g. 1380 to 1410)
  const yearsList: number[] = [];
  for (let y = today.jy - 20; y <= today.jy + 10; y++) {
    yearsList.push(y);
  }

  const isDark = theme === 'dark';

  return (
    <div className={`relative ${className}`} ref={containerRef} dir="rtl">
      {label && (
        <label
          htmlFor={id}
          className={`block text-xs font-semibold mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Input Button */}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setPickerView('days');
            }
          }}
          className={`w-full flex items-center justify-between text-right px-3.5 py-2.5 rounded-xl border transition-all text-sm ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500'
              : isDark
              ? 'bg-slate-900/80 border-slate-700 text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <svg
              className={`w-4 h-4 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className={displayText ? 'font-mono' : isDark ? 'text-slate-500' : 'text-gray-400'}>
              {displayText || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {displayText && !required && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
                }`}
                title="پاک کردن تاریخ"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {helperText && (
        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-72 rounded-2xl p-4 shadow-2xl border transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white shadow-black/60'
              : 'bg-white border-gray-200 text-gray-900 shadow-xl'
          }`}
          style={{ right: 0 }}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
            <button
              type="button"
              onClick={handleNextMonth}
              title="ماه بعد"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5 font-bold text-sm">
              <button
                type="button"
                onClick={() => setPickerView(pickerView === 'months' ? 'days' : 'months')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  pickerView === 'months'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'hover:bg-slate-800 text-blue-400'
                    : 'hover:bg-gray-100 text-blue-600'
                }`}
              >
                {PERSIAN_MONTH_NAMES[viewMonth - 1]}
              </button>

              <button
                type="button"
                onClick={() => setPickerView(pickerView === 'years' ? 'days' : 'years')}
                className={`px-2 py-1 rounded-lg transition-colors font-mono ${
                  pickerView === 'years'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {toPersianDigits(viewYear)}
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              title="ماه قبل"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View: Months Grid */}
          {pickerView === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {PERSIAN_MONTH_NAMES.map((name, idx) => {
                const monthNum = idx + 1;
                const isSelected = viewMonth === monthNum;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setViewMonth(monthNum);
                      setPickerView('days');
                    }}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : isDark
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* View: Years Grid */}
          {pickerView === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-2 max-h-48 overflow-y-auto custom-scrollbar">
              {yearsList.map((y) => {
                const isSelected = viewYear === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewYear(y);
                      setPickerView('days');
                    }}
                    className={`py-2 px-1 text-xs font-mono font-semibold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : isDark
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {toPersianDigits(y)}
                  </button>
                );
              })}
            </div>
          )}

          {/* View: Days Calendar */}
          {pickerView === 'days' && (
            <>
              {/* Weekdays Row */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {PERSIAN_WEEKDAYS.map((wd, i) => (
                  <span
                    key={wd.short}
                    className={`text-[11px] font-bold py-1 ${
                      i === 6
                        ? 'text-rose-400'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {wd.short}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells for start weekday offset */}
                {Array.from({ length: startWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {/* Days numbers */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday =
                    today.jy === viewYear &&
                    today.jm === viewMonth &&
                    today.jd === day;
                  const isSelected =
                    selectedJalali &&
                    selectedJalali.jy === viewYear &&
                    selectedJalali.jm === viewMonth &&
                    selectedJalali.jd === day;

                  // Weekday of this day
                  const dayCol = (startWeekday + i) % 7;
                  const isFriday = dayCol === 6;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-8 w-8 mx-auto text-xs font-mono rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                          : isToday
                          ? 'border border-blue-500 font-bold text-blue-400'
                          : isFriday
                          ? isDark
                            ? 'text-rose-400 hover:bg-slate-800'
                            : 'text-rose-600 hover:bg-gray-100'
                          : isDark
                          ? 'text-slate-200 hover:bg-slate-800'
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {toPersianDigits(day)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs font-medium">
            <button
              type="button"
              onClick={handleSelectToday}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                isDark
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
              }`}
            >
              امروز ({toPersianDigits(today.jd)} {PERSIAN_MONTH_NAMES[today.jm - 1]})
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPickerView('days');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
