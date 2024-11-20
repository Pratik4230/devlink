import { isValidObjectId } from "mongoose";
import Notification from "../models/notification.model.js";

const createNotification = async (reciptent, sender, type, content) => {
  try {
    const notification = new Notification({
      reciptent,
      sender,
      type,
      content,
    });
    await notification.save();
  } catch (error) {
    console.log("notification creation error: ", error);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      reciptent: req.user._id,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Notifications found successfully",
      data: notifications,
    });
  } catch (error) {
    console.log("getNotifications error: ", error);
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(notificationId)) {
      return res.status(400).json({ message: "notification id is not valid" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, reciptent: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "notification not found" });
    }

    return res.status(200).json({
      message: "Notification marked as read successfully",
      data: notification,
    });
  } catch (error) {
    console.log("markNotificationAsRead error: ", error);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(notificationId)) {
      return res.status(400).json({ message: "notification id is not valid" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      reciptent: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "notification not found" });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    console.log("deleteNotification error: ", error);
  }
};

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
