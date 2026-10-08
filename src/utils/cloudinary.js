import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: 'process.env.CLOUDUNARY_CLOUD_NAME',
    api_key: 'process.env.CLOUDINARY_API_KEY',
    api_secret: 'process.env.CLOUDINARY_APT_SECRET'
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        //upload file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uplodeed
        console.log("file is uploaded on clodinary" , response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temprary file as the upload opration got failed
        return null;
    }
}

export{uploadOnCloudinary}