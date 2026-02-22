import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Outlet />
        </div>
    );
}
