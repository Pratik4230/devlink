import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import {
  sendMessage,
  deleteMessage,
  getConversation,
} from "../controllers/conversation.js";

router.use(authCheck);

router.route("/send/:receiverId").post(sendMessage);
router.route("/delete/:messageId").delete(deleteMessage);
router.route("/conversation/:receiverId").get(getConversation);

export default router;
