import { Router } from "express";

const router = Router();

import {
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.js";

import authCheck from "../middlewares/authcheck.js";

router.use(authCheck);

router.route("/add/:postId").post(addComment);
router.route("/update/:commentId").put(updateComment);
router.route("/delete/:commentId").delete(deleteComment);

export default router;