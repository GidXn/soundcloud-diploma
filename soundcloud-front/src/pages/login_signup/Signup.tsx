import React, {useState} from "react";
import "../../styles/login_signup/background.css";
import {useDispatch} from "react-redux";
import {setUser} from "../../store/slices/userSlice";
import {useNavigate} from "react-router-dom";
import {normalizeUser} from "../../utilities/normalizeUser.ts";
import {AxiosError} from "axios";
import {register} from "../../services/authApi.ts";
import "../../styles/login_signup/layout.css"
import "../../styles/login_signup/login_signup_form.css"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const Signup: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onFinish = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            alert("Паролі не співпадають!");
            return;
        }

        try {
            const data = await register(username, email, password, confirmPassword);
            if (!data.token) {
                alert("Помилка: токен не отримано");
                return;
            }
            const user = normalizeUser(data.token);
            if (!user) {
                alert("Помилка: не вдалося отримати дані користувача");
                return;
            }
            localStorage.setItem("token", data.token);
            dispatch(setUser({ user, token: data.token }));
            navigate("/home");
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
            const apiMsg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? "";
            const status = axiosErr.response?.status;
            if ((status === 400 || status === 409) && apiMsg.includes("Google-акаунта")) {
                alert(
                    "Цей email вже прив'язаний до Google. Увійдіть через Google, а потім у профілі встановіть локальний пароль (Меню → Профіль → Встановити пароль)."
                );
                return;
            }
            if ((status === 400 || status === 409) && apiMsg) {
                alert("Помилка реєстрації: " + apiMsg);
                return;
            }
            alert("Помилка реєстрації: " + (axiosErr.message || "невідома помилка"));
        }
    };

    const msgFromError = (e: unknown) =>
        e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        const idToken = response.credential;
        if (!idToken) {
            alert("No credential from Google");
            return;
        }

        try {
            const res = await fetch("http://localhost:5122/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                alert(`Google login failed: ${res.status}\n${errBody}`);
                return;
            }

            const data = await res.json();
            const token = data?.token;
            if (!token) {
                alert("Google login failed: missing token in response");
                return;
            }

            localStorage.setItem("token", token);
            const user = normalizeUser(token) ?? { id: data.id!, username: data.username!, email: data.email!, avatarUrl: data.avatarUrl, totalPlays: 0 };
            dispatch(setUser({ user, token }));
            navigate("/home");
        } catch (e: unknown) {
            alert("Network error: " + msgFromError(e));
        }
    };

    const handleGoogleError = () => {
        console.error("Google Login Failed");
        alert("Google login failed");
    };

    return (
        <div className="background_style min-h-screen flex items-center justify-center px-4">
            <div className="signup_wrapper max-w-5xl w-full flex gap-8 items-center">
                {/* Ліва колонка - форма */}
                <div className="signup_form_section flex-1">
                    <div className="signup_header mb-6">
                        <h2 className="baloo2 text-3xl font-bold text-white mb-2">Allure</h2>
                        <h1 className="baloo2 text-2xl font-bold text-white mb-2">Join Allure</h1>
                        <p className="text-gray-300 text-sm">Join the community Allure.</p>
                    </div>

                    <form onSubmit={onFinish} noValidate autoComplete="off">
                        {/* Username */}
                        <div className="mb-4">
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                className="baloo2 w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                placeholder="Name" 
                                autoComplete="off" 
                                required 
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4 relative">
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                className="baloo2 w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                placeholder="EMail" 
                                required 
                                autoComplete="off" 
                            />
                            <img src="/user.png" alt="user" className="absolute right-4 top-3 w-5 h-5 opacity-60" />
                        </div>

                        {/* Password */}
                        <div className="mb-4 relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name="password" 
                                className="baloo2 w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                placeholder="Enter password" 
                                required 
                                autoComplete="new-password" 
                            />
                            <img src="/show_password.png" alt="show" className="absolute right-4 top-3 w-5 h-5 opacity-60 cursor-pointer" />
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6 relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                className="baloo2 w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                placeholder="Repeat the password" 
                                required 
                                autoComplete="off" 
                            />
                            <img src="/show_password.png" alt="show" className="absolute right-4 top-3 w-5 h-5 opacity-60 cursor-pointer" />
                        </div>

                        {/* Sign Up Button */}
                        <button 
                            type="submit" 
                            className="baloo2 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:opacity-90 transition mb-6"
                        >
                            Sign Up
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-gray-600"></div>
                            <span className="text-gray-400 text-sm">or</span>
                            <div className="flex-1 h-px bg-gray-600"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="flex gap-4 mb-6">
                            {/* Facebook */}
                            <button 
                                type="button" 
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition"
                            >
                                <img src="/facebook.png" alt="facebook" className="w-5 h-5" />
                            </button>

                            {/* Google - with overlay */}
                            <div className="flex-1 relative">
                                <button 
                                    type="button" 
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                    <img src="/google.png" alt="google" className="w-5 h-5" />
                                </button>
                                <div className="absolute inset-0 opacity-0">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        theme="filled_blue"
                                        size="large"
                                        text="signin_with"
                                        shape="pill"
                                        width="100%"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Google Login Overlay - REMOVED */}

                        {/* Sign In Link */}
                        <p className="baloo2 text-center text-gray-400 text-sm">
                            Already have an account? <a href="/login" className="text-purple-400 hover:text-purple-300 underline">Sign in</a>
                        </p>
                    </form>
                </div>

                {/* Права колонка - Банер */}
                <div className="signup_banner_section flex-1 hidden lg:block">
                    <img src="/auth_banner.png" alt="banner" className="w-full h-auto rounded-3xl shadow-2xl" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
