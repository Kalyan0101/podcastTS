import { Router } from "express";

import authAPI from "./auth.route.js";
import userAPI from "./user.route.js";
import channelAPI from "./channel.route.js";
import episodeAPI from "./episode.route.js";
import activityAPI from "./activity.route.js";

const router = Router();

router.use("/auth", authAPI);
router.use("/user", userAPI);
router.use("/channel", channelAPI);
router.use("/episode", episodeAPI);
router.use("/activity", activityAPI);



export default router;