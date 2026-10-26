import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Card */}
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${maxWidths[maxWidth]} my-8 border border-[#E5E7EB] z-10`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
              {description && <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#111827] p-1 rounded-md hover:bg-[#F9FAFB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
