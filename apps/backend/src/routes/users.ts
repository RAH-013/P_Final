import { Router } from "express";

import { requireAuth, requireRole } from "../middlewares/auth.js";

import {
  changeUsername,
  changePassword,
  removeAccount,
  adminRemoveAccount,
  changeRole,
  getMe,
} from "../controllers/users.js";

const router = Router();

router.patch("/me/username", requireAuth, changeUsername);
router.patch("/me/password", requireAuth, changePassword);
router.get("/me", requireAuth, getMe);
router.delete("/me", requireAuth, removeAccount);

router.delete("/:id", requireAuth, requireRole("admin"), adminRemoveAccount);
router.patch("/:id/role", requireAuth, requireRole("admin"), changeRole);

export default router;
