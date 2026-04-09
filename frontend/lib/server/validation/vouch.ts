import { z } from 'zod';

export const CreateVouchSchema = z.object({
  vouchedUserId: z.string().uuid(),
  skillsEndorsed: z.array(z.string()),
  message: z.string().optional(),
});

export type CreateVouchInput = z.infer<typeof CreateVouchSchema>;

export const RevokeVouchSchema = z.object({
  reason: z.string().optional(),
});
