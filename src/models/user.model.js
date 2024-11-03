import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    headline: {
      type: String,
      maxlength: 100,
    },

    skills: [{ type: String }],

    experience: [
      {
        jobTitle: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    education: [
      {
        institution: String,
        degree: String,
        startDate: Date,
        endDate: Date,
      },
    ],

    location: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "company"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
