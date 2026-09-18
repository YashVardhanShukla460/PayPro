import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import type { AttendanceStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  Clock,
  Download,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    employees,
    updateAttendanceStatus,
    manualCheckIn,
    addToast,
    setActiveView,
  } = usePayroll();

  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reconcile modal
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('09:00 AM');
  const [editCheckOut, setEditCheckOut] = useState('06:00 PM');
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('Present');

  // Manual Check-in modal
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-1001');

  // Filter attendance records
  const filteredRecords = attendance.filter((rec) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    const matchesSearch =
      emp?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary Metrics calculations
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const lateCount = attendance.filter((a) => a.status === 'Late').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const needsReviewCount = attendance.filter((a) => a.status === 'Needs Review').length;
  const overtimeCount = attendance.filter((a) => a.overtimeHours > 0).length;

  const handleOpenReconcile = (recordId: string) => {
    const rec = attendance.find((a) => a.id === recordId);
    if (!rec) return;
    setActiveRecordId(recordId);
    setEditCheckIn(rec.checkIn !== '--:--' ? rec.checkIn : '09:15 AM');
    setEditCheckOut(rec.checkOut !== '--:--' ? rec.checkOut : '06:15 PM');
    setEditStatus('Present');
    setReconcileModalOpen(true);
  };

  const handleSaveReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecordId) return;
    updateAttendanceStatus(activeRecordId, editStatus, editCheckIn, editCheckOut);
    setReconcileModalOpen(false);
  };

  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manualCheckIn(selectedEmpId, 'Present');
    setCheckInModalOpen(false);
  };

  const handleExportCSV = () => {
    addToast({
      type: 'info',
      title: 'Attendance Exported',
      message: 'Daily biometric attendance CSV file generated and downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Daily Operations
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Attendance</h1>
            <span className="text-xs text-[#5F6773] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#1B4332]" />
              September 15, 2026 • Shift 1 (09:00 - 18:00 IST)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCheckInModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Check In Employee</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2D3139] bg-white border border-[#E2E4DE] hover:bg-[#F4F4F0] rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Strip (Present, Late, Absent, Missing checkout / Needs review, Overtime) */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4DE] gap-3 sm:gap-0 text-xs">
          <div className="sm:pr-4">
            <span className="text-[#5F6773] block mb-1">Present</span>
            <div className="text-xl font-bold font-mono text-[#1B4332] tabular-nums">{presentCount}</div>
            <span className="text-[10px] text-[#5F6773]">Verified biometric logs</span>
          </div>

          <div className="sm:px-4 pt-2 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Late Arrivals</span>
            <div className="text-xl font-bold font-mono text-[#B45309] tabular-nums">{lateCount}</div>
            <span className="text-[10px] text-[#5F6773]">Exceeded 09:30 AM grace</span>
          </div>

          <div className="sm:px-4 pt-2 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Absent</span>
            <div className="text-xl font-bold font-mono text-[#5F6773] tabular-nums">{absentCount}</div>
            <span className="text-[10px] text-[#5F6773]">Approved leaves</span>
          </div>

          <div className="sm:px-4 pt-2 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Needs Review</span>
            <div className="text-xl font-bold font-mono text-[#B91C1C] tabular-nums">
              {needsReviewCount}
            </div>
            <span className="text-[10px] text-[#B91C1C]">Missing punches</span>
          </div>

          <div className="sm:pl-4 pt-2 sm:pt-0">
            <span className="text-[#5F6773] block mb-1">Overtime Logged</span>
            <div className="text-xl font-bold font-mono text-[#18191B] tabular-nums">{overtimeCount}</div>
            <span className="text-[10px] text-[#5F6773]">&gt; 8 hours approved</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#8A92A0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee attendance records..."
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
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Needs Review">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Dense Operational Table */}
      <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBFBF9] border-b border-[#E2E4DE] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Worked Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {filteredRecords.map((record) => {
                const emp = employees.find((e) => e.id === record.employeeId);
                const isNeedsReview = record.status === 'Needs Review';

                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-[#F9FAF8] transition-colors ${
                      isNeedsReview ? 'bg-[#FEF3C7]/20' : ''
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
                            {emp?.name || record.employeeId}
                          </span>
                          <span className="font-mono text-[10px] text-[#5F6773] block">
                            {record.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#2D3139]">{emp?.department}</td>
                    <td className="px-4 py-3 font-mono">{record.date}</td>
                    <td className="px-4 py-3 font-mono font-medium">{record.checkIn}</td>
                    <td className="px-4 py-3 font-mono font-medium">{record.checkOut}</td>
                    <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                      {record.workedHours > 0 ? `${record.workedHours} hrs` : '—'}
                      {record.overtimeHours > 0 && (
                        <span className="text-[10px] text-[#1B4332] ml-1 font-normal">
                          (+{record.overtimeHours} OT)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                      {record.notes && (
                        <span className="block text-[10px] text-[#8A92A0] mt-0.5 truncate max-w-xs">
                          {record.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isNeedsReview ? (
                        <button
                          onClick={() => handleOpenReconcile(record.id)}
                          className="px-2.5 py-1 font-semibold text-[11px] bg-[#B45309] text-white rounded hover:bg-[#92400E] transition-colors"
                        >
                          Reconcile Punch
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReconcile(record.id)}
                          className="px-2 py-1 font-medium text-[11px] text-[#5F6773] hover:text-[#18191B] border border-[#E2E4DE] rounded hover:bg-[#F4F4F0] transition-colors"
                        >
                          Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconcile Attendance Modal */}
      <Modal
        isOpen={reconcileModalOpen}
        onClose={() => setReconcileModalOpen(false)}
        title="Reconcile Attendance Punch"
        subtitle="Correct biometric punch-in / punch-out timestamps"
      >
        <form onSubmit={handleSaveReconcile} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Punch In Time</label>
              <input
                type="text"
                value={editCheckIn}
                onChange={(e) => setEditCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Punch Out Time</label>
              <input
                type="text"
                value={editCheckOut}
                onChange={(e) => setEditCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Resolved Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="Present">Present (8 Hours Full-Day)</option>
              <option value="Late">Late Arrival (Grace Applied)</option>
              <option value="Half Day">Half Day (4 Hours)</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="p-3 bg-[#EAF2EC] border border-[#C2DBC7] rounded text-[11px] text-[#1B4332]">
            Reconciling this punch will automatically update the September 2026 pay run draft
            and resolve the attention queue flag.
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setReconcileModalOpen(false)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Confirm & Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Check-in Modal */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title="Record Manual Check-In"
        subtitle="Manually swipe in an employee for today's shift"
      >
        <form onSubmit={handleManualCheckInSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id}) — {e.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setCheckInModalOpen(false)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Record Swipe
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
