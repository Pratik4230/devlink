import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
} from "../controllers/connection.js";

router.use(authCheck);

router.route("/send/:toUserId").post(sendConnectionRequest);
router.route("/accept/:connectionId").put(acceptConnectionRequest);
router.route("/reject/:connectionId").put(rejectConnectionRequest);
router.route("/remove/:connectionId").delete(removeConnection);

export default router;
