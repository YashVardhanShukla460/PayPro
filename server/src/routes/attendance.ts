import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all attendance
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM attendance ORDER BY date DESC').all() as any[];

  const attendance = rows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    checkIn: r.check_in,
    checkOut: r.check_out,
    workedHours: r.worked_hours,
    overtimeHours: r.overtime_hours,
    status: r.status,
    notes: r.notes,
  }));

  return res.json(attendance);
});

// POST check-in
router.post('/check-in', authMiddleware, (req: AuthRequest, res: Response) => {
  const { employeeId, date = '2026-09-15', status = 'Present' } = req.body;
  const existing = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(employeeId, date) as any;

  if (existing) {
    db.prepare(`
      UPDATE attendance
      SET check_in = '09:00 AM', check_out = '06:00 PM', worked_hours = 8.0, status = ?
      WHERE id = ?
    `).run(status, existing.id);
  } else {
    const id = `att-${Date.now()}`;
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, worked_hours, overtime_hours, status)
      VALUES (?, ?, ?, '09:00 AM', '06:00 PM', 8.0, 0, ?)
    `).run(id, employeeId, date, status);
  }

  return res.json({ success: true, employeeId, date });
});

// PATCH reconcile
router.patch('/:id/reconcile', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, checkIn, checkOut } = req.body;
  const worked = checkIn !== '--:--' && checkOut !== '--:--' ? 8.0 : 0;

  db.prepare(`
    UPDATE attendance
    SET status = ?, check_in = ?, check_out = ?, worked_hours = ?
    WHERE id = ?
  `).run(status, checkIn, checkOut, worked, id);

  return res.json({ success: true, id, status, workedHours: worked });
});

export default router;
