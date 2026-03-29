"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = exports.comparePassword = exports.hashPassword = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scrypt = (0, util_1.promisify)(crypto_1.scrypt);
const hashPassword = async (password) => {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const key = (await scrypt(password, salt, 64));
    return `${salt}:${key.toString("hex")}`;
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    const [salt, storedKeyHex] = hashedPassword.split(":");
    if (!salt || !storedKeyHex) {
        return false;
    }
    const derivedKey = (await scrypt(password, salt, 64));
    const storedKey = Buffer.from(storedKeyHex, "hex");
    if (derivedKey.length !== storedKey.length) {
        return false;
    }
    return (0, crypto_1.timingSafeEqual)(derivedKey, storedKey);
};
exports.comparePassword = comparePassword;
const generatePassword = (length = 12) => {
    // Keep symbols out to reduce email-client copy/paste issues for temp passwords.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes = (0, crypto_1.randomBytes)(length);
    return Array.from(bytes)
        .map((b) => chars[b % chars.length])
        .join("");
};
exports.generatePassword = generatePassword;
//# sourceMappingURL=password.js.map