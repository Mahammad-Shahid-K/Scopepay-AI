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
      container: 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]',
      icon: <Info className="w-5 h-5 text-[#DC2626] flex-shrink-0" />,
      titleColor: 'text-[#111827]'
    },
    success: {
      container: 'bg-[#F0FDF4] border-green-200 text-green-900',
      icon: <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0" />,
      titleColor: 'text-[#15803D]'
    },
    warning: {
      container: 'bg-[#FFFBEB] border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0" />,
      titleColor: 'text-[#B45309]'
    },
    error: {
      container: 'bg-[#FEF2F2] border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />,
      titleColor: 'text-[#DC2626]'
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
