import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatLakhs } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { NewPayRunWizard } from '../components/payroll/NewPayRunWizard';
import {
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileCheck,
  CalendarCheck,
  Building2,
  Users,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    currentPayRun,
    setActiveView,
    missingBankCount,
    unresolvedAttendanceCount,
    expiringContractsCount,
    pendingLeavesCount,
    employees,
  } = usePayroll();

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Clean, non-decorative monthly payroll trend data (in Lakhs)
  const monthlyTrendData = [
    { month: 'Apr 2026', netPayroll: 16.8, employees: 38 },
    { month: 'May 2026', netPayroll: 17.2, employees: 39 },
    { month: 'Jun 2026', netPayroll: 17.5, employees: 40 },
    { month: 'Jul 2026', netPayroll: 17.95, employees: 40 },
    { month: 'Aug 2026', netPayroll: 18.2, employees: 41 },
    { month: 'Sep 2026', netPayroll: 18.42, employees: 42 },
  ];

  // Department payroll breakdown
  const departmentBreakdown = [
    { department: 'Engineering', headcount: 16, payrollCost: 842000, percentage: 45.7 },
    { department: 'Sales & Growth', headcount: 10, payrollCost: 418000, percentage: 22.7 },
    { department: 'Operations & Logistics', headcount: 8, payrollCost: 284000, percentage: 15.4 },
    { department: 'Product & Design', headcount: 5, payrollCost: 198000, percentage: 10.7 },
    { department: 'People & HR', headcount: 3, payrollCost: 100000, percentage: 5.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Area: Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Operations Workspace
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">
              Payroll Operations
            </h1>
            <span className="text-xs text-[#5F6773] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
              Period: <strong className="text-[#18191B] font-semibold">September 2026</strong>
            </span>
            <span className="text-[11px] text-[#8A92A0]">
              • Last synced Today, 09:45 AM IST
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Pay Run</span>
        </button>
      </div>

      {/* Split Operational Section: Left Current Pay Run vs Right Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Current Pay Run Status (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E4DE] rounded-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773]">
                Current Active Pay Run
              </div>
              <StatusBadge status={currentPayRun.status} />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl font-black tracking-tight text-[#18191B]">
                  {currentPayRun.period}
                </h2>
                <div className="text-xs text-[#5F6773] mt-0.5">
                  Cycle: {currentPayRun.startDate} to {currentPayRun.endDate} • Disbursal: {currentPayRun.payDate}
                </div>
              </div>

              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773] block">
                  Estimated Net Payroll
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-[#1B4332] tabular-nums">
                  {formatINR(currentPayRun.totalNet)}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#E2E4DE] text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#5F6773] uppercase tracking-wider block">
                  Employees
                </span>
                <span className="font-mono text-base font-bold text-[#18191B] tabular-nums">
                  {currentPayRun.totalEmployees}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5F6773] uppercase tracking-wider block">
                  Gross Earnings
                </span>
                <span className="font-mono text-base font-semibold text-[#18191B] tabular-nums">
                  {formatINR(currentPayRun.totalGross)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5F6773] uppercase tracking-wider block">
                  Statutory Deductions
                </span>
                <span className="font-mono text-base font-semibold text-[#B91C1C] tabular-nums">
                  {formatINR(currentPayRun.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E2E4DE] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#5F6773] flex items-center gap-2">
              <span className="font-mono text-[11px] bg-[#F4F4F0] px-2 py-0.5 rounded text-[#2D3139]">
                Ref: {currentPayRun.id}
              </span>
              <span>• Ready for computation and reconciliation</span>
            </div>
            <button
              onClick={() => setActiveView('payruns')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1B4332] bg-[#EAF2EC] hover:bg-[#D2E3D6] rounded transition-colors"
            >
              <span>Continue Processing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: Operational Attention Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E4DE] rounded-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#18191B]">
                  Needs Attention
                </span>
                <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
              </div>
              <span className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                {missingBankCount + unresolvedAttendanceCount + expiringContractsCount + pendingLeavesCount} items
              </span>
            </div>

            <div className="mt-3 divide-y divide-[#E2E4DE] text-xs">
              {/* Item 1: Missing Bank Details */}
              <div
                onClick={() => setActiveView('payruns')}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#FBFBF9] px-1 -mx-1 rounded transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#18191B] group-hover:text-[#1B4332] transition-colors">
                      {missingBankCount} employees missing bank details
                    </div>
                    <div className="text-[11px] text-[#5F6773] mt-0.5">
                      Vikram Mehta, Sanjay Kulkarni, Pooja Hegde
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A92A0] group-hover:text-[#18191B] shrink-0" />
              </div>

              {/* Item 2: Attendance Corrections */}
              <div
                onClick={() => setActiveView('attendance')}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#FBFBF9] px-1 -mx-1 rounded transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#18191B] group-hover:text-[#1B4332] transition-colors">
                      {unresolvedAttendanceCount} attendance records need correction
                    </div>
                    <div className="text-[11px] text-[#5F6773] mt-0.5">
                      Missing punch-outs and unexcused swipes on Sep 15
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A92A0] group-hover:text-[#18191B] shrink-0" />
              </div>

              {/* Item 3: Expiring Contract */}
              <div
                onClick={() => setActiveView('employees', 'EMP-1002')}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#FBFBF9] px-1 -mx-1 rounded transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#18191B] group-hover:text-[#1B4332] transition-colors">
                      {expiringContractsCount} contract expires this month
                    </div>
                    <div className="text-[11px] text-[#5F6773] mt-0.5">
                      Priya Verma (Staff Product Designer) • Exp: Sep 30, 2026
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A92A0] group-hover:text-[#18191B] shrink-0" />
              </div>

              {/* Item 4: Leave Requests Awaiting Approval */}
              <div
                onClick={() => setActiveView('timeoff')}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#FBFBF9] px-1 -mx-1 rounded transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#18191B] group-hover:text-[#1B4332] transition-colors">
                      {pendingLeavesCount} leave requests awaiting approval
                    </div>
                    <div className="text-[11px] text-[#5F6773] mt-0.5">
                      Including 1 Unpaid Leave (LWP) impacting September pay run
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A92A0] group-hover:text-[#18191B] shrink-0" />
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2 text-right">
            <span className="text-[11px] text-[#5F6773] italic">
              Click any item to resolve directly in operations
            </span>
          </div>
        </div>
      </div>

      {/* Workforce Snapshot: Compact Typographic Data Strip */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-5">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773] mb-3">
          Workforce Snapshot • Today, September 15, 2026
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4DE] gap-4 sm:gap-0 text-xs">
          <div className="sm:pr-4">
            <span className="text-[#5F6773] block mb-1">Total Employees</span>
            <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">142</div>
            <span className="text-[10px] text-[#5F6773]">Active across all offices</span>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Present Today</span>
            <div className="text-2xl font-black font-mono text-[#1B4332] tabular-nums">128</div>
            <span className="text-[10px] text-[#1B4332]">90.1% attendance rate</span>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">On Approved Leave</span>
            <div className="text-2xl font-black font-mono text-[#5F6773] tabular-nums">8</div>
            <span className="text-[10px] text-[#5F6773]">4 casual, 3 sick, 1 LWP</span>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Late Arrivals</span>
            <div className="text-2xl font-black font-mono text-[#B45309] tabular-nums">6</div>
            <span className="text-[10px] text-[#B45309]">&gt; 30m grace threshold</span>
          </div>

          <div className="sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Active Contracts</span>
            <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">142</div>
            <span className="text-[10px] text-[#5F6773]">1 pending renewal</span>
          </div>
        </div>
      </div>

      {/* Analytics Split: Payroll Trend (Clean Chart) & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Net Payroll Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E4DE] rounded-md p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E4DE] mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#18191B] tracking-tight">
                Monthly Net Payroll Trend (FY 2026)
              </h2>
              <p className="text-xs text-[#5F6773]">
                Net disbursements from April 2026 to September 2026
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#1B4332]">
              Avg: ₹17.7L / mo
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E4DE" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#8A92A0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E4DE' }}
                />
                <YAxis
                  stroke="#8A92A0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E4DE' }}
                  tickFormatter={(val) => `₹${val}L`}
                  domain={[15, 20]}
                />
                <Tooltip
                  cursor={{ fill: '#F4F4F0' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#18191B] text-white p-2.5 rounded shadow text-xs">
                          <div className="font-semibold">{data.month}</div>
                          <div className="font-mono text-[#C2DBC7] mt-1">
                            Net Payroll: ₹{data.netPayroll} Lakhs
                          </div>
                          <div className="text-[10px] text-[#A0AEC0]">
                            Cohort: {data.employees} Employees
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="netPayroll" fill="#1B4332" radius={[2, 2, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Payroll Comparison (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E4DE] rounded-md p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E4DE] mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#18191B] tracking-tight">
                Department Payroll
              </h2>
              <p className="text-xs text-[#5F6773]">
                Headcount and payroll cost distribution
              </p>
            </div>
            <span className="text-xs text-[#5F6773]">5 Departments</span>
          </div>

          <div className="space-y-4 text-xs">
            {departmentBreakdown.map((dept, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#18191B]">{dept.department}</span>
                    <span className="text-[11px] text-[#5F6773]">({dept.headcount} staff)</span>
                  </div>
                  <div className="font-mono font-medium text-[#18191B] tabular-nums">
                    {formatINR(dept.payrollCost)}
                  </div>
                </div>

                <div className="w-full bg-[#F4F4F0] h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#1B4332] h-full rounded-full transition-all duration-300"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E4DE] flex items-center justify-between text-xs text-[#5F6773]">
            <span>Total September Allocation:</span>
            <span className="font-mono font-bold text-[#18191B] tabular-nums">
              {formatINR(1842000)}
            </span>
          </div>
        </div>
      </div>

      {/* Pay Run Wizard Modal */}
      <NewPayRunWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};
