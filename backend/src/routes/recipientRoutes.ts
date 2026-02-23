import { Router, Request, Response, NextFunction } from 'express';
import {
  getRecipientsByCampaign,
  createRecipient,
  createRecipientsBulk,
  updateRecipientStatus,
  deleteRecipient,
  getRecipientByToken,
} from '../services/index.js';
import type { RecipientStatus } from '../types/index.js';

const router = Router();

// ============================================
// VALIDATION
// ============================================

interface CreateRecipientBody {
  email: string;
  firstName: string;
  lastName: string;
}

function isValidRecipientBody(body: unknown): body is CreateRecipientBody {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.email === 'string' &&
    obj.email.includes('@') &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string'
  );
}

interface BulkRecipientsBody {
  recipients: CreateRecipientBody[];
}

// ============================================
// CAMPAIGN RECIPIENT ROUTES
// ============================================

// Get recipients for campaign
router.get('/campaigns/:id/recipients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipients = await getRecipientsByCampaign(req.params.id);
    res.json(recipients);
  } catch (err) {
    next(err);
  }
});

// Add single recipient to campaign
router.post('/campaigns/:id/recipients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidRecipientBody(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const recipient = await createRecipient({
      campaignId: req.params.id,
      email: req.body.email.trim(),
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
    });

    res.status(201).json(recipient);
  } catch (err) {
    next(err);
  }
});

// Bulk add recipients
router.post('/campaigns/:id/recipients/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as BulkRecipientsBody;
    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const validRecipients = body.recipients.filter(isValidRecipientBody).map((r) => ({
      email: r.email.trim(),
      firstName: r.firstName.trim(),
      lastName: r.lastName.trim(),
    }));

    if (validRecipients.length === 0) {
      res.status(400).json({ error: 'No valid recipients provided' });
      return;
    }

    const count = await createRecipientsBulk(req.params.id, validRecipients);
    res.status(201).json({ success: true, count });
  } catch (err) {
    next(err);
  }
});

// ============================================
// STANDALONE RECIPIENT ROUTES
// ============================================

// Delete recipient
router.delete('/recipients/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteRecipient(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get recipient by token
router.get('/recipients/token/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipient = await getRecipientByToken(req.params.token);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }
    res.json(recipient);
  } catch (err) {
    next(err);
  }
});

// Update recipient status
router.patch('/recipients/token/:token/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    const validStatuses: RecipientStatus[] = ['pending', 'sent', 'clicked', 'submitted', 'failed'];
    if (!validStatuses.includes(status as RecipientStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const recipient = await updateRecipientStatus(req.params.token, status as RecipientStatus);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }
    res.json(recipient);
  } catch (err) {
    next(err);
  }
});

export default router;
