import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const listCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });
};

export const listDepartments = async () => {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Category not found');
  return prisma.category.update({ where: { id }, data });
};

export const createSubcategory = async (categoryId, name) => {
  return prisma.subcategory.create({
    data: { categoryId, name },
  });
};

export const listSlaPolicies = async () => {
  return prisma.sLAPolicy.findMany({ orderBy: { priority: 'asc' } });
};

export const updateSlaPolicy = async (id, data) => {
  const policy = await prisma.sLAPolicy.findUnique({ where: { id } });
  if (!policy) throw ApiError.notFound('SLA policy not found');
  return prisma.sLAPolicy.update({ where: { id }, data });
};
