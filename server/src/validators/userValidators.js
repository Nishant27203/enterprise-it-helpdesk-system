import { z } from 'zod';

const roleEnum = z.enum(['EMPLOYEE', 'IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN']);
const escalationEnum = z.enum(['L1', 'L2', 'L3']);

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: roleEnum,
    departmentId: z.string().uuid().optional(),
    escalationLevel: escalationEnum.optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: roleEnum.optional(),
    departmentId: z.string().uuid().nullable().optional(),
    escalationLevel: escalationEnum.nullable().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    role: roleEnum.optional(),
    search: z.string().optional(),
  }),
});
