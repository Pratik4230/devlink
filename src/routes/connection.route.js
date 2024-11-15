import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnections,
  getConnectionRequestsReceived,
  getConnectionRequestsSent,
  getUsersFeed,
} from "../controllers/connection.js";

router.use(authCheck);

router.route("/send/:toUserId").post(sendConnectionRequest);
router.route("/accept/:connectionId").put(acceptConnectionRequest);
router.route("/reject/:connectionId").put(rejectConnectionRequest);
router.route("/remove/:connectionId").delete(removeConnection);
router.route("/connections").get(getConnections);
router.route("/requestsreceived").get(getConnectionRequestsReceived);
router.route("/requestssent").get(getConnectionRequestsSent);
router.route("/feed").get(getUsersFeed);

export default router;
