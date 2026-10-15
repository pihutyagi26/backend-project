
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// console.log("Cloudinary credentials loaded:", {
//     cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
//     apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
//     apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
// });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Cloudinary upload successful:", response.secure_url);

        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);

        return null;

    } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};

export { uploadOnCloudinary };
