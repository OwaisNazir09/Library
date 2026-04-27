import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  required = false,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Decide if dropdown should open upward
  const handleOpen = () => {
    if (disabled) return;
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 220);
    }
    setOpen(v => !v);
  };

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          w-full h-[36px] px-3 pr-8 flex items-center justify-between gap-2
          bg-white border rounded-lg text-[14px] transition-all duration-150
          ${open
            ? 'border-[#044343] ring-2 ring-[#044343]/10'
            : 'border-slate-200 hover:border-slate-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
          dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200
        `}
      >
        <span className={`truncate ${!selected ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`
            absolute z-[200] w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden
            dark:bg-slate-900 dark:border-slate-700
            ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
        >
          <div className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
            {options.length === 0 && (
              <div className="px-3 py-4 text-center text-slate-400 text-[12px]">No options</div>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-left text-[13px] transition-colors
                    ${isSelected
                      ? 'bg-[#044343]/5 text-[#044343] font-semibold dark:bg-[#044343]/20 dark:text-emerald-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={12} className="shrink-0 ml-2 text-[#044343]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value || ''}
          onChange={() => { }}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      )}
    </div>
  );
};

export default CustomSelect;
