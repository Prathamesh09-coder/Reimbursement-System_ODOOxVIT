import { prisma } from "../../config/db";
import { hashPassword } from "../../utils/password";

type CreateUserInput = {
  name: string;
  email: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE" | "FINANCE" | "DIRECTOR";
  manager_id?: number;
  password?: string;
  is_active?: boolean;
};

type AdminContext = {
  company_id: number;
};

export const createUser = async (data: CreateUserInput, admin: AdminContext) => {
  const roleName = data.role || "EMPLOYEE";
  
  // Get role by name
  const role = await prisma.role.findUnique({
    where: { name: roleName }
  });

  if (!role) {
    throw new Error(`Role "${roleName}" not found in system`);
  }

  const user = await prisma.user.create({
    data: {
      company_id: admin.company_id,
      role_id: role.id,
      name: data.name,
      email: data.email,
      manager_id: data.manager_id || null,
      password_hash: await hashPassword(data.password || "Temp@12345"),
      must_change_password: data.password ? false : true,
      is_active: data.is_active ?? true
    },
    include: { role: true }
  });

  return user;
};

export const listUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      company_id: true,
      name: true,
      email: true,
      role: { select: { name: true } }
    }
  });
};

export const listRoles = async () => {
  return prisma.role.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};

export const updateUserRole = async (userId: number, roleName: string) => {
  const normalizedRoleName = roleName.trim().toUpperCase();

  const role = await prisma.role.findUnique({
    where: { name: normalizedRoleName },
  });

  if (!role) {
    throw new Error(`Role "${normalizedRoleName}" not found in system`);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role_id: role.id },
    include: { role: true },
  });
};