// The backend URL comes from VITE_API_URL (set it in Vercel or .env.local).
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://astone-backend-app.onrender.com'
).replace(/\/+$/, '');

export const CURRENCY = 'MYR';
