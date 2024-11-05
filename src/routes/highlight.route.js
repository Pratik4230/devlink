import { Router } from "express";

const router = Router();

import {
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from "../controllers/highlight.js";
import authCheck from "../middlewares/authcheck.js";
import upload from "../middlewares/multer.js";

router.use(authCheck);

router.route("/create").post(upload.single("image"), createHighlight);
router.route("/update/:highlightId").put(updateHighlight);
router.route("/delete/:highlightId").delete(deleteHighlight);

export default router;
