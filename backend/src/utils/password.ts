import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export const hashPassword = async (password: string): Promise<string> => {
	const salt = randomBytes(16).toString("hex");
	const key = (await scrypt(password, salt, 64)) as Buffer;
	return `${salt}:${key.toString("hex")}`;
};

export const comparePassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	const [salt, storedKeyHex] = hashedPassword.split(":");

	if (!salt || !storedKeyHex) {
		return false;
	}

	const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
	const storedKey = Buffer.from(storedKeyHex, "hex");

	if (derivedKey.length !== storedKey.length) {
		return false;
	}

	return timingSafeEqual(derivedKey, storedKey);
};

export const generatePassword = (length = 12): string => {
	// Keep symbols out to reduce email-client copy/paste issues for temp passwords.
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
	const bytes = randomBytes(length);

	return Array.from(bytes)
		.map((b) => chars[b % chars.length])
		.join("");
};
