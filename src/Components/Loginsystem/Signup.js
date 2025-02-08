import { useState } from "react";
import axios from "axios";
import "../../Styles/signup.css";
import { Link, useNavigate } from "react-router-dom";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    firstName: "",
    middleName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ error: "", success: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage({ error: "", success: "" });

    if (!formData.name) return setMessage({ error: "Name is required." });
    if (!validateEmail(formData.email))
      return setMessage({ error: "Invalid email address." });
    if (formData.password.length < 6)
      return setMessage({ error: "Password must be at least 6 characters." });
    if (formData.password !== formData.confirmPassword)
      return setMessage({ error: "Passwords do not match." });
    if (!formData.gender) return setMessage({ error: "Gender is required." });

    try {
      await axios.post("http://localhost:8000/api/users/Signup", formData);
      setMessage({ success: "Registration successful" });
      navigate("/login");
    } catch (error) {
      setMessage({ error: error.response?.data?.message || "Signup failed" });
    }
  };

  return (
    <div className="main-Container">
      <div className="frame-Container">
        <div className="left-sign">
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            {[
              "username",
              "name",
              "email",
              "firstName",
              "middleName",
              "lastName",
            ].map((field) => (
              <div className="field" key={field}>
                <label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  maxLength={field === "email" ? 70 : 20}
                />
              </div>
            ))}

            {["password", "confirmPassword"].map((field, index) => (
              <div className="field password-container" key={field}>
                <label htmlFor={field}>
                  {index === 0 ? "Password" : "Confirm Password"}:
                </label>
                <input
                  type={
                    (index === 0 ? showPassword : showConfirmPassword)
                      ? "text"
                      : "password"
                  }
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    index === 0
                      ? setShowPassword(!showPassword)
                      : setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <i
                    className={
                      index === 0
                        ? showPassword
                          ? "fas fa-eye-slash"
                          : "fas fa-eye"
                        : showConfirmPassword
                          ? "fas fa-eye-slash"
                          : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            ))}

            <div className="field">
              <label htmlFor="gender">Gender:</label>
              <div className="gender-container">
                {["male", "female"].map((g) => (
                  <div key={g}>
                    <input
                      type="radio"
                      id={g} // Explicitly associate label with input
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                    />
                    <label htmlFor={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {message.error && <div className="error">{message.error}</div>}
            {message.success && (
              <div className="success">{message.success}</div>
            )}

            <button className="left_btn" type="submit">
              Signup
            </button>
          </form>
        </div>

        <div className="right-sign">
          <h1>Already have an account?</h1>
          <Link to="/login">
            <button className="right_btn" type="button">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
