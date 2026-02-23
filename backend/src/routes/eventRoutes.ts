import { Router, Request, Response, NextFunction } from 'express';
import { insertEvent } from '../services/index.js';

const router = Router();

// ============================================
// VALIDATION
// ============================================

const validEventTypes = ['clicked', 'submitted'] as const;
type EventType = typeof validEventTypes[number];

interface EventBody {
  type: EventType;
  campaignId: string;
  recipientToken: string;
}

function isValidEventBody(body: unknown): body is EventBody {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.type === 'string' &&
    validEventTypes.includes(obj.type as EventType) &&
    typeof obj.campaignId === 'string' &&
    obj.campaignId.length > 0 &&
    obj.campaignId.length <= 255 &&
    typeof obj.recipientToken === 'string' &&
    obj.recipientToken.length > 0 &&
    obj.recipientToken.length <= 255
  );
}

// ============================================
// ROUTES
// ============================================

// Track event
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidEventBody(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const { type, campaignId, recipientToken } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    await insertEvent(type, campaignId, recipientToken, ipAddress, userAgent);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
