import React, {useState} from "react";
import "../../styles/login_signup/background.css";
import {useDispatch} from "react-redux";
import {setUser} from "../../store/slices/userSlice";
import {useNavigate} from "react-router-dom";
import {normalizeUser} from "../../utilities/normalizeUser.ts";
import {AxiosError} from "axios";
import {login} from "../../services/authApi.ts";
import "../../styles/login_signup/layout.css"
import "../../styles/login_signup/login_signup_form.css"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onFinish = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const data = await login(email, password);
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
            // show friendly message when credentials are wrong
            if (err instanceof AxiosError && err.response?.status === 401) {
                alert("The username or password you entered is incorrect.");
            } else {
                alert("Помилка логіну: " + (err as AxiosError).message);
            }
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
            <div className="signin_form_container login_window">
                {/* left side inputs */}
                <div className="signup_left_container login_left">
                    <div className="signup_header">
                        <img src="public/logo_Allurew.png" alt="Allure Logo" className="signup_logo" />
                        <h1 className="signup_heading_main">Log in to Allure</h1>
                        <p className="signup_heading_sub">Login to access your favorite tracks.</p>
                    </div>

                    <form onSubmit={onFinish} className="signup_form" noValidate autoComplete="off">
                        {/* email with user icon */}
                        <div className="signup_input_group login_email_group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="signup_input"
                                placeholder="EMail"
                                required
                                autoComplete="off"
                            />
                            <img src="public/user.png" alt="user icon" className="input_icon" />
                        </div>

                        {/* password */}
                        <div className="signup_input_group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="signup_input"
                                placeholder="Enter Password"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="signup_eye_icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img src="public/show_password.png" alt="show_password_icon"/>
                            </button>
                        </div>

                        {/* login buttons */}
                        <button type="submit" className="signup_button login_primary">Log In</button>
                        <button type="button" className="signup_button login_secondary" onClick={() => navigate('/signup')}>Register</button>

                        <div className="signup_forgot_center">
                            <a href="/forgot-password" className="signup_login_prompt">Forgot Password?</a>
                        </div>

                        <div className="signup_or_separator login_or">
                            <span>or</span>
                        </div>

                        <div className="signup_social_buttons">
                            <button type="button" className="signup_oauth_btn signup_facebook_btn">
                                <img src="public/facebook.png" alt="Facebook"/>
                            </button>
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
                        </div>
                    </form>
                </div>
                {/* right banner */}
                <div className="signup_right_container">
                    <img src="public/auth_banner.png" alt="Allure Banner" className="signup_banner" />
                </div>
            </div>
        </div>
    );
};

export default Login;
