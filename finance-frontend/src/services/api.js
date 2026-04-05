import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 12000,
});

export const unwrapData = (response) => response.data?.data ?? response.data;
