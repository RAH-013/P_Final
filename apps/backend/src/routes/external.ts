import { Router } from "express";
import { proxyExternal } from "../controllers/external.js";

const router = Router();

router.use(proxyExternal);

export default router;
