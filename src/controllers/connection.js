import mongoose, { isValidObjectId } from "mongoose";
import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { toUserId } = req.params;

    if (!isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "receiver id is not valid" });
    }

    const isCompany = await Company.findById(userId);
    if (isCompany) {
      return res
        .status(400)
        .json({ message: "company cannot send connection request" });
    }

    const DevlinkUser = await User.findById(toUserId);
    if (!DevlinkUser) {
      return res.status(404).json({ message: "reciver is not Devlink user" });
    }

    if (userId == toUserId) {
      return res
        .status(400)
        .json({ message: "cannot send connection request to Yourself" });
    }

    const alreadyConnected = await Connection.findOne({
      $or: [
        { requester: userId, receiver: toUserId },
        { requester: toUserId, receiver: userId },
      ],
      status: "connected",
    });

    if (alreadyConnected) {
      return res.status(400).json({ message: "already connected." });
    }

    const pending = await Connection.findOne({
      $or: [
        { requester: userId, receiver: toUserId },
        { requester: toUserId, receiver: userId },
      ],
      status: "pending",
    });

    if (pending) {
      return res.status(400).json({ message: "connection already  pending." });
    }

    const newConnection = new Connection({
      requester: userId,
      receiver: toUserId,
      status: "pending",
    });

    await newConnection.save();
    res.status(200).json({
      message: `Connection request sent successfully to ${DevlinkUser?.fullname}`,
      data: newConnection,
    });
  } catch (error) {
    console.log("connection request send error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(connectionId)) {
      return res.status(400).json({ message: "connection id is not valid " });
    }

    const connection = await Connection.findOneAndUpdate(
      { _id: connectionId, status: "pending", receiver: userId },
      { status: "connected" },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({
        message: "Connection request not found or already connected.",
      });
    }

    res.status(200).json({
      message: "Connection request accepted successfully.",
      data: connection,
    });
  } catch (error) {
    console.log("Accept connection error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(connectionId)) {
      return res.status(400).json({ message: "connection id is not Valid" });
    }

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      status: "pending",
      receiver: userId,
    });

    if (!connection) {
      return res
        .status(404)
        .json({ message: "Connection request not found or already handled." });
    }

    res.status(200).json({
      message: "Connection request rejected successfully.",
      data: connection,
    });
  } catch (error) {
    console.log("reject connection error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    if (!isValidObjectId(connectionId)) {
      return res.status(400).json({ message: "connection id is not Valid" });
    }

    const allowedStatus = ["connected", "pending"];

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      status: { $in: allowedStatus },
    });

    if (!connection) {
      return res
        .status(404)
        .json({ message: "Connection request not found or already handled." });
    }

    res.status(200).json({ message: "Connection removed successfully." });
  } catch (error) {
    console.log("reject connection error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requester: userId }, { receiver: userId }],
      status: "connected",
    })
      .populate("requester", "fullname avatar headline _id")
      .populate("receiver", "fullname avatar headline _id")
      .select("status createdAt _id");

    if (!connections || !connections.length) {
      return res.status(204).json({
        message: "No connections found",
      });
    }

    const connectedUsers = connections.map((data) => {
      const { _id, status, createdAt } = data;
      if (data.requester._id.toString() == userId.toString()) {
        return {
          connectionId: _id,
          status: status,
          createdAt: createdAt,
          fullname: data?.receiver?.fullname,
          headline: data?.receiver?.headline,
          avatar: data?.receiver?.avatar,
          nextUserId: data?.receiver?._id,
        };
      }
      return {
        connectionId: _id,
        status: status,
        createdAt: createdAt,
        fullname: data?.requester?.fullname,
        headline: data?.requester?.headline,
        avatar: data?.requester?.avatar,
        nextUserId: data?.requester?._id,
      };
    });

    res.status(200).json({
      message: "connections found successfully",
      data: connectedUsers,
    });
  } catch (error) {
    console.log("get connections error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// TODO
const getConnectionRequestsReceived = async (req, res) => {
  try {
    const userId = req.user._id;

    let connectionsRequestsReceived = await Connection.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          status: "pending",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "requester",
          foreignField: "_id",
          as: "Requester",
        },
      },
      {
        $unwind: "$Requester",
      },
      {
        $project: {
          status: 1,
          fullname: "$Requester.fullname",
          headline: "$Requester.headline",
          avatar: "$Requester.avatar",
          nextUserId: "$Requester._id",
          createdAt: 1,
          connectionId: "$_id",
        },
      },
    ]);

    if (!connectionsRequestsReceived.length) {
      return res.status(204).json({
        message: "No connections found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "connectionsRequestsReceived found successfully",
      data: connectionsRequestsReceived,
    });
  } catch (error) {
    console.log("get connection requests received error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// TODO
const getConnectionRequestsSent = async (req, res) => {
  try {
    const userId = req.user._id;

    let connectionsRequestsSent = await Connection.aggregate([
      {
        $match: {
          requester: new mongoose.Types.ObjectId(userId),
          status: "pending",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "Receiver",
        },
      },
      {
        $unwind: "$Receiver",
      },
      {
        $project: {
          status: 1,
          fullname: "$Receiver.fullname",
          headline: "$Receiver.headline",
          avatar: "$Receiver.avatar",
          nextUserId: "$Receiver._id",
          createdAt: 1,
          connectionId: "$_id",
        },
      },
    ]);

    if (!connectionsRequestsSent.length) {
      return res.status(204).json({
        message: "No connections found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "connectionsRequestsSent found successfully",
      data: connectionsRequestsSent,
    });
  } catch (error) {
    console.log("get connection requests sent error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUsersFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    const connectionsRequests = await Connection.find({
      $or: [{ requester: userId }, { receiver: userId }],
    });

    const ingnoreUsersFromFedd = new Set();
    connectionsRequests.forEach((connection) => {
      ingnoreUsersFromFedd.add(connection.requester.toString());
      ingnoreUsersFromFedd.add(connection.receiver.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: Array.from(ingnoreUsersFromFedd) } },
      ],
    }).select("fullname avatar headline _id education skills");

    return res.status(200).json({
      message: "users found successfully",
      data: users,
    });
  } catch (error) {
    console.log("get users feed error : ", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    const searchRegex = new RegExp(query, "i");

    const results = await User.find({
      $or: [
        { fullname: { $regex: searchRegex } },
        { headline: { $regex: searchRegex } },
        { skills: { $regex: searchRegex } },
      ],
    }).select("fullname avatar headline _id education skills");

    if (results.length === 0) {
      return res.status(204).json({ message: "No results found", data: [] });
    }

    return res.status(200).json({
      message: "Search results fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnections,
  getConnectionRequestsReceived,
  getConnectionRequestsSent,
  getUsersFeed,
  searchUsers,
};
