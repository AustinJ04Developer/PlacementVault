import axios from 'axios';

// Calculate baseURL dynamically from environment variables or relative fallback
const getBaseURL = (): string => {
  const envUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    ''
  ).trim();

  if (!envUrl) {
    return '/api/v1';
  }

  // Remove trailing slashes
  const clean = envUrl.replace(/\/+$/, '');

  // If the provided URL already ends with /api/v1, use it directly
  if (clean.endsWith('/api/v1')) {
    return clean;
  }

  // If it ends with /api, append /v1
  if (clean.endsWith('/api')) {
    return `${clean}/v1`;
  }

  // Otherwise, append /api/v1
  return `${clean}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token from localStorage if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unified error messages & HTML fallback detection
api.interceptors.response.use(
  response => {
    const contentType = String(response.headers?.['content-type'] ?? '');
    // Detect if SPA fallback returned HTML instead of expected JSON API response
    if (
      typeof response.data === 'string' &&
      (contentType.includes('text/html') ||
        response.data.trim().startsWith('<!DOCTYPE') ||
        response.data.trim().startsWith('<html'))
    ) {
      return Promise.reject(
        new Error(
          'Received HTML response instead of JSON. The API endpoint may be misconfigured or the backend server is unavailable.'
        )
      );
    }
    return response;
  },
  error => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
