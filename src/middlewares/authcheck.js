import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authCheck = async (req, res, next) => {
  const { token } = req?.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { _id, email } = decoded;

  const user = await User.findOne({ _id, email });

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;

  next();
};

export default authCheck;
