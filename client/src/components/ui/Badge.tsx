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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#15803D] border border-green-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#15803D]" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Amber / Warning for awaiting review / proposal
  if (['proposed', 'awaiting_approval', 'sent'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#B45309] border border-amber-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#B45309]" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Red / Warning for Pending Payment
  if (normalized === 'pending') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#DC2626] border border-red-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#DC2626]" />
        {label || 'Pending Payment'}
      </span>
    );
  }

  // Error / Cancelled / Rejected
  if (['failed', 'cancelled', 'rejected'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#B91C1C] border border-red-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#B91C1C]" />
        {label || normalized.replace('_', ' ')}
      </span>
    );
  }

  // Default neutral / Draft / In Progress
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#9CA3AF]" />
      {label || normalized.replace('_', ' ')}
    </span>
  );
};
