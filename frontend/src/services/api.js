import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("vantagemarkets_user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vantagemarkets_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

// Users (admin)
export const usersAPI = {
  getAll: (params) => api.get("/admin/users", { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
};

// Transactions (admin)
export const transactionsAPI = {
  getAll: (params) => api.get("/admin/transactions", { params }),
  approve: (id) => api.patch(`/admin/transactions/${id}/approve`),
  reject: (id) => api.patch(`/admin/transactions/${id}/reject`),
};

// Dashboard stats (admin)
export const dashboardAPI = {
  getStats: () => api.get("/admin/dashboard/stats"),
  getChartData: () => api.get("/admin/dashboard/chart"),
};

// Contact / Lead
export const leadAPI = {
  submit: (data) => api.post("/leads", data),
};

export default api;
