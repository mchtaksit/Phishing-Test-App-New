import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Phishing Sim</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/campaigns">
            Kampanyalar
          </NavLink>
          <NavLink to="/campaigns/new">
            Yeni Kampanya
          </NavLink>
          <NavLink to="/landing-pages">
            Landing Pages
          </NavLink>
          <NavLink to="/email-templates">
            E-posta Şablonları
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
