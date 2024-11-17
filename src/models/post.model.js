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

    Image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);

export default Post;
