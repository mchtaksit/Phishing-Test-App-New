import { Router, Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/index.js';

const router = Router();

// ============================================
// ROUTES
// ============================================

// Get dashboard stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
