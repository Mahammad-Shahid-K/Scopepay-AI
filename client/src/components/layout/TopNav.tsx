import React from 'react';
import { Menu, Plus, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface TopNavProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && <h1 className="text-base font-semibold text-[#111827] leading-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sandbox Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-xs font-medium text-[#DC2626]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          <span>PayPal Sandbox Mode</span>
        </div>

        {/* Public payment demo link */}
        <Link
          to="/pay/tok_artisan_deposit_9921"
          target="_blank"
          className="hidden lg:flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#DC2626] transition-colors py-1 px-2 rounded hover:bg-[#FEF2F2]"
          title="Open sample customer payment checkout view"
        >
          <span>Demo Checkout</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* New Project CTA */}
        <Link to="/create-project">
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            New Project
          </Button>
        </Link>
      </div>
    </header>
  );
};
