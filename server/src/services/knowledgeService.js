import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const listArticles = async ({ search, categoryId, page = 1, limit = 20 } = {}) => {
  const where = { isPublished: true };
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { problem: { contains: search, mode: 'insensitive' } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  const skip = (page - 1) * limit;
  const [articles, total] = await Promise.all([
    prisma.knowledgeArticle.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.knowledgeArticle.count({ where }),
  ]);

  return { articles, meta: { page, limit, total } };
};

export const getArticleById = async (id) => {
  const article = await prisma.knowledgeArticle.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!article) throw ApiError.notFound('Article not found');
  return article;
};

export const createArticle = async (user, data) => {
  return prisma.knowledgeArticle.create({
    data: {
      ...data,
      authorId: user.id,
      tags: data.tags || [],
    },
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const updateArticle = async (id, user, data) => {
  const article = await getArticleById(id);
  if (article.authorId !== user.id && user.role !== 'ADMIN') {
    throw ApiError.forbidden('You can only edit your own articles');
  }

  return prisma.knowledgeArticle.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const deleteArticle = async (id) => {
  await getArticleById(id);
  return prisma.knowledgeArticle.update({
    where: { id },
    data: { isPublished: false },
  });
};
