import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LandingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  thumbnail: string;
}

const TEMPLATES: LandingTemplate[] = [
  {
    id: 'university-obs',
    name: 'Üniversite OBS',
    description: 'Öğrenci Bilgi Sistemi giriş sayfası',
    category: 'Eğitim',
    previewUrl: '/landing/demo-obs',
    thumbnail: '🎓',
  },
  {
    id: 'corporate-login',
    name: 'Kurumsal Portal',
    description: 'Şirket içi portal giriş sayfası',
    category: 'Kurumsal',
    previewUrl: '/landing/demo-corporate',
    thumbnail: '🏢',
  },
  {
    id: 'email-verify',
    name: 'E-posta Doğrulama',
    description: 'Hesap doğrulama sayfası',
    category: 'Genel',
    previewUrl: '/landing/demo-email',
    thumbnail: '📧',
  },
  {
    id: 'password-reset',
    name: 'Şifre Sıfırlama',
    description: 'Şifre yenileme formu',
    category: 'Genel',
    previewUrl: '/landing/demo-password',
    thumbnail: '🔐',
  },
  {
    id: 'survey-form',
    name: 'Anket Formu',
    description: 'IT memnuniyet anketi',
    category: 'HR',
    previewUrl: '/landing/demo-survey',
    thumbnail: '📋',
  },
  {
    id: 'document-share',
    name: 'Döküman Paylaşım',
    description: 'OneDrive/SharePoint benzeri sayfa',
    category: 'Kurumsal',
    previewUrl: '/landing/demo-document',
    thumbnail: '📄',
  },
];

const CATEGORIES = ['Tümü', 'Eğitim', 'Kurumsal', 'Genel', 'HR'];

export function LandingPages() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'Tümü' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
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
          {CATEGORIES.map(cat => (
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
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-thumbnail">
              <span className="thumbnail-emoji">{template.thumbnail}</span>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="template-category">{template.category}</span>
            </div>
            <div className="template-actions">
              <Link
                to={template.previewUrl}
                target="_blank"
                className="btn btn-sm"
              >
                Önizle
              </Link>
              <button className="btn btn-sm btn-primary">
                Kullan
              </button>
            </div>
          </div>
        ))}
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
    </div>
  );
}
