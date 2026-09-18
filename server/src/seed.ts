import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db';
import {
  INITIAL_EMPLOYEES,
  INITIAL_CONTRACTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_BALANCES,
  INITIAL_TIME_OFF_REQUESTS,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_PAY_RUNS,
} from '../../src/data/initialData';

export function seedDatabase() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('✓ Database already populated. Skipping seed.');
    return;
  }

  console.log('⚡ Seeding SQLite database with real relational records...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, employee_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const salt = bcrypt.genSaltSync(10);

  // Default Users
  insertUser.run(
    'usr-admin-01',
    'admin@peoplepay360.com',
    bcrypt.hashSync('admin123', salt),
    'Vikram Malhotra',
    'HR_ADMIN',
    'EMP-1005'
  );

  insertUser.run(
    'usr-mgr-02',
    'priya.verma@peoplepay360.internal',
    bcrypt.hashSync('priya123', salt),
    'Priya Verma',
    'MANAGER',
    'EMP-1002'
  );

  insertUser.run(
    'usr-emp-03',
    'rahul.sharma@peoplepay360.internal',
    bcrypt.hashSync('rahul123', salt),
    'Rahul Sharma',
    'EMPLOYEE',
    'EMP-1001'
  );

  // Seed Employees
  const insertEmp = db.prepare(`
    INSERT INTO employees (
      id, name, email, phone, avatar_initials, job_title, department,
      employment_status, employment_type, joined_date, manager,
      pan_number, pf_number, uan, active_contract_id, tax_regime,
      location, bank_account, bank_ifsc, bank_name, bank_verified
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const emp of INITIAL_EMPLOYEES) {
    insertEmp.run(
      emp.id,
      emp.name,
      emp.email,
      emp.phone,
      emp.avatarInitials,
      emp.jobTitle,
      emp.department,
      emp.employmentStatus,
      emp.employmentType,
      emp.joinedDate,
      emp.manager,
      emp.panNumber,
      emp.pfNumber,
      emp.uan,
      emp.activeContractId,
      emp.taxRegime,
      emp.location,
      emp.bankDetails.accountNumber,
      emp.bankDetails.ifscCode,
      emp.bankDetails.bankName,
      emp.bankDetails.isVerified ? 1 : 0
    );
  }

  // Seed Contracts
  const insertContract = db.prepare(`
    INSERT INTO contracts (
      id, employee_id, job_title, monthly_salary, annual_ctc,
      salary_structure_id, start_date, end_date, status, year, document_ref
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of INITIAL_CONTRACTS) {
    insertContract.run(
      c.id,
      c.employeeId,
      c.jobTitle,
      c.monthlySalary,
      c.annualCtc,
      c.salaryStructureId,
      c.startDate,
      c.endDate,
      c.status,
      c.year,
      c.documentRef || null
    );
  }

  // Seed Attendance
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (
      id, employee_id, date, check_in, check_out,
      worked_hours, overtime_hours, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of INITIAL_ATTENDANCE) {
    insertAttendance.run(
      a.id,
      a.employeeId,
      a.date,
      a.checkIn,
      a.checkOut,
      a.workedHours,
      a.overtimeHours,
      a.status,
      a.notes || null
    );
  }

  // Seed Leave Balances
  const insertLeaveBal = db.prepare(`
    INSERT INTO leave_balances (
      employee_id, casual_total, casual_used, sick_total, sick_used,
      earned_total, earned_used, unpaid_lwp_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const [empId, bal] of Object.entries(INITIAL_LEAVE_BALANCES)) {
    insertLeaveBal.run(
      empId,
      bal.casual.total,
      bal.casual.used,
      bal.sick.total,
      bal.sick.used,
      bal.earned.total,
      bal.earned.used,
      bal.unpaidLwpDays
    );
  }

  // Seed Time Off Requests
  const insertTimeOff = db.prepare(`
    INSERT INTO time_off_requests (
      id, employee_id, leave_type, start_date, end_date,
      days, reason, status, approver, applied_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of INITIAL_TIME_OFF_REQUESTS) {
    insertTimeOff.run(
      t.id,
      t.employeeId,
      t.leaveType,
      t.startDate,
      t.endDate,
      t.days,
      t.reason,
      t.status,
      t.approver,
      t.appliedOn
    );
  }

  // Seed Salary Structures & Rules
  const insertStructure = db.prepare(`
    INSERT INTO salary_structures (id, code, name, description)
    VALUES (?, ?, ?, ?)
  `);

  const insertRule = db.prepare(`
    INSERT INTO salary_rules (
      id, structure_id, sequence, code, name, category,
      calc_type, expression, status, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of INITIAL_SALARY_STRUCTURES) {
    insertStructure.run(s.id, s.code, s.name, s.description);
    for (const r of s.rules) {
      insertRule.run(
        r.id,
        s.id,
        r.sequence,
        r.code,
        r.name,
        r.category,
        r.calcType,
        r.expression,
        r.status,
        r.description || null
      );
    }
  }

  // Seed Pay Runs & Employee Payrolls
  const insertPayRun = db.prepare(`
    INSERT INTO pay_runs (
      id, period, start_date, end_date, pay_date,
      salary_structure_id, status, total_employees, total_gross,
      total_deductions, total_net, last_calculated_at, validated_at, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmpPayroll = db.prepare(`
    INSERT INTO employee_payrolls (
      id, pay_run_id, employee_id, contract_id, worked_days,
      total_working_days, lwp_days, basic, hra, transport, special,
      overtime, gross, pf, pt, tds, lwp_deduction, total_deductions,
      net_pay, status
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  for (const pr of INITIAL_PAY_RUNS) {
    insertPayRun.run(
      pr.id,
      pr.period,
      pr.startDate,
      pr.endDate,
      pr.payDate,
      pr.salaryStructureId,
      pr.status,
      pr.totalEmployees,
      pr.totalGross,
      pr.totalDeductions,
      pr.totalNet,
      pr.lastCalculatedAt || null,
      pr.validatedAt || null,
      pr.paidAt || null
    );

    for (const ep of pr.employeePayrolls) {
      insertEmpPayroll.run(
        ep.id,
        pr.id,
        ep.employeeId,
        ep.contractId,
        ep.workedDays,
        ep.totalWorkingDays,
        ep.lwpDays,
        ep.earnings.basic,
        ep.earnings.hra,
        ep.earnings.transportAllowance,
        ep.earnings.specialAllowance,
        ep.earnings.overtimePay,
        ep.earnings.gross,
        ep.deductions.pf,
        ep.deductions.pt,
        ep.deductions.tds,
        ep.deductions.lwpDeduction,
        ep.deductions.totalDeductions,
        ep.netPay,
        ep.status
      );
    }
  }

  console.log('✓ SQLite database successfully seeded with real relational enterprise data.');
}
