
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;

export const handleUpload = async (file) => {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: 'auto',
  });
  return res;
};
