import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

const authCheck = async (req, res, next) => {
  const { token } = req?.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized 1" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized 2" });
  }

  const { _id, email } = decoded;

  const user = await User.findOne({ _id, email });

  const company = await Company.findOne({ _id, email });

  if (!user && !company) {
    return res.status(401).json({ message: "Unauthorized 3" });
  }

  if (!user) {
    req.user = company;
    return next();
  }
  req.user = user;

  next();
};

export default authCheck;
