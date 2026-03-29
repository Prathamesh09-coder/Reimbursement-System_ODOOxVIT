"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCurrency = void 0;
const axios_1 = __importDefault(require("axios"));
const convertCurrency = async (from, to, amount) => {
    const res = await axios_1.default.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    return amount * Number(res.data.rates[to] ?? 1);
};
exports.convertCurrency = convertCurrency;
//# sourceMappingURL=currency.service.js.map