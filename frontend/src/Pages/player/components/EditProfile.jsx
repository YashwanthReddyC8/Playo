import { useEffect, useRef, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import AvatarEditor from "react-avatar-editor";
import axiosInstance from "../../../api/axios";
import { useUser } from "../../../utils/userContext";
import { EditProfileSkeleton } from "./Skeletons";
import toast from "react-hot-toast";

export default function EditProfile() {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);


    const { user, updateUser } = useUser();
    const [form, setForm] = useState(null);

    const [image, setImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setForm(user);
    }, [user]);

    /* ---------------- Image Selection ---------------- */
    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            console.error("Invalid file type:", file.type);
            setUploadError("Only image files allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            console.error("File too large:", file.size);
            setUploadError("Image must be under 5MB");
            return;
        }

        setUploadError("");
        console.log("Selected file:", file);
        setImage(file);
    };
    const handleSave = async () => {
        const nameChanged =
            form?.name?.trim() !== user?.name?.trim();

        const imageChanged = !!editorRef.current;

        if (!nameChanged && !imageChanged) return;

        console.log("Saving profile with form data:", form);

        try {
            setUploading(true);
            setUploadError("");

            const formData = new FormData();

            // Only append name if changed
            if (nameChanged) {
                formData.append("name", form.name.trim());
            }

            // Only append image if changed
            if (imageChanged) {
                const canvas =
                    editorRef.current.getImageScaledToCanvas();

                const blob = await new Promise(resolve =>
                    canvas.toBlob(resolve, "image/png")
                );

                if (!blob) throw new Error("Image processing failed");

                formData.append("file", blob, "profile.png");
            }

            const res = await axiosInstance.post(
                "/api/update/profile",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => {
                        if (!e.total) return;
                        setUploadProgress(Math.round((e.loaded * 100) / e.total));
                    },
                }
            );

            const imageUrl = res.data;

            const updatedUser = {
                ...user,
                name: nameChanged ? form.name.trim() : user.name,
                image: imageChanged ? imageUrl : user.image,
            };

            updateUser(updatedUser);
            setImage(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Upload failed";
            setUploadError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    /* ---------------- Form Change ---------------- */
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (!user || !form) {
        return <EditProfileSkeleton />;
    }

    return (
        <div className="p-6">
            {/* ================= Avatar Section ================= */}
            <div className="flex justify-center items-center border-b pb-8 relative">
                <div className="relative">

                    {/* Normal View */}
                    {!image && (
                        <>
                            <div className="bg-green-600 text-white rounded-full p-1 shadow">
                                <img
                                    src={user.image}
                                    alt="profile"
                                    className="w-28 h-28 rounded-full object-cover border-2 border-white"
                                />

                                {/* Pencil Overlay */}
                                <div
                                    onClick={handleIconClick}
                                    className="cursor-pointer absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition"
                                >
                                    <PencilIcon className="w-4 h-4 text-gray-600" />
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </>
                    )}

                    {/* Edit Mode */}
                    {image && (
                        <div className="flex flex-col items-center gap-4">
                            <AvatarEditor
                                ref={editorRef}
                                image={image}
                                width={200}
                                height={200}
                                border={30}
                                borderRadius={100}
                                scale={1.2}
                            />

                            {uploading && (
                                <div className="w-full">
                                    <div className="text-sm text-center mb-1">
                                        Uploading... {uploadProgress}%
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded">
                                        <div
                                            className="h-2 bg-green-500 rounded"
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
            </div>

            {/* ================= Form Section ================= */}
            <div className="mt-10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Name *
                        </label>
                        <input
                            name="name"
                            value={form.name || ""}
                            onChange={handleChange}
                            className="w-full h-10 px-3 border border-[#E3E8E6] rounded-md focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phone
                        </label>
                        <input
                            value={form.mobile || ""}
                            disabled
                            className="w-full h-10 px-3 bg-gray-100 border border-[#E3E8E6] rounded-md"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                            Email *
                        </label>
                        <input
                            value={form.email || ""}
                            disabled
                            className="w-full h-10 px-3 bg-gray-100 border border-[#E3E8E6] rounded-md"
                        />
                    </div>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                        onClick={() => { setForm(user); setImage(null); setUploadError(""); }}
                        className="px-6 h-10 border border-[#E3E8E6] rounded-md"
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        {uploading ? "Uploading..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
