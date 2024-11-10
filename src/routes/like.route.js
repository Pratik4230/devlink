import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import {
  likePost,
  likeComment,
  likeHighlight,
  getLikedPosts,
} from "../controllers/like.js";

router.use(authCheck);

router.route("/post/:postId").post(likePost);
router.route("/comment/:commentId").post(likeComment);
router.route("/highlight/:highlightId").post(likeHighlight);
router.route("/posts").get(getLikedPosts);

export default router;
