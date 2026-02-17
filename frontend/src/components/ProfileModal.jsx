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
          "/api/auth/profile-image",
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
        localStorage.setItem("image", imageUrl);

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
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("spj");
    localStorage.removeItem("image");
    window.location.reload();
  }
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[450px] rounded-xl shadow-lg p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">My Profile</h2>

        {/* Profile Image */}
        <div className="flex items-center gap-4 mb-4">
          {!image && <img
            src={user?.image}
            className="w-20 h-20 rounded-full border object-cover"
            alt="profile"
          />}
          {/* <button className="px-3 py-1 border rounded-lg text-sm">
            Change Photo
          </button>
          <input className="px-3 py-1 border rounded-lg text-sm" name="Change Photo" type="file" accept="image/*" onChange={handleImageChange} /> */}
          <label
            className="
              inline-flex items-center justify-center
              px-3 py-1
              border border-gray-300
              rounded-lg
              text-sm font-medium
              cursor-pointer
              bg-white
              hover:bg-gray-100
              active:scale-95
              transition
            "
          >Change Photo
            <input
              type="file"
              name="change profile photo"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {image && (<>
            <AvatarEditor
              ref={editorRef}
              image={image}
              width={200}
              height={200}
              border={50}
              borderRadius={100}
              scale={1.2}
              rotate={0}
              className=""
            />
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save"}
            </button>
            {uploading && (
              <div className="w-full mt-3">
                <div className="text-sm text-gray-600 mb-1">
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
              <p className="mt-2 text-sm text-red-600">
                {uploadError}
              </p>
            )}
          </>)}
        </div>

        {/* User Info */}
        <div className="space-y-3">
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
            defaultValue={user?.mobile || "9999999999"}
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="mt-5 w-full py-2 bg-red-500 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
