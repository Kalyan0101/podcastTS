import { Router } from "express";
import { currentUser, getAllUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/all-user").get(getAllUser);

router.use(verifyJWT);
router.route("/current-user").get(currentUser);


export default router;