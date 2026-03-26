import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import ProfileSidebar from "./components/ProfileSideBar";
import BookingsPage from "./components/BookingsPage";
import EditProfile from "./components/EditProfile";
import Feedback from "./components/Feedback";
import ChangePassword from "./components/ChangePassword";

export default function Player() {
    const [activeTab, setActiveTab] = useState("bookings");
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    // Redirect unauthenticated users to login
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Please Log In
                    </h1>
                    <p className="text-gray-600 mb-8">
                        You need to be logged in to access your profile
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6 m-2 mx-4 md:m-10">
            {/* <div className="max-w-6xl mx-auto"> */}
            {/* Sidebar */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                <ProfileSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>

            {/* Content */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-white border border-[#E3E8E6] rounded-xl min-h-[600px] mb-20 md:mb-0">

                {activeTab === "bookings" && <BookingsPage />}
                {activeTab === "edit" && <EditProfile />}
                {activeTab === "security" && <ChangePassword />}
                {activeTab === "feedback" && <Feedback />}

            </div>
            {/* </div> */}
        </div>
    );
}