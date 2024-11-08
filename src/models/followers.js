import { model, Schema } from "mongoose";

const followerSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Follower = model("Follower", followerSchema);

export default Follower;
