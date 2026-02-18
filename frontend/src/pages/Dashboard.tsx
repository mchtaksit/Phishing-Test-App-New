import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Campaign } from '../types';

export function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCampaigns()
      .then(setCampaigns)
      .catch(() => setError('Kampanyalar yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link to="/campaigns/new" className="btn btn-primary">
          + Yeni Kampanya
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Toplam Kampanya</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Aktif</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Tamamlanan</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.draft}</div>
          <div className="stat-label">Taslak</div>
        </div>
      </div>

      <div className="section">
        <h3>Son Kampanyalar</h3>
        {campaigns.length === 0 ? (
          <p className="empty-state">Henüz kampanya oluşturulmamış.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Kampanya Adı</th>
                <th>Durum</th>
                <th>Hedef Sayısı</th>
                <th>Oluşturulma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 5).map(campaign => (
                <tr key={campaign.id}>
                  <td>{campaign.name}</td>
                  <td>
                    <span className={`badge badge-${campaign.status}`}>
                      {campaign.status === 'draft' && 'Taslak'}
                      {campaign.status === 'active' && 'Aktif'}
                      {campaign.status === 'completed' && 'Tamamlandı'}
                    </span>
                  </td>
                  <td>{campaign.targetCount}</td>
                  <td>{new Date(campaign.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td>
                    <Link to={`/campaigns/${campaign.id}`} className="btn btn-sm">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
