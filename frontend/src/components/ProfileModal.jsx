import React from "react";
import ReactDOM from "react-dom";

export default function ProfileModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;
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
          <img
            src={user?.image}
            className="w-20 h-20 rounded-full border object-cover"
            alt="profile"
          />
          <button className="px-3 py-1 border rounded-lg text-sm">
            Change Photo
          </button>
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
