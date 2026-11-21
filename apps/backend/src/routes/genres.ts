import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getGenres, updateGenres } from "../controllers/genres.js";

const router = Router();

router.get("/me", requireAuth, getGenres);
router.put("/me", requireAuth, updateGenres);

export default router;
