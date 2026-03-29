"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = exports.notify = void 0;
const db_1 = require("../../config/db");
const notify = async (userId, msg, type = "INFO", company_id) => {
    await db_1.prisma.notification.create({
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
exports.notify = notify;
const listNotifications = async () => {
    return db_1.prisma.notification.findMany({
        orderBy: { created_at: "desc" }
    });
};
exports.listNotifications = listNotifications;
//# sourceMappingURL=notification.service.js.map