import { z } from 'zod';

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    categoryId: z.string().uuid().optional(),
    problem: z.string().min(10),
    troubleshootingSteps: z.string().min(10),
    resolution: z.string().min(5),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateArticleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    categoryId: z.string().uuid().nullable().optional(),
    problem: z.string().min(10).optional(),
    troubleshootingSteps: z.string().min(10).optional(),
    resolution: z.string().min(5).optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const listArticlesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});
