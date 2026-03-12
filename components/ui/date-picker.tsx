"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

interface DatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(
    parsed?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed?.getMonth() ?? new Date().getMonth(),
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!parsed) return false;
    return (
      parsed.getFullYear() === viewYear &&
      parsed.getMonth() === viewMonth &&
      parsed.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  const formatDisplay = (val: string) => {
    const d = new Date(val + "T00:00:00");
    return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <div ref={ref} className={twMerge("relative", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={twMerge(
          "w-full flex items-center gap-2 px-3 py-2.5 text-sm bg-white border border-primary-200 rounded-xl transition-all text-left cursor-pointer",
          "hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400",
          isOpen && "ring-2 ring-brand-200 border-brand-400",
        )}
      >
        <FiCalendar className="size-4 text-primary-400 shrink-0" />
        <span className={value ? "text-primary-900" : "text-primary-400"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="ml-auto p-0.5 rounded hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors"
          >
            <FiX className="size-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-[280px] bg-white border border-primary-200 rounded-2xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
            >
              <FiChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold text-primary-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
            >
              <FiChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-medium text-primary-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={twMerge(
                    "size-9 rounded-lg text-sm font-medium transition-all duration-150",
                    isSelected(day)
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : isToday(day)
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-primary-700 hover:bg-primary-50",
                  )}
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
