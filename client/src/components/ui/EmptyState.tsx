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
    <div className={`text-center py-12 px-4 bg-white border border-[#E5E7EB] border-dashed rounded-lg ${className}`}>
      {icon && <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626] mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
