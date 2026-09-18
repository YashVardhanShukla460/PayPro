import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatDate } from '../utils/formatters';
import {
  FileText,
  Printer,
  Mail,
  Search,
  Filter,
  ArrowRight,
  Download,
  Calendar,
  Building,
} from 'lucide-react';

export const PayslipsPage: React.FC = () => {
  const {
    currentPayRun,
    payRuns,
    employees,
    getPayslip,
    openPayslipModal,
    addToast,
  } = usePayroll();

  const [selectedCycleId, setSelectedCycleId] = useState(currentPayRun.id);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'EMP-1001');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const selectedRun = payRuns.find((p) => p.id === selectedCycleId) || currentPayRun;
  const currentPayslip = getPayslip(selectedRun.id, selectedEmpId);

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    if (!currentPayslip) return;
    addToast({
      type: 'success',
      title: 'Payslip Dispatched',
      message: `PDF payslip sent to ${currentPayslip.employeeSnapshot.name} at registered email address.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Documentation & Records
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Payslips</h1>
            <span className="text-xs text-[#5F6773]">
              Authentic printable employee payslips & PDF generation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="text-xs font-semibold text-[#18191B] border border-[#E2E4DE] bg-white px-3 py-2 rounded focus:outline-none"
          >
            {payRuns.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.period} ({pr.status})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2D3139] bg-white border border-[#E2E4DE] hover:bg-[#F4F4F0] rounded transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Split Explorer Layout: Left Cohort Selector vs Right Printable Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Cohort Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E4DE] rounded-md flex flex-col h-[750px] no-print">
          <div className="p-3.5 border-b border-[#E2E4DE] space-y-2">
            <div className="text-xs font-bold text-[#18191B] flex items-center justify-between">
              <span>Employee Cohort</span>
              <span className="text-[10px] text-[#5F6773] bg-[#F4F4F0] px-1.5 py-0.5 rounded">
                {filteredEmployees.length} people
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A92A0] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Product">Product</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#E2E4DE]">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmpId;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`p-3 cursor-pointer hover:bg-[#F9FAF8] transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-[#EAF2EC]/40 border-l-2 border-[#1B4332]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {emp.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#18191B] truncate">{emp.name}</div>
                      <div className="text-[10px] text-[#5F6773] truncate">
                        {emp.id} • {emp.jobTitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#5F6773] shrink-0">
                    {emp.department.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Printable Document View (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E4DE] rounded-md p-8 sm:p-10 payslip-print-container">
          {currentPayslip ? (
            <div className="text-[#18191B] space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row justify-between border-b-2 border-[#18191B] pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-[#1B4332] text-white flex items-center justify-center font-mono text-xs font-bold rounded">
                      P
                    </span>
                    <span className="text-lg font-black tracking-tight text-[#18191B]">
                      PEOPLEPAY360 TECHNOLOGIES PVT LTD
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6773] max-w-sm leading-relaxed">
                    CIN: U72200KA2022PTC148912 • Tech Hub Tower, Outer Ring Road, Bengaluru, Karnataka
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="text-xl font-bold uppercase tracking-wide text-[#1B4332]">
                    PAYSLIP
                  </div>
                  <div className="text-xs font-bold text-[#18191B] mt-0.5">
                    {currentPayslip.period}
                  </div>
                  <div className="text-[11px] text-[#5F6773]">
                    Disbursement Date: {currentPayslip.payDate}
                  </div>
                </div>
              </div>

              {/* Demographic & Banking Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#E2E4DE] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    Employee Name
                  </span>
                  <span className="font-semibold text-[#18191B]">
                    {currentPayslip.employeeSnapshot.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    Employee ID
                  </span>
                  <span className="font-mono text-[#18191B]">
                    {currentPayslip.employeeSnapshot.employeeId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    Designation
                  </span>
                  <span className="text-[#18191B]">
                    {currentPayslip.employeeSnapshot.jobTitle}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    Department
                  </span>
                  <span className="text-[#18191B]">
                    {currentPayslip.employeeSnapshot.department}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    PAN Card
                  </span>
                  <span className="font-mono text-[#18191B]">
                    {currentPayslip.employeeSnapshot.pan}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    Bank Account
                  </span>
                  <span className="font-mono text-[#18191B]">
                    {currentPayslip.employeeSnapshot.accountNumber
                      ? `•••• ${currentPayslip.employeeSnapshot.accountNumber.slice(-4)}`
                      : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    IFSC Code
                  </span>
                  <span className="font-mono text-[#18191B]">
                    {currentPayslip.employeeSnapshot.ifscCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block mb-0.5">
                    UAN / PF Number
                  </span>
                  <span className="font-mono text-[#18191B]">
                    {currentPayslip.employeeSnapshot.uan}
                  </span>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="flex flex-wrap items-center justify-between py-2.5 px-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded text-xs">
                <span>Working Days in Month: <strong>{currentPayslip.attendanceSnapshot.totalDays}</strong></span>
                <span>Days Worked: <strong className="text-[#1B4332]">{currentPayslip.attendanceSnapshot.workedDays}</strong></span>
                <span>Paid Leaves: <strong>{currentPayslip.attendanceSnapshot.paidLeaves}</strong></span>
                <span>Unpaid Absence (LWP): <strong className="text-[#B91C1C]">{currentPayslip.attendanceSnapshot.unpaidLeaves}</strong></span>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
                {/* Earnings */}
                <div>
                  <div className="border-b-2 border-[#1B4332] pb-1 mb-2 flex justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                      Earnings
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-[#5F6773]">Amount</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {currentPayslip.earnings.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-[#F4F4F0]">
                        <span className="text-[#2D3139]">{item.name}</span>
                        <span className="font-mono font-medium tabular-nums">{formatINR(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between py-2 mt-3 border-t-2 border-[#18191B] text-xs font-bold">
                    <span>Gross Earnings</span>
                    <span className="font-mono tabular-nums">{formatINR(currentPayslip.grossPay)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <div className="border-b-2 border-[#18191B] pb-1 mb-2 flex justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#18191B]">
                      Deductions
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-[#5F6773]">Amount</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {currentPayslip.deductions.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-[#F4F4F0]">
                        <span className="text-[#2D3139]">{item.name}</span>
                        <span className="font-mono font-medium text-[#B91C1C] tabular-nums">
                          {formatINR(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between py-2 mt-3 border-t-2 border-[#18191B] text-xs font-bold">
                    <span>Total Deductions</span>
                    <span className="font-mono text-[#B91C1C] tabular-nums">
                      {formatINR(currentPayslip.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight Bar */}
              <div className="p-4 bg-[#EAF2EC] border border-[#C2DBC7] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1B4332] block">
                    Net Take Home Pay
                  </span>
                  <div className="text-2xl font-black font-mono text-[#1B4332] tabular-nums mt-0.5">
                    {formatINR(currentPayslip.netPay)}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] block">
                    Amount in Words
                  </span>
                  <span className="text-xs font-medium italic text-[#18191B]">
                    {currentPayslip.netPayInWords}
                  </span>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="pt-6 border-t border-[#E2E4DE] text-[11px] text-[#5F6773] flex justify-between items-end">
                <span>System Ref: {currentPayslip.id} • Generated via PeoplePay360</span>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#18191B]">[VERIFIED DISBURSAL]</div>
                  <div className="border-t border-[#18191B] pt-0.5 text-[10px]">Head of Payroll Operations</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#5F6773]">
              Select an employee to display their payslip document.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
