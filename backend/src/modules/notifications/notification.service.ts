import { prisma } from "../../config/db";
import { sendEmail } from "../../services/emailService";

export const notify = async (userId: number, msg: string, type: string = "INFO", company_id?: number) => {
  await prisma.notification.create({
    data: {
      user_id: userId,
      company_id: company_id || null,
      message: msg,
      type,
      is_read: false
    }
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: `Reimburse Notification: ${type}`,
        text: msg,
      });
    } catch {
      // Do not fail primary notification flow if email delivery fails.
    }
  }

  return { message: "Notification queued" };
};

export const listNotifications = async (userId: number, companyId: number) => {
  return prisma.notification.findMany({
    where: {
      user_id: userId,
      company_id: companyId,
    },
    orderBy: { created_at: "desc" }
  });
};

export const markAsRead = async (id: number, userId: number) => {
  return prisma.notification.updateMany({
    where: { id, user_id: userId },
    data: { is_read: true },
  });
};

export const markAllRead = async (userId: number, companyId: number) => {
  return prisma.notification.updateMany({
    where: { user_id: userId, company_id: companyId, is_read: false },
    data: { is_read: true },
  });
};