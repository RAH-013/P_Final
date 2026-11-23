import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  getComments,
  getCommentsByUser,
  updateComment,
} from "../controllers/comments.js";

const router = Router();

router.get("/", getAllComments);
router.get("/user/:userId", getCommentsByUser);
router.get("/:mediaType/:externalId", getComments);
router.get("/:id", getCommentById);

router.post("/", requireAuth, createComment);
router.patch("/:id", requireAuth, updateComment);
router.delete("/:id", requireAuth, deleteComment);

export default router;
