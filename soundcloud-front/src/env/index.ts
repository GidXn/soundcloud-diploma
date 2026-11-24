const REMOTE_BASE_URL: string = import.meta.env.VITE_BASE_URL;
const ACCESS_KEY: string = import.meta.env.VITE_ACCESS_KEY;

const APP_ENV = {
    REMOTE_BASE_URL,
    ACCESS_KEY,
}

export { APP_ENV };