import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import AvatarEditor from "react-avatar-editor";
import axiosInstance from "../api/axios";

export default function ProfileModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;
  const editorRef = useRef(null);
  const [image, setImage] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSave1 = async () => {
    if (!editorRef.current) return;

    const canvas = editorRef.current.getImageScaledToCanvas();

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "profile.png", {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axiosInstance.post(
          "/api/auth/profile-image",
          formData
        );

        const imageUrl = res.data;
        console.log("Uploaded image URL:", imageUrl);

        localStorage.setItem("image", imageUrl);
        setImage(null);
        onClose();
      } catch (err) {
        console.error("Profile image upload failed:", err);
      }
    }, "image/png");
  };

  const handleSave = async () => {
    if (!editorRef.current) return;

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    const canvas = editorRef.current.getImageScaledToCanvas();

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setUploadError("Failed to process image");
        setUploading(false);
        return;
      }

      const file = new File([blob], "profile.png", { type: "image/png" });

      // Client-side validation
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Image must be under 2MB");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axiosInstance.post(
          "/api/update/profile",
          formData,
          {
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return;
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            },
          }
        );
        console.log("Uploaded image URL:", res);
        const imageUrl = res.data;
        const updatedUser = { ...user, profileLink: imageUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUploading(false);
        setImage(null);
        onClose();
      } catch (err) {
        setUploading(false);

        // 👇 Pass Spring error to UI
        if (err.response) {
          setUploadError(
            err.response.data?.message ||
            err.response.data ||
            "Upload failed"
          );
        } else {
          setUploadError("Network error");
        }
      }
    }, "image/png");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };
  // console.log(user);
  const logout = () => {
    localStorage.removeItem("spj");
    localStorage.removeItem("user");
    window.location.reload();
  }
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[480px] rounded-xl shadow-lg p-6 relative">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* ================= PROFILE IMAGE SECTION ================= */}
        <div className="flex flex-col items-center gap-4 mb-6">

          {/* Current Image */}
          {!image && (
            <img
              src={user?.profileLink}
              className="w-24 h-24 rounded-full border object-cover"
              alt="profile"
            />
          )}

          {/* Change Photo Button */}
          {!image && (
            <label className="px-4 py-1 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {/* Image Editor Section */}
          {image && (
            <div className="flex flex-col items-center gap-3 w-full">

              <AvatarEditor
                ref={editorRef}
                image={image}
                width={200}
                height={200}
                border={40}
                borderRadius={100}
                scale={1.2}
                rotate={0}
              />

              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-4 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 text-white hover:bg-green-600 transition"
              >
                {uploading ? "Uploading..." : "Save"}
              </button>

              {/* Progress */}
              {uploading && (
                <div className="w-full">
                  <div className="text-sm text-gray-600 mb-1 text-center">
                    Uploading… {uploadProgress}%
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-600 text-center">
                  {uploadError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= USER INFO SECTION ================= */}
        <div className="space-y-3 mb-6">
          <input
            className="border px-3 py-2 rounded-lg w-full"
            defaultValue={user?.name || "User Name"}
          />
          <input
            className="border px-3 py-2 rounded-lg w-full"
            defaultValue={user?.email || "user@email.com"}
          />
          <input
            className="border px-3 py-2 rounded-lg w-full"
            defaultValue={user?.phone || "9999999999"}
          />
        </div>

        {/* ================= LOGOUT ================= */}
        <button
          onClick={logout}
          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </div>
    ,
    document.getElementById("modal-root")
  );
}
