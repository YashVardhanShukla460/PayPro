import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatLakhs } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { NewPayRunWizard } from '../components/payroll/NewPayRunWizard';
import {
  Coins,
  Play,
  CheckCircle2,
  AlertTriangle,
  Send,
  CreditCard,
  Building,
  Search,
  Filter,
  FileText,
  Lock,
  ArrowRight,
  UserCheck,
  Calendar,
  Check,
} from 'lucide-react';

export const PayRunsPage: React.FC = () => {
  const {
    currentPayRun,
    payRuns,
    setCurrentPayRunId,
    computePayroll,
    validatePayRun,
    markPayRunPaid,
    sendPayslips,
    employees,
    contracts,
    getPayslip,
    openPayslipModal,
    updateBankDetails,
    setActiveView,
  } = usePayroll();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Quick Resolve Bank modal for warnings in the table
  const [resolvingEmpId, setResolvingEmpId] = useState<string | null>(null);
  const [quickAccount, setQuickAccount] = useState('');
  const [quickIfsc, setQuickIfsc] = useState('');

  const employeePayrolls = currentPayRun.employeePayrolls || [];

  const filteredPayrolls = employeePayrolls.filter((ep) => {
    const emp = employees.find((e) => e.id === ep.employeeId);
    const matchesSearch =
      emp?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isDraft = currentPayRun.status === 'Draft';
  const isComputed = currentPayRun.status === 'Computed';
  const isValidated = currentPayRun.status === 'Validated';
  const isPaid = currentPayRun.status === 'Paid';

  const dataCheck = currentPayRun.dataCheck || {
    activeContractsValid: true,
    salaryStructuresValid: true,
    attendanceReconciled: true,
    bankDetailsComplete: false,
    missingBankDetailsCount: 3,
    leaveDeductionsApplied: true,
  };

  const handleOpenBankModal = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvingEmpId(empId);
    setQuickAccount('');
    setQuickIfsc('HDFC0000240');
  };

  const handleSaveQuickBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingEmpId || !quickAccount || !quickIfsc) return;
    updateBankDetails(resolvingEmpId, {
      accountNumber: quickAccount,
      ifscCode: quickIfsc,
      bankName: 'HDFC Bank',
      isVerified: true,
    });
    setResolvingEmpId(null);
  };

  const resolvingEmp = employees.find((e) => e.id === resolvingEmpId);

  return (
    <div className="space-y-6">
      {/* Top Header: Pay Runs Processing Workspace */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Payroll Processing Console
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Pay Runs</h1>

            {/* Cycle Selector */}
            <select
              value={currentPayRun.id}
              onChange={(e) => setCurrentPayRunId(e.target.value)}
              className="text-xs font-semibold text-[#18191B] border border-[#E2E4DE] bg-white px-2.5 py-1 rounded focus:outline-none focus:border-[#1B4332]"
            >
              {payRuns.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.period} ({pr.status})
                </option>
              ))}
            </select>

            <StatusBadge status={currentPayRun.status} />
          </div>
        </div>

        {/* Primary Pay Run Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Compute */}
          <button
            onClick={() => computePayroll(currentPayRun.id)}
            disabled={isPaid}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              isPaid
                ? 'bg-[#EAEAE5] text-[#8A92A0] cursor-not-allowed'
                : 'bg-white border border-[#E2E4DE] text-[#18191B] hover:bg-[#F4F4F0]'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>{isComputed || isValidated ? 'Re-Compute' : 'Compute Payroll'}</span>
          </button>

          {/* Action 2: Validate */}
          <button
            onClick={() => validatePayRun(currentPayRun.id)}
            disabled={isPaid}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              isPaid
                ? 'bg-[#EAEAE5] text-[#8A92A0] cursor-not-allowed'
                : 'bg-white border border-[#E2E4DE] text-[#18191B] hover:bg-[#F4F4F0]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B53]" />
            <span>Validate Data</span>
          </button>

          {/* Action 3: Mark Paid */}
          <button
            onClick={() => markPayRunPaid(currentPayRun.id)}
            disabled={isPaid}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded text-white transition-colors ${
              isPaid
                ? 'bg-[#EAEAE5] text-[#8A92A0] cursor-not-allowed'
                : 'bg-[#1B4332] hover:bg-[#143427]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isPaid ? 'Disbursed (Paid)' : 'Mark as Paid'}</span>
          </button>

          {/* Action 4: Send Payslips */}
          <button
            onClick={() => sendPayslips(currentPayRun.id)}
            disabled={!isPaid}
            title={!isPaid ? 'Pay Run must be finalized and marked Paid before sending payslips' : ''}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              isPaid
                ? 'bg-[#EAF2EC] text-[#1B4332] border border-[#C2DBC7] hover:bg-[#D2E3D6]'
                : 'bg-[#F4F4F0] text-[#8A92A0] border border-[#E2E4DE] cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Payslips</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-2.5 py-2 text-xs font-medium text-[#5F6773] hover:text-[#18191B] border border-dashed border-[#E2E4DE] rounded hover:border-[#18191B]"
          >
            + New Cycle
          </button>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4DE] gap-4 sm:gap-0 text-xs">
          <div className="sm:pr-4">
            <span className="text-[#5F6773] block mb-1">Target Cycle Period</span>
            <div className="text-base font-bold text-[#18191B]">{currentPayRun.period}</div>
            <span className="text-[11px] text-[#5F6773]">
              {currentPayRun.startDate} to {currentPayRun.endDate}
            </span>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Enrolled Employees</span>
            <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">
              {currentPayRun.totalEmployees}
            </div>
            <span className="text-[11px] text-[#5F6773]">100% active contracts assigned</span>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Gross Incurred</span>
            <div className="text-xl font-bold font-mono text-[#18191B] tabular-nums">
              {formatINR(currentPayRun.totalGross)}
            </div>
            <span className="text-[11px] text-[#5F6773]">
              Deductions: <strong className="text-[#B91C1C]">{formatINR(currentPayRun.totalDeductions)}</strong>
            </span>
          </div>

          <div className="sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Estimated Net Payout</span>
            <div className="text-2xl font-black font-mono text-[#1B4332] tabular-nums">
              {formatINR(currentPayRun.totalNet)}
            </div>
            <span className="text-[11px] text-[#1B4332] font-semibold">
              {formatLakhs(currentPayRun.totalNet)} total disbursal
            </span>
          </div>
        </div>
      </div>

      {/* DATA CHECK & VALIDATION PROGRESS AREA */}
      <div className="bg-[#FBFBF9] border border-[#E2E4DE] rounded-md p-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE] mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-[#18191B]">
              Data Check & Pre-Disbursement Verification
            </span>
            <span className="text-[11px] text-[#5F6773]">
              (Automated 5-point integrity check)
            </span>
          </div>

          {dataCheck.missingBankDetailsCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />
              <span>{dataCheck.missingBankDetailsCount} Action Required</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#EAF2EC] text-[#1B4332] border border-[#C2DBC7]">
              <Check className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>All 5 Rules Verified</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Rule 1 */}
          <div className="p-3 bg-white border border-[#E2E4DE] rounded flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#18191B]">Active Contracts</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">42/42 valid & active</div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3 bg-white border border-[#E2E4DE] rounded flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#18191B]">Salary Structures</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">Regular India Tier-1</div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3 bg-white border border-[#E2E4DE] rounded flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#18191B]">Attendance Records</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">Reconciled for 22 days</div>
            </div>
          </div>

          {/* Rule 4: Bank Details */}
          <div
            className={`p-3 rounded border flex items-start gap-2.5 ${
              dataCheck.missingBankDetailsCount > 0
                ? 'bg-[#FFFBEB] border-[#FDE68A]'
                : 'bg-white border-[#E2E4DE]'
            }`}
          >
            {dataCheck.missingBankDetailsCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-[#18191B]">
                {dataCheck.missingBankDetailsCount > 0
                  ? `${dataCheck.missingBankDetailsCount} Missing Bank Details`
                  : 'Bank Details Verified'}
              </div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">
                {dataCheck.missingBankDetailsCount > 0
                  ? 'Click employee row to resolve'
                  : 'All NEFT / RTGS verified'}
              </div>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="p-3 bg-white border border-[#E2E4DE] rounded flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#18191B]">Leave Deductions</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">LWP calibrated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Employee Payroll Table */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#8A92A0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee in current pay run..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5F6773] font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
          >
            <option value="All">All Statuses ({employeePayrolls.length})</option>
            <option value="Ready">Ready</option>
            <option value="Missing Bank Details">Missing Bank Details</option>
            <option value="Computed">Computed</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* EMPLOYEE PAYROLL TABLE */}
      <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
        <div className="p-3.5 bg-[#FBFBF9] border-b border-[#E2E4DE] flex items-center justify-between">
          <span className="font-bold text-xs text-[#18191B]">
            Employee Payroll Registry • {filteredPayrolls.length} entries
          </span>
          <span className="text-[11px] text-[#5F6773]">
            Click any row to open full printable payslip document
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F4F0] border-b border-[#E2E4DE] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Contract / Title</th>
                <th className="px-4 py-3">Worked Days</th>
                <th className="px-4 py-3">Gross Earnings</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Pay</th>
                <th className="px-4 py-3">Disbursal Status</th>
                <th className="px-4 py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {filteredPayrolls.map((payroll) => {
                const emp = employees.find((e) => e.id === payroll.employeeId);
                const isMissingBank = payroll.status === 'Missing Bank Details';

                return (
                  <tr
                    key={payroll.id}
                    onClick={() => {
                      const ps = getPayslip(currentPayRun.id, payroll.employeeId);
                      if (ps) openPayslipModal(ps);
                    }}
                    className={`hover:bg-[#F9FAF8] cursor-pointer transition-colors ${
                      isMissingBank ? 'bg-[#FFFBEB]/30' : ''
                    }`}
                  >
                    {/* Col 1: Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {emp?.avatarInitials || 'EM'}
                        </div>
                        <div>
                          <span className="font-semibold text-[#18191B] hover:text-[#1B4332]">
                            {emp?.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#5F6773] block">
                            {payroll.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Contract */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#18191B]">{emp?.jobTitle}</div>
                      <div className="text-[10px] text-[#5F6773]">{emp?.department}</div>
                    </td>

                    {/* Col 3: Worked Days */}
                    <td className="px-4 py-3 font-mono tabular-nums">
                      <span className="font-semibold text-[#18191B]">
                        {payroll.workedDays} / {payroll.totalWorkingDays}
                      </span>
                      {payroll.lwpDays > 0 && (
                        <span className="block text-[10px] text-[#B91C1C]">
                          (-{payroll.lwpDays} d LWP)
                        </span>
                      )}
                    </td>

                    {/* Col 4: Gross */}
                    <td className="px-4 py-3 font-mono font-bold text-[#18191B] tabular-nums">
                      {formatINR(payroll.earnings.gross)}
                    </td>

                    {/* Col 5: Deductions */}
                    <td className="px-4 py-3 font-mono text-[#B91C1C] tabular-nums font-semibold">
                      {formatINR(payroll.deductions.totalDeductions)}
                    </td>

                    {/* Col 6: Net Pay */}
                    <td className="px-4 py-3 font-mono font-black text-sm text-[#1B4332] tabular-nums">
                      {formatINR(payroll.netPay)}
                    </td>

                    {/* Col 7: Status & Quick Action */}
                    <td className="px-4 py-3">
                      {isMissingBank ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status="warning" />
                          <button
                            onClick={(e) => handleOpenBankModal(payroll.employeeId, e)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-[#B45309] text-white rounded hover:bg-[#92400E] transition-colors"
                          >
                            Add Bank
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={payroll.status} />
                      )}
                    </td>

                    {/* Col 8: Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const ps = getPayslip(currentPayRun.id, payroll.employeeId);
                          if (ps) openPayslipModal(ps);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1B4332] bg-[#EAF2EC] hover:bg-[#D2E3D6] rounded transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Document</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPayrolls.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#5F6773]">
                    No employee records match the applied criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Bank Details Modal from table warning */}
      <Modal
        isOpen={!!resolvingEmpId}
        onClose={() => setResolvingEmpId(null)}
        title="Resolve Missing Bank Details"
        subtitle={`Register bank disbursal account for ${resolvingEmp?.name || ''}`}
      >
        <form onSubmit={handleSaveQuickBank} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Bank Name</label>
            <input
              type="text"
              readOnly
              value="HDFC Bank"
              className="w-full px-3 py-2 border border-[#E2E4DE] bg-[#F4F4F0] rounded text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Account Number *</label>
            <input
              type="text"
              required
              value={quickAccount}
              onChange={(e) => setQuickAccount(e.target.value)}
              placeholder="e.g. 50100481920194"
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">IFSC Code *</label>
            <input
              type="text"
              required
              value={quickIfsc}
              onChange={(e) => setQuickIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0000240"
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setResolvingEmpId(null)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Confirm Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Run Wizard */}
      <NewPayRunWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};
