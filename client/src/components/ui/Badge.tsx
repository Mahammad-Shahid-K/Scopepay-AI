import React from 'react';

export type BadgeVariant =
  | 'draft'
  | 'proposed'
  | 'awaiting_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'pending'
  | 'paid'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'rejected'
  | 'sent'
  | 'accepted';

interface BadgeProps {
  status: BadgeVariant | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const normalized = (status || '').toLowerCase();

  // Green ONLY for successful states (verified payments, approved contracts, completed)
  if (['paid', 'captured', 'approved', 'accepted', 'completed'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-400 border border-green-200 dark:border-emerald-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#15803D] dark:bg-emerald-400" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Amber / Warning for awaiting review / proposal
  if (['proposed', 'awaiting_approval', 'sent'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#B45309] dark:bg-amber-400" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Red / Warning for Pending Payment
  if (normalized === 'pending') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] dark:bg-red-950/40 text-[#DC2626] dark:text-red-400 border border-red-200 dark:border-red-900/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#DC2626] dark:bg-red-400" />
        {label || 'Pending Payment'}
      </span>
    );
  }

  // Error / Cancelled / Rejected
  if (['failed', 'cancelled', 'rejected'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] dark:bg-red-950/40 text-[#B91C1C] dark:text-red-400 border border-red-200 dark:border-red-900/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#B91C1C] dark:bg-red-400" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Default neutral / Draft / In Progress
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F9FAFB] dark:bg-gray-800/60 text-[#4B5563] dark:text-gray-300 border border-[#E5E7EB] dark:border-gray-700 ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#9CA3AF] dark:bg-gray-500" />
      {label || normalized.replace('_', ' ')}
    </span>
  );
};
