'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import type { LoginCredentials, RegisterCredentials, User } from '@/types';

/**
 * useAuth — thin wrapper over next-auth/react `useSession()` that preserves
 * the legacy hook interface the rest of the app still relies on.
 *
 * The full user record (with developer/founder relations) is fetched on
 * demand via `fetchCurrentUser()` and also returned from `user` when the
 * session is populated. For quick role checks (isDeveloper, etc.) we read
 * off the session payload directly.
 */
export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const sessionUser = session?.user as
    | (User & { id: string; role: User['role']; isVerified: boolean })
    | undefined;

  const user: User | null = useMemo(() => {
    if (fullUser) return fullUser;
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      role: sessionUser.role,
      isVerified: sessionUser.isVerified,
      createdAt: '',
      updatedAt: '',
    } as User;
  }, [fullUser, sessionUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null);
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });
      if (result?.error) {
        const message = 'Invalid email or password';
        setError(message);
        throw new Error(message);
      }
      await update();
    },
    [update],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setError(null);
      try {
        await apiClient.post('/auth/register', credentials);
      } catch (err: any) {
        const message = err?.message || 'Registration failed';
        setError(message);
        throw new Error(message);
      }
      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      if (result?.error) {
        const message = 'Auto-login after registration failed';
        setError(message);
        throw new Error(message);
      }
      await update();
    },
    [update],
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setFullUser(null);
    router.push('/');
  }, [router]);

  const fetchCurrentUser = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await apiClient.get<{ user: User }>('/auth/me');
      setFullUser(data.user);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch user');
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    setError,
    isDeveloper: user?.role === 'DEVELOPER',
    isFounder: user?.role === 'FOUNDER',
    isAdmin: user?.role === 'ADMIN',
  };
};

export default useAuth;
