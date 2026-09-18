import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all employees
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY id ASC').all() as any[];

  const employees = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    avatarInitials: r.avatar_initials,
    jobTitle: r.job_title,
    department: r.department,
    employmentStatus: r.employment_status,
    employmentType: r.employment_type,
    joinedDate: r.joined_date,
    manager: r.manager,
    panNumber: r.pan_number,
    pfNumber: r.pf_number,
    uan: r.uan,
    activeContractId: r.active_contract_id,
    taxRegime: r.tax_regime,
    location: r.location,
    bankDetails: {
      accountNumber: r.bank_account || '',
      ifscCode: r.bank_ifsc || '',
      bankName: r.bank_name || '',
      isVerified: Boolean(r.bank_verified),
    },
  }));

  return res.json(employees);
});

// POST add employee
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const {
    name,
    email,
    phone,
    avatarInitials,
    jobTitle,
    department,
    employmentType,
    joinedDate,
    manager,
    bankDetails,
  } = req.body;

  const countRow = db.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number };
  const id = `EMP-${1000 + countRow.count + 1}`;

  db.prepare(`
    INSERT INTO employees (
      id, name, email, phone, avatar_initials, job_title, department,
      employment_status, employment_type, joined_date, manager,
      pan_number, pf_number, uan, active_contract_id, tax_regime,
      location, bank_account, bank_ifsc, bank_name, bank_verified
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      'Active', ?, ?, ?,
      'ABCDE1234F', 'KN/BLR/0048912/000/9999', '100948129999', 'CTR-TEMP', 'New',
      'Bengaluru (HQ)', ?, ?, ?, ?
    )
  `).run(
    id,
    name,
    email,
    phone || '',
    avatarInitials || name.slice(0, 2).toUpperCase(),
    jobTitle,
    department,
    employmentType || 'Full-Time',
    joinedDate || '2026-09-01',
    manager || 'Sunita Rao (VP of People)',
    bankDetails?.accountNumber || '',
    bankDetails?.ifscCode || '',
    bankDetails?.bankName || (bankDetails?.accountNumber ? 'HDFC Bank' : ''),
    bankDetails?.accountNumber ? 1 : 0
  );

  // Initialize leave balance in SQLite
  db.prepare(`
    INSERT INTO leave_balances (
      employee_id, casual_total, casual_used, sick_total, sick_used,
      earned_total, earned_used, unpaid_lwp_days
    ) VALUES (?, 12, 0, 10, 0, 18, 0, 0)
  `).run(id);

  const newEmp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  return res.status(201).json({
    id: newEmp.id,
    name: newEmp.name,
    email: newEmp.email,
    phone: newEmp.phone,
    avatarInitials: newEmp.avatar_initials,
    jobTitle: newEmp.job_title,
    department: newEmp.department,
    employmentStatus: newEmp.employment_status,
    employmentType: newEmp.employment_type,
    joinedDate: newEmp.joined_date,
    manager: newEmp.manager,
    panNumber: newEmp.pan_number,
    pfNumber: newEmp.pf_number,
    uan: newEmp.uan,
    activeContractId: newEmp.active_contract_id,
    taxRegime: newEmp.tax_regime,
    location: newEmp.location,
    bankDetails: {
      accountNumber: newEmp.bank_account,
      ifscCode: newEmp.bank_ifsc,
      bankName: newEmp.bank_name,
      isVerified: Boolean(newEmp.bank_verified),
    },
  });
});

// PATCH update bank details
router.patch('/:id/bank', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { accountNumber, ifscCode, bankName } = req.body;

  db.prepare(`
    UPDATE employees
    SET bank_account = ?, bank_ifsc = ?, bank_name = ?, bank_verified = 1
    WHERE id = ?
  `).run(accountNumber, ifscCode, bankName || 'HDFC Bank', id);

  // Update in active pay runs
  db.prepare(`
    UPDATE employee_payrolls
    SET status = 'Ready'
    WHERE employee_id = ? AND status = 'Missing Bank Details'
  `).run(id);

  return res.json({ success: true, employeeId: id, isVerified: true });
});

export default router;
