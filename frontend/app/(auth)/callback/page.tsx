'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Legacy OAuth callback page.
 *
 * Auth.js v5 now handles OAuth callbacks at /api/auth/callback/{provider}
 * and redirects the browser back to the app directly, so this page is
 * effectively dead code kept only for backwards-compatibility with any
 * bookmark or external link still pointing here. Just bounce to /dashboard.
 */
export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signing you in…</CardTitle>
        <CardDescription>Redirecting to your dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}
