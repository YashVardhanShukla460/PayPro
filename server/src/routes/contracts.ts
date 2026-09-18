import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all contracts
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM contracts ORDER BY year DESC').all() as any[];

  const contracts = rows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    jobTitle: r.job_title,
    monthlySalary: r.monthly_salary,
    annualCtc: r.annual_ctc,
    salaryStructureId: r.salary_structure_id,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    year: r.year,
    documentRef: r.document_ref,
  }));

  return res.json(contracts);
});

// POST renew contract
router.post('/renew', authMiddleware, (req: AuthRequest, res: Response) => {
  const { employeeId, monthlySalary, startDate, endDate } = req.body;
  const year = new Date(startDate).getFullYear();

  // Expire previous active contract
  db.prepare(`
    UPDATE contracts
    SET status = 'Expired'
    WHERE employee_id = ? AND status = 'Active'
  `).run(employeeId);

  const emp = db.prepare('SELECT job_title FROM employees WHERE id = ?').get(employeeId) as any;
  const newContractId = `CTR-${employeeId}-${year}`;

  db.prepare(`
    INSERT INTO contracts (
      id, employee_id, job_title, monthly_salary, annual_ctc,
      salary_structure_id, start_date, end_date, status, year
    ) VALUES (?, ?, ?, ?, ?, 'struct-reg-01', ?, ?, 'Active', ?)
  `).run(
    newContractId,
    employeeId,
    emp?.job_title || 'Staff',
    monthlySalary,
    monthlySalary * 12,
    startDate,
    endDate,
    year
  );

  db.prepare(`
    UPDATE employees
    SET active_contract_id = ?
    WHERE id = ?
  `).run(newContractId, employeeId);

  return res.json({
    id: newContractId,
    employeeId,
    monthlySalary,
    annualCtc: monthlySalary * 12,
    status: 'Active',
    year,
  });
});

export default router;
