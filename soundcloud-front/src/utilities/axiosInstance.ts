import axios from "axios";
import { API_BASE_URL } from "../env/index";


const api = axios.create({
    // baseURL: import.meta.env.VITE_BASE_URL,
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;