import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createLike,
  deleteLike,
  getLikeById,
  getLikes,
} from "../controllers/likes.js";

const router = Router();

router.get("/", requireAuth, getLikes);
router.get("/:id", requireAuth, getLikeById);
router.post("/", requireAuth, createLike);
router.delete("/:mediaType/:externalId", requireAuth, deleteLike);

export default router;
