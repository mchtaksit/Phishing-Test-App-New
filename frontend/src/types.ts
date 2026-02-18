export type CampaignStatus = 'draft' | 'active' | 'completed';
export type EventType = 'clicked' | 'submitted';
export type Frequency = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type SendingMode = 'all' | 'spread';
export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  targetCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignEvent {
  id: number;
  type: EventType;
  campaignId: string;
  recipientToken: string;
  createdAt: string;
}

export interface CampaignStats {
  totalTargets: number;
  emailsSent: number;
  clicked: number;
  submitted: number;
  clickRate: number;
  submitRate: number;
}

export interface CampaignDetail extends Campaign {
  stats: CampaignStats;
  events: CampaignEvent[];
}

export interface UserGroup {
  id: string;
  name: string;
  memberCount: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
}

export interface LandingPage {
  id: string;
  name: string;
}

export interface CampaignFormData {
  name: string;
  targetGroupId: string;
  frequency: Frequency;
  startDate: string;
  startTime: string;
  timezone: string;
  sendingMode: SendingMode;
  spreadDays: number;
  spreadUnit: 'hours' | 'days';
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: string[];
  trackActivityDays: number;
  category: string;
  templateMode: 'random' | 'specific';
  templateId: string;
  difficultyRating: DifficultyRating | null;
  phishDomain: string;
  landingPageId: string;
  addClickersToGroup: string;
  sendReportEmail: boolean;
}
