import axios from 'axios';

export const ROLE_STORAGE_KEY = 'userRole';
export const ROLE_OPTIONS = ['admin', 'analyst', 'viewer'];

const normalizeRole = (role) => {
  const normalizedRole = String(role || '')
    .trim()
    .toLowerCase();

  return ROLE_OPTIONS.includes(normalizedRole) ? normalizedRole : 'viewer';
};

export const getStoredRole = () => {
  if (typeof window === 'undefined') {
    return 'viewer';
  }

  const normalizedRole = normalizeRole(window.localStorage.getItem(ROLE_STORAGE_KEY));
  window.localStorage.setItem(ROLE_STORAGE_KEY, normalizedRole);
  return normalizedRole;
};

export const setStoredRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ROLE_STORAGE_KEY, normalizedRole);
  }

  return normalizedRole;
};

const resolvedApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const api = axios.create({
  baseURL: resolvedApiBaseUrl || undefined,
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.headers = nextConfig.headers || {};
  nextConfig.headers['x-user-role'] = getStoredRole();
  return nextConfig;
});

export const unwrapData = (response) => response.data?.data ?? response.data;
