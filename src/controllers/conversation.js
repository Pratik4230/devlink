import { isValidObjectId } from "mongoose";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;
    const { content } = req.body;

    if (!isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "receiver id is not valid" });
    }

    if (senderId == receiverId) {
      return res
        .status(400)
        .json({ message: "cannot send message to yourself" });
    }

    const isUser = await User.findById(receiverId);
    if (!isUser) {
      return res.status(404).json({ message: "receiver not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    conversation.messages.push({
      sender: senderId,
      content,
    });

    await conversation.save();

    return res.status(200).json({
      message: "Message sent successfully",
      data: conversation,
    });
  } catch (error) {
    console.log("send message error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const senderId = req.user._id;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "message id is not valid" });
    }

    const conversation = await Conversation.findOne({
      "messages._id": messageId,
      participants: senderId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "message not found" });
    }

    const myMsgIdx = conversation.messages.findIndex((msg) => {
      return (
        msg._id.toString() === messageId &&
        msg.sender.toString() === senderId.toString()
      );
    });

    if (myMsgIdx === -1) {
      return res
        .status(401)
        .json({ message: "Only sender can delete this message" });
    }

    conversation.messages.splice(myMsgIdx, 1);

    await conversation.save();

    return res.status(200).json({
      message: "Message deleted successfully",
      data: conversation,
    });
  } catch (error) {
    console.log("delete message error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getConversation = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "receiver id is not valid" });
    }

    if (senderId == receiverId) {
      return res
        .status(400)
        .json({ message: "cannot get conversation with yourself" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    })
      .populate("participants", "fullname email")
      .populate("messages.sender", "fullname email");

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" });
    }

    return res.status(200).json({
      message: "Conversation found successfully",
      data: conversation,
    });
  } catch (error) {
    console.log("get conversation error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { sendMessage, deleteMessage, getConversation };
