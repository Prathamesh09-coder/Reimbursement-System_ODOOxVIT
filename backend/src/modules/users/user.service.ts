import { prisma } from "../../config/db";
import { generatePassword, hashPassword } from "../../utils/password";
import { sendEmail } from "../../services/emailService";

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

  const hasManualPassword = Boolean(data.password?.trim());

  const user = await prisma.user.create({
    data: {
      company_id: admin.company_id,
      role_id: role.id,
      name: data.name,
      email: data.email,
      manager_id: data.manager_id || null,
      password_hash: hasManualPassword ? await hashPassword(data.password as string) : null,
      must_change_password: true,
      is_active: data.is_active ?? true
    },
    include: { role: true }
  });

  return user;
};

export const sendPasswordToUser = async (userId: number, companyId: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      company_id: companyId,
      is_active: true,
    },
  });

  if (!user) {
    throw new Error("User not found in your company");
  }

  const tempPassword = generatePassword(12);
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: passwordHash,
      must_change_password: true,
    },
  });

  const delivery = await sendEmail({
    to: user.email,
    subject: "Your ReimburseIQ Temporary Password",
    text: `Hi ${user.name || "User"}, your temporary password is: ${tempPassword}. Please login and change this password immediately.`,
  });

  if (delivery.simulated) {
    await prisma.passwordToken.create({
      data: {
        user_id: user.id,
        token: tempPassword,
        type: "TEMP_PASSWORD_SIMULATION",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  return {
    message: "Temporary password sent successfully",
    delivery,
    ...(delivery.simulated ? { simulatedTempPassword: tempPassword } : {}),
  };
};

export const listUsers = async (companyId: number) => {
  return prisma.user.findMany({
    where: { company_id: companyId },
    select: {
      id: true,
      company_id: true,
      name: true,
      email: true,
      manager: { select: { id: true, name: true } },
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

export const updateUserRole = async (userId: number, roleName: string, companyId: number) => {
  const normalizedRoleName = roleName.trim().toUpperCase();

  const role = await prisma.role.findUnique({
    where: { name: normalizedRoleName },
  });

  if (!role) {
    throw new Error(`Role "${normalizedRoleName}" not found in system`);
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, company_id: companyId },
  });

  if (!user) {
    throw new Error("User not found in your company");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role_id: role.id },
    include: { role: true },
  });
};