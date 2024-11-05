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
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    expiresAt: {
      type: Date,
      default: function () {
        return Date.now() + 24 * 60 * 60 * 1000;
      },
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Highlight = model("Highlight", highlightSchema);

export default Highlight;
