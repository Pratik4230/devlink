import mongoose, { model, Schema } from "mongoose";

const connectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["idle", "pending", "connected"],
      default: "idle",
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

connectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });

const Connection = model("Connection", connectionSchema);

export default Connection;
