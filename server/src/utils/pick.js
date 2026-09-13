export const pickUserFields = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  departmentId: user.departmentId,
  escalationLevel: user.escalationLevel,
  isActive: user.isActive,
  department: user.department
    ? {
        id: user.department.id,
        name: user.department.name,
      }
    : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
