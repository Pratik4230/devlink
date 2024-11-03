import { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    Image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);

export default Post;
