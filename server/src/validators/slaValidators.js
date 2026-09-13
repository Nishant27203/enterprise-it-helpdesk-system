import { z } from 'zod';

export const updateSlaSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    responseTimeMinutes: z.number().int().min(1).optional(),
    resolutionTimeMinutes: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});
