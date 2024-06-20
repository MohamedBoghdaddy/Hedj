import React, { useState } from "react";
import "../../Styles/login.css"; // Adjust the path as needed
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous error message
    setError("");

    // Front-end validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/users/login', { email, password });
      console.log('Login successful:', response.data);
      // Redirect to dashboard or another page if needed
      navigate('/dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message); // Assuming your backend sends an error message
      } else {
        setError('An error occurred. Please try again.');
      }
    }
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
            {error && <div className="error">{error}</div>}
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
