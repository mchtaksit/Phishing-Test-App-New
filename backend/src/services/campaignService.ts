import { config } from '../config.js';
import { getPool, memoryStore, generateId } from '../db/index.js';
import type { Campaign, CampaignStats } from '../types/index.js';

// ============================================
// GET CAMPAIGNS
// ============================================

export async function getCampaigns(): Promise<Campaign[]> {
  if (config.useMemoryDb) {
    return [...memoryStore.campaigns].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const p = await getPool();
  if (!p) return [];

  const result = await p.query(
    `SELECT id, name, description, status, target_count, created_at, updated_at
     FROM campaigns ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    targetCount: row.target_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ============================================
// GET CAMPAIGN
// ============================================

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    return memoryStore.campaigns.find((c) => c.id === id) || null;
  }

  const p = await getPool();
  if (!p) return null;

  const result = await p.query(
    `SELECT id, name, description, status, target_count, created_at, updated_at
     FROM campaigns WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

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

// ============================================
// CREATE CAMPAIGN
// ============================================

export async function createCampaign(data: {
  name: string;
  description: string;
  targetCount: number;
}): Promise<Campaign> {
  const now = new Date();

  if (config.useMemoryDb) {
    const campaign: Campaign = {
      id: generateId(),
      name: data.name,
      description: data.description,
      status: 'draft',
      targetCount: data.targetCount,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.campaigns.push(campaign);
    console.log(`Campaign created: ${campaign.name}`);
    return campaign;
  }

  const p = await getPool();
  if (!p) throw new Error('Database not available');

  const result = await p.query(
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

// ============================================
// UPDATE CAMPAIGN
// ============================================

export async function updateCampaign(
  id: string,
  data: { name?: string; description?: string; targetCount?: number }
): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (!campaign) return null;
    if (campaign.status !== 'draft') return null;

    if (data.name !== undefined) campaign.name = data.name;
    if (data.description !== undefined) campaign.description = data.description;
    if (data.targetCount !== undefined) campaign.targetCount = data.targetCount;
    campaign.updatedAt = new Date();
    console.log(`Campaign updated: ${campaign.name}`);
    return campaign;
  }

  const p = await getPool();
  if (!p) return null;

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.targetCount !== undefined) {
    updates.push(`target_count = $${paramIndex++}`);
    values.push(data.targetCount);
  }

  if (updates.length === 0) return getCampaign(id);

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await p.query(
    `UPDATE campaigns SET ${updates.join(', ')}
     WHERE id = $${paramIndex} AND status = 'draft'
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    values
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  console.log(`Campaign updated: ${row.name}`);

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

// ============================================
// DELETE CAMPAIGN
// ============================================

export async function deleteCampaign(id: string): Promise<boolean> {
  if (config.useMemoryDb) {
    const index = memoryStore.campaigns.findIndex((c) => c.id === id);
    if (index === -1) return false;

    memoryStore.events = memoryStore.events.filter((e) => e.campaignId !== id);
    memoryStore.recipients = memoryStore.recipients.filter((r) => r.campaignId !== id);
    memoryStore.campaigns.splice(index, 1);
    console.log(`Campaign deleted: ${id}`);
    return true;
  }

  const p = await getPool();
  if (!p) return false;

  await p.query('DELETE FROM events WHERE campaign_id = $1', [id]);
  await p.query('DELETE FROM recipients WHERE campaign_id = $1', [id]);

  const result = await p.query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return false;

  console.log(`Campaign deleted: ${id}`);
  return true;
}

// ============================================
// START CAMPAIGN
// ============================================

export async function startCampaign(id: string): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (campaign && campaign.status === 'draft') {
      campaign.status = 'active';
      campaign.updatedAt = new Date();
      console.log(`Campaign started: ${campaign.name}`);
      return campaign;
    }
    return null;
  }

  const p = await getPool();
  if (!p) return null;

  const result = await p.query(
    `UPDATE campaigns SET status = 'active', updated_at = NOW()
     WHERE id = $1 AND status = 'draft'
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id]
  );

  if (result.rows.length === 0) return null;

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

// ============================================
// PAUSE CAMPAIGN
// ============================================

export async function pauseCampaign(id: string): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (campaign && campaign.status === 'active') {
      campaign.status = 'paused';
      campaign.updatedAt = new Date();
      console.log(`Campaign paused: ${campaign.name}`);
      return campaign;
    }
    return null;
  }

  const p = await getPool();
  if (!p) return null;

  const result = await p.query(
    `UPDATE campaigns SET status = 'paused', updated_at = NOW()
     WHERE id = $1 AND status = 'active'
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  console.log(`Campaign paused: ${row.name}`);

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

// ============================================
// RESUME CAMPAIGN
// ============================================

export async function resumeCampaign(id: string): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (campaign && campaign.status === 'paused') {
      campaign.status = 'active';
      campaign.updatedAt = new Date();
      console.log(`Campaign resumed: ${campaign.name}`);
      return campaign;
    }
    return null;
  }

  const p = await getPool();
  if (!p) return null;

  const result = await p.query(
    `UPDATE campaigns SET status = 'active', updated_at = NOW()
     WHERE id = $1 AND status = 'paused'
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  console.log(`Campaign resumed: ${row.name}`);

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

// ============================================
// COMPLETE CAMPAIGN
// ============================================

export async function completeCampaign(id: string): Promise<Campaign | null> {
  if (config.useMemoryDb) {
    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (campaign && (campaign.status === 'active' || campaign.status === 'paused')) {
      campaign.status = 'completed';
      campaign.updatedAt = new Date();
      console.log(`Campaign completed: ${campaign.name}`);
      return campaign;
    }
    return null;
  }

  const p = await getPool();
  if (!p) return null;

  const result = await p.query(
    `UPDATE campaigns SET status = 'completed', updated_at = NOW()
     WHERE id = $1 AND status IN ('active', 'paused')
     RETURNING id, name, description, status, target_count, created_at, updated_at`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  console.log(`Campaign completed: ${row.name}`);

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

// ============================================
// GET CAMPAIGN STATS
// ============================================

export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const campaign = await getCampaign(campaignId);
  const totalTargets = campaign?.targetCount || 0;

  if (config.useMemoryDb) {
    const events = memoryStore.events.filter((e) => e.campaignId === campaignId);
    const clickedTokens = new Set(events.filter((e) => e.type === 'clicked').map((e) => e.recipientToken));
    const submittedTokens = new Set(events.filter((e) => e.type === 'submitted').map((e) => e.recipientToken));

    const clicked = clickedTokens.size;
    const submitted = submittedTokens.size;

    return {
      totalTargets,
      emailsSent: totalTargets,
      clicked,
      submitted,
      clickRate: totalTargets > 0 ? (clicked / totalTargets) * 100 : 0,
      submitRate: totalTargets > 0 ? (submitted / totalTargets) * 100 : 0,
    };
  }

  const p = await getPool();
  if (!p) {
    return { totalTargets, emailsSent: 0, clicked: 0, submitted: 0, clickRate: 0, submitRate: 0 };
  }

  const clickedResult = await p.query(
    `SELECT COUNT(DISTINCT recipient_token) as count FROM events
     WHERE campaign_id = $1 AND type = 'clicked'`,
    [campaignId]
  );

  const submittedResult = await p.query(
    `SELECT COUNT(DISTINCT recipient_token) as count FROM events
     WHERE campaign_id = $1 AND type = 'submitted'`,
    [campaignId]
  );

  const clicked = parseInt(clickedResult.rows[0].count, 10);
  const submitted = parseInt(submittedResult.rows[0].count, 10);

  return {
    totalTargets,
    emailsSent: totalTargets,
    clicked,
    submitted,
    clickRate: totalTargets > 0 ? (clicked / totalTargets) * 100 : 0,
    submitRate: totalTargets > 0 ? (submitted / totalTargets) * 100 : 0,
  };
}
