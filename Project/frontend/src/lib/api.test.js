import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import api, { errorMessage, SESSION_EXPIRED_EVENT } from './api';
import { API_BASE_URL } from './config';

describe('api client', () => {
  let apiMock;
  let rawMock;
  beforeEach(() => {
    apiMock = new MockAdapter(api);
    rawMock = new MockAdapter(axios);
  });
  afterEach(() => {
    apiMock.restore();
    rawMock.restore();
  });

  it('sends the saved access token', async () => {
    localStorage.setItem('access', 'abc');
    apiMock.onGet('/me/').reply((config) => [200, { auth: config.headers.Authorization }]);
    const res = await api.get('/me/');
    expect(res.data.auth).toBe('Bearer abc');
  });

  it('refreshes an expired token once and retries the request', async () => {
    localStorage.setItem('access', 'old');
    localStorage.setItem('refresh', 'r1');
    rawMock.onPost(`${API_BASE_URL}/token/refresh/`).reply(200, { access: 'new' });
    apiMock.onGet('/cart/').reply((config) =>
      config.headers.Authorization === 'Bearer new' ? [200, { ok: true }] : [401, { detail: 'expired' }],
    );
    const res = await api.get('/cart/');
    expect(res.data.ok).toBe(true);
    expect(localStorage.getItem('access')).toBe('new');
  });

  it('logs out when the refresh token is no longer valid', async () => {
    localStorage.setItem('access', 'old');
    localStorage.setItem('refresh', 'dead');
    localStorage.setItem('role', 'customer');
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    rawMock.onPost(`${API_BASE_URL}/token/refresh/`).reply(401, {});
    apiMock.onGet('/cart/').reply(401, { detail: 'expired' });
    await expect(api.get('/cart/')).rejects.toBeTruthy();
    expect(localStorage.getItem('access')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(onExpired).toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it('does not try to refresh failed logins', async () => {
    localStorage.setItem('refresh', 'r1');
    apiMock.onPost('/login/').reply(401, { detail: 'Invalid email or password.' });
    const error = await api.post('/login/', {}).catch((e) => e);
    expect(errorMessage(error)).toBe('Invalid email or password.');
    expect(rawMock.history.post).toHaveLength(0);
  });
});

describe('errorMessage', () => {
  it('explains network failures and field errors in plain words', () => {
    expect(errorMessage({ code: 'ERR_NETWORK' })).toMatch(/Can't reach the Astoné server/);
    expect(errorMessage({ response: { data: { shop_name: ['Taken.'] } } })).toBe('Taken.');
    expect(errorMessage({ response: { data: { user: { email: ['Exists.'] } } } })).toBe('Exists.');
    expect(errorMessage({ response: { data: '<html>' } }, 'Fallback')).toBe('Fallback');
  });
});
