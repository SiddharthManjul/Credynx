import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types';

// Same-origin: Next.js App Router route handlers live at /api.
// Auth.js sets an HTTP-only session cookie that the browser sends
// automatically with every request — no bearer header needed.
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // On 401, let the caller decide what to do. Most pages will rely on
    // NextAuth middleware / useSession to redirect; we only redirect
    // reactively here as a safety net for actions that hit a protected
    // endpoint unexpectedly.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const onAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register');
      if (!onAuthRoute) {
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      error: error.response?.data?.error,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
