"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_1 = require("../config/mail");
const sendEmail = async (to, text) => {
    if (!process.env.EMAIL || !process.env.PASSWORD) {
        console.warn("Email credentials are not configured. Skipping outbound email.");
        return;
    }
    await mail_1.transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Reimburse - Notification",
        text
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailService.js.map