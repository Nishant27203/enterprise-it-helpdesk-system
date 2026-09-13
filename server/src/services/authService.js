import prisma from '../config/prisma.js';
import { comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { pickUserFields } from '../utils/pick.js';
import { ApiError } from '../utils/ApiError.js';

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { department: true },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Contact IT support.');
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: pickUserFields(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User account is inactive or does not exist');
  }

  return pickUserFields(user);
};

export const logout = async () => {
  // Stateless JWT: client discards token. Endpoint exists for API consistency.
  return { message: 'Logged out successfully' };
};
