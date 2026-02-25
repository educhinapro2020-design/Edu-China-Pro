"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  textClassName?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function Select({
  value,
  onChange,
  options,
  textClassName,
  placeholder = "Select...",
  className,
  disabled,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={twMerge(
          "flex w-full items-center justify-between rounded-xl border border-primary-200 bg-white px-4 h-12 text-base text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500",
          isOpen && "border-brand-500 ring-4 ring-brand-500/10",
          disabled && "cursor-not-allowed opacity-50 bg-primary-50",
          className,
        )}
      >
        <span
          className={twMerge(
            !selectedOption ? "text-primary-400" : "text-primary-900",
            textClassName,
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          className={twMerge(
            "h-4 w-4 text-primary-400 transition-transform duration-200",
            isOpen && "transform rotate-180 text-brand-500",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-primary-100 bg-white p-2 shadow-xl shadow-primary-900/10"
          >
            <div className="max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!option.disabled) handleSelect(option.value);
                  }}
                  disabled={option.disabled}
                  className={twMerge(
                    "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-base font-medium transition-colors cursor-pointer text-left",
                    value === option.value
                      ? "bg-brand-50 text-brand-700"
                      : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                    option.disabled &&
                      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-primary-600",
                    textClassName,
                  )}
                >
                  {option.label}
                  {value === option.value && (
                    <FiCheck className="h-4 w-4 text-brand-500" />
                  )}
                </button>
              ))}
              {options.length === 0 && (
                <div className="p-3 text-center text-sm text-primary-400">
                  No options available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
