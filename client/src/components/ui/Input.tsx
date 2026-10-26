import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm text-[#111827] bg-white border ${
          error ? 'border-[#DC2626] focus:ring-red-500' : 'border-[#E5E7EB] focus:ring-red-500 focus:border-[#DC2626]'
        } rounded-md shadow-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-3.5 py-2 text-sm text-[#111827] bg-white border ${
          error ? 'border-[#DC2626] focus:ring-red-500' : 'border-[#E5E7EB] focus:ring-red-500 focus:border-[#DC2626]'
        } rounded-md shadow-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>}
    </div>
  );
};
