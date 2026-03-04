import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "../../styles/login_signup/background.css";
import "../../styles/login_signup/forgot_password.css";

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post("http://localhost:5122/api/user/forgot-password", { email });
            setIsLoading(false);
            alert("If the address is registered, you will receive an email with further instructions.");
            navigate("/login");
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            alert("Помилка відновлення");
        }
    };

    return (
        <div className="background_style min-h-screen flex items-center justify-center">
            <div className="forgot_password_container">
                <div className="forgot_password_header">
                    <img src="public/logo_Allurew.png" alt="Allure Logo" className="forgot_password_logo" />
                    <h1 className="forgot_password_title">Recover password</h1>
                    <p className="forgot_password_subtitle">Enter your email address to receive a password reset link.</p>
                </div>

                <form onSubmit={onSubmit} className="forgot_password_form" noValidate autoComplete="off">
                    <div className="forgot_password_input_group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="forgot_password_input"
                            placeholder="EMail"
                            required
                            autoComplete="off"
                        />
                        <img src="public/user.png" alt="user icon" className="forgot_password_icon" />
                    </div>

                    <button type="submit" className="forgot_password_button forgot_password_button_primary">
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                        type="button"
                        className="forgot_password_button forgot_password_button_secondary"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;