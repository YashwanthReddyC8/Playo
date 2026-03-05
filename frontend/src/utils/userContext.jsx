import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const logout = useCallback((msg = "Logged out successfully") => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("spj");
        navigate("/");
        toast.success(msg, { id: `logout:${msg}` });
    }, [navigate]);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        const handleAuthExpired = () => {
            if (!localStorage.getItem("spj")) return;
            logout("Session expired. Please log in again.");
        };

        window.addEventListener("auth:expired", handleAuthExpired);
        return () => window.removeEventListener("auth:expired", handleAuthExpired);
    }, [logout]);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
