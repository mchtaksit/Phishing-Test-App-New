import { Router, Request, Response, NextFunction } from 'express';
import {
  testLdapConnection,
  getLdapUsersPreview,
  syncLdapUsersToCampaign,
} from '../services/index.js';

const router = Router();

// ============================================
// ROUTES
// ============================================

// Test LDAP connection
router.get('/test', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const connected = await testLdapConnection();
    res.json({
      success: connected,
      message: connected ? 'LDAP connection successful' : 'LDAP connection failed',
    });
  } catch (err) {
    next(err);
  }
});

// Preview LDAP users (without syncing)
router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getLdapUsersPreview();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Sync LDAP users to a campaign
router.post('/sync/:campaignId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      res.status(400).json({ error: 'Campaign ID is required' });
      return;
    }

    const result = await syncLdapUsersToCampaign(campaignId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
