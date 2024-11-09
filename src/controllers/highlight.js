import Highlight from "../models/highlight.model.js";
import { isValidObjectId } from "mongoose";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";

const createHighlight = async (req, res) => {
  try {
    const { content } = req.body;

    const ImagePath = req.file?.path;

    if (!ImagePath) {
      return res.status(400).json({ message: "Please provide  Image" });
    }

    const result = await cloudinaryUpload(ImagePath);
    if (!result) {
      return res
        .status(500)
        .json({ message: "Image not uploaded Please try again" });
    }

    const highlight = new Highlight({
      content,
      Image: {
        url: result.url,
        public_id: result.public_id,
      },
      author: req.user._id,
    });

    if (!highlight) {
      return res
        .status(500)
        .json({ message: "Highlight not created Please try again" });
    }

    await highlight.save();

    res
      .status(200)
      .json({ message: "Highlight created successfully", data: highlight });
  } catch (error) {
    console.log("create Highlight error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateHighlight = async (req, res) => {
  try {
    const user = req?.user;
    const { highlightId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(highlightId)) {
      return res.status(400).json({ message: "highlight id is not valid" });
    }

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }

    const highlight = await Highlight.findById(highlightId);
    if (!highlight) {
      return res.status(404).json({ message: "Highlight not found" });
    }

    if (highlight.author?.toString() != user?._id?.toString()) {
      return res
        .status(401)
        .json({ message: "Only owner can update Highlight" });
    }

    const updatedhighlight = await Highlight.findByIdAndUpdate(
      { _id: highlightId },
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedhighlight) {
      return res
        .status(500)
        .json({ message: "failed to update highlight Please try again" });
    }

    return res.status(200).json({
      message: "Highlight updated successfully",
      data: updatedhighlight,
    });
  } catch (error) {
    console.log("update Highlight error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteHighlight = async (req, res) => {
  try {
    const user = req?.user;
    const { highlightId } = req.params;

    if (!isValidObjectId(highlightId)) {
      return res.status(400).json({ message: "highlight id is not valid" });
    }

    const highlight = await Highlight.findById(highlightId);
    if (!highlight) {
      return res.status(404).json({ message: "Highlight not found" });
    }

    if (highlight.author?.toString() != user?._id?.toString()) {
      return res
        .status(401)
        .json({ message: "Only owner can delete Highlight" });
    }

    const deletedHighlight = await Highlight.findByIdAndDelete(highlightId);

    if (!deletedHighlight) {
      return res.status(404).json({ message: "Highlight not found" });
    }

    const result = cloudinaryDelete(highlight?.Image?.public_id);

    return res.status(200).json({ message: "Highlight deleted successfully" });
  } catch (error) {
    console.log("error deleting highlight", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createHighlight, updateHighlight, deleteHighlight };
