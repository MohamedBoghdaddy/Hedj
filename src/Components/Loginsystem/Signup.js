import React, { useState } from "react";
import axios from "axios";
import "../../Styles/signup.css"; // Shared CSS
import { Link } from "react-router-dom";

const validateEmail = (email) => email.includes("@");

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");

  const handlePasswordChange = (e) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      setPassword(input);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      setConfirmPassword(input);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert("Please enter a valid email address with '@'.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await axios.post("/api/users/signup", {
        name,
        email,
        password,
        gender,
      });

      alert("Registration successful");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Signup failed");
    }
  };

  return (
    <div className="main-Container">
      <div className="frame-Container">
        <div className="left">
          {/* Left section for signup */}
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            <div className="field input">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                required
              />
            </div>
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
              <label htmlFor="password">Password:</label>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange} // Corrected
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="field input"> {/* Confirm Password */}
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="field input"> {/* Gender selection */}
              <label>Gender:</label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={(e) => setGender(e.target.value)}
              />
              Male
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={(e) => setGender(e.target.value)}
              />
              Female
            </div>
            <button className="green_btn" type="submit">Signup</button>
          </form>
        </div>

        <div className="right">
          {/* Right section for login information */}
          <h1>Already have an account?</h1>
          <Link to="/login">
            <button className="white_btn" type="button">Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
