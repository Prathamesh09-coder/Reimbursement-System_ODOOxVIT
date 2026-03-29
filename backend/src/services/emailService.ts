import axios from "axios";
import { appendFile } from "fs/promises";
import path from "path";
import { mailConfig } from "../config/mail";

type SendEmailOptions = {
	to: string;
	subject: string;
	text: string;
	html?: string;
};

export type EmailSendResult = {
	accepted: boolean;
	messageId?: number;
	messageUUID?: string;
	simulated?: boolean;
};

const simulatedLogPath = path.join(process.cwd(), "simulated-mails.log");

const simulateEmail = async (
	options: SendEmailOptions,
	reason: string
): Promise<EmailSendResult> => {
	const fakeMessageId = Date.now();
	const fakeMessageUUID = `sim-${fakeMessageId}`;
	const logLine = [
		`[${new Date().toISOString()}]`,
		`TO=${options.to}`,
		`SUBJECT=${options.subject}`,
		`REASON=${reason}`,
		`MESSAGE_ID=${fakeMessageId}`,
		`MESSAGE_UUID=${fakeMessageUUID}`,
		`TEXT=${options.text.replace(/\s+/g, " ").trim()}`,
	].join(" | ");

	try {
		await appendFile(simulatedLogPath, `${logLine}\n`, "utf8");
	} catch {
		// Ignore simulation log write errors.
	}

	console.warn("Email simulation mode: outbound email captured in simulated-mails.log");

	return {
		accepted: true,
		messageId: fakeMessageId,
		messageUUID: fakeMessageUUID,
		simulated: true,
	};
};

export const sendEmail = async ({ to, subject, text, html }: SendEmailOptions): Promise<EmailSendResult> => {
	const payload: SendEmailOptions = {
		to,
		subject,
		text,
		...(html ? { html } : {}),
	};

	if (mailConfig.simulationMode) {
		return simulateEmail(payload, "MAIL_SIMULATION=true");
	}

	if (!mailConfig.enabled) {
		return simulateEmail(payload, "Missing Mailjet credentials");
	}

	try {
		const response = await axios.post(
			mailConfig.apiUrl,
			{
				Messages: [
					{
						From: {
							Email: mailConfig.fromEmail,
							Name: mailConfig.fromName,
						},
						To: [{ Email: to }],
						Subject: subject,
						TextPart: text,
						...(html ? { HTMLPart: html } : {}),
					},
				],
			},
			{
				auth: {
					username: mailConfig.apiKey,
					password: mailConfig.secretKey,
				},
			}
		);

		const firstMessage = response.data?.Messages?.[0];
		const firstRecipient = firstMessage?.To?.[0];

		return {
			accepted: firstMessage?.Status === "success",
			messageId: firstRecipient?.MessageID,
			messageUUID: firstRecipient?.MessageUUID,
		};
	} catch (error) {
		console.error("Mailjet send failed:", error);
		return simulateEmail(payload, "Mailjet request failed");
	}
};
