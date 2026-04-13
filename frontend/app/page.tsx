/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { FuturisticButton as Button } from "@/components/ui/futuristic-button";
import { Github } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { Background3D } from "@/components/landing/Background3D";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ScrollSections } from "@/components/landing/ScrollSections";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { signIn } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mountKey, setMountKey] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authWarning, setAuthWarning] = useState<string>('');

  // Force remount Background3D when component mounts
  useEffect(() => {
    setMountKey((prev) => prev + 1);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Don't show landing page to authenticated users
  if (isAuthenticated) {
    return null;
  }

  const handleAuthModalOpen = (tab: 'login' | 'signup', message?: string) => {
    setAuthTab(tab);
    setAuthWarning(message || '');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Background3D key={mountKey} />

      <Navbar onAuthModalOpen={handleAuthModalOpen} />

      <div className="-mt-16">
        <HeroSection />
      </div>

      <div className="mt-24">
        <h3 className="text-4xl md:text-5xl font-bold text-center mb-12 text-muted-foreground">
          Why It <span style={{ color: '#F97316' }}>Matters</span>
        </h3>
        <BentoGrid />
      </div>

      {/* Scroll Sections */}
      <ScrollSections />

      {/* OAuth Quick Access */}
        <div className="py-24 text-center space-y-3">
          <p className="text-sm text-muted-foreground mb-4">Or continue with</p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-background/50"
              borderColor="rgba(255, 0, 0, 1)"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            >
              <Github className="mr-2 h-5 w-5" />
              GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-background/50"
              borderColor="rgba(66, 133, 244, 0.8)"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </div>
        </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthWarning('');
        }}
        defaultTab={authTab}
        warningMessage={authWarning}
      />
      </div>
    );
}
