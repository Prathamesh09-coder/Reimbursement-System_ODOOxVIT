import { prisma } from "../../config/db";

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

  return { message: "Notification queued" };
};

export const listNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: { created_at: "desc" }
  });
};