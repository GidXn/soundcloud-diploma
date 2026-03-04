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
            alert("Помилка логіну: " + (err as AxiosError).message);
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
            <div className="login_form_container">
                <div className="login_second_container_text baloo2">
                    <h1>Sign into your account</h1>
                </div>

                <div className="login_third_google_facebook_container">
                    <div className="login_third_google_button baloo2">
                        <div className="oauth-wrap">
                            <button type="button" className="oauth-btn">
                                <img src="src/images/icons/google_icon.png" alt="" className="oauth-btn__icon" />
                                Sign in with Google
                            </button>
                            <div className="oauth-overlay">
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

                    <button className="login_third_google_button baloo2 text-white"><img
                        src="src/images/icons/facebook_icon.png" alt="facebook"/> Sign in with
                        Facebook
                    </button>
                </div>

                <form onSubmit={onFinish} className="login_fourth_login_container" noValidate>
                    <div className="login_fourth_text_or baloo2">
                        <label>OR</label>
                    </div>

                    <div className="login_fourth_emailLogin_container">
                        <label className="login_fourth_emailLogin_container_text baloo2" htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" className="login_fourth_emailLogin_input baloo2" placeholder="Enter your email" required />
                    </div>

                    <div className="login_fourth_emailLogin_container">
                        <label className="login_fourth_emailLogin_container_text baloo2" htmlFor="password">Password</label>
                        <input type={showPassword ? "text" : "password"} id="password" name="password" className="login_fourth_emailLogin_input baloo2" placeholder="Enter your password" required />
                        <button type="button" className="eye_icon_position" onClick={() => setShowPassword(!showPassword)}>
                            <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                        </button>
                    </div>

                    <div className="login_fifth_forgot_password_container">
                        <a href="/forgot-password" className="baloo2">Forgot your Password?</a>
                    </div>

                    <div className="sixth_login_button_container">
                        <button type="submit" className="baloo2 login_sixth_button">Sign In</button>
                    </div>
                    <div className="login_seventh_container">
                        <label className="baloo2">Don’t have an account? <a href="/signup" className="text-purple underline">Sign up</a></label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
