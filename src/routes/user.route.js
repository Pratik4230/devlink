import { Router } from "express";

const router = Router();

import {
  register,
  login,
  logout,
  getProfile,
  updatePassword,
  updateHeadlineLocation,
  updateSkills,
  addEducation,
  addExperience,
  myProfile,
  getFeed,
} from "../controllers/user.js";
import authCheck from "../middlewares/authcheck.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/auth").get(authCheck, myProfile);

router.route("/profile/:userId").get(authCheck, getProfile);
router.route("/updatepassword").put(authCheck, updatePassword);
router.route("/headlinelocation").put(authCheck, updateHeadlineLocation);
router.route("/updateskills").put(authCheck, updateSkills);
router.route("/addeducation").post(authCheck, addEducation);
router.route("/addexperience").post(authCheck, addExperience);

router.route("/feed").get(authCheck, getFeed);

export default router;
