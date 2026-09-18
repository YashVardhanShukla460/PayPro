import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Building2,
  AlertTriangle,
  History,
  Plus,
} from 'lucide-react';

interface EmployeeDetailPageProps {
  employeeId: string;
  onBack: () => void;
}

export const EmployeeDetailPage: React.FC<EmployeeDetailPageProps> = ({
  employeeId,
  onBack,
}) => {
  const {
    getEmployee,
    getContractsByEmployee,
    getActiveContract,
    attendance,
    leaveRequests,
    leaveBalances,
    updateBankDetails,
    renewContract,
    requestLeave,
    getPayslip,
    openPayslipModal,
    setActiveView,
    currentPayRun,
  } = usePayroll();

  const employee = getEmployee(employeeId);
  const employeeContracts = getContractsByEmployee(employeeId);
  const activeContract = getActiveContract(employeeId);
  const empLeaveBalance = leaveBalances[employeeId] || {
    casual: { total: 12, used: 2 },
    sick: { total: 10, used: 1 },
    earned: { total: 18, used: 4 },
    unpaidLwpDays: 0,
  };

  const [activeTab, setActiveTab] = useState<
    'overview' | 'contracts' | 'attendance' | 'timeoff' | 'payslips'
  >('overview');

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState(employee?.bankDetails.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(employee?.bankDetails.ifscCode || '');
  const [bankName, setBankName] = useState(employee?.bankDetails.bankName || 'HDFC Bank');

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewSalary, setRenewSalary] = useState(activeContract ? activeContract.monthlySalary + 5000 : 45000);
  const [renewStart, setRenewStart] = useState('2026-10-01');
  const [renewEnd, setRenewEnd] = useState('2027-09-30');

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave (LWP)'>('Casual Leave');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');

  if (!employee) {
    return (
      <div className="p-8 text-center text-xs">
        <p className="text-[#5F6773]">Employee record not found.</p>
        <button onClick={onBack} className="mt-4 px-3 py-1.5 bg-[#1B4332] text-white rounded">
          Back to Directory
        </button>
      </div>
    );
  }

  const employeeAttendance = attendance.filter((a) => a.employeeId === employeeId);
  const employeeLeaves = leaveRequests.filter((l) => l.employeeId === employeeId);

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !ifscCode) return;
    updateBankDetails(employeeId, {
      accountNumber,
      ifscCode,
      bankName,
      isVerified: true,
    });
    setIsBankModalOpen(false);
  };

  const handleRenewContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewContract(employeeId, renewSalary, renewStart, renewEnd);
    setIsRenewModalOpen(false);
  };

  const handleRequestLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestLeave({
      employeeId,
      leaveType,
      startDate: '2026-09-22',
      endDate: '2026-09-23',
      days: leaveDays,
      reason: leaveReason || 'Personal appointment',
      approver: employee.manager,
    });
    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  const isBankMissing = !employee.bankDetails?.accountNumber || !employee.bankDetails?.isVerified;

  return (
    <div className="space-y-6">
      {/* Top Bar: Back & Operational Employee Header */}
      <div className="pb-4 border-b border-[#E2E4DE]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6773] hover:text-[#18191B] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-[#1B4332] text-white flex items-center justify-center text-base font-bold shrink-0">
              {employee.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-[#18191B] tracking-tight">{employee.name}</h1>
                <span className="font-mono text-xs text-[#5F6773] bg-[#F4F4F0] px-2 py-0.5 rounded border border-[#E2E4DE]">
                  {employee.id}
                </span>
                <StatusBadge status={employee.employmentStatus} />
              </div>
              <div className="text-xs text-[#5F6773] mt-0.5">
                {employee.jobTitle} • {employee.department} • {employee.location}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="px-3 py-1.5 font-medium border border-[#E2E4DE] bg-white hover:bg-[#F4F4F0] rounded transition-colors"
            >
              Edit Banking Details
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3 py-1.5 font-medium border border-[#E2E4DE] bg-white hover:bg-[#F4F4F0] rounded transition-colors"
            >
              Request Leave
            </button>
            <button
              onClick={() => {
                const ps = getPayslip(currentPayRun.id, employee.id);
                if (ps) openPayslipModal(ps);
              }}
              className="px-3 py-1.5 font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors"
            >
              View September Payslip
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Personal & Employment Information (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E4DE] rounded-md p-5 text-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773] pb-3 border-b border-[#E2E4DE]">
            Personal & Statutory Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <span className="text-[#5F6773] block mb-0.5">Corporate Email</span>
              <div className="font-semibold text-[#18191B]">{employee.email}</div>
            </div>
            <div>
              <span className="text-[#5F6773] block mb-0.5">Contact Phone</span>
              <div className="font-mono text-[#18191B]">{employee.phone}</div>
            </div>

            <div>
              <span className="text-[#5F6773] block mb-0.5">Date of Joining</span>
              <div className="font-semibold text-[#18191B]">{formatDate(employee.joinedDate)}</div>
            </div>
            <div>
              <span className="text-[#5F6773] block mb-0.5">Reporting Manager</span>
              <div className="text-[#18191B]">{employee.manager}</div>
            </div>

            <div>
              <span className="text-[#5F6773] block mb-0.5">PAN Card</span>
              <div className="font-mono font-medium text-[#18191B]">{employee.panNumber}</div>
            </div>
            <div>
              <span className="text-[#5F6773] block mb-0.5">Tax Regime (Income Tax)</span>
              <div className="font-semibold text-[#18191B]">{employee.taxRegime} Tax Regime</div>
            </div>

            <div>
              <span className="text-[#5F6773] block mb-0.5">Provident Fund (PF) No.</span>
              <div className="font-mono text-[#18191B]">{employee.pfNumber}</div>
            </div>
            <div>
              <span className="text-[#5F6773] block mb-0.5">Universal Account No. (UAN)</span>
              <div className="font-mono text-[#18191B]">{employee.uan}</div>
            </div>
          </div>

          {/* Bank Disbursal Status Sub-section */}
          <div className="mt-2 pt-4 border-t border-[#E2E4DE] bg-[#FBFBF9] p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#18191B] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#1B4332]" />
                Salary Disbursal Bank Account
              </span>
              {isBankMissing ? (
                <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                  Missing Bank Details
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#1B4332] bg-[#EAF2EC] px-2 py-0.5 rounded border border-[#C2DBC7]">
                  Verified for Transfer
                </span>
              )}
            </div>

            {isBankMissing ? (
              <div className="flex items-center justify-between text-xs">
                <p className="text-[#B45309]">
                  Disbursal on hold. Bank account and IFSC code have not been registered.
                </p>
                <button
                  onClick={() => setIsBankModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#1B4332] text-white rounded hover:bg-[#143427] transition-colors"
                >
                  Resolve Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#5F6773] block">Bank Name</span>
                  <span className="font-semibold text-[#18191B]">{employee.bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-[#5F6773] block">Account Number</span>
                  <span className="font-mono font-medium text-[#18191B]">
                    •••• {employee.bankDetails.accountNumber.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6773] block">IFSC Code</span>
                  <span className="font-mono font-medium text-[#18191B]">{employee.bankDetails.ifscCode}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Current Active Contract Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E4DE] rounded-md p-5 flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773]">
                Current Active Contract
              </div>
              <StatusBadge status="Active" />
            </div>

            {activeContract ? (
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block">
                    Fixed Monthly Compensation
                  </span>
                  <div className="text-2xl font-black font-mono tracking-tight text-[#1B4332] tabular-nums mt-0.5">
                    {formatINR(activeContract.monthlySalary)}
                    <span className="text-xs font-medium text-[#5F6773]"> / month</span>
                  </div>
                  <div className="text-xs text-[#5F6773] mt-0.5">
                    Annual Gross CTC: <strong className="text-[#18191B]">{formatINR(activeContract.annualCtc)}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E4DE] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5F6773]">Contract Validity Period:</span>
                    <span className="font-semibold text-[#18191B]">
                      {formatDate(activeContract.startDate)} — {formatDate(activeContract.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6773]">Compensation Structure:</span>
                    <span className="font-semibold text-[#18191B]">Regular Salary (India Tier-1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6773]">Contract Designation:</span>
                    <span className="text-[#18191B] font-medium">{activeContract.jobTitle}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#5F6773]">No active contract found.</div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-[#E2E4DE] flex items-center justify-between">
            <span className="text-[11px] text-[#5F6773]">Ref: {activeContract?.id || '—'}</span>
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs text-[#1B4332] bg-[#EAF2EC] hover:bg-[#D2E3D6] rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Renew / Upgrade Contract</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Section Navigation Tabs */}
      <div className="border-b border-[#E2E4DE] flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {(['overview', 'contracts', 'attendance', 'timeoff', 'payslips'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 border-b-2 capitalize transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#5F6773] hover:text-[#18191B]'
            }`}
          >
            {tab === 'timeoff' ? 'Time Off' : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Contracts Timeline Interface */}
      {activeTab === 'contracts' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E4DE] mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#18191B] tracking-tight">Contract History & Timeline</h2>
              <p className="text-xs text-[#5F6773]">
                Period-based compensation timeline and active statutory bindings
              </p>
            </div>
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Period Contract</span>
            </button>
          </div>

          {/* Timeline View */}
          <div className="space-y-6 max-w-2xl pl-2">
            {employeeContracts.map((contract, index) => {
              const isActive = contract.status === 'Active';

              return (
                <div key={contract.id} className="relative flex items-start gap-4">
                  {/* Timeline connector vertical line */}
                  {index !== employeeContracts.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-[2px] bg-[#E2E4DE]" />
                  )}

                  {/* Dot */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      isActive ? 'bg-[#1B4332] text-white' : 'bg-[#E2E4DE] text-[#5F6773]'
                    }`}
                  >
                    <span className="text-[9px] font-bold">{contract.year.toString().slice(-2)}</span>
                  </div>

                  {/* Contract Card */}
                  <div
                    className={`flex-1 p-4 rounded border text-xs ${
                      isActive
                        ? 'bg-[#EAF2EC]/40 border-[#C2DBC7]'
                        : 'bg-[#FBFBF9] border-[#E2E4DE]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#18191B]">
                            {contract.year} — {contract.jobTitle}
                          </span>
                          <StatusBadge status={contract.status} />
                        </div>
                        <div className="text-xs text-[#5F6773] mt-0.5">
                          Period: {formatDate(contract.startDate)} to {formatDate(contract.endDate)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-base font-black text-[#18191B] tabular-nums">
                          {formatINR(contract.monthlySalary)}
                        </span>
                        <span className="text-[11px] text-[#5F6773]"> / mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E4DE] rounded-md p-5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-2">
              Leave Balances (FY 2026-27)
            </span>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
                <span className="text-[#5F6773]">Casual Leave</span>
                <span className="font-semibold text-[#18191B]">
                  {empLeaveBalance.casual.total - empLeaveBalance.casual.used} left ({empLeaveBalance.casual.used} used)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
                <span className="text-[#5F6773]">Sick Leave</span>
                <span className="font-semibold text-[#18191B]">
                  {empLeaveBalance.sick.total - empLeaveBalance.sick.used} left ({empLeaveBalance.sick.used} used)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
                <span className="text-[#5F6773]">Earned / Privilege</span>
                <span className="font-semibold text-[#18191B]">
                  {empLeaveBalance.earned.total - empLeaveBalance.earned.used} left ({empLeaveBalance.earned.used} used)
                </span>
              </div>
              <div className="flex justify-between py-1 text-[#B91C1C]">
                <span>Unpaid (LWP)</span>
                <span className="font-bold font-mono">{empLeaveBalance.unpaidLwpDays} days</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E4DE] rounded-md p-5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-2">
              Attendance Snapshot
            </span>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
                <span className="text-[#5F6773]">September Status</span>
                <span className="font-semibold text-[#1B4332]">Reconciled</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
                <span className="text-[#5F6773]">Working Days Present</span>
                <span className="font-semibold text-[#18191B]">22 / 22 days</span>
              </div>
              <div className="flex justify-between py-1 text-[#5F6773]">
                <span>Overtime Logged</span>
                <span className="font-semibold text-[#18191B]">0.5 hrs</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E4DE] rounded-md p-5 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-2">
                Latest Payslip
              </span>
              <div className="text-base font-bold text-[#18191B]">September 2026</div>
              <p className="text-xs text-[#5F6773] mt-1">
                Estimated Net: <strong className="text-[#1B4332] font-mono">{formatINR(activeContract?.monthlySalary ? activeContract.monthlySalary * 0.88 : 35400)}</strong>
              </p>
            </div>
            <button
              onClick={() => {
                const ps = getPayslip(currentPayRun.id, employee.id);
                if (ps) openPayslipModal(ps);
              }}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors text-center"
            >
              Open Payslip Document
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
          <div className="p-4 border-b border-[#E2E4DE] flex items-center justify-between">
            <span className="font-bold text-xs text-[#18191B]">Attendance Log for {employee.name}</span>
            <span className="text-xs text-[#5F6773]">Month: September 2026</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#FBFBF9] border-b border-[#E2E4DE] text-[10px] uppercase font-bold text-[#5F6773]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Check In</th>
                <th className="p-3">Check Out</th>
                <th className="p-3">Worked Hours</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {employeeAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#F9FAF8]">
                  <td className="p-3 font-mono">{rec.date}</td>
                  <td className="p-3 font-mono">{rec.checkIn}</td>
                  <td className="p-3 font-mono">{rec.checkOut}</td>
                  <td className="p-3 font-mono">{rec.workedHours} hrs</td>
                  <td className="p-3">
                    <StatusBadge status={rec.status} />
                  </td>
                </tr>
              ))}
              {employeeAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#5F6773]">
                    No attendance exceptions detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Time Off Tab */}
      {activeTab === 'timeoff' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md p-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE] mb-4">
            <span className="font-bold text-xs text-[#18191B]">Leave Applications</span>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3 py-1.5 bg-[#1B4332] text-white font-semibold rounded text-xs"
            >
              + Submit Leave Request
            </button>
          </div>

          <div className="divide-y divide-[#E2E4DE]">
            {employeeLeaves.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#18191B]">{req.leaveType} ({req.days} days)</div>
                  <div className="text-[#5F6773] text-[11px] mt-0.5">
                    {req.startDate} to {req.endDate} • Reason: {req.reason}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
            {employeeLeaves.length === 0 && (
              <div className="p-6 text-center text-[#5F6773]">No leave requests on record.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
          <div className="p-4 border-b border-[#E2E4DE]">
            <span className="font-bold text-xs text-[#18191B]">Historical Payslip Documents</span>
          </div>
          <div className="divide-y divide-[#E2E4DE]">
            {['September 2026', 'August 2026', 'July 2026'].map((period, idx) => {
              const isSep = period === 'September 2026';
              return (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#F9FAF8]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#1B4332]" />
                    <div>
                      <div className="font-semibold text-[#18191B]">Payslip — {period}</div>
                      <div className="text-[11px] text-[#5F6773]">
                        {isSep ? 'Current active run (Draft / Computed)' : 'Disbursed via Direct Bank Transfer'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const ps = getPayslip(currentPayRun.id, employee.id);
                      if (ps) openPayslipModal(ps);
                    }}
                    className="px-3 py-1.5 border border-[#E2E4DE] bg-white hover:bg-[#F4F4F0] rounded font-semibold text-[#1B4332]"
                  >
                    View & Print PDF
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title="Update Bank Details"
        subtitle={`Register official salary account for ${employee.name}`}
      >
        <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Bank Name *</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              placeholder="e.g. HDFC Bank Ltd"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Account Number *</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              placeholder="e.g. 50100481920194"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">IFSC Code *</label>
            <input
              type="text"
              required
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              placeholder="e.g. HDFC0000240"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setIsBankModalOpen(false)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Verify & Save Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Contract Renewal Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew / Execute Period Contract"
        subtitle={`Configure compensation adjustments for ${employee.name}`}
      >
        <form onSubmit={handleRenewContractSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">New Monthly Salary (CTC Base) *</label>
            <input
              type="number"
              required
              value={renewSalary}
              onChange={(e) => setRenewSalary(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
            />
            <span className="text-[11px] text-[#5F6773] mt-1 block">
              Annualized CTC: <strong className="text-[#18191B] font-mono">{formatINR(renewSalary * 12)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Effective Start Date</label>
              <input
                type="date"
                value={renewStart}
                onChange={(e) => setRenewStart(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Expiration Date</label>
              <input
                type="date"
                value={renewEnd}
                onChange={(e) => setRenewEnd(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F4F4F0] rounded text-xs text-[#5F6773]">
            This will archive the current contract as Expired and promote this contract to ACTIVE.
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setIsRenewModalOpen(false)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Execute Contract
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Request Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Leave Application"
        subtitle={`Request time off on behalf of ${employee.name}`}
      >
        <form onSubmit={handleRequestLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Leave Category *</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="Casual Leave">Casual Leave (Paid)</option>
              <option value="Sick Leave">Sick Leave (Paid)</option>
              <option value="Earned Leave">Earned / Privilege Leave (Paid)</option>
              <option value="Unpaid Leave (LWP)">Unpaid Leave (LWP - Will deduct from payrun)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Number of Days *</label>
            <input
              type="number"
              min={1}
              max={30}
              value={leaveDays}
              onChange={(e) => setLeaveDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Reason / Notes</label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              rows={2}
              placeholder="e.g. Medical recovery / Personal appointment"
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
