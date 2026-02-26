import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { EmailTemplate } from '../types';

// Extract category from template name
const getCategoryFromName = (name: string): string => {
  if (name.includes('IT') || name.includes('VPN')) return 'IT';
  if (name.includes('HR') || name.includes('İK')) return 'HR';
  if (name.includes('Finans') || name.includes('Ödeme')) return 'Finans';
  if (name.includes('Genel') || name.includes('Güvenlik')) return 'Genel';
  return 'Genel';
};

// Get emoji based on category
const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    'IT': '🔐',
    'HR': '💼',
    'Finans': '💰',
    'Genel': '📧',
  };
  return emojis[category] || '📧';
};

export function EmailTemplates() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await api.getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Extract unique categories from templates
  const categories = ['Tümü', ...Array.from(new Set(templates.map(t => getCategoryFromName(t.name))))];

  const filteredTemplates = templates.filter(template => {
    const category = getCategoryFromName(template.name);
    const matchesCategory = selectedCategory === 'Tümü' || category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Strip HTML tags from body to create a description
  const getDescription = (body: string): string => {
    const text = body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="email-templates-page">
      <div className="page-header">
        <div>
          <h2>E-posta Şablonları</h2>
          <p className="text-muted">Phishing simülasyonları için hazır e-posta şablonları</p>
        </div>
        <button className="btn btn-primary">
          + Yeni Şablon
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Şablon veya konu ara..."
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

      {/* Templates List */}
      <div className="email-templates-grid">
        {loading ? (
          <div className="loading-state">Şablonlar yükleniyor...</div>
        ) : (
          filteredTemplates.map(template => {
            const category = getCategoryFromName(template.name);
            const emoji = getCategoryEmoji(category);
            return (
              <div
                key={template.id}
                className={`email-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="template-icon">
                  <span>{emoji}</span>
                </div>
                <div className="template-content">
                  <div className="template-header">
                    <h3>{template.name}</h3>
                    {template.isDefault && (
                      <span className="difficulty-badge" style={{ backgroundColor: '#22c55e' }}>
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="template-subject">{template.subject}</p>
                  <p className="template-desc">{getDescription(template.body)}</p>
                  <div className="template-meta">
                    <span className="template-category">{category}</span>
                  </div>
                </div>
                <div className="template-actions-side">
                  <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                    Önizle
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/new?templateId=${template.id}`); }}
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

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="email-preview-modal" onClick={() => setSelectedTemplate(null)}>
          <div className="email-preview-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTemplate(null)}>×</button>

            <div className="email-preview">
              <div className="email-preview-header">
                <h3>E-posta Önizleme</h3>
                {selectedTemplate.isDefault && (
                  <span className="difficulty-badge" style={{ backgroundColor: '#22c55e' }}>
                    Varsayılan Şablon
                  </span>
                )}
              </div>

              <div className="email-mock">
                <div className="email-mock-header">
                  <div className="email-field">
                    <span className="field-label">Kimden:</span>
                    <span className="field-value">guvenlik@sirket-destek.com</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">Kime:</span>
                    <span className="field-value">{'{{email}}'}</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">Konu:</span>
                    <span className="field-value subject">{selectedTemplate.subject}</span>
                  </div>
                </div>

                <div className="email-mock-body" dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
              </div>

              <div className="preview-indicators">
                <h4>Phishing İndikatörleri</h4>
                <ul>
                  <li><span className="indicator-icon">⚠️</span> Sahte gönderen adresi</li>
                  <li><span className="indicator-icon">⚠️</span> Aciliyet yaratan dil</li>
                  <li><span className="indicator-icon">⚠️</span> Şüpheli bağlantı</li>
                  <li><span className="indicator-icon">⚠️</span> Tehdit içeren ifadeler</li>
                </ul>
              </div>

              <div className="preview-actions">
                <button className="btn btn-secondary" onClick={() => setSelectedTemplate(null)}>
                  Kapat
                </button>
                <button className="btn btn-primary">
                  Bu Şablonu Kullan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="templates-stats">
        <div className="stat-item">
          <div className="stat-number">{templates.length}</div>
          <div className="stat-text">Toplam Şablon</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{categories.length - 1}</div>
          <div className="stat-text">Kategori</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{templates.filter(t => t.isDefault).length}</div>
          <div className="stat-text">Varsayılan Şablon</div>
        </div>
      </div>
    </div>
  );
}
