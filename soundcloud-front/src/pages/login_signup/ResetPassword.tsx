import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../styles/login_signup/background.css";
import "../../styles/login_signup/reset_password.css";

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const token = searchParams.get("token");

    // Validation rules
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const allRulesMet = hasMinLength && hasUpperCase && hasNumber;

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. No token provided.");
        }
    }, [token]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid reset link.");
            return;
        }

        if (!hasMinLength || !hasUpperCase || !hasNumber) {
            setError("Password does not meet all requirements.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);
            await axios.post("http://localhost:5122/api/user/reset-password", {
                token,
                newPassword,
                confirmPassword
            });
            alert("Password has been reset successfully. You can now log in with your new password.");
            navigate("/login");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to reset password. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="background_style min-h-screen flex items-center justify-center">
                <div className="reset_password_container">
                    <div className="reset_password_header">
                        <h1 className="reset_password_title">Invalid Reset Link</h1>
                        <p className="reset_password_subtitle">The password reset link is invalid or has expired.</p>
                        <button
                            type="button"
                            className="reset_password_button reset_password_button_primary"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Request New Reset Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="background_style min-h-screen flex items-center justify-center">
            <div className="reset_password_container">
                <div className="reset_password_header">
                    <div className="reset_password_header1"><img src="public/logo_Allurew.png" alt="Allure Logo" className="reset_password_logo" />
                    <h1 className="reset_password_title">Recover Password</h1></div>
                    <div className="reset_password_header2"><p className="reset_password_subtitle">Create a New Password. Choose a new password for your account.</p></div>
                </div>

                <form onSubmit={onSubmit} className="reset_password_form" noValidate autoComplete="off">
                    <div className="reset_password_input_group">
                        <div className="reset_password_input_wrapper">
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="reset_password_input"
                                placeholder="New Password"
                                required
                                autoComplete="new-password"
                            />
                            <img src="public/show_password.png" alt="lock icon" className="reset_password_icon" />
                        </div>

                        <div className="reset_password_input_wrapper">
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="reset_password_input"
                                placeholder="Confirm New Password"
                                required
                                autoComplete="new-password"
                            />
                            <img src="public/show_password.png" alt="lock icon" className="reset_password_icon" />
                        </div>

                        <div className="reset_password_rules">
                            <p className={`reset_password_rules_text ${hasMinLength ? "rule-met" : ""}`}>Be at least 8 characters long</p>
                            <p className={`reset_password_rules_text ${hasUpperCase ? "rule-met" : ""}`}>Contain at least one uppercase letter</p>
                            <p className={`reset_password_rules_text ${hasNumber ? "rule-met" : ""}`}>Contain at least one number</p>
                        </div>

                        {error && <p className="reset_password_error">{error}</p>}
                    </div>

                    <button type="submit" className="reset_password_button reset_password_button_primary" disabled={isLoading || !allRulesMet || newPassword !== confirmPassword || !newPassword || !confirmPassword}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <button
                        type="button"
                        className="reset_password_button reset_password_button_secondary"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;