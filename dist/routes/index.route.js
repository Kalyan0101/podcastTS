import { Router } from "express";
import authAPI from "./auth.route.js";
const router = Router();
router.use("/auth", authAPI);
export default router;
