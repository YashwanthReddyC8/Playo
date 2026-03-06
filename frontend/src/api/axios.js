import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8040",
    withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("spj");
    if (token && !config.headers?.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            window.dispatchEvent(new CustomEvent("auth:expired"));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
