import apiClient from './client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User
} from '@/types';

export const authApi = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  // GitHub OAuth — redirects to backend which initiates the GitHub OAuth flow
  githubLogin: (): void => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/github`;
  },

  // Google OAuth — redirects to backend which initiates the Google OAuth flow
  googleLogin: (): void => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/google`;
  },

  // Update authenticated user's email
  updateEmail: async (email: string): Promise<{ email: string }> => {
    const { data } = await apiClient.patch<{ email: string }>('/auth/email', { email });
    return data;
  },
};

export default authApi;

