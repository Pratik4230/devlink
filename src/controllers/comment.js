import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

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

    const comment = new Comment({
      content,
      author: req.user?._id,
      post: postId,
    });

    if (!comment) {
      return res
        .status(500)
        .json({ message: "Comment not created Please try again" });
    }

    await comment.save();

    return res
      .status(200)
      .json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.log("addComment error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: "comment id is not valid" });
    }

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author?.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: "only owner can edit comment" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      { _id: commentId },
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedComment) {
      return res
        .status(500)
        .json({ message: "Failed to update comment Please try again" });
    }

    return res
      .status(200)
      .json({ message: "comment updated successfully", data: updateComment });
  } catch (error) {
    console.log("comment update error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ message: "Commentid is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author?.toString() !== req.user?._id.toString()) {
      return res
        .status(401)
        .json({ message: "only owner can delete the comment" });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res
        .status(500)
        .json({ message: "failed to delete comment Please try again" });
    }

    return res.status(200).json({ message: "comment deleted Successfully" });
  } catch (error) {
    console.log("delete comment error : ", error);
    return res.status(500).json({ message: "Internal server error " });
  }
};

// TODO
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "post id is not valid" });
    }

    const isPostExist = await Post.findById(postId);
    if (!isPostExist) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
        },
      },
      {
        $addFields: {
          users: {
            $first: "$users",
          },
          likeCount: {
            $size: { $ifNull: ["$likes", []] },
          },
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
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          content: 1,
          _id: 1,
          createdAt: 1,
          likeCount: 1,
          users: {
            fullname: 1,
            headline: 1,
            _id: 1,
            avatar: 1,
          },
          isLiked: 1,
        },
      },
    ]);

    if (!comments.length) {
      return res.status(204).json({ message: "Comments not found" });
    }

    return res
      .status(200)
      .json({ message: "Comments fetched successfully", data: comments });
  } catch (error) {
    console.log("getPostComments error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { addComment, updateComment, deleteComment, getPostComments };
