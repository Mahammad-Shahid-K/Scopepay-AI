import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const styles = {
    info: {
      container: 'bg-[#F9FAFB] dark:bg-gray-800/50 border-[#E5E7EB] dark:border-gray-700 text-[#111827] dark:text-gray-100',
      icon: <Info className="w-5 h-5 text-[#DC2626] dark:text-red-400 flex-shrink-0" />,
      titleColor: 'text-[#111827] dark:text-gray-100'
    },
    success: {
      container: 'bg-[#F0FDF4] dark:bg-emerald-950/40 border-green-200 dark:border-emerald-800/50 text-green-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-[#15803D] dark:text-emerald-400 flex-shrink-0" />,
      titleColor: 'text-[#15803D] dark:text-emerald-400'
    },
    warning: {
      container: 'bg-[#FFFBEB] dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-[#B45309] dark:text-amber-400 flex-shrink-0" />,
      titleColor: 'text-[#B45309] dark:text-amber-400'
    },
    error: {
      container: 'bg-[#FEF2F2] dark:bg-red-950/40 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] dark:text-red-400 flex-shrink-0" />,
      titleColor: 'text-[#DC2626] dark:text-red-400'
    }
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-md border flex items-start gap-3 text-sm ${current.container} ${className}`}>
      {current.icon}
      <div className="flex-1">
        {title && <h4 className={`font-semibold mb-0.5 ${current.titleColor}`}>{title}</h4>}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>
    </div>
  );
};
