import { useState } from "react";
import ProfileSidebar from "./components/ProfileSideBar";
import BookingsPage from "./components/BookingsPage";
import EditProfile from "./components/EditProfile";
import Feedback from "./components/Feedback";

export default function Player() {
    const [activeTab, setActiveTab] = useState("bookings");

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
                {activeTab === "feedback" && <Feedback />}

            </div>
            {/* </div> */}
        </div>
    );
}