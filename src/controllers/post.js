import Company from "../models/company.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPost = async (req, res) => {
  try {
    const userId = req.user?._id;

    const { content, Image } = req.body;

    if (!content && !Image) {
      return res
        .status(400)
        .json({ message: "Please provide content or Image" });
    }

    let authorId;

    const user = await User.findById(userId);
    if (user) {
      authorId = user?._id;
    }
    const company = await Company.findById(userId);
    if (company) {
      authorId = company?._id;
    }
    if (!user && !company) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      content,
      Image,
      author: authorId,
    });

    if (!post) {
      return res
        .status(500)
        .json({ message: "Post not created Please try again" });
    }

    await post.save();

    return res.status(200).json({ message: "Post created successfully", post });
  } catch (error) {
    console.log("post create error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "post id is not valid" });
    }

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post?.author.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: "Only owner can edit post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      { _id: postId },
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res
        .status(404)
        .json({ message: "Something went wrong Please try again" });
    }

    return res
      .status(200)
      .json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    console.log("post update error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "post id is not valid" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post?.author.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: "Only owner can delete post" });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res
        .status(404)
        .json({ message: "something went wrong Please try again" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("post delete error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "user id is not valid" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const UserPosts = await Post.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "Like",
        },
      },

      {
        $addFields: {
          likeCount: {
            $size: "$Like",
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "Author",
        },
      },
      { $unwind: "$Author" },
      {
        $project: {
          content: 1,
          createdAt: 1,
          likeCount: 1,
          "Author.headline": 1,
          "Author.fullname": 1,
          "Author.avatar": 1,
          "Author._id": 1,
        },
      },
    ]);

    if (!UserPosts || UserPosts.length === 0) {
      return res.status(204).json({ message: "Posts not found" });
    }

    return res
      .status(200)
      .json({ message: "Posts found successfully", data: UserPosts });
  } catch (error) {
    console.log("getPosts error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export { createPost, updatePost, deletePost, getUserPosts };
