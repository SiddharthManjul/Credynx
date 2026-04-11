import apiClient from './client';
import type { RegisterCredentials } from '@/types';

/**
 * Thin client for the Next.js `/api/auth/*` endpoints.
 *
 * Auth.js v5 (next-auth) owns sign-in, sign-out, and the session — callers
 * should use `signIn()` / `signOut()` / `useSession()` from `next-auth/react`
 * directly. What's left here are the few things that aren't part of the
 * NextAuth surface:
 *
 * - `register`: custom POST /auth/register that creates the User record.
 *   After this resolves, the caller should `signIn('credentials', ...)` to
 *   establish a session.
 * - `updateEmail`: PATCH /auth/email for authenticated users.
 */
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<{ ok: true }> => {
    const { data } = await apiClient.post<{ ok: true }>('/auth/register', credentials);
    return data;
  },

  updateEmail: async (email: string): Promise<{ email: string }> => {
    const { data } = await apiClient.patch<{ email: string }>('/auth/email', { email });
    return data;
  },
};

export default authApi;
