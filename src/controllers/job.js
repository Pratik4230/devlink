import { isValidObjectId } from "mongoose";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";

const createJob = async (req, res) => {
  try {
    const companyId = req.user._id;

    const isCompany = await Company.findById(companyId);
    if (!isCompany) {
      return res.status(404).json({ message: "only Company can create job" });
    }

    const {
      title,
      description,
      location,
      requirements,
      skills,
      minSalary,
      maxSalary,
      type,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !requirements ||
      !skills ||
      !minSalary ||
      !maxSalary
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const job = new Job({
      title,
      description,
      location,
      company: companyId,
      requirements,
      skills,
      minSalary,
      maxSalary,
      type,
    });

    await job.save();

    return res
      .status(201)
      .json({ message: "Job created successfully", data: job });
  } catch (error) {
    console.log("job create error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "job id is not valid" });
    }

    const {
      title,
      description,
      location,
      requirements,
      skills,
      minSalary,
      maxSalary,
      type,
      status,
    } = req.body;

    const isCompany = await Company.findById(req.user._id);
    if (!isCompany) {
      return res.status(404).json({ message: "only Company can update job" });
    }

    const job = await Job.findByIdAndUpdate(
      { _id: jobId },
      {
        title,
        description,
        location,
        requirements,
        skills,
        minSalary,
        maxSalary,
        type,
        status,
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res
      .status(200)
      .json({ message: "Job updated successfully", data: job });
  } catch (error) {
    console.log("job update error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "job id is not valid" });
    }

    const isCompany = await Company.findById(req.user._id);
    if (!isCompany) {
      return res.status(404).json({ message: "only Company can delete job" });
    }

    const job = await Job.findByIdAndDelete(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res
      .status(200)
      .json({ message: "Job deleted successfully", data: job });
  } catch (error) {
    console.log("job delete error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const toggleJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "job id is not valid" });
    }

    const isCompany = await Company.findById(req.user._id);
    if (!isCompany) {
      return res.status(404).json({ message: "only Company can update job" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status === "active") {
      const isActive = await Job.findByIdAndUpdate(
        { _id: jobId, status: "active" },
        { status: "closed" },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Job status updated successfully", data: isActive });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      { _id: jobId, status: "closed" },
      { status: "active" },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Job status updated successfully", data: updatedJob });
  } catch (error) {
    console.log("job update error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getCompanyJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: "company id is not valid" });
    }
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const jobs = await Job.find({ company: companyId })
      .populate("company", "companyName companySize locations website bio logo")
      .select("-__v");
    if (!jobs) {
      return res.status(404).json({ message: "Jobs not found" });
    }
    return res
      .status(200)
      .json({ message: "Jobs found successfully", data: jobs });
  } catch (error) {
    console.log("getCompanyJobs error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createJob, updateJob, deleteJob, toggleJobStatus, getCompanyJobs };
