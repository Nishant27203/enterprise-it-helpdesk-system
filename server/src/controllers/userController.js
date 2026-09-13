import * as userService from '../services/userService.js';

export const list = async (req, res) => {
  const result = await userService.listUsers(req.validated.query);
  res.json({ success: true, data: result.users, meta: result.meta });
};

export const getById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: user });
};

export const create = async (req, res) => {
  const user = await userService.createUser(req.validated.body);
  res.status(201).json({ success: true, data: user });
};

export const update = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.validated.body);
  res.json({ success: true, data: user });
};

export const technicians = async (_req, res) => {
  const users = await userService.listTechnicians();
  res.json({ success: true, data: users });
};
