import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { CreateEpisode, deleteEpisode, getEpisodes, updateEpisodeDetails } from "../controller/episod.controller.js";

const router = Router()

router.use(verifyJWT);
router.route("/list").get(getEpisodes);
router.route("/update").put(updateEpisodeDetails);
router.route("/:id").delete(deleteEpisode);
router.route("/").post(CreateEpisode);


export default router;