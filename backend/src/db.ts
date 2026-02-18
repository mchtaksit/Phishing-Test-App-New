// In-memory storage (PostgreSQL entegrasyonu sonra eklenecek)

export type CampaignStatus = 'draft' | 'active' | 'completed';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  targetCount: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Event {
  id: number;
  type: string;
  campaignId: string;
  recipientToken: string;
  createdAt: Date;
}

const campaigns: Campaign[] = [];
const events: Event[] = [];
let eventNextId = 1;
let campaignNextId = 1;

// Campaign functions
export function getCampaigns(): Campaign[] {
  return [...campaigns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find(c => c.id === id);
}

export function createCampaign(data: { name: string; description: string; targetCount: number }): Campaign {
  const campaign: Campaign = {
    id: `campaign-${campaignNextId++}`,
    name: data.name,
    description: data.description,
    status: 'draft',
    targetCount: data.targetCount,
    createdAt: new Date(),
  };
  campaigns.push(campaign);
  console.log(`Campaign created: ${campaign.name}`);
  return campaign;
}

export function startCampaign(id: string): Campaign | undefined {
  const campaign = campaigns.find(c => c.id === id);
  if (campaign && campaign.status === 'draft') {
    campaign.status = 'active';
    campaign.startedAt = new Date();
    console.log(`Campaign started: ${campaign.name}`);
  }
  return campaign;
}

// Event functions
export function getEventsByCampaign(campaignId: string): Event[] {
  return events
    .filter(e => e.campaignId === campaignId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function insertEvent(
  type: string,
  campaignId: string,
  recipientToken: string
): void {
  events.push({
    id: eventNextId++,
    type,
    campaignId,
    recipientToken,
    createdAt: new Date(),
  });
  console.log(`Event recorded: ${type} - Campaign: ${campaignId}`);
}

export function getCampaignStats(campaignId: string) {
  const campaign = getCampaign(campaignId);
  const campaignEvents = getEventsByCampaign(campaignId);

  const clicked = campaignEvents.filter(e => e.type === 'clicked').length;
  const submitted = campaignEvents.filter(e => e.type === 'submitted').length;
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
