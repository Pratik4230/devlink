import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Highlight from "../models/highlight.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "post id is not valid" });
    }

    const userId = req.user?._id;

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = await Like.findOne({ likedBy: userId, post: postId });
    if (isLiked) {
      await Like.findByIdAndDelete(isLiked?._id);
      return res
        .status(200)
        .json({ message: "Post unliked successfully", isLiked: false });
    }

    const like = new Like({
      likedBy: userId,
      post: postId,
    });

    if (!like) {
      return res
        .status(500)
        .json({ message: "Like not created Please try again" });
    }

    await like.save();

    return res
      .status(200)
      .json({ message: "Post liked successfully", isLiked: true });
  } catch (error) {
    console.log("post like error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: "comment id is not valid" });
    }

    if (!commentId) {
      return res.status(400).json({ message: "Comment id is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isLiked = await Like.findOne({ likedBy: userId, comment: commentId });
    if (isLiked) {
      await Like.findByIdAndDelete(isLiked?._id);
      return res
        .status(200)
        .json({ message: "Comment unliked successfully", isLiked: false });
    }

    const like = new Like({
      likedBy: userId,
      comment: commentId,
    });

    if (!like) {
      return res
        .status(500)
        .json({ message: "Like not created Please try again" });
    }

    await like.save();

    return res
      .status(200)
      .json({ message: "Comment liked successfully", isLiked: true });
  } catch (error) {
    console.log("comment like error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getLikedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const Likedposts = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "posts",
        },
      },
      { $unwind: "$posts" },

      {
        $lookup: {
          from: "users",
          localField: "posts.author",
          foreignField: "_id",
          as: "postOwner",
        },
      },

      {
        $addFields: {
          postOwner: {
            $first: "$postOwner",
          },
        },
      },

      {
        $lookup: {
          from: "likes",
          localField: "posts._id",
          foreignField: "post",
          as: "likes",
        },
      },

      {
        $addFields: {
          likes: {
            $size: { $ifNull: ["$likes", []] },
          },
        },
      },

      {
        $project: {
          _id: 1,
          likes: 1,
          "posts._id": 1,
          "posts.content": 1,
          "posts.createdAt": 1,
          "postOwner._id": 1,
          "postOwner.fullname": 1,
          "postOwner.headline": 1,
          "postOwner.avatar": 1,
        },
      },
    ]);

    if (!Likedposts || Likedposts.length === 0) {
      return res.status(204).json({ message: "No liked posts found" });
    }

    return res.status(200).json({ message: "Liked posts", Likedposts });
  } catch (error) {
    console.log("getLikedPosts error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { likePost, likeComment, getLikedPosts };
