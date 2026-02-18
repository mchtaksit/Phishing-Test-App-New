import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function LandingPage() {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'anonymous';

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  // Sayfa yüklendiğinde "clicked" event gönder
  useState(() => {
    fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'clicked',
        campaignId: campaignId || 'unknown',
        recipientToken: token,
      }),
    }).catch(() => {});
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // "submitted" event gönder
    try {
      await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'submitted',
          campaignId: campaignId || 'unknown',
          recipientToken: token,
        }),
      });
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="header-left">
            <div className="header-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L35 15V35H5V15L20 5Z" fill="#dc2626" />
                <path d="M15 20H25V35H15V20Z" fill="white" />
              </svg>
            </div>
            <span className="header-title">Öğrenci Bilgi Sistemi</span>
          </div>
        </header>

        <main className="landing-main">
          <div className="landing-card success-card">
            <div className="success-icon">✓</div>
            <h2>Phishing Simülasyonu</h2>
            <p>Bu bir güvenlik farkındalık testidir.</p>
            <p>Gerçek bir saldırı olsaydı, bilgileriniz ele geçirilmiş olacaktı.</p>
            <div className="security-tips">
              <h3>Güvenlik İpuçları:</h3>
              <ul>
                <li>URL adresini her zaman kontrol edin</li>
                <li>Şüpheli e-postalardaki linklere tıklamayın</li>
                <li>Resmi kanalları kullanarak doğrulayın</li>
                <li>Şifrelerinizi asla paylaşmayın</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-left">
          <div className="header-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L35 15V35H5V15L20 5Z" fill="#dc2626" />
              <path d="M15 20H25V35H15V20Z" fill="white" />
            </svg>
          </div>
          <span className="header-title">Öğrenci Bilgi Sistemi</span>
        </div>
        <div className="header-right">
          <button className="header-btn">Giriş</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="landing-card">
          {/* University Logo */}
          <div className="university-logo">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 8L50 20V52H10V20L30 8Z" fill="#dc2626" />
              <path d="M22 28H38V52H22V28Z" fill="white" />
              <path d="M28 35H32V52H28V35Z" fill="#dc2626" />
            </svg>
          </div>

          <h1 className="university-name">ÜNİVERSİTE ADI</h1>
          <p className="university-name-en">UNIVERSITY NAME</p>

          {/* Info Box */}
          <div className="info-box">
            <p>
              <strong>2024–2025 öğretim yılı bahar dönemi kayıt yenileme işlemleri;</strong>
            </p>
            <p>
              • <strong>03 Şubat 2025 (00:15) - 07 Şubat 2025 (23:59)</strong> tarihleri arasında
              aşağıda belirtilen günlerde Öğrenci Bilgi Sistemi üzerinden yapılacaktır.
            </p>
          </div>

          {/* Schedule Table */}
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Program Türü</th>
                <th>Kayıt Yenileme ve Ders Seçim İşlemleri Günleri</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lisans</td>
                <td>
                  <ul>
                    <li>7.yarıyıl ve üstü öğrenciler 3 Şubat 2025 Pazartesi günü ve sonraki günler</li>
                    <li>5.yarıyıl ve üstü öğrenciler 4 Şubat 2025 Salı günü ve sonraki günler</li>
                    <li>3.yarıyıl ve üstü öğrenciler 5 Şubat 2025 Çarşamba günü ve sonraki günler</li>
                    <li>1.yarıyıl ve üstü öğrenciler 6 Şubat 2025 Perşembe günü</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>Önlisans</td>
                <td>4 Şubat 2025 Salı günü ve sonraki günler</td>
              </tr>
              <tr>
                <td>Lisansüstü</td>
                <td>3 Şubat 2025 Pazartesi günü ve sonraki günler</td>
              </tr>
            </tbody>
          </table>

          {/* Warning Box */}
          <div className="warning-box">
            <h4>ÖNEMLİ UYARILAR</h4>
            <p>
              * Seçtiğiniz / yüklenen dersin grubunu değiştirmek için 'Açılan Dersler' panelinde
              dersin diğer grubunu seçmeniz yeterlidir. Bu durumda üzerinizdeki ders otomatik
              olarak bırakılıp yeni ders yüklenecektir.
            </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="landing-footer-bar">
          <p>
            Sistem hakkındaki istek, görüş ve önerilerinizi{' '}
            <a href="#">bilgi@universite.edu.tr</a> adresine iletebilirsiniz.
            (ogr.universite.edu.tr uzantılı e-posta adresiniz ile gönderiniz.)
          </p>
        </div>

        {/* Login Button */}
        <button className="login-cta-btn" onClick={() => document.getElementById('login-modal')?.classList.add('show')}>
          Giriş yapmak için tıklayınız
        </button>
      </main>

      {/* Login Modal */}
      <div id="login-modal" className="login-modal">
        <div className="modal-backdrop" onClick={() => document.getElementById('login-modal')?.classList.remove('show')} />
        <div className="modal-content">
          <button className="modal-close" onClick={() => document.getElementById('login-modal')?.classList.remove('show')}>
            ×
          </button>
          <div className="modal-header">
            <div className="modal-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L35 15V35H5V15L20 5Z" fill="#dc2626" />
                <path d="M15 20H25V35H15V20Z" fill="white" />
              </svg>
            </div>
            <h2>Öğrenci Bilgi Sistemi</h2>
            <p>Kullanıcı Girişi</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label>Kullanıcı Adı / Öğrenci No</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Öğrenci numaranızı giriniz"
                required
              />
            </div>
            <div className="form-field">
              <label>Şifre</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Şifrenizi giriniz"
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Giriş Yap
            </button>
            <div className="form-links">
              <a href="#">Şifremi Unuttum</a>
              <a href="#">Yardım</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
