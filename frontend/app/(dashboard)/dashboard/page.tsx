/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth, useMyProfile, useMyReputationScore, useDeveloperVouches } from '@/lib/hooks';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { ReputationScore, ReputationBreakdown, TierBadge } from '@/components/features/reputation';
import { GitHubSyncButton, GitHubStatsCard } from '@/components/features/github';
import { ProjectCard } from '@/components/features/profile/ProjectCard';
import { ProjectFormDialog } from '@/components/features/profile/ProjectFormDialog';
import { Background3D } from '@/components/landing/Background3D';
import {
  FolderGit2,
  Users,
  TrendingUp,
  Plus,
  User as UserIcon,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  MapPin,
  Edit,
  Building2,
  Camera,
  X,
  Mail,
  Loader2,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDeveloperProfileSchema, updateFounderProfileSchema, type UpdateDeveloperProfileFormData, type UpdateFounderProfileFormData } from '@/lib/validations';
import { useUpdateProfile } from '@/lib/hooks/useProfile';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Availability } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Project } from '@/types';

export default function UnifiedDashboardPage() {
  const { user, isDeveloper, isFounder } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: reputationScore, isLoading: reputationLoading } = useMyReputationScore();

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const developer = profile?.developer;
  const founder = profile?.founder;
  
  // Check for actual profile data, not just user role
  // This handles cases where ADMIN users may also have developer/founder profiles
  const hasDeveloperProfile = !!developer;
  const hasFounderProfile = !!founder;
  const hasProfile = hasDeveloperProfile || hasFounderProfile;

  // If no profile, show onboarding
  if (!hasProfile) {
    return (
      <div className="space-y-8 relative pt-6">
        <Background3D />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-orange-500">
            Welcome to Credynx! 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Complete your profile to get started
          </p>
        </div>

        <FuturisticCard className="border-primary/30 relative z-10">
          <CardHeader className="pt-3">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-base">
              {isDeveloper && 'Create your developer profile to showcase your work and connect with founders'}
              {isFounder && 'Create your founder profile to discover talented developers'}
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-sm bg-background/50"
              onClick={() => router.push('/profile')}
            >
              <UserIcon className="mr-2 h-5 w-5" />
              Create Profile Now
            </Button>
          </div>
        </FuturisticCard>
      </div>
    );
  }

  // Developer Unified Dashboard - show if user has a developer profile
  if (hasDeveloperProfile && developer) {
    return <DeveloperUnifiedDashboard developer={developer} reputationScore={reputationScore} reputationLoading={reputationLoading} />;
  }

  // Founder Unified Dashboard - show if user has a founder profile
  if (hasFounderProfile && founder) {
    return <FounderUnifiedDashboard founder={founder} />;
  }

  return null;
}

// Developer Unified Dashboard Component
const MAX_AVATAR_BYTES = 1 * 1024 * 1024; // 1 MB

