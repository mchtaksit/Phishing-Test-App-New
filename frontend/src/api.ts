import type { Campaign, CampaignDetail } from './types';

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
  getCampaigns: () => request<Campaign[]>('/campaigns'),

  getCampaign: (id: string) => request<CampaignDetail>(`/campaigns/${id}`),

  createCampaign: (data: { name: string; description: string; targetCount: number }) =>
    request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  startCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/start`, { method: 'POST' }),

  healthCheck: () => request<{ ok: boolean }>('/health'),
};
