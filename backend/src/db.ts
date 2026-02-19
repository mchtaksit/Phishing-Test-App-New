import { pool } from './database.js';

// ============================================
// TYPES
// ============================================

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused';

// Database row types
interface CampaignRow {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  target_count: number;
  created_at: Date;
  updated_at: Date;
}

interface EventRow {
  id: string;
  campaign_id: string;
  type: string;
  recipient_token: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  targetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignEvent {
  id: string;
  type: string;
  campaignId: string;
  recipientToken: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CampaignStats {
  totalTargets: number;
  emailsSent: number;
  clicked: number;
  submitted: number;
  clickRate: number;
  submitRate: number;
}

// ============================================
// CAMPAIGN FUNCTIONS
// ============================================

export async function getCampaigns(): Promise<Campaign[]> {
  const result = await pool.query(
    `SELECT id, name, description, status, target_count, created_at, updated_at
     FROM campaigns
     ORDER BY created_at DESC`
  );

  return result.rows.map((row: CampaignRow) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const result = await pool.query(
    `SELECT id, name, description, status, target_count, created_at, updated_at
     FROM campaigns
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCampaign(data: {
  name: string;
  description: string;
  targetCount: number;
}): Promise<Campaign> {
  const result = await pool.query(
    `INSERT INTO campaigns (name, description, target_count)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [data.name, data.description, data.targetCount]
  );

  const row = result.rows[0];
  console.log(`Campaign created: ${row.name}`);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function startCampaign(id: string): Promise<Campaign | null> {
  const result = await pool.query(
    `UPDATE campaigns
     SET status = 'active'
     WHERE id = $1 AND status = 'draft'
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  console.log(`Campaign started: ${row.name}`);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<Campaign | null> {
  const result = await pool.query(
    `UPDATE campaigns
     SET status = $2
     WHERE id = $1
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id, status]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM campaigns WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// EVENT FUNCTIONS
// ============================================

export async function getEventsByCampaign(campaignId: string): Promise<CampaignEvent[]> {
  const result = await pool.query(
    `SELECT id, campaign_id, type, recipient_token, ip_address, user_agent, created_at
     FROM events
     WHERE campaign_id = $1
     ORDER BY created_at DESC`,
    [campaignId]
  );

  return result.rows.map((row: EventRow) => ({
    id: row.id,
    campaignId: row.campaign_id,
    type: row.type,
    recipientToken: row.recipient_token,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function insertEvent(
  type: string,
  campaignId: string,
  recipientToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await pool.query(
    `INSERT INTO events (campaign_id, type, recipient_token, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [campaignId, type, recipientToken, ipAddress || null, userAgent || null]
  );
  console.log(`Event recorded: ${type} - Campaign: ${campaignId}`);
}

// ============================================
// STATS FUNCTIONS
// ============================================

export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const campaign = await getCampaign(campaignId);

  const clickedResult = await pool.query(
    `SELECT COUNT(DISTINCT recipient_token) as count
     FROM events
     WHERE campaign_id = $1 AND type = 'clicked'`,
    [campaignId]
  );

  const submittedResult = await pool.query(
    `SELECT COUNT(DISTINCT recipient_token) as count
     FROM events
     WHERE campaign_id = $1 AND type = 'submitted'`,
    [campaignId]
  );

  const clicked = parseInt(clickedResult.rows[0].count, 10);
  const submitted = parseInt(submittedResult.rows[0].count, 10);
  const totalTargets = campaign?.targetCount || 0;

  return {
    totalTargets,
    emailsSent: totalTargets,
    clicked,
    submitted,
    clickRate: totalTargets > 0 ? (clicked / totalTargets) * 100 : 0,
    submitRate: totalTargets > 0 ? (submitted / totalTargets) * 100 : 0,
  };
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const campaignsResult = await pool.query(
    'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM campaigns',
    ['active']
  );

  const eventsResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE type = 'clicked') as clicked,
       COUNT(*) FILTER (WHERE type = 'submitted') as submitted
     FROM events`
  );

  return {
    totalCampaigns: parseInt(campaignsResult.rows[0].total, 10),
    activeCampaigns: parseInt(campaignsResult.rows[0].active, 10),
    totalClicks: parseInt(eventsResult.rows[0].clicked, 10),
    totalSubmissions: parseInt(eventsResult.rows[0].submitted, 10),
  };
}
