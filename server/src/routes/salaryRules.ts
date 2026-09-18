import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all structures and rules
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  const structures = db.prepare('SELECT * FROM salary_structures').all() as any[];
  const rules = db.prepare('SELECT * FROM salary_rules ORDER BY sequence ASC').all() as any[];

  const result = structures.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description,
    rules: rules
      .filter((r) => r.structure_id === s.id)
      .map((r) => ({
        id: r.id,
        sequence: r.sequence,
        code: r.code,
        name: r.name,
        category: r.category,
        calcType: r.calc_type,
        expression: r.expression,
        status: r.status,
        description: r.description,
      })),
  }));

  return res.json(result);
});

// PATCH rule expression
router.patch('/rule/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { expression } = req.body;

  db.prepare('UPDATE salary_rules SET expression = ? WHERE id = ?').run(expression, id);

  return res.json({ success: true, id, expression });
});

export default router;
