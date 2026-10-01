/**
 * Centralized API configuration.
 * Local development: VITE_API_URL is loaded from .env (defaults to http://localhost:5000 in dev mode).
 * Production (Vercel): VITE_API_URL MUST be set in Vercel Project Settings to your deployed backend URL.
 * In production mode, it will NEVER fall back to localhost:5000.
 */
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (import.meta.env.PROD && !rawUrl) {
  console.error(
    'CRITICAL CONFIGURATION ERROR: VITE_API_URL environment variable is not defined in production build! Please add VITE_API_URL in your Vercel Project Settings.'
  );
}

const API_URL = rawUrl ? rawUrl.replace(/\/+$/, '') : '';

export default API_URL;
