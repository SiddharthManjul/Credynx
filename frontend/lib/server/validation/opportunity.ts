import { z } from 'zod';

export const CreateHackathonSchema = z.object({
  name: z.string().min(1),
  ecosystem: z.string().min(1),
  organizer: z.string().min(1),
  prizePool: z.number().optional(),
  startDate: z.string().datetime().or(z.string().min(1)),
  endDate: z.string().datetime().or(z.string().min(1)),
  websiteUrl: z.string().url(),
});

export type CreateHackathonInput = z.infer<typeof CreateHackathonSchema>;

export const CreateGrantSchema = z.object({
  name: z.string().min(1),
  ecosystem: z.string().min(1),
  provider: z.string().min(1),
  amount: z.number().optional(),
  websiteUrl: z.string().url(),
  deadline: z.string().optional(),
});

export type CreateGrantInput = z.infer<typeof CreateGrantSchema>;

export const HackathonStatusSchema = z.object({
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED']),
});

export const GrantStatusSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED']),
});
