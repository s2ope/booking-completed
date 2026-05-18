import axios from "axios";

const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_CLOUDINARY_API_URL;
const UPLOAD_PRESET = "upload";

export const uploadImage = async (file) => {
  if (!file) return "";

  if (!CLOUDINARY_UPLOAD_URL) {
    throw new Error("Cloudinary upload URL is not configured.");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_UPLOAD_URL, data);
    const imageUrl = response.data?.secure_url || response.data?.url;

    if (!imageUrl) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return imageUrl;
  } catch (error) {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Image upload failed.";

    throw new Error(message);
  }
};
