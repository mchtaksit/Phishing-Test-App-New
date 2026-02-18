import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetail } from './pages/CampaignDetail';
import { CampaignNew } from './pages/CampaignNew';
import { LandingPages } from './pages/LandingPages';
import { LandingPage } from './pages/LandingPage';
import { EmailTemplates } from './pages/EmailTemplates';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Panel */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/new" element={<CampaignNew />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="landing-pages" element={<LandingPages />} />
          <Route path="email-templates" element={<EmailTemplates />} />
        </Route>

        {/* Phishing Landing Page (Layout dışında) */}
        <Route path="/landing/:campaignId" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
