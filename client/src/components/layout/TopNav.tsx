import React from 'react';
import { Menu, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopNavProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, title, subtitle }) => {
  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-gray-800 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="md:hidden p-2 rounded-md text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F9FAFB] dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && <h1 className="text-base font-semibold text-[#111827] dark:text-gray-100 leading-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-[#6B7280] dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Sandbox Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs font-medium text-[#DC2626] dark:text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] dark:bg-red-500 animate-pulse" />
          <span>PayPal Sandbox Mode</span>
        </div>

        {/* Public payment demo link */}
        <Link
          to="/pay/tok_artisan_deposit_9921"
          target="_blank"
          className="hidden lg:flex items-center gap-1 text-xs font-medium text-[#6B7280] dark:text-gray-400 hover:text-[#DC2626] dark:hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-[#FEF2F2] dark:hover:bg-red-950/30"
          title="Open sample customer payment checkout view"
        >
          <span>Demo Checkout</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />

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
