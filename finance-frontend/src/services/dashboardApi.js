import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const role = import.meta.env.VITE_MOCK_ROLE;
  const userId = import.meta.env.VITE_MOCK_USER_ID;

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
