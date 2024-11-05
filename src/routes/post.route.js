import { Router } from "express";

const router = Router();

import { createPost, updatePost, deletePost } from "../controllers/post.js";
import authCheck from "../middlewares/authcheck.js";

router.use(authCheck);

router.route("/create").post(createPost);
router.route("/update/:postId").put(updatePost);
router.route("/delete/:postId").delete(deletePost);

export default router;
