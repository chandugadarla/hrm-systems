import { useRef, useState } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function CloudinaryUpload({
  currentImage,
  onUpload,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert(
        "Cloudinary configuration is missing. Check frontend/.env"
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary error:", data);
        throw new Error(
          data?.error?.message || "Cloudinary upload failed"
        );
      }

      // Cloudinary's permanent HTTPS image URL
      onUpload(data.secure_url);

    } catch (error) {
      console.error("Cloudinary upload error:", error);

      alert(
        error.message ||
          "Failed to upload image. Please check Cloudinary settings."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="cloudinary-profile-upload">

      <div className="profile-image-wrapper">
        {currentImage ? (
          <img
            src={currentImage}
            alt="Profile"
            className="profile-cloudinary-image"
          />
        ) : (
          <div className="profile-image-placeholder">
            HR
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        hidden
      />

      <button
        type="button"
        className="change-profile-image-btn"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Change Photo"}
      </button>

    </div>
  );
}
