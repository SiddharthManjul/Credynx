'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, fetchCurrentUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL params
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens in auth store
        setAuth({
          user: null!, // Will be fetched via fetchCurrentUser
          accessToken,
          refreshToken,
        });

        // Fetch user data
        await fetchCurrentUser();

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, setAuth, fetchCurrentUser, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {status === 'loading' && 'Processing your authentication...'}
          {status === 'success' && 'Authentication successful!'}
          {status === 'error' && 'Authentication failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/login">Back to Login</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    }>
      <CallbackContent />
    </Suspense>
  );
}
