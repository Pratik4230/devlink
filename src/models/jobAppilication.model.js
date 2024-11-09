import { model, Schema } from "mongoose";

const jobApplicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "viewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const JobApplication = model("JobApplication", jobApplicationSchema);

export default JobApplication;
