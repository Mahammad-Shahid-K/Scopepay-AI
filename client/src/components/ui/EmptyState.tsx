import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 border-dashed rounded-lg transition-colors ${className}`}>
      {icon && (
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#FEF2F2] dark:bg-red-950/40 text-[#DC2626] dark:text-red-400 border border-transparent dark:border-red-900/40 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#111827] dark:text-gray-100">{title}</h3>
      <p className="text-xs text-[#6B7280] dark:text-gray-400 max-w-sm mx-auto mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
