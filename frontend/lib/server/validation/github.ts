import { z } from 'zod';

export const ValidateRepositorySchema = z.object({
  repositoryUrl: z
    .string()
    .regex(
      /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+$/,
      'Invalid GitHub repository URL format',
    ),
});

export type ValidateRepositoryInput = z.infer<typeof ValidateRepositorySchema>;

export const SyncGithubProfileSchema = z.object({
  githubUsername: z.string().regex(/^[a-zA-Z0-9-]+$/, 'Invalid GitHub username format'),
});

export type SyncGithubProfileInput = z.infer<typeof SyncGithubProfileSchema>;
