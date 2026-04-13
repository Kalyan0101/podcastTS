import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "../controller/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").get(refreshAccessToken);

router.route("/logout").get(verifyJWT, logout);



export default router;