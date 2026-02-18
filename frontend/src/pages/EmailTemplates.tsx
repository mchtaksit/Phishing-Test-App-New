import { useState } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: string;
  difficulty: number;
  thumbnail: string;
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: 'it-password-reset',
    name: 'IT Şifre Sıfırlama',
    subject: 'Acil: Şifrenizi Sıfırlamanız Gerekmektedir',
    description: 'IT departmanından gelen şifre sıfırlama talebi',
    category: 'IT',
    difficulty: 2,
    thumbnail: '🔐',
  },
  {
    id: 'hr-payroll',
    name: 'Maaş Bordrosu',
    subject: 'Maaş Bordronuz Hazır - İncelemeniz Gerekmektedir',
    description: 'İK departmanından maaş bordrosu bildirimi',
    category: 'HR',
    difficulty: 3,
    thumbnail: '💰',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365 Uyarısı',
    subject: 'Microsoft 365: Hesabınız Askıya Alınacak',
    description: 'Microsoft hesap güvenlik uyarısı',
    category: 'IT',
    difficulty: 4,
    thumbnail: '🪟',
  },
  {
    id: 'shipping-notification',
    name: 'Kargo Bildirimi',
    subject: 'Kargonuz Teslim Edilemedi - Adres Onayı Gerekli',
    description: 'Sahte kargo takip bildirimi',
    category: 'Genel',
    difficulty: 2,
    thumbnail: '📦',
  },
  {
    id: 'ceo-urgent',
    name: 'CEO Acil Talep',
    subject: 'Acil - Bugün İçinde Yanıt Gerekli',
    description: 'CEO kimliğine bürünme saldırısı',
    category: 'Yönetim',
    difficulty: 5,
    thumbnail: '👔',
  },
  {
    id: 'invoice-payment',
    name: 'Fatura Ödeme',
    subject: 'Ödenmemiş Fatura - Son Ödeme Tarihi Yaklaşıyor',
    description: 'Sahte fatura ödeme talebi',
    category: 'Finans',
    difficulty: 3,
    thumbnail: '🧾',
  },
  {
    id: 'shared-document',
    name: 'Paylaşılan Döküman',
    subject: 'Sizinle Bir Döküman Paylaşıldı',
    description: 'OneDrive/Google Drive paylaşım bildirimi',
    category: 'IT',
    difficulty: 3,
    thumbnail: '📄',
  },
  {
    id: 'meeting-invite',
    name: 'Toplantı Daveti',
    subject: 'Toplantı Daveti: Acil Proje Değerlendirmesi',
    description: 'Sahte takvim daveti',
    category: 'Genel',
    difficulty: 2,
    thumbnail: '📅',
  },
  {
    id: 'security-alert',
    name: 'Güvenlik Uyarısı',
    subject: 'Şüpheli Giriş Tespit Edildi - Hemen Doğrulayın',
    description: 'Sahte güvenlik uyarısı',
    category: 'IT',
    difficulty: 4,
    thumbnail: '🚨',
  },
  {
    id: 'bonus-announcement',
    name: 'Bonus Duyurusu',
    subject: 'Tebrikler! Yıllık Bonus Hak Kazandınız',
    description: 'Sahte bonus/ödül bildirimi',
    category: 'HR',
    difficulty: 3,
    thumbnail: '🎁',
  },
];

const CATEGORIES = ['Tümü', 'IT', 'HR', 'Finans', 'Yönetim', 'Genel'];

export function EmailTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'Tümü' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyLabel = (level: number) => {
    const labels = ['', 'Çok Kolay', 'Kolay', 'Orta', 'Zor', 'Çok Zor'];
    return labels[level] || '';
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
    return colors[level] || '#6b7280';
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

      {/* Templates List */}
      <div className="email-templates-grid">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`email-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="template-icon">
              <span>{template.thumbnail}</span>
            </div>
            <div className="template-content">
              <div className="template-header">
                <h3>{template.name}</h3>
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(template.difficulty) }}
                >
                  {getDifficultyLabel(template.difficulty)}
                </span>
              </div>
              <p className="template-subject">{template.subject}</p>
              <p className="template-desc">{template.description}</p>
              <div className="template-meta">
                <span className="template-category">{template.category}</span>
              </div>
            </div>
            <div className="template-actions-side">
              <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                Önizle
              </button>
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

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="email-preview-modal" onClick={() => setSelectedTemplate(null)}>
          <div className="email-preview-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTemplate(null)}>×</button>

            <div className="email-preview">
              <div className="email-preview-header">
                <h3>E-posta Önizleme</h3>
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(selectedTemplate.difficulty) }}
                >
                  Zorluk: {getDifficultyLabel(selectedTemplate.difficulty)}
                </span>
              </div>

              <div className="email-mock">
                <div className="email-mock-header">
                  <div className="email-field">
                    <span className="field-label">Kimden:</span>
                    <span className="field-value">guvenlik@sirket-destek.com</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">Kime:</span>
                    <span className="field-value">{'{{alici_email}}'}</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">Konu:</span>
                    <span className="field-value subject">{selectedTemplate.subject}</span>
                  </div>
                </div>

                <div className="email-mock-body">
                  <p>Sayın {'{{alici_adi}}'} {'{{alici_soyadi}}'},</p>
                  <br />
                  <p>
                    Sistemlerimizde hesabınızla ilgili olağandışı bir aktivite tespit edilmiştir.
                    Güvenliğiniz için hesabınızı doğrulamanız gerekmektedir.
                  </p>
                  <br />
                  <p>
                    Lütfen aşağıdaki bağlantıya tıklayarak hesabınızı doğrulayın:
                  </p>
                  <br />
                  <div className="email-cta">
                    <a href="#" className="email-button">Hesabımı Doğrula</a>
                  </div>
                  <br />
                  <p>
                    Bu işlemi 24 saat içinde tamamlamazsanız, hesabınız geçici olarak askıya alınacaktır.
                  </p>
                  <br />
                  <p>Saygılarımızla,</p>
                  <p><strong>IT Güvenlik Ekibi</strong></p>
                </div>
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
          <div className="stat-number">{TEMPLATES.length}</div>
          <div className="stat-text">Toplam Şablon</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{CATEGORIES.length - 1}</div>
          <div className="stat-text">Kategori</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">5</div>
          <div className="stat-text">Zorluk Seviyesi</div>
        </div>
      </div>
    </div>
  );
}
