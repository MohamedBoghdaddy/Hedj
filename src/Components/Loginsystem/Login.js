import React, { useState } from "react";
import axios from "axios";
import "../../Styles/login.css"; // Shared CSS
import { Link } from "react-router-dom";

const validateEmail = (email) => email.includes("@");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert("Please enter a valid email address with '@'.");
      return;
    }

    try {
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("authToken", token);
      alert("Login successful");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed");
    }
  };

  const handlePasswordChange = (e) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      setPassword(input);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="left">
          {/* Left section for login */}
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="field input">
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={70}
                required
              />
            </div>
            <div className="field input">
              {/* Password with show/hide toggle */}
              <label htmlFor="password">Password:</label>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange} // Only allows numbers
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button className="green_btn" type="submit">
              Login
            </button>
          </form>
        </div>

        <div className="right">
          {/* Right section for signup information */}
          <h1>New Here?</h1>
          <Link to="/signup">
            <button className="white_btn" type="button">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
