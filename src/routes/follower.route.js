import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import { toggleFollow, getFollowers } from "../controllers/follower.js";

router.use(authCheck);

router.route("/company/:companyId").post(toggleFollow);
router.route("/followers/:companyId").get(getFollowers);

export default router;
