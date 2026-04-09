import { z } from 'zod';

const AvailabilityEnum = z.enum(['AVAILABLE', 'BUSY', 'NOT_LOOKING']);

export const CreateDeveloperProfileSchema = z.object({
  username: z.string().min(3).max(30),
  fullName: z.string().min(2).max(100),
  contactNumber: z.string().min(1),
  github: z.string().url(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  availability: AvailabilityEnum.optional(),
});

export type CreateDeveloperProfileInput = z.infer<typeof CreateDeveloperProfileSchema>;

export const UpdateDeveloperProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  fullName: z.string().min(2).max(100).optional(),
  contactNumber: z.string().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  availability: AvailabilityEnum.optional(),
  avatarUrl: z.string().optional(),
});

export type UpdateDeveloperProfileInput = z.infer<typeof UpdateDeveloperProfileSchema>;

export const CreateFounderProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  companyName: z.string().min(2).max(100),
  position: z.string().min(1),
  companyWebsite: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional(),
});

export type CreateFounderProfileInput = z.infer<typeof CreateFounderProfileSchema>;

export const UpdateFounderProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  companyName: z.string().min(2).max(100).optional(),
  position: z.string().optional(),
  companyWebsite: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional(),
});

export type UpdateFounderProfileInput = z.infer<typeof UpdateFounderProfileSchema>;
