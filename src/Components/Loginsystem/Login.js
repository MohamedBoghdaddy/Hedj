import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import "../../Styles/login.css"; // Adjust the path as needed

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errorMessage,
    successMessage,
    isLoading,
    handleLogin,
  } = useLogin();

  return (
    <div className="main-container">
      <div className="login-container">
        {/* 🔹 Left Side - Login Form */}
        <div className="left-login">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            {/* ✅ Email Field */}
            <div className="field">
              <div className="field-wrapper">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ✅ Password Field with Show/Hide Toggle */}
            <div className="field password-container">
              <div className="field-wrapper">
                <label htmlFor="password">Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>
            </div>

            {/* ✅ Error & Success Messages */}
            {errorMessage && <div className="error">{errorMessage}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            {/* ✅ Login Button */}
            <button className="left_btn" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* 🔹 Right Side - Signup Prompt */}
        <div className="right-login">
          <h1>Don't have an account?</h1>
          <Link to="/signup">
            <button className="right_btn" type="button" disabled={isLoading}>
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