function DeveloperUnifiedDashboard({ developer, reputationScore, reputationLoading }: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const updateProfile = useUpdateProfile();
  const { data: vouches } = useDeveloperVouches(developer.id);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(developer.avatarUrl);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email state — email lives on User, not Developer; read from auth store
  const storeUser = useAuthStore((s) => s.user);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const [email, setEmail] = useState(storeUser?.email ?? '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image must be 1 MB or smaller.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmailSave = async () => {
    const trimmed = email.trim();
    if (!trimmed || trimmed === storeUser?.email) return;
    setEmailSaving(true);
    setEmailError('');
    setEmailSuccess('');
    try {
      await authApi.updateEmail(trimmed);
      await fetchCurrentUser();
      setEmailSuccess('Email updated!');
    } catch (err: any) {
      setEmailError(err?.response?.data?.message || err?.message || 'Failed to update email.');
    } finally {
      setEmailSaving(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateDeveloperProfileFormData>({
    resolver: zodResolver(updateDeveloperProfileSchema),
    defaultValues: {
      fullName: developer.fullName,
      contactNumber: developer.contactNumber,
      twitter: developer.twitter || '',
      linkedin: developer.linkedin || '',
      bio: developer.bio || '',
      location: developer.location || '',
      availability: developer.availability,
    },
  });

  const onSubmit = async (data: UpdateDeveloperProfileFormData) => {
    try {
      await updateProfile.mutateAsync({ ...data, avatarUrl: avatarPreview } as any);
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setProjectDialogOpen(false);
    setEditingProject(undefined);
  };

  const availabilityColors = {
    AVAILABLE: 'bg-green-500',
    BUSY: 'bg-yellow-500',
    NOT_LOOKING: 'bg-gray-500',
  };

  const availabilityLabels = {
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    NOT_LOOKING: 'Not Looking',
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <Background3D />
        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </div>
              <Button variant="outline" className="backdrop-blur-sm bg-background/50" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {updateProfile.error && (
                <Alert variant="destructive">
                  <AlertDescription>{updateProfile.error.message}</AlertDescription>
                </Alert>
              )}

              {/* ── Profile Photo ── */}
              <div className="space-y-3">
                <Label>Profile Photo <span className="text-xs text-muted-foreground">(max 1 MB)</span></Label>
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-white/10 border-2 border-primary/40 flex items-center justify-center">
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                        : <Camera className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    {avatarPreview && (
                      <button type="button" onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center shadow">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleImageChange} className="hidden" />
                    <Button type="button" variant="outline" size="sm"
                      className="backdrop-blur-sm bg-background/50" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 1 MB</p>
                    {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* ── Email ── */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="email" type="email" className="pl-10 bg-white/5 border-white/10"
                      value={email} onChange={(e) => { setEmail(e.target.value); setEmailSuccess(''); setEmailError(''); }} />
                  </div>
                  <Button type="button" variant="outline" size="sm"
                    className="backdrop-blur-sm bg-background/50"
                    onClick={handleEmailSave}
                    disabled={emailSaving || !email.trim() || email.trim() === storeUser?.email}>
                    {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                  </Button>
                </div>
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                {emailSuccess && <p className="text-sm text-green-500">{emailSuccess}</p>}
              </div>

              <Separator className="bg-white/10" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register('fullName')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" {...register('contactNumber')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    onValueChange={(value) => setValue('availability', value as Availability)}
                    defaultValue={developer.availability}
                    disabled={updateProfile.isPending}
                  >
                    <SelectTrigger id="availability" className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Availability.AVAILABLE}>Available</SelectItem>
                      <SelectItem value={Availability.BUSY}>Busy</SelectItem>
                      <SelectItem value={Availability.NOT_LOOKING}>Not Looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="San Francisco, CA" {...register('location')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input id="twitter" placeholder="https://twitter.com/username" {...register('twitter')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.twitter && <p className="text-sm text-destructive">{errors.twitter.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/in/username" {...register('linkedin')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} {...register('bio')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="backdrop-blur-sm bg-background/50"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </FuturisticCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <Background3D />
      
      {/* Header with Edit Button */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-orange-500">
              Welcome back, {developer.fullName}! 👋
            </h1>
            <TierBadge tier={developer.tier} size="lg" />
          </div>
          <p className="text-muted-foreground text-lg">@{developer.username}</p>
        </div>
        <Button
          variant="outline"
          className="backdrop-blur-sm bg-background/50"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4 relative z-10">
        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Reputation Score</p>
            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold text-orange-500">{(developer.reputationScore || 0).toFixed(1)}</p>
              <p className="text-muted-foreground pb-1">/ 100</p>
            </div>
          </div>
        </FuturisticCard>

        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
              <FolderGit2 className="h-4 w-4" />
              Projects
            </div>
            <p className="text-4xl font-bold text-white">{developer.projects?.length || 0}</p>
          </div>
        </FuturisticCard>

        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
              <Users className="h-4 w-4" />
              Vouches
            </div>
            <p className="text-4xl font-bold text-white">{vouches?.length || 0}</p>
          </div>
        </FuturisticCard>

        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              Tier Ranking
            </div>
            <p className="text-3xl font-bold text-white uppercase italic">
              {developer.tier.replace('TIER_', 'Tier ')}
            </p>
          </div>
        </FuturisticCard>
      </div>

      {/* Profile Info & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-3 relative z-10">
        {/* Profile Information */}
        <FuturisticCard className="lg:col-span-2 border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
            <div className="space-y-6">
              {/* Bio */}
              {developer.bio && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">About</h3>
                  <p className="text-base text-white/90 leading-relaxed">{developer.bio}</p>
                </div>
              )}

              <Separator className="bg-white/10" />

              {/* Contact & Location */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Contact</h3>
                  <p className="text-base text-white/90">{developer.contactNumber}</p>
                  {developer.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      {developer.location}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Availability</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${availabilityColors[developer.availability as keyof typeof availabilityColors]}`} />
                    <span className="text-sm font-medium text-white">{availabilityLabels[developer.availability as keyof typeof availabilityLabels]}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Social Links</h3>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={developer.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {developer.twitter && (
                    <a
                      href={developer.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      Twitter
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {developer.linkedin && (
                    <a
                      href={developer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FuturisticCard>

        {/* Quick Actions */}
        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
            <p className="text-muted-foreground mb-6">Manage your profile</p>
            <div className="space-y-4">
              <Button
                className="w-full justify-start backdrop-blur-sm bg-background/50"
                variant="outline"
                onClick={() => setProjectDialogOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Project
              </Button>
              <GitHubSyncButton variant="outline" size="default" showText className="w-full justify-start" />
              <Button
                className="w-full justify-start backdrop-blur-sm bg-background/50"
                variant="outline"
                onClick={() => router.push('/developers')}
              >
                <Users className="mr-2 h-5 w-5" />
                Browse Developers
              </Button>
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* Reputation Details */}
      <div className="relative z-10">
        {!reputationLoading && reputationScore && (
          <div className="grid gap-8 md:grid-cols-2">
            <ReputationScore
              score={reputationScore.totalScore}
              tier={reputationScore.tier}
            />
            <ReputationBreakdown breakdown={reputationScore} />
          </div>
        )}
      </div>

      {/* GitHub Statistics */}
      <div className="relative z-10">
        {developer.github && (
          <GitHubStatsCard
            username={developer.github.split('/').pop() || ''}
          />
        )}
      </div>

      {/* Projects Section */}
      <FuturisticCard className="border-primary/20 relative z-10" hoverEffect={false}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold">Projects</h3>
              <p className="text-muted-foreground mt-1 text-base">
                Showcase your work and contributions
              </p>
            </div>
            <Button
              variant="outline"
              className="backdrop-blur-sm bg-background/50"
              onClick={() => setProjectDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Project
            </Button>
          </div>

          <div>
            {developer.projects?.length === 0 || !developer.projects ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-muted-foreground text-lg">
                  No projects yet. Start adding your work to increase your reputation!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {developer.projects.map((project: Project, index: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onEdit={handleEditProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </FuturisticCard>

      {/* Getting Started Tips */}
      {developer.reputationScore < 10 && (
        <FuturisticCard className="border-orange-500/30 relative z-10 bg-orange-500/5">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">💡 Tips to Improve Your Reputation</h3>
            <p className="text-muted-foreground mb-6">Complete these actions to increase your visibility</p>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <span>Add at least 2-3 projects with live demos and GitHub repositories</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <span>Sync your GitHub profile to showcase your contributions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <span>Complete your profile with bio, location, and social links</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <span>Submit hackathon wins and grant achievements for verification</span>
              </li>
            </ul>
          </div>
        </FuturisticCard>
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={handleCloseDialog}
        project={editingProject}
      />
    </div>
  );
}

// Founder Unified Dashboard Component
function FounderUnifiedDashboard({ founder }: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFounderProfileFormData>({
    resolver: zodResolver(updateFounderProfileSchema),
    defaultValues: {
      fullName: founder.fullName || '',
      companyName: founder.companyName,
      position: founder.position,
      companyWebsite: founder.companyWebsite || '',
      bio: founder.bio || '',
      linkedinUrl: founder.linkedinUrl || '',
    },
  });

  const onSubmit = async (data: UpdateFounderProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <Background3D />
        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                <CardDescription>Update your company information</CardDescription>
              </div>
              <Button
                variant="outline"
                className="backdrop-blur-sm bg-background/50"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {updateProfile.error && (
                <Alert variant="destructive">
                  <AlertDescription>{updateProfile.error.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register('fullName')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" {...register('companyName')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" {...register('position')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input id="companyWebsite" type="url" placeholder="https://example.com" {...register('companyWebsite')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.companyWebsite && <p className="text-sm text-destructive">{errors.companyWebsite.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/username" {...register('linkedinUrl')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                  {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Company Bio</Label>
                <Textarea id="bio" rows={4} {...register('bio')} disabled={updateProfile.isPending} className="bg-white/5 border-white/10" />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="backdrop-blur-sm bg-background/50"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </FuturisticCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <Background3D />
      {/* Header with Edit Button */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-orange-500 mb-2">
            Welcome back, {founder.fullName}! 👋
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-lg">
            <span>{founder.position}</span>
            <span className="text-muted-foreground/50">at</span>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-400" />
              <span className="text-white/80">{founder.companyName}</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="backdrop-blur-sm bg-background/50"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Company Information & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-3 relative z-10">
        {/* Company Profile */}
        <FuturisticCard className="lg:col-span-2 border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-6">Company Information</h3>
            <div className="space-y-6">
              {/* Bio */}
              {founder.bio && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">About</h3>
                  <p className="text-base text-white/90 leading-relaxed">{founder.bio}</p>
                </div>
              )}

              <Separator className="bg-white/10" />

              {/* Company Details */}
              <div className="grid gap-6 md:grid-cols-2">
                {founder.companyWebsite && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Website</h3>
                    <a
                      href={founder.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                      {founder.companyWebsite.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Member Since</h3>
                  <p className="text-base text-white/90">{new Date(founder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Social Links</h3>
                {founder.linkedinUrl ? (
                  <a
                    href={founder.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No social links added</p>
                )}
              </div>
            </div>
          </div>
        </FuturisticCard>

        {/* Quick Actions */}
        <FuturisticCard className="border-primary/20" hoverEffect={false}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
            <p className="text-muted-foreground mb-6">Discover developers</p>
            <div className="space-y-4">
              <Button
                className="w-full justify-start backdrop-blur-sm bg-background/50"
                variant="outline"
                onClick={() => router.push('/developers')}
              >
                <Users className="mr-2 h-5 w-5" />
                Browse Developers
              </Button>
              <Button
                className="w-full justify-start backdrop-blur-sm bg-background/50"
                variant="outline"
                onClick={() => router.push('/projects')}
              >
                <FolderGit2 className="mr-2 h-5 w-5" />
                Browse Projects
              </Button>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-bold">Coming Soon</p>
                <Button
                  className="w-full justify-start backdrop-blur-sm bg-background/50 opacity-50 cursor-not-allowed"
                  variant="outline"
                  disabled
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Post a Job
                </Button>
              </div>
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* Platform Features */}
      <FuturisticCard className="border-primary/20 relative z-10" hoverEffect={false}>
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">Platform Features</h3>
          <p className="text-muted-foreground mb-8">Available tools for hiring</p>
          <ul className="grid gap-6 md:grid-cols-2">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-500 font-bold">✓</span>
              </div>
              <div>
                <p className="font-bold text-lg">Browse Verified Developers</p>
                <p className="text-muted-foreground">Access tier-ranked developer profiles with reputation scores</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-500 font-bold">✓</span>
              </div>
              <div>
                <p className="font-bold text-lg">View Developer Projects</p>
                <p className="text-muted-foreground">See live demos and GitHub repositories</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-500">⏳</span>
              </div>
              <div>
                <p className="font-bold text-lg">Post Job Openings</p>
                <p className="text-muted-foreground">Coming soon - AI-powered developer matching</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-500">⏳</span>
              </div>
              <div>
                <p className="font-bold text-lg">Schedule Sessions</p>
                <p className="text-muted-foreground">Coming soon - Direct developer meetings</p>
              </div>
            </li>
          </ul>
        </div>
      </FuturisticCard>

      {/* Getting Started Tips */}
      <FuturisticCard className="border-blue-500/30 relative z-10 bg-blue-500/5">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">💡 Getting Started</h3>
          <p className="text-muted-foreground mb-6">Make the most of the platform</p>
          <ul className="space-y-4 text-white/80">
            <li className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span>Browse the developer directory to discover talented Web3 developers</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span>Check developer reputation scores and tier rankings for quality assurance</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span>Review developer projects to see their work in action</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span>Complete your company profile to increase credibility</span>
            </li>
          </ul>
        </div>
      </FuturisticCard>
    </div>
  );
}
