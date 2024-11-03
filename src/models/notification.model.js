import { model, Schema } from "mongoose";

const notificationSchema = new Schema();

const Notification = model("Notification", notificationSchema);

export default Notification;
