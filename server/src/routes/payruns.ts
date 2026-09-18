import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all pay runs
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const runs = db.prepare('SELECT * FROM pay_runs ORDER BY start_date DESC').all() as any[];
  const payrolls = db.prepare('SELECT * FROM employee_payrolls').all() as any[];

  const result = runs.map((pr) => {
    const runPayrolls = payrolls
      .filter((p) => p.pay_run_id === pr.id)
      .map((p) => ({
        id: p.id,
        employeeId: p.employee_id,
        contractId: p.contract_id,
        workedDays: p.worked_days,
        totalWorkingDays: p.total_working_days,
        lwpDays: p.lwp_days,
        earnings: {
          basic: p.basic,
          hra: p.hra,
          transportAllowance: p.transport,
          specialAllowance: p.special,
          overtimePay: p.overtime,
          gross: p.gross,
        },
        deductions: {
          pf: p.pf,
          pt: p.pt,
          tds: p.tds,
          lwpDeduction: p.lwp_deduction,
          totalDeductions: p.total_deductions,
        },
        netPay: p.net_pay,
        status: p.status,
      }));

    const missingBankCount = runPayrolls.filter((p) => p.status === 'Missing Bank Details').length;

    return {
      id: pr.id,
      period: pr.period,
      startDate: pr.start_date,
      endDate: pr.end_date,
      payDate: pr.pay_date,
      salaryStructureId: pr.salary_structure_id,
      status: pr.status,
      totalEmployees: pr.total_employees,
      totalGross: pr.total_gross,
      totalDeductions: pr.total_deductions,
      totalNet: pr.total_net,
      lastCalculatedAt: pr.last_calculated_at,
      validatedAt: pr.validated_at,
      paidAt: pr.paid_at,
      employeePayrolls: runPayrolls,
      dataCheck: {
        activeContractsValid: true,
        salaryStructuresValid: true,
        attendanceReconciled: true,
        bankDetailsComplete: missingBankCount === 0,
        missingBankDetailsCount: missingBankCount,
        leaveDeductionsApplied: true,
      },
    };
  });

  return res.json(result);
});

// POST create pay run
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { period, startDate, endDate, payDate, salaryStructureId, employeeIds } = req.body;
  const newId = `PR-${Date.now().toString().slice(-6)}`;

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  const insertPayroll = db.prepare(`
    INSERT INTO employee_payrolls (
      id, pay_run_id, employee_id, contract_id, worked_days,
      total_working_days, lwp_days, basic, hra, transport, special,
      overtime, gross, pf, pt, tds, lwp_deduction, total_deductions,
      net_pay, status
    ) VALUES (
      ?, ?, ?, ?, 22, 22, 0, ?, ?, ?, ?, 0, ?, ?, ?, ?, 0, ?, ?, ?
    )
  `);

  for (const empId of employeeIds) {
    const contract = db.prepare("SELECT * FROM contracts WHERE employee_id = ? AND status = 'Active' LIMIT 1").get(empId) as any;
    const salary = contract ? contract.monthly_salary : 40000;
    const basic = Math.round(salary * 0.5);
    const hra = Math.round(salary * 0.25);
    const transport = 3200;
    const special = Math.max(0, salary - (basic + hra + transport));
    const gross = salary;
    const pf = Math.min(Math.round(basic * 0.12), 3600);
    const pt = 200;
    const tds = Math.round(salary * 12 > 1000000 ? 5000 : 2000);
    const deductions = pf + pt + tds;
    const net = gross - deductions;

    const emp = db.prepare('SELECT bank_account, bank_verified FROM employees WHERE id = ?').get(empId) as any;
    const isMissingBank = !emp?.bank_account || !emp.bank_verified;

    totalGross += gross;
    totalDeductions += deductions;
    totalNet += net;

    insertPayroll.run(
      `EP-${empId}-${newId}`,
      newId,
      empId,
      contract?.id || 'CTR-TEMP',
      basic,
      hra,
      transport,
      special,
      gross,
      pf,
      pt,
      tds,
      deductions,
      net,
      isMissingBank ? 'Missing Bank Details' : 'Computed'
    );
  }

  db.prepare(`
    INSERT INTO pay_runs (
      id, period, start_date, end_date, pay_date,
      salary_structure_id, status, total_employees, total_gross,
      total_deductions, total_net
    ) VALUES (?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?)
  `).run(
    newId,
    period,
    startDate,
    endDate,
    payDate,
    salaryStructureId || 'struct-reg-01',
    employeeIds.length,
    totalGross,
    totalDeductions,
    totalNet
  );

  return res.status(201).json({ id: newId });
});

