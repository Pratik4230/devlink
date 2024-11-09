import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import { applyJob } from "../controllers/jobapplication.js";
import upload from "../middlewares/multer.js";

router.use(authCheck);

router.route("/apply/:jobId").post(upload.single("resume"), applyJob);

export default router;
