import { isValidObjectId } from "mongoose";
import Job from "../models/job.model.js";
import JobApplication from "../models/jobAppilication.model.js";
import User from "../models/user.model.js";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";

const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const filePath = req.file?.path;

    console.log("filePath", filePath);

    if (!filePath) {
      return res.status(400).json({ message: "Please provide a resume" });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "job id is not valid" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isUser = await User.findById(userId);
    if (!isUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isApplied = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    });

    if (isApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    const uploadResult = await cloudinaryUpload(filePath);
    console.log("up res", uploadResult);

    if (!uploadResult) {
      return res
        .status(500)
        .json({ message: "Resume upload failed. Try again." });
    }

    const application = new JobApplication({
      job: jobId,
      applicant: userId,
      resume: {
        url: uploadResult?.url,
        public_id: uploadResult?.public_id,
      },
    });

    await application.save();

    return res.status(200).json({
      message: "Job applied successfully",
      data: application,
    });
  } catch (error) {
    console.log("job application error : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO
const getAppliedJobs = async (req, res) => {};

export { applyJob };
