import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import { applyJob, getJobApplications } from "../controllers/jobapplication.js";
import upload from "../middlewares/multer.js";

router.use(authCheck);

router.route("/apply/:jobId").post(upload.single("resume"), applyJob);
router.route("/applications/:jobId").get(getJobApplications);

export default router;
