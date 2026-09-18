import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Coins,
  FileText,
  Sliders,
  BarChart3,
  Menu,
  X,
  Building2,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const {
    activeView,
    setActiveView,
    pendingLeavesCount,
    unresolvedAttendanceCount,
    missingBankCount,
  } = usePayroll();

  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const attentionTotal = pendingLeavesCount + unresolvedAttendanceCount + missingBankCount;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeAlert?: boolean;
  }

  const workNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: attentionTotal > 0 ? attentionTotal : undefined, badgeAlert: true },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock, badge: unresolvedAttendanceCount > 0 ? unresolvedAttendanceCount : undefined },
    { id: 'timeoff', label: 'Time Off', icon: CalendarDays, badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined },
  ];

  const payrollNav: NavItem[] = [
    { id: 'payruns', label: 'Pay Runs', icon: Coins, badge: missingBankCount > 0 ? missingBankCount : undefined },
    { id: 'payslips', label: 'Payslips', icon: FileText },
    { id: 'salary-rules', label: 'Salary Rules', icon: Sliders },
  ];

  const insightsNav: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setMobileOpen(false);
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-5">
      <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
        {title}
      </div>
      <nav aria-label={title} className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'employees' && activeView === 'employee-detail');

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                isActive
                  ? 'bg-[#1B4332] text-white font-semibold'
                  : 'text-[#2D3139] hover:bg-[#EAEAE5] hover:text-[#18191B]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#5F6773]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeAlert
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      : 'bg-[#EAF2EC] text-[#1B4332]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FBFBF9] text-[#18191B]">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-13 z-40 bg-[#F4F4F0] border-b border-[#E2E4DE] px-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-[#18191B] hover:bg-[#EAEAE5] rounded"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-bold tracking-tight text-[#18191B]">PEOPLEPAY360</span>
        </div>
        <span className="text-[11px] font-medium text-[#5F6773] px-2 py-0.5 bg-[#EAEAE5] rounded">
          Sept 2026
        </span>
      </header>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#18191B]/40 lg:hidden no-print"
        />
      )}

      {/* Left Navigation Rail (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#F4F4F0] border-r border-[#E2E4DE] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-4 border-b border-[#E2E4DE] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#1B4332] rounded flex items-center justify-center text-white font-mono text-xs font-bold">
                P
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider text-[#18191B]">
                  PEOPLEPAY360
                </div>
                <div className="text-[10px] text-[#5F6773] tracking-tight">
                  HR & Payroll Console
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase px-1 py-0.5 bg-[#E8EDE7] text-[#1B4332] rounded font-semibold">
              v2.4
            </span>
          </div>

          {/* Nav Groups */}
          <div className="p-3 overflow-y-auto">
            {renderNavGroup('WORK', workNav)}
            {renderNavGroup('PAYROLL', payrollNav)}
            {renderNavGroup('INSIGHTS', insightsNav)}
          </div>
        </div>

        {/* Bottom Workspace & User Section */}
        <div className="p-3 border-t border-[#E2E4DE] bg-[#EFEFEA] space-y-2.5">
          {/* Company Context */}
          <div className="flex items-center justify-between px-2 py-1.5 bg-white/70 border border-[#E2E4DE] rounded text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[#5F6773] shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-[#18191B] truncate text-[11px]">Acme Technologies</div>
                <div className="text-[10px] text-[#5F6773] truncate">IN-BLR • 142 Staff</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A92A0]" />
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between px-2 pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PP'}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-[#18191B] truncate">
                  {user?.name || 'Vikram Malhotra'}
                </div>
                <div className="text-[10px] text-[#5F6773] truncate flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-[#1B4332]" />
                  <span>{user?.role ? user.role.replace('_', ' ') : 'HR ADMIN'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-[#8A92A0] hover:text-[#B91C1C] hover:bg-white rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col pt-13 lg:pt-0">
        <div className="p-5 md:p-8 max-w-7xl w-full mx-auto flex-1">{children}</div>
      </main>
    </div>
  );
};
