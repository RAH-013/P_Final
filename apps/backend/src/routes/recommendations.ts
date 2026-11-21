import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getRecommendations,
  getNextRecommendation,
  getRecommendationById,
} from "../controllers/recommendations.js";

const router = Router();

router.use(requireAuth);

router.get("/", getRecommendations);
router.get("/next", getNextRecommendation);
router.get("/:id", getRecommendationById);

export default router;
