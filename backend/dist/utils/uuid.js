"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUuid = void 0;
const crypto_1 = require("crypto");
const createUuid = () => (0, crypto_1.randomUUID)();
exports.createUuid = createUuid;
//# sourceMappingURL=uuid.js.map