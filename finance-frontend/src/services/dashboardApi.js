import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 12000,
});

const TOKEN_STORAGE_KEY = 'finance_auth_token';

const getStoredToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
};

export const setDashboardAuthToken = (token) => {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (_error) {
    // Ignore localStorage errors in restricted browser contexts.
  }
};

apiClient.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_AUTH_TOKEN || getStoredToken();
  const role = import.meta.env.VITE_MOCK_ROLE;
  const userId = import.meta.env.VITE_MOCK_USER_ID;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (role) {
    config.headers['x-user-role'] = role;
  }

  if (userId) {
    config.headers['x-user-id'] = userId;
  }

  return config;
});

const unwrapData = (response) => response.data?.data ?? response.data;

export const fetchDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return unwrapData(response);
};

export const fetchDashboardTrends = async () => {
  const response = await apiClient.get('/dashboard/trends');
  return unwrapData(response);
};

export const fetchDashboardCategoryWise = async () => {
  const response = await apiClient.get('/dashboard/category-wise');
  return unwrapData(response);
};
