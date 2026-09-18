import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all time off requests & balances
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const requestRows = db.prepare('SELECT * FROM time_off_requests ORDER BY applied_on DESC').all() as any[];
  const balanceRows = db.prepare('SELECT * FROM leave_balances').all() as any[];

  const requests = requestRows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.days,
    reason: r.reason,
    status: r.status,
    approver: r.approver,
    appliedOn: r.applied_on,
  }));

  const balances: Record<string, any> = {};
  for (const b of balanceRows) {
    balances[b.employee_id] = {
      casual: { total: b.casual_total, used: b.casual_used },
      sick: { total: b.sick_total, used: b.sick_used },
      earned: { total: b.earned_total, used: b.earned_used },
      unpaidLwpDays: b.unpaid_lwp_days,
    };
  }

  return res.json({ requests, balances });
});

// POST submit leave request
router.post('/request', authMiddleware, (req: AuthRequest, res: Response) => {
  const { employeeId, leaveType, startDate, endDate, days, reason, approver } = req.body;
  const id = `LEAVE-REQ-${Date.now().toString().slice(-4)}`;

  db.prepare(`
    INSERT INTO time_off_requests (
      id, employee_id, leave_type, start_date, end_date,
      days, reason, status, approver, applied_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, '2026-09-15')
  `).run(id, employeeId, leaveType, startDate, endDate, days, reason || '', approver || 'Management');

  return res.status(201).json({
    id,
    employeeId,
    leaveType,
    startDate,
    endDate,
    days,
    status: 'Pending',
  });
});

// PATCH approve/refuse status
router.patch('/:id/status', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved' | 'Refused'

  const request = db.prepare('SELECT * FROM time_off_requests WHERE id = ?').get(id) as any;
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  db.prepare('UPDATE time_off_requests SET status = ? WHERE id = ?').run(status, id);

  if (status === 'Approved') {
    const empId = request.employee_id;
    const days = request.days;

    if (request.leave_type === 'Casual Leave') {
      db.prepare('UPDATE leave_balances SET casual_used = casual_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Sick Leave') {
      db.prepare('UPDATE leave_balances SET sick_used = sick_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Earned Leave') {
      db.prepare('UPDATE leave_balances SET earned_used = earned_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Unpaid Leave (LWP)') {
      db.prepare('UPDATE leave_balances SET unpaid_lwp_days = unpaid_lwp_days + ? WHERE employee_id = ?').run(days, empId);

      // Recalculate in active Draft pay run
      const draftRun = db.prepare("SELECT id FROM pay_runs WHERE status IN ('Draft', 'Computed') ORDER BY start_date DESC LIMIT 1").get() as any;
      if (draftRun) {
        const payroll = db.prepare('SELECT * FROM employee_payrolls WHERE pay_run_id = ? AND employee_id = ?').get(draftRun.id, empId) as any;
        if (payroll) {
          const newLwp = payroll.lwp_days + days;
          const newWorked = Math.max(0, payroll.total_working_days - newLwp);
          const lwpDeduction = Math.round((payroll.gross / payroll.total_working_days) * newLwp);
          const totalDeductions = payroll.pf + payroll.pt + payroll.tds + lwpDeduction;
          const netPay = payroll.gross - totalDeductions;

          db.prepare(`
            UPDATE employee_payrolls
            SET lwp_days = ?, worked_days = ?, lwp_deduction = ?, total_deductions = ?, net_pay = ?
            WHERE id = ?
          `).run(newLwp, newWorked, lwpDeduction, totalDeductions, netPay, payroll.id);

          // Update pay run totals
          const totals = db.prepare(`
            SELECT SUM(net_pay) as total_net, SUM(total_deductions) as total_deductions
            FROM employee_payrolls WHERE pay_run_id = ?
          `).get(draftRun.id) as any;

          db.prepare(`
            UPDATE pay_runs
            SET total_net = ?, total_deductions = ?
            WHERE id = ?
          `).run(totals.total_net, totals.total_deductions, draftRun.id);
        }
      }
    }
  }

  return res.json({ success: true, id, status });
});

export default router;
