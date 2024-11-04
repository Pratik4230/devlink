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

    expiresAt: {
      type: Date,
      default: function () {
        return Date.now() + 24 * 60 * 60 * 1000;
      },
      index: { expires: "0s" },
    },
  },
  { timestamps: true }
);

const Highlight = model("Highlight", highlightSchema);

export default Highlight;
