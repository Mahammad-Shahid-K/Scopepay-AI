import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const actionText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  const currentLabel = isDark ? 'Dark Mode' : 'Light Mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={actionText}
      title={`${currentLabel} (Click to ${actionText.toLowerCase()})`}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-md border text-xs font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
        isDark
          ? 'bg-[#1F2937] border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white focus:ring-offset-gray-900 shadow-xs'
          : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] focus:ring-offset-white shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
      )}
      {showLabel && (
        <span className="hidden sm:inline-block capitalize">{currentLabel}</span>
      )}
      <span className="sr-only">{actionText}</span>
    </button>
  );
};
