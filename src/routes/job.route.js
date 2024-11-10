import { Router } from "express";

const router = Router();

import {
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getCompanyJobs,
} from "../controllers/job.js";
import authCheck from "../middlewares/authcheck.js";

router.use(authCheck);

router.route("/create").post(createJob);
router.route("/update/:jobId").put(updateJob);
router.route("/delete/:jobId").delete(deleteJob);
router.route("/status/:jobId").put(toggleJobStatus);
router.route("/company/:companyId").get(getCompanyJobs);

export default router;
