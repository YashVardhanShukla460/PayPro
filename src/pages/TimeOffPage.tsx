import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { LeaveType } from '../types';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const TimeOffPage: React.FC = () => {
  const {
    leaveRequests,
    leaveBalances,
    employees,
    approveLeave,
    refuseLeave,
    requestLeave,
    setActiveView,
  } = usePayroll();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'refused'>('all');

  // Request modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-1001');
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState('2026-09-22');
  const [endDate, setEndDate] = useState('2026-09-23');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('');

  const filteredRequests = leaveRequests.filter((req) => {
    if (activeFilter === 'pending') return req.status === 'Pending';
    if (activeFilter === 'approved') return req.status === 'Approved';
    if (activeFilter === 'refused') return req.status === 'Refused';
    return true;
  });

  const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;
  const approvedThisMonth = leaveRequests.filter(
    (r) => r.status === 'Approved' && r.appliedOn.startsWith('2026-09')
  ).length;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    requestLeave({
      employeeId: selectedEmpId,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason || 'Planned leave',
      approver: emp?.manager || 'Sunita Rao (VP of People)',
    });
    setIsModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Leave Administration
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Time Off</h1>
            <span className="text-xs text-[#5F6773]">
              Leave approvals directly update balances & active payroll deductions
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4DE] gap-4 sm:gap-0 text-xs">
          <div className="sm:pr-5">
            <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-1">
              Company-wide Available Balance
            </span>
            <div className="text-2xl font-black font-mono text-[#18191B] tabular-nums">412 Days</div>
            <span className="text-[11px] text-[#5F6773] mt-0.5 block">
              Avg 9.8 days per employee • Casual (12) + Sick (10) + Earned (18)
            </span>
          </div>

          <div className="sm:px-5 pt-3 sm:pt-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-1">
                Pending Requests
              </span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
              )}
            </div>
            <div className="text-2xl font-black font-mono text-[#B45309] tabular-nums">
              {pendingCount}
            </div>
            <span className="text-[11px] text-[#B45309] mt-0.5 block font-medium">
              Requires supervisor or HR authorization
            </span>
          </div>

          <div className="sm:pl-5 pt-3 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-1">
              Approved This Month
            </span>
            <div className="text-2xl font-black font-mono text-[#1B4332] tabular-nums">
              {approvedThisMonth}
            </div>
            <span className="text-[11px] text-[#1B4332] mt-0.5 block">
              September 2026 payroll deductions calibrated
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Banner */}
      <div className="p-3.5 bg-[#F0F4F1] border border-[#D2E3D6] rounded-md text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" />
          <span className="text-[#18191B] font-medium">
            <strong>Operational Demonstration:</strong> Approving an <em>Unpaid Leave (LWP)</em> immediately
            deducts pro-rata pay in the active September pay run.
          </span>
        </div>
        <button
          onClick={() => setActiveView('payruns')}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4332] hover:underline whitespace-nowrap"
        >
          <span>Inspect Active Pay Run</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2E4DE] pb-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5F6773] hover:bg-[#F4F4F0]'
            }`}
          >
            All Requests ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5F6773] hover:bg-[#F4F4F0]'
            }`}
          >
            Pending Authorization ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeFilter === 'approved'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5F6773] hover:bg-[#F4F4F0]'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveFilter('refused')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeFilter === 'refused'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5F6773] hover:bg-[#F4F4F0]'
            }`}
          >
            Refused
          </button>
        </div>
      </div>

      {/* Dense Request List */}
      <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBFBF9] border-b border-[#E2E4DE] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Remaining Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Approver</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {filteredRequests.map((req) => {
                const emp = employees.find((e) => e.id === req.employeeId);
                const balance = leaveBalances[req.employeeId];
                const isPending = req.status === 'Pending';
                const isLwp = req.leaveType === 'Unpaid Leave (LWP)';

                let balanceDisplay = '—';
                if (balance) {
                  if (req.leaveType === 'Casual Leave') {
                    balanceDisplay = `${balance.casual.total - balance.casual.used} left`;
                  } else if (req.leaveType === 'Sick Leave') {
                    balanceDisplay = `${balance.sick.total - balance.sick.used} left`;
                  } else if (req.leaveType === 'Earned Leave') {
                    balanceDisplay = `${balance.earned.total - balance.earned.used} left`;
                  } else {
                    balanceDisplay = `${balance.unpaidLwpDays} d accrued LWP`;
                  }
                }

                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-[#F9FAF8] transition-colors ${
                      isPending ? 'bg-[#FEF3C7]/15' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {emp?.avatarInitials || 'EM'}
                        </div>
                        <div>
                          <span
                            onClick={() => emp && setActiveView('employee-detail', emp.id)}
                            className="font-semibold text-[#18191B] hover:text-[#1B4332] hover:underline cursor-pointer"
                          >
                            {emp?.name || req.employeeId}
                          </span>
                          <span className="font-mono text-[10px] text-[#5F6773] block">
                            {req.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${isLwp ? 'text-[#B91C1C]' : 'text-[#18191B]'}`}>
                        {req.leaveType}
                      </span>
                      {req.reason && (
                        <span className="block text-[10px] text-[#5F6773] truncate max-w-[180px]">
                          {req.reason}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#18191B] tabular-nums">
                      {req.days} {req.days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#5F6773] tabular-nums">
                      {balanceDisplay}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-[#5F6773] text-[11px]">{req.approver}</td>
                    <td className="px-4 py-3 text-right">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => approveLeave(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-[#1B4332] text-white rounded hover:bg-[#143427] transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => refuseLeave(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded hover:bg-[#FDD] transition-colors"
                          >
                            <X className="w-3 h-3" />
                            <span>Refuse</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A92A0] italic">
                          Action completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#5F6773]">
                    No leave requests matching the active filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Employee Time Off"
        subtitle="Record planned vacation, sick leave, or unpaid absence"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Employee *</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id}) — {e.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Leave Classification</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="Casual Leave">Casual Leave (Paid Statutory)</option>
              <option value="Sick Leave">Sick Leave (Medical Certificate)</option>
              <option value="Earned Leave">Earned / Annual Privilege Leave</option>
              <option value="Unpaid Leave (LWP)">Unpaid Leave (LWP - Deducts pay pro-rata)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Working Days Count</label>
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Urgent family commitments / Medical treatment"
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
