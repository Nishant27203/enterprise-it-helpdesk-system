import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import { pickUserFields } from '../utils/pick.js';

const userInclude = { department: { select: { id: true, name: true } } };

export const listUsers = async ({ page = 1, limit = 20, role, search } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(pickUserFields),
    meta: { page, limit, total },
  };
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
  if (!user) throw ApiError.notFound('User not found');
  return pickUserFields(user);
};

export const createUser = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw ApiError.conflict('Email already in use');

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      departmentId: data.departmentId,
      escalationLevel: data.escalationLevel || null,
    },
    include: userInclude,
  });

  return pickUserFields(user);
};

export const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');

  const updates = { ...data };
  delete updates.password;
  delete updates.email;

  if (data.password) {
    updates.passwordHash = await hashPassword(data.password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updates,
    include: userInclude,
  });

  return pickUserFields(updated);
};

export const listTechnicians = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['IT_TECHNICIAN', 'IT_MANAGER'] },
      isActive: true,
    },
    include: userInclude,
    orderBy: { firstName: 'asc' },
  });
  return users.map(pickUserFields);
};
