import { isValidObjectId } from "mongoose";
import Company from "../models/company.model.js";
import Follower from "../models/followers.js";

const toggleFollow = async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }

    const isCompany = await Company.findById(userId);
    if (isCompany) {
      return res
        .status(404)
        .json({ message: "company cannot follow other company" });
    }

    const alreadyFollowed = await Follower.findOneAndDelete({
      follower: userId,
      following: companyId,
    });
    if (alreadyFollowed) {
      return res
        .status(200)
        .json({ message: " unfollow ", isFollowing: false });
    }

    const follow = await Follower.create({
      follower: userId,
      following: companyId,
    });
    if (!follow) {
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({ message: "follow", isFollowing: true });
  } catch (error) {
    console.log("toggleFollow error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFollowers = async (req, res) => {};

export { toggleFollow };
