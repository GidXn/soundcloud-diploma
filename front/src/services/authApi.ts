import api from "../utilities/axiosInstance.ts";
import axios from "axios";

const extractServerMsg = (data: unknown): string | undefined => {
    if (!data) return;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
        const d = data as { error?: string; message?: string; detail?: string };
        return d.error || d.message || d.detail;
    }
};

export const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    const response = await api.post("/User/register", { username, email, password, confirmPassword});
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post("/User/login", { email, password });
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");
