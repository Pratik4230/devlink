import { Router } from "express";

const router = Router();

import authCheck from "../middlewares/authcheck.js";
import {
  comapnyRegister,
  comapnyLogin,
  companyLogout,
  companyProfile,
  updateCompanyData,
  myCompanyProfile,
} from "../controllers/company.js";

router.route("/register").post(comapnyRegister);
router.route("/login").post(comapnyLogin);
router.route("/logout").post(authCheck, companyLogout);
router.route("/profile/:companyId").get(authCheck, companyProfile);
router.route("/update").put(authCheck, updateCompanyData);

router.route("/auth").get(authCheck, myCompanyProfile);

export default router;
