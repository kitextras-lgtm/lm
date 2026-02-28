import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  options: { value: string | number | undefined; label: string }[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  style,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number | undefined) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const defaultStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const dropdownStyle: React.CSSProperties = {
    ...defaultStyle,
    ...style,
  };

  const listStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    maxHeight: '240px',
    overflowY: 'auto',
    zIndex: 50,
  };

  const optionStyle: React.CSSProperties = {
    padding: '10px 16px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const selectedOptionStyle: React.CSSProperties = {
    ...optionStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none flex items-center justify-between transition-all duration-200"
        style={dropdownStyle}
      >
        <span>{displayValue}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          color="#94A3B8"
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg"
          style={listStyle}
        >
          {options.map((option) => (
            <div
              key={option.value?.toString() || 'empty'}
              onClick={() => handleSelect(option.value)}
              style={option.value === value ? selectedOptionStyle : optionStyle}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
