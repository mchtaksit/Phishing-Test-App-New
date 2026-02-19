import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { testConnection, closePool } from './database.js';
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
  methods: ['GET', 'POST', 'DELETE'],
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
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.json({ ok: true, database: 'connected' });
  } catch {
    res.status(503).json({ ok: false, database: 'disconnected' });
  }
});

// ============ CAMPAIGNS ============

// List all campaigns
app.get('/campaigns', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await getCampaigns();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

// Get single campaign with stats and events
app.get('/campaigns/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await getCampaign(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const [stats, events] = await Promise.all([
      getCampaignStats(campaign.id),
      getEventsByCampaign(campaign.id),
    ]);

    res.json({ ...campaign, stats, events });
  } catch (err) {
    next(err);
  }
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

app.post('/campaigns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidCreateCampaign(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const campaign = await createCampaign({
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
app.post('/campaigns/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await startCampaign(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found or already started' });
      return;
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
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

app.post('/events', async (req: Request, res: Response, next: NextFunction) => {
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

// ============ ERROR HANDLER ============

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: config.isProduction ? 'Internal server error' : err.message,
  });
});

// ============ SERVER START ============

async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Start server
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...');
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
