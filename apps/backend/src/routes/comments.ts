import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comments.js";

const router = Router();

router.get("/:mediaType/:externalId", getComments);
router.post("/", requireAuth, createComment);
router.patch("/:id", requireAuth, updateComment);
router.delete("/:id", requireAuth, deleteComment);

export default router;
