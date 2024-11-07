import Joi from "joi";
import mongoose, { model, Schema } from "mongoose";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
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

    companySize: {
      type: Number,
      required: true,
    },

    locations: {
      type: [String],
    },

    website: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      required: true,
    },

    logo: {
      type: String,
    },

    about: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

function validateCompany(company) {
  const schema = Joi.object({
    companyName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    about: Joi.string().min(10).max(1000).required(),
    bio: Joi.string().min(5).required(),
    website: Joi.string().required(),
    companySize: Joi.number().required(),
  });
  return schema.validate(company);
}

function validateCompanyLogin(company) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(company);
}

const Company = model("Company", companySchema);
export { validateCompany, validateCompanyLogin };
export default Company;
