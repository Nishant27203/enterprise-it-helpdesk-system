import * as knowledgeService from '../services/knowledgeService.js';

export const list = async (req, res) => {
  const result = await knowledgeService.listArticles(req.validated.query);
  res.json({ success: true, data: result.articles, meta: result.meta });
};

export const getById = async (req, res) => {
  const article = await knowledgeService.getArticleById(req.params.id);
  res.json({ success: true, data: article });
};

export const create = async (req, res) => {
  const article = await knowledgeService.createArticle(req.user, req.validated.body);
  res.status(201).json({ success: true, data: article });
};

export const update = async (req, res) => {
  const article = await knowledgeService.updateArticle(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: article });
};

export const remove = async (req, res) => {
  await knowledgeService.deleteArticle(req.params.id);
  res.json({ success: true, data: { message: 'Article deleted' } });
};
