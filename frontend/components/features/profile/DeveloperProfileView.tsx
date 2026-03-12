'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Loader2, Github, ExternalLink, MapPin, Twitter, Linkedin, Plus, Camera, X, Mail } from 'lucide-react';
import { updateDeveloperProfileSchema, type UpdateDeveloperProfileFormData } from '@/lib/validations';
import { useUpdateProfile, useMyReputationScore, useCalculateMyReputation } from '@/lib/hooks';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import type { Developer, Project } from '@/types';
import { Availability } from '@/types';
import { ProjectCard } from './ProjectCard';
import { ProjectFormDialog } from './ProjectFormDialog';
import { ReputationScore, ReputationBreakdown, TierBadge } from '@/components/features/reputation';
import { GitHubStatsCard } from '@/components/features/github';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

interface DeveloperProfileViewProps {
  developer: Developer;
}

export function DeveloperProfileView({ developer }: DeveloperProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(developer.avatarUrl);
  const [avatarError, setAvatarError] = useState('');
  const [email, setEmail] = useState(developer.user?.email ?? '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const { data: reputationScore, isLoading: reputationLoading } = useMyReputationScore();
  const updateUser = useAuthStore((s) => s.setAuth);
  const currentUser = useAuthStore((s) => s.user);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setAvatarError('Image must be 1 MB or smaller');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: UpdateDeveloperProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        ...data,
        avatarUrl: avatarPreview,
      } as any);
      setIsEditing(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleEmailSave = async () => {
    if (!email.trim() || email === (developer.user?.email ?? '')) return;
    setEmailSaving(true);
    setEmailError('');
    setEmailSuccess('');
    try {
      await authApi.updateEmail(email.trim());
      setEmailSuccess('Email updated successfully');
      // Update local auth store so the navbar reflects new email
      if (currentUser) {
        updateUser({ user: { ...currentUser, email: email.trim() }, accessToken: '', refreshToken: '' });
      }
    } catch (err: any) {
      setEmailError(err?.message || err?.response?.data?.message || 'Failed to update email');
    } finally {
      setEmailSaving(false);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {updateProfile.error && (
              <Alert variant="destructive">
                <AlertDescription>{updateProfile.error.message}</AlertDescription>
              </Alert>
            )}

            {/* Profile Photo */}
            <div className="flex items-start gap-6">
              <div className="relative shrink-0">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white/10 border-2 border-primary/30 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Label>Profile Photo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  borderColor="rgba(255,0,0,0.6)"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground">Max size: 1 MB. JPG, PNG, or WebP.</p>
                {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailSuccess(''); setEmailError(''); }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEmailSave}
                  disabled={emailSaving || !email.trim()}
                  borderColor="rgba(255,0,0,0.6)"
                >
                  {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              {emailSuccess && <p className="text-sm text-green-500">{emailSuccess}</p>}
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  disabled={updateProfile.isPending}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  {...register('contactNumber')}
                  disabled={updateProfile.isPending}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  onValueChange={(value) => setValue('availability', value as Availability)}
                  defaultValue={developer.availability}
                  disabled={updateProfile.isPending}
                >
                  <SelectTrigger id="availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Availability.AVAILABLE}>Available</SelectItem>
                    <SelectItem value={Availability.BUSY}>Busy</SelectItem>
                    <SelectItem value={Availability.NOT_LOOKING}>Not Looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  {...register('location')}
                  disabled={updateProfile.isPending}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  {...register('twitter')}
                  disabled={updateProfile.isPending}
                />
                {errors.twitter && (
                  <p className="text-sm text-destructive">{errors.twitter.message}</p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  {...register('linkedin')}
                  disabled={updateProfile.isPending}
                />
                {errors.linkedin && (
                  <p className="text-sm text-destructive">{errors.linkedin.message}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                {...register('bio')}
                disabled={updateProfile.isPending}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border-2 border-primary/30 shrink-0 flex items-center justify-center">
                {developer.avatarUrl ? (
                  <img src={developer.avatarUrl} alt={developer.fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {developer.fullName?.charAt(0)?.toUpperCase() ?? 'D'}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{developer.fullName}</CardTitle>
                  <Badge className={availabilityColors[developer.availability]}>
                    {availabilityLabels[developer.availability]}
                  </Badge>
                </div>
                <CardDescription className="text-base">@{developer.username}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          {developer.bio && (
            <div>
              <p className="text-muted-foreground">{developer.bio}</p>
            </div>
          )}

          <Separator />

          {/* Contact & Social */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{developer.contactNumber}</p>
                {developer.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {developer.location}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Social Links</h3>
              <div className="space-y-2">
                <a
                  href={developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
                {developer.twitter && (
                  <a
                    href={developer.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {developer.linkedin && (
                  <a
                    href={developer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Reputation & Tier */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Reputation Score</p>
              <p className="text-2xl font-bold">{developer.reputationScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <TierBadge tier={developer.tier} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation Details */}
      {!reputationLoading && reputationScore && (
        <div className="grid gap-6 md:grid-cols-2">
          <ReputationScore
            score={reputationScore.totalScore}
            tier={reputationScore.tier}
          />
          <ReputationBreakdown breakdown={reputationScore} />
        </div>
      )}

      {/* GitHub Statistics */}
      {developer.github && (
        <GitHubStatsCard
          username={developer.github.split('/').pop() || ''}
        />
      )}

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Showcase your work and contributions
              </CardDescription>
            </div>
            <Button onClick={() => setProjectDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {developer.projects?.length === 0 || !developer.projects ? (
            <p className="text-muted-foreground text-center py-8">
              No projects yet. Start adding your work to increase your reputation!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {developer.projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onEdit={handleEditProject}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={handleCloseDialog}
        project={editingProject}
      />
    </div>
  );
}
