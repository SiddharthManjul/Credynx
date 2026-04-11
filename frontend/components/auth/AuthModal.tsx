/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import { Github, Mail, Lock, User, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { UserRole } from '@/types';
import { useAuth } from '@/lib/hooks';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['DEVELOPER', 'FOUNDER']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  warningMessage?: string;
}

/** Google icon SVG (no external dependency needed) */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Divider used between form and OAuth buttons */
function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-primary/20" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-black px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>
  );
}

/** OAuth provider buttons shown in both Login and Signup tabs */
function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full backdrop-blur-sm bg-background/50"
        borderColor="rgba(255, 0, 0, 1)"
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>

      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full backdrop-blur-sm bg-background/50"
        borderColor="rgba(66, 133, 244, 0.8)"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login', warningMessage }: AuthModalProps) {
  const router = useRouter();
  const { login: authLogin, register: authRegister } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedRole, setSelectedRole] = useState<'DEVELOPER' | 'FOUNDER'>('DEVELOPER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'DEVELOPER',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await authLogin(data);
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await authRegister({
        email: data.email,
        password: data.password,
        role: selectedRole === 'DEVELOPER' ? UserRole.DEVELOPER : UserRole.FOUNDER,
      });
      onClose();
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 bg-transparent border-none shadow-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Welcome to Credynx
          </DialogTitle>
        </DialogHeader>

        {warningMessage && (
          <div className="mb-4 p-3 rounded-md bg-orange-500/10 border border-orange-500/30">
            <p className="text-sm text-orange-500">{warningMessage}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/40 border border-primary/20 p-1">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register('password')}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                variant="outline"
                className="w-full backdrop-blur-sm bg-background/50"
                disabled={isLoading}
                borderColor="rgba(255, 0, 0, 1)"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <OrDivider />
            <OAuthButtons />
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-3">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('DEVELOPER')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'DEVELOPER'
                      ? 'border-primary bg-primary/10'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Developer</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('FOUNDER')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'FOUNDER'
                      ? 'border-primary bg-primary/10'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
                >
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Founder</p>
                </button>
              </div>
            </div>

            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...registerForm.register('email')}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...registerForm.register('password')}
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                variant="outline"
                className="w-full backdrop-blur-sm bg-background/50"
                disabled={isLoading}
                borderColor="rgba(255, 0, 0, 1)"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <OrDivider />
            <OAuthButtons />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
