import { config } from '../config.js';
import { getPool, memoryStore } from '../db/index.js';
import type { DashboardStats } from '../types/index.js';

// ============================================
// GET DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  if (config.useMemoryDb) {
    const campaigns = memoryStore.campaigns;
    const recipients = memoryStore.recipients;
    const events = memoryStore.events;

    const sentRecipients = recipients.filter((r) => r.status !== 'pending').length;
    const clickedTokens = new Set(events.filter((e) => e.type === 'clicked').map((e) => e.recipientToken));
    const submittedTokens = new Set(events.filter((e) => e.type === 'submitted').map((e) => e.recipientToken));

    const totalRecipients = recipients.length;
    const totalEmailsSent = sentRecipients;
    const totalClicks = clickedTokens.size;
    const totalSubmissions = submittedTokens.size;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      completedCampaigns: campaigns.filter((c) => c.status === 'completed').length,
      draftCampaigns: campaigns.filter((c) => c.status === 'draft').length,
      pausedCampaigns: campaigns.filter((c) => c.status === 'paused').length,
      totalRecipients,
      totalEmailsSent,
      totalClicks,
      totalSubmissions,
      overallClickRate: totalEmailsSent > 0 ? (totalClicks / totalEmailsSent) * 100 : 0,
      overallSubmitRate: totalEmailsSent > 0 ? (totalSubmissions / totalEmailsSent) * 100 : 0,
    };
  }

  const p = await getPool();
  if (!p) {
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      draftCampaigns: 0,
      pausedCampaigns: 0,
      totalRecipients: 0,
      totalEmailsSent: 0,
      totalClicks: 0,
      totalSubmissions: 0,
      overallClickRate: 0,
      overallSubmitRate: 0,
    };
  }

  const [campaignStats, recipientStats, clickStats, submitStats] = await Promise.all([
    p.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'paused') as paused
      FROM campaigns
    `),
    p.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status != 'pending') as sent
      FROM recipients
    `),
    p.query(`SELECT COUNT(DISTINCT recipient_token) as count FROM events WHERE type = 'clicked'`),
    p.query(`SELECT COUNT(DISTINCT recipient_token) as count FROM events WHERE type = 'submitted'`),
  ]);

  const c = campaignStats.rows[0];
  const r = recipientStats.rows[0];
  const totalEmailsSent = parseInt(r.sent, 10);
  const totalClicks = parseInt(clickStats.rows[0].count, 10);
  const totalSubmissions = parseInt(submitStats.rows[0].count, 10);

  return {
    totalCampaigns: parseInt(c.total, 10),
    activeCampaigns: parseInt(c.active, 10),
    completedCampaigns: parseInt(c.completed, 10),
    draftCampaigns: parseInt(c.draft, 10),
    pausedCampaigns: parseInt(c.paused, 10),
    totalRecipients: parseInt(r.total, 10),
    totalEmailsSent,
    totalClicks,
    totalSubmissions,
    overallClickRate: totalEmailsSent > 0 ? (totalClicks / totalEmailsSent) * 100 : 0,
    overallSubmitRate: totalEmailsSent > 0 ? (totalSubmissions / totalEmailsSent) * 100 : 0,
  };
}
