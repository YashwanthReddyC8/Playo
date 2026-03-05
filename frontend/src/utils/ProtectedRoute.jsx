import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { isSessionValid } from "./auth";
import { useUser } from "./userContext";

export const PlayerProtectedRoute = () => {
    const [isReady, setIsReady] = useState(false);
    const { logout } = useUser();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("spj");
            const userRaw = localStorage.getItem("user");
            if (!token || !userRaw) {
                logout("Please log in to access this page.");
                return;
            }

            let user = null;
            try {
                user = JSON.parse(userRaw);
            } catch {
                user = null;
            }

            if (!user) {
                logout("Please log in to access this page.");
                return;
            }

            const role = (user.role || "").toString().toUpperCase();
            if (role && role !== "PLAYER" && role !== "USER") {
                logout("Unauthorized access.");
                return;
            }

            if (isSessionValid(token, user)) {
                setIsReady(true);
                return;
            }

            logout("Session expired. Please log in again.");
        };

        verify();
    }, [logout]);

    if (!isReady) return null;
    return <Outlet />;
};

export const AdminProtectedRoute = () => {
    const [isReady, setIsReady] = useState(false);
    const { logout } = useUser();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("spj");
            const userRaw = localStorage.getItem("user");
            if (!token || !userRaw) {
                logout("Please log in.");
                return;
            }

            let user = null;
            try {
                user = JSON.parse(userRaw);
            } catch {
                user = null;
            }

            if (!user) {
                logout("Please log in as admin.");
                return;
            }

            const role = (user.role || "").toString().toUpperCase();
            if (role !== "ADMIN") {
                logout(`Unauthorized access.`);
                return;
            }

            if (isSessionValid(token, user)) {
                setIsReady(true);
                return;
            }

            logout("Session expired. Please log in again.");
        };

        verify();
    }, [logout]);

    if (!isReady) return null;
    return <Outlet />;
};

export default PlayerProtectedRoute;
