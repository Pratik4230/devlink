import { Router } from "express";

const router = Router();

import {
  register,
  login,
  logout,
  getProfile,
  updatePassword,
  updateUserProfile,
  myProfile,
  getFeed,
} from "../controllers/user.js";
import authCheck from "../middlewares/authcheck.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(authCheck, logout);

router.route("/auth").get(authCheck, myProfile);

router.route("/profile/:userId").get(authCheck, getProfile);
router.route("/updatepassword").put(authCheck, updatePassword);
router.route("/update").put(authCheck, updateUserProfile);

router.route("/feed").get(authCheck, getFeed);

export default router;
