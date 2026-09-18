import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatLakhs } from '../utils/formatters';
import {
  BarChart3,
  Download,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { addToast } = usePayroll();

  const [periodFilter, setPeriodFilter] = useState('FY 2026-27 (YTD)');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeReportTab, setActiveReportTab] = useState<
    'payroll_cost' | 'net_trend' | 'attendance' | 'leave_usage' | 'headcount'
  >('payroll_cost');

  // Trend data
  const monthlyCostData = [
    { month: 'Apr 26', gross: 19.8, net: 16.8, statutory: 3.0 },
    { month: 'May 26', gross: 20.2, net: 17.2, statutory: 3.0 },
    { month: 'Jun 26', gross: 20.6, net: 17.5, statutory: 3.1 },
    { month: 'Jul 26', gross: 21.1, net: 17.95, statutory: 3.15 },
    { month: 'Aug 26', gross: 21.4, net: 18.2, statutory: 3.2 },
    { month: 'Sep 26', gross: 21.64, net: 18.42, statutory: 3.22 },
  ];

  const departmentCostData = [
    { department: 'Engineering', gross: 984000, net: 842000, employerPf: 96000, headcount: 16 },
    { department: 'Sales & Growth', gross: 492000, net: 418000, employerPf: 48000, headcount: 10 },
    { department: 'Operations & Logistics', gross: 334000, net: 284000, employerPf: 32000, headcount: 8 },
    { department: 'Product & Design', gross: 234000, net: 198000, employerPf: 24000, headcount: 5 },
    { department: 'People & HR', gross: 120000, net: 100000, employerPf: 12000, headcount: 3 },
  ];

  const leaveConsumptionData = [
    { type: 'Casual Leave', allocated: 1704, used: 312, remaining: 1392 },
    { type: 'Sick Leave', allocated: 1420, used: 198, remaining: 1222 },
    { type: 'Earned Leave', allocated: 2556, used: 640, remaining: 1916 },
    { type: 'Unpaid Leave (LWP)', allocated: 0, used: 14, remaining: 0 },
  ];

  const handleExport = () => {
    addToast({
      type: 'success',
      title: 'Report Generated',
      message: `Exported ${activeReportTab.replace('_', ' ').toUpperCase()} data for ${periodFilter} to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Audit & Compliance
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">
              HR & Payroll Reports
            </h1>
            <span className="text-xs text-[#5F6773]">
              Operational expenditure, statutory compliance, and workforce metrics
            </span>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report Data</span>
        </button>
      </div>

      {/* Structured Filter Controls Bar */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-3.5 flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#5F6773]" />
            <span className="text-[#5F6773] font-medium">Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="FY 2026-27 (YTD)">FY 2026-27 (YTD)</option>
              <option value="Q2 FY 2026-27">Q2 FY 2026-27 (Jul - Sep)</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#5F6773]" />
            <span className="text-[#5F6773] font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Product">Product</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#5F6773] font-medium">Employment Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time Only</option>
              <option value="Contract">Contractors Only</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] text-[#5F6773] font-mono">
          Last reconciliation: 15-Sep-2026
        </span>
      </div>

      {/* Horizontal Report Navigation Tabs */}
      <div className="border-b border-[#E2E4DE] flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'payroll_cost', label: 'Payroll Cost' },
          { id: 'net_trend', label: 'Net Salary Trend' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'leave_usage', label: 'Leave Usage' },
          { id: 'headcount', label: 'Headcount' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#5F6773] hover:text-[#18191B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT VIEW 1: Payroll Cost */}
      {activeReportTab === 'payroll_cost' && (
        <div className="space-y-6">
          {/* Typographic Summary Metrics */}
          <div className="bg-white border border-[#E2E4DE] rounded-md p-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4DE] gap-4 sm:gap-0 text-xs">
              <div className="sm:pr-4">
                <span className="text-[#5F6773] block mb-1">Total Gross Disbursed</span>
                <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">
                  {formatINR(2164000)}
                </div>
                <span className="text-[10px] text-[#5F6773]">Base + HRA + Special allowances</span>
              </div>
              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[#5F6773] block mb-1">Statutory Deductions (EPF/TDS)</span>
                <div className="text-2xl font-black font-mono text-[#B91C1C] tabular-nums">
                  {formatINR(322000)}
                </div>
                <span className="text-[10px] text-[#5F6773]">Direct remittances to government</span>
              </div>
              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[#5F6773] block mb-1">Total Net Disbursed</span>
                <div className="text-2xl font-black font-mono text-[#1B4332] tabular-nums">
                  {formatINR(1842000)}
                </div>
                <span className="text-[10px] text-[#1B4332]">Credited to bank accounts</span>
              </div>
              <div className="sm:pl-4 pt-3 sm:pt-0">
                <span className="text-[#5F6773] block mb-1">Employer PF & Gratuity</span>
                <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">
                  {formatINR(212000)}
                </div>
                <span className="text-[10px] text-[#5F6773]">Company overhead liability</span>
              </div>
            </div>
          </div>

          {/* Department Cost Table */}
          <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
            <div className="p-3.5 bg-[#FBFBF9] border-b border-[#E2E4DE]">
              <span className="font-bold text-xs text-[#18191B]">
                Department Cost Breakdown • September 2026
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#F4F4F0] border-b border-[#E2E4DE] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
                <tr>
                  <th className="p-3">Department</th>
                  <th className="p-3">Headcount</th>
                  <th className="p-3">Gross Payroll</th>
                  <th className="p-3">Net Disbursal</th>
                  <th className="p-3">Employer PF</th>
                  <th className="p-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4DE]">
                {departmentCostData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAF8]">
                    <td className="p-3 font-semibold text-[#18191B]">{row.department}</td>
                    <td className="p-3 font-mono tabular-nums">{row.headcount} staff</td>
                    <td className="p-3 font-mono font-medium text-[#18191B] tabular-nums">
                      {formatINR(row.gross)}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#1B4332] tabular-nums">
                      {formatINR(row.net)}
                    </td>
                    <td className="p-3 font-mono text-[#5F6773] tabular-nums">
                      {formatINR(row.employerPf)}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold tabular-nums">
                      {((row.net / 1842000) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: Net Salary Trend */}
      {activeReportTab === 'net_trend' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md p-6">
          <div className="pb-4 border-b border-[#E2E4DE] mb-6 flex justify-between items-baseline">
            <div>
              <h2 className="font-bold text-sm text-[#18191B]">Monthly Net Salary Progression</h2>
              <p className="text-xs text-[#5F6773]">
                Net take-home disbursements across the last 6 cycles (Lakhs)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#1B4332]">+9.6% YTD Growth</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCostData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E4DE" vertical={false} />
                <XAxis dataKey="month" stroke="#8A92A0" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8A92A0"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}L`}
                  domain={[15, 20]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#18191B] text-white p-2.5 rounded shadow text-xs">
                          <div className="font-semibold">{data.month}</div>
                          <div className="font-mono text-[#C2DBC7] mt-0.5">
                            Net Disbursed: ₹{data.net} Lakhs
                          </div>
                          <div className="text-[10px] text-[#A0AEC0]">
                            Gross Incurred: ₹{data.gross} Lakhs
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#1B4332"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1B4332' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* REPORT VIEW 3: Attendance */}
      {activeReportTab === 'attendance' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md p-6 text-xs space-y-5">
          <div className="pb-3 border-b border-[#E2E4DE]">
            <h2 className="font-bold text-sm text-[#18191B]">Punctuality & Working Hours Compliance</h2>
            <p className="text-xs text-[#5F6773]">
              Summary of 1,260 employee biometric punches in September 2026
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-1">
                Average Working Hours
              </span>
              <div className="text-2xl font-black font-mono text-[#18191B]">8.12 hrs / day</div>
              <span className="text-[11px] text-[#1B4332] mt-0.5 block">Meets 8h threshold</span>
            </div>
            <div className="p-4 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-1">
                Punctuality Rate
              </span>
              <div className="text-2xl font-black font-mono text-[#18191B]">94.8%</div>
              <span className="text-[11px] text-[#5F6773] mt-0.5 block">Within grace threshold</span>
            </div>
            <div className="p-4 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-1">
                Total Overtime Compensated
              </span>
              <div className="text-2xl font-black font-mono text-[#18191B]">48.5 hours</div>
              <span className="text-[11px] text-[#5F6773] mt-0.5 block">Paid at 1.5x standard rate</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 4: Leave Usage */}
      {activeReportTab === 'leave_usage' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
          <div className="p-4 border-b border-[#E2E4DE]">
            <h2 className="font-bold text-sm text-[#18191B]">Annual Leave Quota Utilization</h2>
            <p className="text-xs text-[#5F6773]">
              Breakdown of days consumed vs remaining across company roster
            </p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#F4F4F0] border-b border-[#E2E4DE] text-[10px] font-bold uppercase text-[#5F6773]">
              <tr>
                <th className="p-3">Leave Type</th>
                <th className="p-3">Allocated Quota</th>
                <th className="p-3">Days Consumed</th>
                <th className="p-3">Remaining Balance</th>
                <th className="p-3">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {leaveConsumptionData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAF8]">
                  <td className="p-3 font-semibold text-[#18191B]">{row.type}</td>
                  <td className="p-3 font-mono">{row.allocated > 0 ? `${row.allocated} d` : 'Unlimited'}</td>
                  <td className="p-3 font-mono font-bold text-[#18191B]">{row.used} d</td>
                  <td className="p-3 font-mono text-[#1B4332]">{row.remaining > 0 ? `${row.remaining} d` : '—'}</td>
                  <td className="p-3 font-mono">
                    {row.allocated > 0 ? `${((row.used / row.allocated) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT VIEW 5: Headcount */}
      {activeReportTab === 'headcount' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md p-6 text-xs space-y-4">
          <div className="pb-3 border-b border-[#E2E4DE]">
            <h2 className="font-bold text-sm text-[#18191B]">Workforce Growth & Composition</h2>
            <p className="text-xs text-[#5F6773]">142 employees across 5 core departments</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[#5F6773] block mb-1">Full-Time Staff</span>
              <div className="text-xl font-bold font-mono text-[#18191B]">136</div>
            </div>
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[#5F6773] block mb-1">Contract / Retainer</span>
              <div className="text-xl font-bold font-mono text-[#18191B]">6</div>
            </div>
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[#5F6773] block mb-1">New Hires (Q2)</span>
              <div className="text-xl font-bold font-mono text-[#1B4332]">12</div>
            </div>
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[#5F6773] block mb-1">Attrition Rate</span>
              <div className="text-xl font-bold font-mono text-[#18191B]">1.4%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
