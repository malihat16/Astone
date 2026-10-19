import api from '../lib/api';

export const login = (email, password) => api.post('/login/', { email, password }).then((r) => r.data);
export const register = (details) => api.post('/register/', details).then((r) => r.data);
export const getMe = () => api.get('/me/').then((r) => r.data);
export const updateMe = (details) => api.patch('/me/', details).then((r) => r.data);
export const requestPasswordReset = (email) => api.post('/forgot-password/', { email }).then((r) => r.data);
export const resetPassword = (token, password) => api.post('/change-password/', { token, password }).then((r) => r.data);
