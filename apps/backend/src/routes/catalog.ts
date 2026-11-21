import { Router } from "express";
import { search, featured, details } from "../controllers/catalog.js";

const router = Router();

router.get("/search", search);
router.get("/featured", featured);
router.get("/:id", details);

export default router;
