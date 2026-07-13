import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = process.env;

let isCloudinaryConfigured = false;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
  isCloudinaryConfigured = true;
  console.log("☁️  Cloudinary storage integration initialized successfully.");
} else {
  console.warn("⚠️  Cloudinary environment variables are missing. Media uploads will run in sandbox/simulation mode.");
}

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an asset buffer to Cloudinary or simulate the upload if credentials are missing.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "sitemint_media",
  fileName?: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    // Simulate upload and return a realistic fallback URL
    const randId = Math.random().toString(36).substring(2, 15);
    const mockPublicId = `${folder}/${randId}`;
    const mockUrl = `https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop`; // generic high-quality premium image placeholder
    
    console.log(`[SIMULATION] Uploaded file "${fileName || "unnamed"}" to mock storage path "${mockPublicId}"`);
    return {
      url: mockUrl,
      publicId: mockPublicId
    };
  }

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: fileName ? fileName.split(".")[0] : undefined
      },
      (error, result) => {
        if (error || !result) {
          console.error("❌ Cloudinary upload error:", error);
          reject(error || new Error("Failed to upload asset to Cloudinary."));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete an asset from Cloudinary.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured) {
    console.log(`[SIMULATION] Deleted mock storage asset "${publicId}"`);
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error(`❌ Cloudinary deletion error for public ID ${publicId}:`, error);
    return false;
  }
}
