import { model, Schema } from "mongoose";

const highlightSchema = new Schema(
  {
    content: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Highlight = model("Highlight", highlightSchema);

export default Highlight;
