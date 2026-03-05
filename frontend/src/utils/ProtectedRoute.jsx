import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { isSessionValid } from './auth';
import { useUser } from './userContext';

const ProtectedRoute = () => {
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);
    const { logout } = useUser();

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem('spj');
            const userRaw = localStorage.getItem('user');
            if (!token) {
                logout("Please log in to access this page.");
                return;
            }

            let user = null;
            if (userRaw) {
                try {
                    user = JSON.parse(userRaw);
                } catch (e) {
                    user = null;
                }
            }

            if (isSessionValid(token, user)) {
                setIsReady(true);
                return;
            }

            logout("Session expired. Please log in again.");
        };

        verify();
    }, [navigate]);

    if (!isReady) return null;
    return <Outlet />;
};

export default ProtectedRoute;
