import { useEffect, useState } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function ProfileSidebar({ activeTab, setActiveTab }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    return (
        <div
            className="
                fixed bottom-0 left-0 right-0 z-10
                md:static md:sticky md:top-24
                bg-white border border-[#E3E8E6]
                md:rounded-xl
                md:p-6
            "
        >
            <div className="flex md:flex-col w-full">

                {/* DESKTOP PROFILE INFO */}
                <div className="hidden md:flex flex-col items-center py-6 border-b">
                    <img
                        src={user?.profileLink}
                        alt="profile"
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <h3 className="font-semibold mt-2">{user?.name}</h3>
                    <p className="text-sm text-gray-600">{user?.phone}</p>
                    <p className="text-sm text-gray-500 text-center">
                        {user?.email}
                    </p>
                </div>

                {/* MENU */}
                <div className="flex md:flex-col w-full space-y-2 md:mt-4 m-1 overflow-x-auto md:overflow-visible">

                    <SidebarButton
                        label="Bookings"
                        active={activeTab === "bookings"}
                        onClick={() => setActiveTab("bookings")}
                    />

                    <SidebarButton
                        label="Profile"
                        active={activeTab === "edit"}
                        onClick={() => setActiveTab("edit")}
                    />

                    <SidebarButton
                        label="Security"
                        active={activeTab === "security"}
                        onClick={() => setActiveTab("security")}
                    />

                    <SidebarButton
                        label="Feedback"
                        active={activeTab === "feedback"}
                        onClick={() => setActiveTab("feedback")}
                    />

                    <SidebarButton
                        className={`hidden md:block text-left text-red-300 hover:bg-red-100 hover:text-red-500`}
                        label="Logout"
                        active={false}
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    />

                </div>

            </div>
        </div>
    );
}

function SidebarButton({ label, active, onClick, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full
                flex
                items-center
                justify-center md:justify-start
                px-6
                py-3
                text-sm md:text-base
                font-medium
                transition-all duration-200
                hover:scale-[1.02]
                active:scale-[0.98]
                rounded-lg
                ${active
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${className}
            `}
        >
            {label}
        </button>
    );
}