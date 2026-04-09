import { z } from 'zod';

const DeveloperTierEnum = z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4']);
const AvailabilityEnum = z.enum(['AVAILABLE', 'BUSY', 'NOT_LOOKING']);

export const DeveloperFilterSchema = z.object({
  tier: DeveloperTierEnum.optional(),
  availability: AvailabilityEnum.optional(),
  minReputation: z.coerce.number().int().min(0).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
  orderBy: z.enum(['reputation', 'recent', 'alphabetical']).default('reputation'),
});

export type DeveloperFilterInput = z.infer<typeof DeveloperFilterSchema>;

export const FounderFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type FounderFilterInput = z.infer<typeof FounderFilterSchema>;

export const ProjectFilterSchema = z.object({
  technologies: z.string().optional(),
  search: z.string().optional(),
  isVerified: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export type ProjectFilterInput = z.infer<typeof ProjectFilterSchema>;
