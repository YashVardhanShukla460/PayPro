import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatINR } from '../../utils/formatters';
import { Printer, Mail, X, CheckCircle2, Building, Calendar, Hash } from 'lucide-react';

export const PayslipModal: React.FC = () => {
  const { selectedPayslip, closePayslipModal, addToast } = usePayroll();

  if (!selectedPayslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    addToast({
      type: 'success',
      title: 'Payslip Emailed',
      message: `PDF payslip sent to ${selectedPayslip.employeeSnapshot.name} at registered email.`,
    });
  };

  const {
    period,
    payDate,
    employeeSnapshot,
    attendanceSnapshot,
    earnings,
    deductions,
    grossPay,
    totalDeductions,
    netPay,
    netPayInWords,
  } = selectedPayslip;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payslip-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#18191B]/50 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white border border-[#E2E4DE] rounded-md shadow-lg my-6 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E2E4DE] bg-[#FBFBF9] no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#EAF2EC] px-2 py-0.5 rounded">
              Official Document
            </span>
            <span id="payslip-modal-title" className="text-xs font-semibold text-[#5F6773]">
              Payslip #{selectedPayslip.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2D3139] bg-white border border-[#E2E4DE] hover:bg-[#F4F4F0] rounded transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              onClick={closePayslipModal}
              className="p-1 text-[#8A92A0] hover:text-[#18191B] rounded ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-10 overflow-y-auto payslip-print-container text-[#18191B]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-[#18191B] pb-5 gap-4">
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
                Registered Office: 4th Floor, Tech Hub Tower, Outer Ring Road, Kadubeesanahalli,
                Bengaluru, Karnataka 560103. CIN: U72200KA2022PTC148912
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-xl font-bold uppercase tracking-wide text-[#1B4332]">
                PAYSLIP
              </div>
              <div className="text-xs font-semibold text-[#18191B] mt-0.5">
                Pay Period: {period}
              </div>
              <div className="text-[11px] text-[#5F6773]">
                Disbursement Date: {payDate}
              </div>
            </div>
          </div>

          {/* Employee & Statutory Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E2E4DE] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Employee Name
              </span>
              <span className="font-semibold text-[#18191B]">{employeeSnapshot.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Employee ID
              </span>
              <span className="font-mono font-medium text-[#18191B]">{employeeSnapshot.employeeId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Designation
              </span>
              <span className="text-[#18191B]">{employeeSnapshot.jobTitle}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Department
              </span>
              <span className="text-[#18191B]">{employeeSnapshot.department}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                PAN Number
              </span>
              <span className="font-mono text-[#18191B]">{employeeSnapshot.pan}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Bank Account
              </span>
              <span className="font-mono text-[#18191B]">
                {employeeSnapshot.accountNumber ? `•••• ${employeeSnapshot.accountNumber.slice(-4)}` : 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                Bank IFSC
              </span>
              <span className="font-mono text-[#18191B]">{employeeSnapshot.ifscCode}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider block mb-0.5">
                PF / UAN No.
              </span>
              <span className="font-mono text-[#18191B]">{employeeSnapshot.uan}</span>
            </div>
          </div>

          {/* Attendance Snapshot Strip */}
          <div className="flex flex-wrap items-center justify-between py-3 border-b border-[#E2E4DE] bg-[#FBFBF9] px-3 my-4 rounded text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5F6773]" />
              <span className="text-[#5F6773]">Calendar Days:</span>
              <span className="font-semibold text-[#18191B]">{attendanceSnapshot.totalDays}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
              <span className="text-[#5F6773]">Days Worked:</span>
              <span className="font-semibold text-[#18191B]">{attendanceSnapshot.workedDays}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#5F6773]">Paid Leaves:</span>
              <span className="font-semibold text-[#18191B]">{attendanceSnapshot.paidLeaves}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#5F6773]">Unpaid (LWP):</span>
              <span className="font-semibold text-[#B91C1C]">{attendanceSnapshot.unpaidLeaves}</span>
            </div>
          </div>

          {/* Dual Table: Earnings & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
            {/* Left: Earnings */}
            <div>
              <div className="border-b-2 border-[#1B4332] pb-1 mb-2 flex justify-between items-baseline">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  Earnings Component
                </h3>
                <span className="text-[10px] uppercase font-bold text-[#5F6773]">Amount</span>
              </div>
              <div className="space-y-2 text-xs">
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-[#F4F4F0]">
                    <span className="text-[#2D3139]">{item.name}</span>
                    <span className="font-mono font-medium text-[#18191B] tabular-nums">
                      {formatINR(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-2.5 mt-3 border-t-2 border-[#18191B] text-xs font-bold">
                <span className="text-[#18191B]">Gross Earnings (A)</span>
                <span className="font-mono tabular-nums text-[#18191B]">{formatINR(grossPay)}</span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div>
              <div className="border-b-2 border-[#18191B] pb-1 mb-2 flex justify-between items-baseline">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18191B]">
                  Deductions Component
                </h3>
                <span className="text-[10px] uppercase font-bold text-[#5F6773]">Amount</span>
              </div>
              <div className="space-y-2 text-xs">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-[#F4F4F0]">
                    <span className="text-[#2D3139]">{item.name}</span>
                    <span className="font-mono font-medium text-[#B91C1C] tabular-nums">
                      {formatINR(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-2.5 mt-3 border-t-2 border-[#18191B] text-xs font-bold">
                <span className="text-[#18191B]">Total Deductions (B)</span>
                <span className="font-mono tabular-nums text-[#B91C1C]">
                  {formatINR(totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Highlighted Net Pay Bar */}
          <div className="border border-[#C2DBC7] bg-[#EAF2EC] p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B4332] block">
                Net Pay Disbursed (A - B)
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#1B4332] tabular-nums mt-0.5">
                {formatINR(netPay)}
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5F6773] block">
                In Words
              </span>
              <span className="text-xs font-medium text-[#18191B] italic">{netPayInWords}</span>
            </div>
          </div>

          {/* Footer & Signature lines */}
          <div className="pt-8 border-t border-[#E2E4DE] text-[11px] text-[#5F6773] flex flex-col sm:flex-row justify-between items-end gap-6">
            <div>
              <p>This is a computer-generated document and does not require a physical seal.</p>
              <p className="mt-0.5">Authorized for PeoplePay360 Operations • Ref: {selectedPayslip.id}</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="font-mono text-xs font-semibold text-[#18191B] tracking-wider mb-1">
                [DIGITALLY SIGNED & VERIFIED]
              </div>
              <div className="border-t border-[#18191B] pt-1 text-[10px] text-[#18191B]">
                Finance & Payroll Authority
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
