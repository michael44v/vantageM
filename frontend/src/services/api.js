import axios from 'axios';

// Base API Configuration
const API_BASE_URL = 'https://vantagemarkets.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (JWT handling)
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('vantagemarkets_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Error management)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vantagemarkets_user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const accountService = {
  getAccounts: () => api.get('/accounts'),
  createAccount: (data) => api.post('/accounts', data),
  internalTransfer: (data) => api.post('/payments/transfer', data),
};

export const kycService = {
  getStatus: () => api.get('/kyc'),
  upload: (formData) => api.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const paymentService = {
  deposit: (data) => api.post('/payments/deposit', data),
};

export const tradingService = {
  execute: (data) => api.post('/trading/execute', data),
  getPositions: (accountId) => api.get(`/trading/positions?account_id=${accountId}`),
  getSignals: () => api.get('/signals'),
  copySignal: (data) => api.post('/signals/copy', data),
};

export const adminService = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getTransactions: () => api.get('/admin/transactions'),
  approveTransaction: (id) => api.patch(`/admin/transactions/${id}/approve`),
  rejectTransaction: (id) => api.patch(`/admin/transactions/${id}/reject`),
};

export default api;
