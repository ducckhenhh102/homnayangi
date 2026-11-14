import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function generateUploadSignature(subfolder = 'restaurants') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const rootFolder = process.env.CLOUDINARY_FOLDER_ROOT || 'hom-nay-an-gi';

  if (!cloudName || !apiKey || !apiSecret) {
    const err = new Error('Chưa cấu hình thông tin Cloudinary trên máy chủ.');
    err.statusCode = 500;
    err.code = 'CLOUDINARY_CONFIG_MISSING';
    throw err;
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `${rootFolder}/${subfolder}`;

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  };
}

export async function destroyImage(publicId) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
