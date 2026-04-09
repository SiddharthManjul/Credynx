import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  livePlatformUrl: z.string().url(),
  repositoryUrl: z.string().url(),
  teammateNames: z.array(z.string()).optional(),
  technologies: z.array(z.string()).min(1),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  livePlatformUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  teammateNames: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
