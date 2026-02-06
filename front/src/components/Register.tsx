import React, { useState } from "react";
import { register } from "../services/authApi";
import { normalizeUser } from "../utilities/normalizeUser";
import { AxiosError } from "axios";
import { IRegisterForm } from "../types/registerForm";

const Register: React.FC = () => {
    const [formData, setFormData] = useState<IRegisterForm>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Паролі не співпадають!");
            return;
        }

        try {
            const data = await register(
                formData.username,
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            if (!data.token) {
                setError("Помилка: токен не отримано");
                return;
            }

            const user = normalizeUser(data.token);
            if (!user) {
                setError("Помилка: не вдалося отримати дані користувача");
                return;
            }

            localStorage.setItem("token", data.token);
            alert("Реєстрація успішна! Вітаємо, " + user.username);
            // Тут можна додати навігацію або оновлення стану користувача
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
            const apiMsg =
                axiosErr.response?.data?.error ??
                axiosErr.response?.data?.message ??
                "";

            if (axiosErr.response?.status === 400 || axiosErr.response?.status === 409) {
                setError("Помилка реєстрації: " + (apiMsg || "невідома помилка"));
            } else {
                setError("Помилка реєстрації: " + (axiosErr.message || "невідома помилка"));
            }
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h2>Реєстрація</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="username" style={{ display: "block", marginBottom: "5px" }}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                        Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "5px", top: "5px", background: "none", border: "none", cursor: "pointer" }}
                        >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px" }}>
                        Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: "absolute", right: "5px", top: "5px", background: "none", border: "none", cursor: "pointer" }}
                        >
                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ color: "red", marginBottom: "15px" }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Register;
