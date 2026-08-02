import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createChannel, deleteChannel, getChannel, updateChannelDetails } from "../controller/channel.controller.js";

const router = Router()

router.use(verifyJWT);
router.route("/list").get(getChannel);
router.route("/update").put(updateChannelDetails);
router.route("/:id").delete(deleteChannel);
router.route("/").post(createChannel);


export default router;