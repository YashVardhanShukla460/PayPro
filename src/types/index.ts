export type Department = 'Engineering' | 'Sales' | 'HR' | 'Operations' | 'Finance' | 'Product';
export type EmploymentStatus = 'Active' | 'Probation' | 'Notice Period' | 'Terminated';
export type EmploymentType = 'Full-Time' | 'Contract' | 'Intern';
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Needs Review' | 'Half Day';
export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave (LWP)';
export type LeaveStatus = 'Pending' | 'Approved' | 'Refused';
export type PayRunStatus = 'Draft' | 'Computed' | 'Validated' | 'Paid';

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isVerified: boolean;
}

export interface Employee {
  id: string; // e.g. 'EMP-1001'
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  jobTitle: string;
  department: Department;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  joinedDate: string; // YYYY-MM-DD
  manager: string;
  bankDetails: BankDetails;
  panNumber: string;
  pfNumber: string;
  uan: string;
  activeContractId: string;
  taxRegime: 'New' | 'Old';
  location: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  jobTitle: string;
  monthlySalary: number;
  annualCtc: number;
  salaryStructureId: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
  year: number;
  documentRef?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // '09:15 AM'
  checkOut: string; // '06:30 PM'
  workedHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approver: string;
  appliedOn: string;
}

export interface LeaveBalance {
  casual: { total: number; used: number };
  sick: { total: number; used: number };
  earned: { total: number; used: number };
  unpaidLwpDays: number;
}

export interface SalaryRule {
  id: string;
  sequence: number;
  code: string;
  name: string;
  category: 'Base' | 'Allowance' | 'Deduction' | 'Net';
  calcType: 'Percentage of CTC' | 'Fixed Amount' | 'Percentage of Basic' | 'Formula' | 'Computed';
  expression: string;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface SalaryStructure {
  id: string;
  code: string;
  name: string;
  description: string;
  rules: SalaryRule[];
}

export interface EmployeePayroll {
  id: string;
  employeeId: string;
  contractId: string;
  workedDays: number;
  totalWorkingDays: number;
  lwpDays: number;
  earnings: {
    basic: number;
    hra: number;
    transportAllowance: number;
    specialAllowance: number;
    overtimePay: number;
    gross: number;
  };
  deductions: {
    pf: number;
    pt: number;
    tds: number;
    lwpDeduction: number;
    totalDeductions: number;
  };
  netPay: number;
  status: 'Ready' | 'Missing Bank Details' | 'Computed' | 'Paid';
  payslipId?: string;
}

export interface PayRun {
  id: string;
  period: string; // 'September 2026'
  startDate: string;
  endDate: string;
  payDate: string;
  salaryStructureId: string;
  status: PayRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeePayrolls: EmployeePayroll[];
  dataCheck: {
    activeContractsValid: boolean;
    salaryStructuresValid: boolean;
    attendanceReconciled: boolean;
    bankDetailsComplete: boolean;
    missingBankDetailsCount: number;
    leaveDeductionsApplied: boolean;
  };
  lastCalculatedAt?: string;
  validatedAt?: string;
  paidAt?: string;
}

export interface Payslip {
  id: string;
  payRunId: string;
  employeeId: string;
  period: string;
  payDate: string;
  generationDate: string;
  employeeSnapshot: {
    name: string;
    employeeId: string;
    jobTitle: string;
    department: Department;
    joinedDate: string;
    pan: string;
    pfNumber: string;
    uan: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    location: string;
  };
  attendanceSnapshot: {
    totalDays: number;
    workedDays: number;
    paidLeaves: number;
    unpaidLeaves: number;
  };
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
}

export interface OperationalAlert {
  id: string;
  type: 'bank' | 'attendance' | 'contract' | 'leave';
  title: string;
  description: string;
  severity: 'warning' | 'error' | 'info';
  actionTarget: string;
}
