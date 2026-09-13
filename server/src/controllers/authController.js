import * as authService from '../services/authService.js';

export const login = async (req, res) => {
  const { email, password } = req.validated.body;
  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getMe = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const logout = async (_req, res) => {
  const result = await authService.logout();

  res.status(200).json({
    success: true,
    data: result,
  });
};
