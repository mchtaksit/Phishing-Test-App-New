import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Campaign } from '../types';

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCampaigns()
      .then(setCampaigns)
      .catch(() => setError('Kampanyalar yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <h2>Kampanyalar</h2>
        <Link to="/campaigns/new" className="btn btn-primary">
          + Yeni Kampanya
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <p>Henüz kampanya oluşturulmamış.</p>
          <Link to="/campaigns/new" className="btn btn-primary">
            İlk Kampanyayı Oluştur
          </Link>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Kampanya Adı</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th>Hedef Sayısı</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(campaign => (
              <tr key={campaign.id}>
                <td>
                  <Link to={`/campaigns/${campaign.id}`} className="link">
                    {campaign.name}
                  </Link>
                </td>
                <td className="text-muted">{campaign.description || '-'}</td>
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
  );
}
