import User, {
  validateUser,
  validateLogin,
  validateExperience,
  validateEducation,
} from "../models/user.model.js";
import bcrypt from "bcrypt";

import Post from "../models/post.model.js";

import jwt from "jsonwebtoken";

const tokenOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createToken = (userId, email) => {
  return jwt.sign({ _id: userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const removePassword = (user) => {
  let userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

const register = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, fullname, password } = req?.body;

    const alreadyExist = await User.findOne({ email: email });
    if (alreadyExist) {
      return res.status(400).json({ message: "User already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 11);

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await user.save();

    const createdUser = await User.findOne({ email: email });
    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "User not created. Please try again" });
    }

    const token = createToken(createdUser._id, createdUser.email);

    const userWithoutPassword = removePassword(createdUser);

    return res.status(201).cookie("token", token, tokenOptions).json({
      message: "User created successfully.",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log("register error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { error } = validateLogin(req?.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = createToken(user._id, user.email);

    const userWithoutPassword = removePassword(user);

    return res
      .status(200)
      .cookie("token", token, tokenOptions)
      .json({ message: "Login successful", data: userWithoutPassword });
  } catch (error) {
    console.log("login error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("logout error : ", error);
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req?.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithoutPassword = removePassword(user);

    return res.status(200).json({
      message: "Profile fetched successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log("getProfile error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Login first" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 11);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("password change error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateHeadlineLocation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { headline, location } = req.body;

    if (!headline && !location) {
      return res
        .status(400)
        .json({ message: "Please provide at least one field" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Login first" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (headline) {
      user.headline = headline;
    }

    if (location) {
      user.location = location;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Headline and location updated successfully" });
  } catch (error) {
    console.log("updateHeadlineLocation error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSkills = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { skills } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Login first" });
    }

    if (!skills) {
      return res
        .status(400)
        .json({ message: "Please provide at least one skill" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.skills = skills;
    await user.save();

    return res.status(200).json({ message: "Skills updated successfully" });
  } catch (error) {
    console.log("updateSkills error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addEducation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const newEducation = req.body;

    const { error } = validateEducation(newEducation);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { education: newEducation },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Education added successfully" });
  } catch (error) {
    console.log("addEducation error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addExperience = async (req, res) => {
  try {
    const userId = req.user?._id;
    const newExperience = req.body;

    const { error } = validateExperience(newExperience);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { experience: newExperience },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Experience added successfully" });
  } catch (error) {
    console.log("addExperience error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const myProfile = async (req, res) => {
  try {
    const userId = req?.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithoutPassword = removePassword(user);

    return res.status(200).json({
      message: "Profile fetched successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log("getProfile error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: "$authorDetails",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          isLiked: {
            $cond: {
              if: { $in: [userId, "$likes.likedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          likeCount: 1,
          isLiked: 1,
          author: {
            _id: "$authorDetails._id",
            fullname: "$authorDetails.fullname",
            headline: "$authorDetails.headline",
            avatar: "$authorDetails.avatar",
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (!posts.length) {
      return res.status(204).json({ message: "No posts found" });
    }

    return res
      .status(200)
      .json({ message: "Feed fetched successfully", data: posts });
  } catch (error) {
    console.log("getFeed error: ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
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
};
