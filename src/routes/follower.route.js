import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import { toggleFollow } from "../controllers/follower.js";

router.use(authCheck);

router.route("/company/:companyId").post(toggleFollow);

export default router;
