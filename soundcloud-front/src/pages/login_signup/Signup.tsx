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

        // client-side validations
        if (username.length < 3 || username.length > 40) {
            alert("Invalid name length. The login cannot be less than 3 characters and more than 40 characters!");
            return;
        }

        // password requirements
        const passwordRequirements = [] as string[];
        if (password.length < 8) passwordRequirements.push("Be at least 8 characters long");
        if (!/[A-Z]/.test(password)) passwordRequirements.push("Contain at least one uppercase letter");
        if (!/[0-9]/.test(password)) passwordRequirements.push("Contain at least one number");
        if (passwordRequirements.length > 0) {
            alert(passwordRequirements.map(item => `- ${item}`).join("\n"));
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
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
            // custom server messages
            if (apiMsg.includes("This name is already registered")) {
                alert("This name is already registered");
                return;
            }
            if (apiMsg.includes("Invalid name length")) {
                alert("Invalid name length. The login cannot be less than 3 characters and more than 40 characters!");
                return;
            }
            if (apiMsg.includes("User with this email address already exists")) {
                alert("User with this email address already exists.");
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
        <div className="background_style min-h-screen flex items-center justify-center">
            <div className="signin_form_container">
                {/* Left side - Input fields */}
                <div className="signup_left_container">
                    {/* Logo and heading */}
                    <div className="signup_header">
                        <img src="public/logo_Allurew.png" alt="Allure Logo" className="signup_logo" />
                        <h1 className="signup_heading_main">Join Allure</h1>
                        <p className="signup_heading_sub">Join the community Allure.</p>
                        <p className="signup_login_prompt">Already have an account? <a href="/login" className="signup_login_link">Sign In</a></p>
                    </div>

                    <form onSubmit={onFinish} className="signup_form" noValidate autoComplete="off">
                        {/* Name field */}
                        <div className="signup_input_group">
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                className="signup_input" 
                                placeholder="Name" 
                                autoComplete="off" 
                                required 
                            />
                        </div>

                        {/* Email field */}
                        <div className="signup_input_group">
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                className="signup_input" 
                                placeholder="EMail" 
                                required 
                                autoComplete="off" 
                            />
                        </div>

                        {/* Password field */}
                        <div className="signup_input_group">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name="password" 
                                className="signup_input" 
                                placeholder="Enter Password" 
                                required 
                                autoComplete="new-password" 
                            />
                            <button 
                                type="button" 
                                className="signup_eye_icon" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                            </button>
                        </div>

                        {/* Confirm Password field */}
                        <div className="signup_input_group">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                className="signup_input" 
                                placeholder="Repeat the Password" 
                                required 
                                autoComplete="off" 
                            />
                            <button 
                                type="button" 
                                className="signup_eye_icon" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                            </button>
                        </div>

                        {/* Sign Up button */}
                        <button type="submit" className="signup_button">Sign Up</button>

                        {/* OR separator */}
                        <div className="signup_or_separator">
                            <span>or</span>
                        </div>

                        {/* Social login buttons */}
                        <div className="signup_social_buttons">
                            {/* Google button */}
                            <div className="signup_oauth_wrap">
                                <button type="button" className="signup_oauth_btn">
                                    <img src="public/google.png" alt="Google" />
                                </button>
                                <div className="signup_oauth_overlay">
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

                            {/* Facebook button */}
                            <button type="button" className="signup_oauth_btn signup_facebook_btn">
                                <img src="public/facebook.png" alt="Facebook"/>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right side - Banner */}
                <div className="signup_right_container">
                    <img src="public/auth_banner.png" alt="Allure Banner" className="signup_banner" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
