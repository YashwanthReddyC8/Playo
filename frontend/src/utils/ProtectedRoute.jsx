import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { isSessionValid } from "./auth";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

export const PlayerProtectedRoute = () => {
    const [isReady, setIsReady] = useState(false);
    const { user, logout } = useAuthStore();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("spj");
            const userRaw = localStorage.getItem("user");
            if (!token || !userRaw) {
                toast.error("Please log in to access this page.");
                logout();
                return;
            }

            let parsedUser = null;
            try {
                parsedUser = JSON.parse(userRaw);
            } catch {
                parsedUser = null;
            }

            if (!parsedUser) {
                toast.error("Session data corrupted. Please log in again.");
                logout();
                return;
            }

            const role = (parsedUser.role || "").toString().toUpperCase();
            if (role && role !== "PLAYER" && role !== "USER") {
                toast.error("Unauthorized access. Admin users cannot access this area.");
                logout();
                return;
            }

            if (isSessionValid(token, parsedUser)) {
                setIsReady(true);
                return;
            }

            toast.error("Session expired. Please log in again.");
            logout();
        };

        verify();
    }, [logout]);

    if (!isReady) return null;
    return <Outlet />;
};

export const AdminProtectedRoute = () => {
    const [isReady, setIsReady] = useState(false);
    const { logout } = useAuthStore();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("spj");
            const userRaw = localStorage.getItem("user");
            if (!token || !userRaw) {
                toast.error("Please log in as an admin.");
                logout();
                return;
            }

            let user = null;
            try {
                user = JSON.parse(userRaw);
            } catch {
                user = null;
            }

            if (!user) {
                toast.error("Invalid session. Please log in as admin.");
                logout();
                return;
            }

            const role = (user.role || "").toString().toUpperCase();
            if (role !== "ADMIN") {
                toast.error("Unauthorized. Admin access required.");
                logout();
                return;
            }

            if (isSessionValid(token, user)) {
                setIsReady(true);
                return;
            }

            toast.error("Session expired. Please log in again.");
            logout();
        };

        verify();
    }, [logout]);

    if (!isReady) return null;
    return <Outlet />;
};

export const OwnerProtectedRoute = () => {
    const [isReady, setIsReady] = useState(false);
    const { logout } = useAuthStore();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("spj");
            const userRaw = localStorage.getItem("user");
            if (!token || !userRaw) {
                toast.error("Please log in as an owner.");
                logout();
                return;
            }

            let user = null;
            try {
                user = JSON.parse(userRaw);
            } catch {
                user = null;
            }

            if (!user) {
                toast.error("Invalid session. Please log in as owner.");
                logout();
                return;
            }

            const role = (user.role || "").toString().toUpperCase();
            if (role !== "OWNER") {
                toast.error("Unauthorized. Owner access required.");
                logout();
                return;
            }

            if (isSessionValid(token, user)) {
                setIsReady(true);
                return;
            }

            toast.error("Session expired. Please log in again.");
            logout();
        };

        verify();
    }, [logout]);

    if (!isReady) return null;
    return <Outlet />;
};

export default PlayerProtectedRoute;
