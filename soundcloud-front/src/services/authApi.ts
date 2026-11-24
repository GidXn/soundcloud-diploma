import api from "../utilities/axiosInstance.ts";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/auth";

const extractServerMsg = (data: unknown): string | undefined => {
    if (!data) return;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
        const d = data as { error?: string; message?: string; detail?: string };
        return d.error || d.message || d.detail;
    }
};

export const register = async (username: string, email: string, password: string, confirmPassword:string) => {
    const response = await api.post(`${API_URL}/User/register`, { username, email, password, confirmPassword});
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post(`${API_URL}/User/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

// // new: POST-request to the backend to set a local password
// export const setLocalPassword = async (password: string, confirmPassword: string) => {
//     // eslint-disable-next-line no-useless-catch
//     try {
//         // const response = await api.post('/auth/set-local-password', { password, confirmPassword });
//         // return response.data;  // Returns data from the backend (e.g. success or an updated token)
//         // api has baseURL = http://localhost:5122/api
//         // So the path is relative to /api:
//         const { data } = await api.post('/User/password/set', {
//             password,
//             confirmPassword,
//         });
//         return data;
//     } catch (error) {
//         throw error;  // Error handling (the backend throws if passwords don't match or on other validation errors)
//     }
// };

export const setLocalPassword = async (password: string, confirmPassword: string) => {
    // 1) simplest form
    try {
        const { data } = await api.post("/User/password/set", { password, confirmPassword });
        return data;
    } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 400) throw err;
        // 2) variant with newPassword
        try {
            const { data } = await api.post("/User/password/set", { newPassword: password, confirmPassword });
            return data;
        } catch (err2) {
            if (!axios.isAxiosError(err2) || err2.response?.status !== 400) throw err2;
            // 3) variant with oldPassword (empty for google-only)
            try {
                const { data } = await api.post("/User/password/set", {
                    oldPassword: "",
                    newPassword: password,
                    confirmPassword,
                });
                return data;
            } catch (err3) {
                // return a readable error message from the server
                if (axios.isAxiosError(err3)) {
                    const msg = extractServerMsg(err3.response?.data);
                    throw new Error(msg || "Failed to set password");
                }
                throw err3;
            }
        }
    }
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");