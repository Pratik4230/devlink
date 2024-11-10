import mongoose, { isValidObjectId } from "mongoose";
import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { toUserId } = req.params;
    const SevenDays = 7 * 24 * 60 * 60 * 60 * 1000;

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

    const recentlyRejected = await Connection.findOne({
      $or: [
        { requester: userId, receiver: toUserId },
        { requester: toUserId, receiver: userId },
      ],
      status: "idle",
      rejectedAt: { $gte: new Date(Date.now() - SevenDays) },
    });

    if (recentlyRejected) {
      return res.status(403).json({
        message: `Cannot send connection request to ${DevlinkUser?.fullname}  within 7 days`,
      });
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

    const connection = await Connection.findOneAndUpdate(
      { _id: connectionId, status: "pending", receiver: userId },
      { status: "idle", rejectedAt: new Date() },
      { new: true }
    );

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

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      status: "connected",
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

    let connections = await Connection.aggregate([
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
        $lookup: {
          from: "users",
          localField: "requester",
          foreignField: "_id",
          as: "requester",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $unwind: "$requester",
      },
      {
        $unwind: "$receiver",
      },

      {
        $addFields: {
          connectedUser: {
            $cond: {
              if: { $eq: ["$requester", userId] },
              then: "$receiver",
              else: "$requester",
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          "connectedUser._id": 1,
          "connectedUser.fullname": 1,
          "connectedUser.avatar": 1,
          "connectedUser.headline": 1,
        },
      },
    ]);
    console.log(connections);

    // connections = connections.filter((connection) => {
    //   console.log(
    //     connection?.connectedUser?._id?.toString() == userId?.toString()
    //   );
    //   return connection?.connectedUser?._id?.toString() != userId?.toString();
    // });

    console.log("connections", connections);

    if (!connections.length) {
      return res.status(204).json({
        message: "No connections found",
      });
    }

    res
      .status(200)
      .json({ message: "connections found successfully", data: connections });
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
          RequesterId: "$Requester._id",
          createdAt: 1,
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
          receiverId: "$Receiver._id",
          createdAt: 1,
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

export {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnections,
  getConnectionRequestsReceived,
  getConnectionRequestsSent,
};
