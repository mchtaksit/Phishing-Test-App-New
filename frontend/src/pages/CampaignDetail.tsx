import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { CampaignDetail as CampaignDetailType } from '../types';

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getCampaign(id)
      .then(setCampaign)
      .catch(() => setError('Kampanya yüklenemedi'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    if (!id) return;
    try {
      const updated = await api.startCampaign(id);
      setCampaign(prev => prev ? { ...prev, ...updated } : null);
    } catch {
      setError('Kampanya başlatılamadı');
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error || !campaign) {
    return (
      <div className="error-page">
        <h2>Hata</h2>
        <p>{error || 'Kampanya bulunamadı'}</p>
        <Link to="/campaigns" className="btn">Geri Dön</Link>
      </div>
    );
  }

  const { stats } = campaign;

  return (
    <div className="campaign-detail">
      <div className="page-header">
        <div>
          <Link to="/campaigns" className="back-link">← Kampanyalar</Link>
          <h2>{campaign.name}</h2>
          <p className="text-muted">{campaign.description}</p>
        </div>
        {campaign.status === 'draft' && (
          <button className="btn btn-primary" onClick={handleStart}>
            Kampanyayı Başlat
          </button>
        )}
      </div>

      <div className="campaign-meta">
        <span className={`badge badge-${campaign.status}`}>
          {campaign.status === 'draft' && 'Taslak'}
          {campaign.status === 'active' && 'Aktif'}
          {campaign.status === 'completed' && 'Tamamlandı'}
          {campaign.status === 'paused' && 'Duraklatıldı'}
        </span>
        <span>Oluşturulma: {new Date(campaign.createdAt).toLocaleString('tr-TR')}</span>
        <span>Güncelleme: {new Date(campaign.updatedAt).toLocaleString('tr-TR')}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalTargets}</div>
          <div className="stat-label">Toplam Hedef</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.emailsSent}</div>
          <div className="stat-label">Gönderilen E-posta</div>
        </div>
        <div className="stat-card highlight-warning">
          <div className="stat-value">{stats.clicked}</div>
          <div className="stat-label">Tıklama ({stats.clickRate.toFixed(1)}%)</div>
        </div>
        <div className="stat-card highlight-danger">
          <div className="stat-value">{stats.submitted}</div>
          <div className="stat-label">Form Gönderimi ({stats.submitRate.toFixed(1)}%)</div>
        </div>
      </div>

      <div className="section">
        <h3>Etkinlik Geçmişi</h3>
        {campaign.events.length === 0 ? (
          <p className="empty-state">Henüz etkinlik kaydedilmemiş.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Tür</th>
                <th>Alıcı Token</th>
              </tr>
            </thead>
            <tbody>
              {campaign.events.map(event => (
                <tr key={event.id}>
                  <td>{new Date(event.createdAt).toLocaleString('tr-TR')}</td>
                  <td>
                    <span className={`badge badge-${event.type}`}>
                      {event.type === 'clicked' && 'Tıklandı'}
                      {event.type === 'submitted' && 'Gönderildi'}
                    </span>
                  </td>
                  <td className="text-mono">{event.recipientToken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
