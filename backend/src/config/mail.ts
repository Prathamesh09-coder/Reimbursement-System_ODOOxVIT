export const mailConfig = {
  apiKey: process.env.MAILJET_API_KEY || "",
  secretKey: process.env.MAILJET_SECRET_KEY || "",
  fromEmail: process.env.MAILJET_FROM_EMAIL || "no-reply@reimburseiq.app",
  fromName: process.env.MAILJET_FROM_NAME || "ReimburseIQ",
  apiUrl: "https://api.mailjet.com/v3.1/send",
  simulationMode: process.env.MAIL_SIMULATION === "true",
  enabled: Boolean(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY),
};