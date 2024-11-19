import { Router } from "express";

const router = Router();

import {
  createHighlight,
  deleteHighlight,
  getHighlights,
} from "../controllers/highlight.js";
import authCheck from "../middlewares/authcheck.js";
import upload from "../middlewares/multer.js";

router.use(authCheck);

router.route("/create").post(upload.single("image"), createHighlight);
router.route("/delete/:highlightId").delete(deleteHighlight);
router.route("/get").get(getHighlights);
export default router;
