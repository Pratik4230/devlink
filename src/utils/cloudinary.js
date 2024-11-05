import { v2 as cloudinary } from "cloudinary";

import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = async (filePath) => {
  try {
    if (!filePath) {
      return null;
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("file uploaded to cloudinary");
    return uploadResult;
  } catch (error) {
    console.log("cloundinary upload error : ", error);
  }
};

const cloudinaryDelete = async (public_id, resource_type = "image") => {
  try {
    if (!public_id) {
      return null;
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: `${resource_type}`,
    });

    return result;
  } catch (error) {
    console.log("delete from cloudinary failed", error);
    return error;
  }
};

export { cloudinaryUpload, cloudinaryDelete };
