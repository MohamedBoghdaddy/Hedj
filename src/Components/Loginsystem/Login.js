import React, { useState } from "react";
import "../../Styles/login.css"; // Adjust the path as needed
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="left">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="field">
              <div className="field-wrapper">
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
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
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            </div>
            <button className="green_btn" type="submit">
              Login
            </button>
          </form>
        </div>

        <div className="right">
          <h1>Don't have an account?</h1>
          <Link to="/signup">
            <button className="white_btn" type="button">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
