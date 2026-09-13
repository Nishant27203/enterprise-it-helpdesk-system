import { z } from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }).passthrough(),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid ID') }),
});
