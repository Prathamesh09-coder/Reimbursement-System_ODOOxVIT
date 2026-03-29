import { transporter } from "../config/mail";

export const sendEmail = async (to: string, text: string): Promise<void> => {
	if (!process.env.EMAIL || !process.env.PASSWORD) {
		console.warn("Email credentials are not configured. Skipping outbound email.");
		return;
	}

	await transporter.sendMail({
		from: process.env.EMAIL,
		to,
		subject: "Reimburse - Notification",
		text
	});
};
