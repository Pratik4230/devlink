import { model, Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    requirements: {
      type: String,
      required: true,
    },

    skills: {
      type: [String],
      required: true,
    },

    minSalary: {
      type: String,
      required: true,
    },
    maxSalary: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = model("Job", jobSchema);

export default Job;
