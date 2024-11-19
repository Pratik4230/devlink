import Highlight from "../models/highlight.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";
import Connection from "../models/connection.model.js";

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

const getHighlights = async (req, res) => {
  try {
    const userId = req.user._id;

    const connectionHighlights = await Connection.aggregate([
      {
        $match: {
          $or: [
            { requester: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
          status: "connected",
        },
      },

      {
        $addFields: {
          connectedUser: {
            $cond: {
              if: { $eq: ["$requester", new mongoose.Types.ObjectId(userId)] },
              then: "$receiver",
              else: "$requester",
            },
          },
        },
      },

      {
        $lookup: {
          from: "highlights",
          localField: "connectedUser",
          foreignField: "author",
          as: "highlights",
        },
      },

      { $unwind: "$highlights" },

      {
        $match: {
          "highlights.expiresAt": { $gte: new Date() },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "highlights.author",
          foreignField: "_id",
          as: "Author",
        },
      },

      { $unwind: "$Author" },

      {
        $project: {
          _id: 0,
          highlightId: "$highlights._id",
          content: "$highlights.content",
          author: "$Author.fullname",
          avatar: "$Author.avatar.url",
          authorId: "$Author._id",
          image: "$highlights.Image.url",
          createdAt: "$highlights.createdAt",
        },
      },
    ]);

    const UserHighlights = await Highlight.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
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
          _id: 0,
          highlightId: "$_id",
          content: "$content",
          author: "$Author.fullname",
          avatar: "$Author.avatar.url",
          authorId: "$Author._id",
          image: "$Image.url",
          createdAt: "$createdAt",
        },
      },
    ]);

    const highlights = [...connectionHighlights, ...UserHighlights];

    if (!highlights || highlights?.length == 0) {
      return res.status(204).json({ message: "No highlights found" });
    }

    return res
      .status(200)
      .json({ message: "Highlights found successfully", data: highlights });
  } catch (error) {
    console.log("error getting highlights", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createHighlight, deleteHighlight, getHighlights };
