import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/admin/dashboard');
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  const isAdminLogin = location.pathname.startsWith('/admin/login');

  const handleLogout = () => {
    sessionStorage.removeItem('nec_admin_token');
    navigate('/admin/login');
  };

  return (
    <header className="site">
      <Link to="/" className="brand">
        <div className="logo">NEC</div>
        <div>
          <h1>National Engineering College</h1>
          <p>
            {isDashboard
              ? 'Admin Dashboard — Grievance Redressal Portal'
              : 'K.R.Nagar, Kovilpatti - 628503'}
          </p>
        </div>
      </Link>

      <div className="contact">
        {!isDashboard && (
          <>
            <span className="contact-item">✉ principal@nec.edu.in</span>
            <span className="contact-item">📞 04632-232749</span>
            <span className="contact-item">📠 04632-227441</span>
          </>
        )}

        {isDashboard ? (
          <>
            <span id="whoami" style={{ fontWeight: 500 }}>
              Logged in as Admin
            </span>
            <button className="logout-btn" onClick={handleLogout} type="button">
              Logout
            </button>
          </>
        ) : isHome ? (
          <Link className="admin-link" to="/admin/login" title="Admin Login">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </Link>
        ) : (
          <Link to="/" className="home-nav-link">
            ← Home
          </Link>
        )}
      </div>
    </header>
  );
}
