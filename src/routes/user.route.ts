import { Router } from "express";
import { currentUser, getAllUser, updateUserDetails } from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/all-user").get(getAllUser);

router.use(verifyJWT);
router.route("/current-user").get(currentUser);
router.route("/update").put(updateUserDetails);


export default router;