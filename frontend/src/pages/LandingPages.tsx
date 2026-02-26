import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { LandingPage } from '../types';

// Extract category from landing page name
const getCategoryFromName = (name: string): string => {
  if (name.includes('Office') || name.includes('Microsoft')) return 'Kurumsal';
  if (name.includes('OBS') || name.includes('Üniversite')) return 'Eğitim';
  if (name.includes('HR') || name.includes('İK')) return 'HR';
  return 'Genel';
};

// Get emoji based on category/name
const getEmoji = (name: string): string => {
  if (name.includes('Office') || name.includes('Microsoft')) return '🪟';
  if (name.includes('OBS') || name.includes('Üniversite')) return '🎓';
  if (name.includes('Portal')) return '🏢';
  if (name.includes('Şifre')) return '🔐';
  if (name.includes('Anket')) return '📋';
  if (name.includes('Döküman')) return '📄';
  return '📧';
};

export function LandingPages() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<LandingPage | null>(null);

  useEffect(() => {
    const fetchLandingPages = async () => {
      try {
        const data = await api.getLandingPages();
        setLandingPages(data);
      } catch (err) {
        console.error('Failed to fetch landing pages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingPages();
  }, []);

  // Extract unique categories from landing pages
  const categories = ['Tümü', ...Array.from(new Set(landingPages.map(lp => getCategoryFromName(lp.name))))];

  const filteredTemplates = landingPages.filter(template => {
    const category = getCategoryFromName(template.name);
    const matchesCategory = selectedCategory === 'Tümü' || category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="landing-pages-page">
      <div className="page-header">
        <div>
          <h2>Landing Page Şablonları</h2>
          <p className="text-muted">Phishing simülasyonları için hazır landing page şablonları</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {loading ? (
          <div className="loading-state">Landing page'ler yükleniyor...</div>
        ) : (
          filteredTemplates.map(template => {
            const category = getCategoryFromName(template.name);
            const emoji = getEmoji(template.name);
            return (
              <div key={template.id} className="template-card">
                <div className="template-thumbnail">
                  <span className="thumbnail-emoji">{emoji}</span>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  {template.isDefault && (
                    <span className="badge" style={{ backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      Varsayılan
                    </span>
                  )}
                  <span className="template-category">{category}</span>
                </div>
                <div className="template-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => setPreviewPage(template)}
                  >
                    Önizle
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/campaigns/new?landingPageId=${template.id}`)}
                  >
                    Kullan
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="empty-state">
          <p>Aramanızla eşleşen şablon bulunamadı.</p>
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <h3>Landing Page Nasıl Çalışır?</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">1</div>
            <div>
              <h4>Şablon Seçin</h4>
              <p>Hedef kitlenize uygun bir şablon seçin</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">2</div>
            <div>
              <h4>Özelleştirin</h4>
              <p>Logo, renkler ve içeriği düzenleyin</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">3</div>
            <div>
              <h4>Kampanyaya Ekleyin</h4>
              <p>Kampanya oluştururken bu şablonu seçin</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">4</div>
            <div>
              <h4>Sonuçları İzleyin</h4>
              <p>Tıklama ve form gönderim verilerini analiz edin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPage && (
        <div
          className="preview-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setPreviewPage(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              height: '90vh',
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Önizleme: {previewPage.name}
              </h3>
              <button
                onClick={() => setPreviewPage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>
            <iframe
              srcDoc={previewPage.html}
              style={{
                width: '100%',
                height: 'calc(100% - 65px)',
                border: 'none',
              }}
              title="Landing Page Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
