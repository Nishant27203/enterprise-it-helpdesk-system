import { z } from 'zod';

const priorityEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const statusEnum = z.enum([
  'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER', 'ESCALATED', 'RESOLVED', 'CLOSED',
]);
const escalationEnum = z.enum(['L1', 'L2', 'L3']);

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().uuid(),
    subcategoryId: z.string().uuid(),
    priority: priorityEnum,
  }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    assignedToId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    requesterId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    queue: z.enum(['assigned', 'unassigned']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    priority: priorityEnum.optional(),
    troubleshootingNotes: z.string().optional(),
    rootCause: z.string().optional(),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ assignedToId: z.string().uuid() }),
});

export const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: statusEnum,
    notes: z.string().optional(),
  }),
});

export const commentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
    isInternal: z.boolean().optional().default(false),
  }),
});

export const escalateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    toLevel: escalationEnum,
    escalatedToId: z.string().uuid().optional(),
    reason: z.string().min(5),
    notes: z.string().optional(),
  }),
});

export const resolveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    resolutionNotes: z.string().min(5),
    rootCause: z.string().min(3),
    troubleshootingNotes: z.string().min(3),
  }),
});

export const feedbackSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const parseListFilters = (query) => ({
  search: query.search,
  status: query.status ? query.status.split(',') : undefined,
  priority: query.priority ? query.priority.split(',') : undefined,
  categoryId: query.categoryId,
  assignedToId: query.assignedToId,
  departmentId: query.departmentId,
  requesterId: query.requesterId,
  dateFrom: query.dateFrom,
  dateTo: query.dateTo,
  queue: query.queue,
  page: query.page,
  limit: query.limit,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
});
