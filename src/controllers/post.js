import Post from "../models/post.model.js";
import User from "../models/user.model.js";

const createPost = async (req, res) => {
  try {
    const userId = req.user?._id;

    const { content, Image } = req.body;

    if (!content && !Image) {
      return res
        .status(400)
        .json({ message: "Please provide content or Image" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      content,
      Image,
      author: user._id,
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

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
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

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
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

const getPosts = async (req, res) => {};
export { createPost, updatePost, deletePost };
