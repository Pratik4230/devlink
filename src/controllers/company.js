import bcrypt from "bcrypt";
import Company from "../models/company.model.js";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import {
  validateCompany,
  validateCompanyLogin,
} from "../models/company.model.js";
import Follower from "../models/followers.js";

const tokenOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createToken = (comapnyId, email) => {
  return jwt.sign({ _id: comapnyId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const removePassword = (company) => {
  let companyWithoutPassword = company.toObject();
  delete companyWithoutPassword.password;
  return companyWithoutPassword;
};

const comapnyRegister = async (req, res) => {
  try {
    const { error } = validateCompany(req?.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { companyName, email, password, about, bio, website, companySize } =
      req?.body;

    const alreadyExist = await Company.findOne({
      email: email,
      companyName: companyName,
    });
    if (alreadyExist) {
      return res.status(400).json({ message: "Company already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 11);

    const company = new Company({
      companyName: companyName,
      email: email,
      password: hashedPassword,
      about: about,
      bio: bio,
      website: website,
      companySize: companySize,
    });

    await company.save();

    const createdCompany = await Company.findOne({
      email: email,
      companyName: companyName,
    });
    if (!createdCompany) {
      return res
        .status(500)
        .json({ message: "Company not created. Please try again" });
    }

    const token = createToken(createdCompany._id, createdCompany.email);

    const companyWithoutPassword = removePassword(createdCompany);

    return res.status(200).cookie("token", token, tokenOptions).json({
      message: "Company registered successfully",
      data: companyWithoutPassword,
    });
  } catch (error) {
    console.log("register error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const comapnyLogin = async (req, res) => {
  try {
    const { error } = validateCompanyLogin(req?.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const company = await Company.findOne({ email: email });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const validPassword = await bcrypt.compare(password, company.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = createToken(company._id, company.email);

    const companyWithoutPassword = removePassword(company);

    return res
      .status(200)
      .cookie("token", token, tokenOptions)
      .json({ message: "Login successful", data: companyWithoutPassword });
  } catch (error) {
    console.log("login error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const companyLogout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({ message: "Logout successful" });
  } catch (error) {
    console.log("company logout error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const companyProfile = async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }

    const isFollowing = await Follower.exists({
      following: companyId,
      follower: userId,
    });

    const companyWithoutPassword = removePassword(company);

    return res.status(200).json({
      message: "company profile",
      data: { ...companyWithoutPassword, isFollowing },
    });
  } catch (error) {
    console.log("company profile error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const myCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user._id;

    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }

    const companyWithoutPassword = removePassword(company);

    return res
      .status(200)
      .json({ message: "company profile", data: companyWithoutPassword });
  } catch (error) {
    console.log("company profile error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateCompanyData = async (req, res) => {
  try {
    const comapnyId = req.user._id;

    if (!isValidObjectId(comapnyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }

    const { email, companyName } = req.body;
    if (email || companyName) {
      return res.status(403).json({
        message: "Updating email or company name is not allowed.",
      });
    }

    const company = await Company.findByIdAndUpdate(comapnyId, req.body, {
      new: true,
    });
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }

    const companyWithoutPassword = removePassword(company);

    return res.status(200).json({
      message: "company profile updated",
      data: companyWithoutPassword,
    });
  } catch (error) {
    console.log("updateCompanyData error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  comapnyRegister,
  comapnyLogin,
  companyLogout,
  companyProfile,
  updateCompanyData,
  myCompanyProfile,
};
