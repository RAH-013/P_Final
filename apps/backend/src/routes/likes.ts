import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createLike, deleteLike, getLikes } from "../controllers/likes.js";

const router = Router();

router.get("/", requireAuth, getLikes);
router.post("/", requireAuth, createLike);
router.delete("/:mediaType/:externalId", requireAuth, deleteLike);

export default router;
