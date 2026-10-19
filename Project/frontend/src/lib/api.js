import axios from 'axios';
import { API_BASE_URL } from './config';
import { session } from './session';

/** The one HTTP client the whole app uses. It attaches the login token and refreshes it when it expires. */
const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

export const SESSION_EXPIRED_EVENT = 'astone:session-expired';

api.interceptors.request.use((config) => {
  const token = session.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null; // shared so parallel 401s trigger a single refresh

function refreshAccessToken() {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_BASE_URL}/token/refresh/`, { refresh: session.refresh })
      .then((res) => {
        session.save({ access: res.data.access, refresh: res.data.refresh });
        return res.data.access;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = /\/(login|token)\b/.test(original?.url || '');
    if (error.response?.status === 401 && session.refresh && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        const access = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        session.clear();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

/** Turn any API error into one sentence a shopper can act on. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The server took too long to respond. It may be waking up; try again in a moment.'
      : "Can't reach the Astoné server. Check your connection and try again.";
  }
  const data = error.response.data;
  if (typeof data === 'string' || !data) return fallback;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return String(first[0]);
  if (first && typeof first === 'object') return String(Object.values(first)[0]);
  if (typeof first === 'string') return first;
  return fallback;
}

export default api;
