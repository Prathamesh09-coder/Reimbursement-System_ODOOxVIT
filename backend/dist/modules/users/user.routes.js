"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.get("/", user_controller_1.listUsers);
router.get("/:id", user_controller_1.getUserById);
router.post("/", user_controller_1.createUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map