import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, addLike, episodeRemove, episodeSave, makeSubscription, removeComment, removeLike, removeSubscription } from "../controller/activity.controller.js";

const router = Router()

router.use(verifyJWT);
router.route("/subscribe").post(makeSubscription);
router.route("/subscribe/:id").delete(removeSubscription);

router.route("/like").post(addLike);
router.route("/like/:id").delete(removeLike);

router.route("/comment").post(addComment);
router.route("/comment/:id").delete(removeComment);

router.route("/episode").post(episodeSave);
router.route("/episode/:id").delete(episodeRemove);


export default router;