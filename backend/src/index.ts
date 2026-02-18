import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import {
  insertEvent,
  getCampaigns,
  getCampaign,
  createCampaign,
  startCampaign,
  getEventsByCampaign,
  getCampaignStats,
} from './db.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// ============ CAMPAIGNS ============

// List all campaigns
app.get('/campaigns', (_req: Request, res: Response) => {
  const campaigns = getCampaigns();
  res.json(campaigns);
});

// Get single campaign with stats and events
app.get('/campaigns/:id', (req: Request, res: Response) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  const stats = getCampaignStats(campaign.id);
  const events = getEventsByCampaign(campaign.id);

  res.json({ ...campaign, stats, events });
});

// Create new campaign
interface CreateCampaignBody {
  name: string;
  description?: string;
  targetCount?: number;
}

function isValidCreateCampaign(body: unknown): body is CreateCampaignBody {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    obj.name.length <= 255
  );
}

app.post('/campaigns', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidCreateCampaign(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const campaign = createCampaign({
      name: req.body.name.trim(),
      description: (req.body.description || '').trim(),
      targetCount: req.body.targetCount || 10,
    });

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

// Start campaign
app.post('/campaigns/:id/start', (req: Request, res: Response) => {
  const campaign = startCampaign(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(campaign);
});

// ============ EVENTS ============

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

app.post('/events', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidEventBody(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const { type, campaignId, recipientToken } = req.body;
    insertEvent(type, campaignId, recipientToken);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ============ ERROR HANDLER ============

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: config.isProduction ? 'Internal server error' : err.message,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
