const REMOTE_BASE_URL: string = import.meta.env.VITE_BASE_URL;
const ACCESS_KEY: string = import.meta.env.VITE_ACCESS_KEY;

const APP_ENV = {
    REMOTE_BASE_URL,
    ACCESS_KEY,
}

// Backend address in one place: VITE_BASE_URL (".../api") from .env, local dev server by default
export const API_BASE_URL: string = (REMOTE_BASE_URL || "http://localhost:5122/api").replace(/\/+$/, "");
// Origin for media paths ("/uploads/...") and non-/api routes ("/auth/google")
export const API_ORIGIN: string = API_BASE_URL.replace(/\/api$/, "");

export { APP_ENV };
