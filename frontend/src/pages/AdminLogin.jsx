import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter username and password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const data = await adminLogin(username.trim(), password);
      if (data && data.token) {
        sessionStorage.setItem('nec_admin_token', data.token);
        navigate('/admin/dashboard');
      } else {
        throw new Error('Invalid login response from server.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="admin-main">
      <div className="login-card">
        <div className="avatar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          </svg>
        </div>
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin} id="loginForm">
          <div className="field">
            <label htmlFor="username">UserName</label>
            <input
              type="text"
              id="username"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="msg error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="btn-row">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate('/')}
              disabled={isLoggingIn}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-login"
              id="loginBtn"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
