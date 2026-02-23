import { Router, Request, Response, NextFunction } from 'express';
import {
  getLandingPages,
  getLandingPage,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
} from '../services/index.js';

const router = Router();

// ============================================
// VALIDATION
// ============================================

interface CreateLandingPageBody {
  name: string;
  html: string;
  isDefault?: boolean;
}

function isValidLandingPageBody(body: unknown): body is CreateLandingPageBody {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    typeof obj.html === 'string'
  );
}

// ============================================
// ROUTES
// ============================================

// List all landing pages
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await getLandingPages();
    res.json(pages);
  } catch (err) {
    next(err);
  }
});

// Get single landing page
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await getLandingPage(req.params.id);
    if (!page) {
      res.status(404).json({ error: 'Landing page not found' });
      return;
    }
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// Create landing page
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidLandingPageBody(req.body)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const page = await createLandingPage({
      name: req.body.name.trim(),
      html: req.body.html,
      isDefault: req.body.isDefault,
    });

    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
});

// Update landing page
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Partial<CreateLandingPageBody>;
    const page = await updateLandingPage(req.params.id, {
      name: body.name?.trim(),
      html: body.html,
      isDefault: body.isDefault,
    });
    if (!page) {
      res.status(404).json({ error: 'Landing page not found' });
      return;
    }
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// Delete landing page
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteLandingPage(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Landing page not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