// POST compute
router.post('/:id/compute', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const payrolls = db.prepare('SELECT * FROM employee_payrolls WHERE pay_run_id = ?').all(id) as any[];

  let newTotalGross = 0;
  let newTotalDeductions = 0;
  let newTotalNet = 0;

  for (const p of payrolls) {
    const contract = db.prepare("SELECT * FROM contracts WHERE employee_id = ? AND status = 'Active' LIMIT 1").get(p.employee_id) as any;
    const monthlySalary = contract ? contract.monthly_salary : 40000;
    const basic = Math.round(monthlySalary * 0.5);
    const hra = Math.round(monthlySalary * 0.25);
    const transport = 3200;
    const special = Math.max(0, monthlySalary - (basic + hra + transport));
    const gross = monthlySalary + p.overtime;

    const pf = Math.min(Math.round(basic * 0.12), 3600);
    const pt = 200;
    const annualGross = gross * 12;
    let annualTax = 0;
    if (annualGross > 1500000) {
      annualTax = (annualGross - 1500000) * 0.3 + 150000;
    } else if (annualGross > 1000000) {
      annualTax = (annualGross - 1000000) * 0.2 + 50000;
    } else if (annualGross > 700000) {
      annualTax = (annualGross - 700000) * 0.1;
    }
    const monthlyTds = Math.round(annualTax / 12);

    const balance = db.prepare('SELECT unpaid_lwp_days FROM leave_balances WHERE employee_id = ?').get(p.employee_id) as any;
    const lwpDays = balance ? balance.unpaid_lwp_days : p.lwp_days;
    const lwpDeduction = Math.round((gross / 22) * lwpDays);
    const totalDeds = pf + pt + monthlyTds + lwpDeduction;
    const net = gross - totalDeds;

    const emp = db.prepare('SELECT bank_account, bank_verified FROM employees WHERE id = ?').get(p.employee_id) as any;
    const isMissingBank = !emp?.bank_account || !emp.bank_verified;

    db.prepare(`
      UPDATE employee_payrolls
      SET basic = ?, hra = ?, transport = ?, special = ?, gross = ?,
          pf = ?, pt = ?, tds = ?, lwp_days = ?, lwp_deduction = ?,
          total_deductions = ?, net_pay = ?, status = ?
      WHERE id = ?
    `).run(
      basic, hra, transport, special, gross,
      pf, pt, monthlyTds, lwpDays, lwpDeduction,
      totalDeds, net, isMissingBank ? 'Missing Bank Details' : 'Computed',
      p.id
    );

    newTotalGross += gross;
    newTotalDeductions += totalDeds;
    newTotalNet += net;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE pay_runs
    SET status = 'Computed', total_gross = ?, total_deductions = ?, total_net = ?, last_calculated_at = ?
    WHERE id = ?
  `).run(newTotalGross, newTotalDeductions, newTotalNet, now, id);

  return res.json({ success: true, id, status: 'Computed' });
});

// POST validate
router.post('/:id/validate', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE pay_runs
    SET status = 'Validated', validated_at = ?
    WHERE id = ?
  `).run(now, id);

  return res.json({ success: true, id, status: 'Validated' });
});

// POST mark paid
router.post('/:id/pay', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE pay_runs
    SET status = 'Paid', paid_at = ?
    WHERE id = ?
  `).run(now, id);

  db.prepare(`
    UPDATE employee_payrolls
    SET status = 'Paid'
    WHERE pay_run_id = ?
  `).run(id);

  return res.json({ success: true, id, status: 'Paid' });
});

export default router;
