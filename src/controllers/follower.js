import mongoose, { isValidObjectId } from "mongoose";
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
        .json({ message: " unfollowed ", isFollowing: false });
    }

    const follow = await Follower.create({
      follower: userId,
      following: companyId,
    });
    if (!follow) {
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({ message: "following", isFollowing: true });
  } catch (error) {
    console.log("toggleFollow error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getFollowers = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }

    const followers = await Follower.aggregate([
      {
        $match: {
          following: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "Follower",
        },
      },
      {
        $unwind: "$Follower",
      },

      {
        $project: {
          _id: 1,
          following: 1,
          createdAt: 1,
          "Follower.fullname": 1,
          "Follower._id": 1,
          "Follower.avatar": 1,
          "Follower.headline": 1,
          "Follower.location": 1,
        },
      },
    ]);

    if (!followers || !followers.length) {
      return res.status(204).json({ message: "No followers found" });
    }

    return res
      .status(200)
      .json({ message: "Followers found successfully", data: followers });
  } catch (error) {
    console.log("getFollowers error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { toggleFollow, getFollowers };
