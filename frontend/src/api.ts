import type {
  Campaign,
  CampaignDetail,
  EventType,
  Recipient,
  EmailTemplate,
  LandingPage,
  DashboardStats,
  LdapUser,
  LdapSyncResult,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health check
  healthCheck: () => request<{ ok: boolean; database: string }>('/health'),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Campaigns
  getCampaigns: () => request<Campaign[]>('/campaigns'),

  getCampaign: (id: string) => request<CampaignDetail>(`/campaigns/${id}`),

  createCampaign: (data: { name: string; description: string; targetCount: number }) =>
    request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaign: (id: string, data: { name?: string; description?: string; targetCount?: number }) =>
    request<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCampaign: (id: string) =>
    request<{ success: boolean }>(`/campaigns/${id}`, { method: 'DELETE' }),

  startCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/start`, { method: 'POST' }),

  pauseCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/pause`, { method: 'POST' }),

  resumeCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/resume`, { method: 'POST' }),

  completeCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/complete`, { method: 'POST' }),

  // Recipients
  getRecipients: (campaignId: string) =>
    request<Recipient[]>(`/campaigns/${campaignId}/recipients`),

  addRecipient: (campaignId: string, data: { email: string; firstName: string; lastName: string }) =>
    request<Recipient>(`/campaigns/${campaignId}/recipients`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addRecipientsBulk: (campaignId: string, recipients: Array<{ email: string; firstName: string; lastName: string }>) =>
    request<{ success: boolean; count: number }>(`/campaigns/${campaignId}/recipients/bulk`, {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    }),

  deleteRecipient: (id: string) =>
    request<{ success: boolean }>(`/recipients/${id}`, { method: 'DELETE' }),

  // Email Templates
  getTemplates: () => request<EmailTemplate[]>('/templates'),

  getTemplate: (id: string) => request<EmailTemplate>(`/templates/${id}`),

  createTemplate: (data: { name: string; subject: string; body: string; isDefault?: boolean }) =>
    request<EmailTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (id: string, data: { name?: string; subject?: string; body?: string; isDefault?: boolean }) =>
    request<EmailTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTemplate: (id: string) =>
    request<{ success: boolean }>(`/templates/${id}`, { method: 'DELETE' }),

  // Landing Pages
  getLandingPages: () => request<LandingPage[]>('/landing-pages'),

  getLandingPage: (id: string) => request<LandingPage>(`/landing-pages/${id}`),

  createLandingPage: (data: { name: string; html: string; isDefault?: boolean }) =>
    request<LandingPage>('/landing-pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLandingPage: (id: string, data: { name?: string; html?: string; isDefault?: boolean }) =>
    request<LandingPage>(`/landing-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLandingPage: (id: string) =>
    request<{ success: boolean }>(`/landing-pages/${id}`, { method: 'DELETE' }),

  // Events
  trackEvent: (data: { type: EventType; campaignId: string; recipientToken: string }) =>
    request<{ success: boolean }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // LDAP
  testLdapConnection: () =>
    request<{ success: boolean; message: string }>('/ldap/test'),

  getLdapUsers: () =>
    request<{ users: LdapUser[]; count: number }>('/ldap/users'),

  syncLdapUsers: (campaignId: string) =>
    request<LdapSyncResult>(`/ldap/sync/${campaignId}`, { method: 'POST' }),
};
