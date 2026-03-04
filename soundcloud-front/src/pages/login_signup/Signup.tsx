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
        <div className="background_style min-h-screen flex items-center justify-center">
            <div className="signin_form_container">
                <div className="login_second_container_text baloo2">
                    <h1>Sign Up</h1>
                </div>
                <div className="login_third_google_facebook_container">
                    <div className="login_third_google_button baloo2">
                        <div className="oauth-wrap">
                            <button type="button" className="oauth-btn">
                                <img src="src/images/icons/google_icon.png" alt="" className="oauth-btn__icon " />
                                <span>Sign up with Google</span>
                            </button>
                            <div className="oauth-overlay text-white">
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
                        src="src/images/icons/facebook_icon.png" alt="facebook"/> Sign up with
                        Facebook
                    </button>
                </div>
                <form onSubmit={onFinish} className="login_fourth_login_container" noValidate autoComplete="off">
                    <div className="login_fourth_text_or baloo2">
                        <label>OR</label>
                    </div>
                    <div className="login_fourth_emailLogin_container">
                        <label className="baloo2" htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" className="baloo2 login_fourth_emailLogin_input" placeholder="Enter your username" autoComplete="off" required />
                    </div>

                    <div className="login_fourth_emailLogin_container">
                        <label className="login_fourth_emailLogin_container_text baloo2" htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" className="login_fourth_emailLogin_input baloo2" placeholder="Enter your email" required autoComplete="off" />
                    </div>

                    <div className="login_fourth_emailLogin_container">
                        <label className="login_fourth_emailLogin_container_text baloo2" htmlFor="password">Password</label>
                        <input type={showPassword ? "text" : "password"} id="password" name="password" className="login_fourth_emailLogin_input baloo2" placeholder="Enter your password" required autoComplete="new-password" />
                        <button type="button" className="eye_icon_position_signin" onClick={() => setShowPassword(!showPassword)}>
                            <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                        </button>
                    </div>

                    <div className="form_group">
                        <label className="login_fourth_emailLogin_container_text baloo2" htmlFor="confirmPassword">Confirm Password</label>
                        <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" className="login_fourth_emailLogin_input baloo2" placeholder="Confirm your password" required autoComplete="off" />
                        <button type="button" className="eye_icon_position_signin_confirm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                        </button>
                    </div>

                    <div className="sixth_login_button_container">
                        <button type="submit" className="baloo2 login_sixth_button">Sign Up</button>
                    </div>
                    <div className="login_seventh_container">
                        <label className="baloo2">Already have an account? <a href="/login" className="text-purple underline login_signup_button">Sign in</a></label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
