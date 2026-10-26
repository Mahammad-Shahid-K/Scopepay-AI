import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Settings,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'AI Scope Generator', path: '/create-project', icon: Sparkles },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-md bg-[#DC2626] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#111827]">ScopePay</span>
              <span className="bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">AI</span>
            </div>
            <p className="text-[10px] text-[#6B7280] font-medium leading-none">Agree • Get Paid • Protect</p>
          </div>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-[#6B7280] hover:text-[#111827]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FEF2F2] text-[#DC2626] font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#DC2626]' : 'text-[#6B7280]'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#FEF2F2] border border-red-200 flex items-center justify-center text-xs font-bold text-[#DC2626] flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#111827] truncate">
                {user?.full_name || 'Freelancer'}
              </p>
              <p className="text-[11px] text-[#6B7280] truncate">
                {user?.business_name || 'Creative Studio'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-[#6B7280] hover:text-[#DC2626] rounded hover:bg-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
