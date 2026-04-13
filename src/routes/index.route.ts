import { Router } from "express";

import authAPI from "./auth.route.js";
import userAPI from "./user.route.js";

const router = Router();

router.use("/auth", authAPI);
router.use("/user", userAPI);



export default router;