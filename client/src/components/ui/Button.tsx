import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-red' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-red-600 shadow-sm border border-transparent dark:focus:ring-offset-gray-900',
    secondary: 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-gray-100 border border-[#E5E7EB] dark:border-gray-700 hover:bg-[#F9FAFB] dark:hover:bg-gray-700 focus:ring-gray-300 dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900 shadow-sm',
    'outline-red': 'bg-white dark:bg-[#111827] text-[#DC2626] dark:text-red-400 border border-[#DC2626] dark:border-red-500/70 hover:bg-[#FEF2F2] dark:hover:bg-red-950/30 focus:ring-red-500 dark:focus:ring-offset-gray-900',
    ghost: 'bg-transparent text-[#6B7280] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white hover:bg-[#F9FAFB] dark:hover:bg-gray-800 focus:ring-gray-300 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-900',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-red-700 shadow-sm dark:focus:ring-offset-gray-900'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
