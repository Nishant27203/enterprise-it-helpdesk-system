import * as categoryService from '../services/categoryService.js';

export const listCategories = async (_req, res) => {
  const data = await categoryService.listCategories();
  res.json({ success: true, data });
};

export const listDepartments = async (_req, res) => {
  const data = await categoryService.listDepartments();
  res.json({ success: true, data });
};

export const updateCategory = async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  res.json({ success: true, data });
};

export const listSlaPolicies = async (_req, res) => {
  const data = await categoryService.listSlaPolicies();
  res.json({ success: true, data });
};

export const updateSlaPolicy = async (req, res) => {
  const data = await categoryService.updateSlaPolicy(req.params.id, req.validated.body);
  res.json({ success: true, data });
};
