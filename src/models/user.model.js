import mongoose, { model, Schema } from "mongoose";
import Joi from "joi";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 8,
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

    experience: {
      jobTitle: { type: String },
      company: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      description: { type: String },
    },

    education: {
      institution: { type: String },
      degree: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },

    location: {
      type: String,
    },
  },
  { timestamps: true }
);

function validateUser(user) {
  const schema = Joi.object({
    fullname: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(user);
}

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(user);
}

function validateExperience(experience) {
  const schema = Joi.object({
    jobTitle: Joi.string().required(),
    company: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    description: Joi.string(),
  });
  return schema.validate(experience);
}

function validateEducation(education) {
  const schema = Joi.object({
    institution: Joi.string().required(),
    degree: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
  });
  return schema.validate(education);
}

const User = model("User", userSchema);
export { validateUser, validateLogin, validateExperience, validateEducation };
export default User;
