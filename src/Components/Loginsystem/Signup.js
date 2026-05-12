import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import signupVisual from "../../Assets/Images/daybedroom.jpg";
import "../../Styles/signup.css";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const splitFullName = (fullName) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : parts[0] || "",
  };
};

const usernameFromName = (fullName, email) => {
  const normalized = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return normalized || email.split("@")[0];
};

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "prefer-not-to-say",
    firstName: "",
    middleName: "",
    lastName: "",
    earlyAccess: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ error: "", success: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setMessage({ error: "", success: "" });

    if (!formData.name.trim()) {
      setMessage({ error: "Full name is required.", success: "" });
      return;
    }
    if (!validateEmail(formData.email)) {
      setMessage({ error: "Invalid email address.", success: "" });
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ error: "Password must be at least 6 characters.", success: "" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ error: "Passwords do not match.", success: "" });
      return;
    }

    const nameParts = splitFullName(formData.name);
    const payload = {
      ...formData,
      username: formData.username || usernameFromName(formData.name, formData.email),
      firstName: formData.firstName || nameParts.firstName,
      middleName: formData.middleName || nameParts.middleName,
      lastName: formData.lastName || nameParts.lastName,
      gender: formData.gender || "prefer-not-to-say",
    };

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/signup`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setMessage({ error: "", success: "Registration successful" });
      navigate("/login");
    } catch (error) {
      setMessage({
        error: error.response?.data?.message || "Signup failed",
        success: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-shell-signup">
      <section className="auth-visual-panel">
        <img className="auth-visual-image" src={signupVisual} alt="Serene luxury bedroom" />
        <div className="auth-visual-overlay auth-visual-overlay-signup" />
        <div className="auth-visual-brand-top">Hedj</div>
        <div className="auth-visual-copy">
          <h2>Design the life you were meant to live.</h2>
          <p>Join an exclusive community of curators and interior enthusiasts.</p>
        </div>
      </section>

      <section className="auth-form-panel" aria-labelledby="signup-title">
        <div className="auth-form-card">
          <div className="auth-mobile-brand">Hedj</div>

          <header className="auth-header">
            <h1 id="signup-title">Create Account</h1>
            <p>Start your journey into high-end commerce.</p>
          </header>

          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Julianne Moore"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <PasswordField
              id="signup-password"
              label="Password"
              name="password"
              value={formData.password}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <PasswordField
              id="signup-confirm-password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <label className="auth-checkbox" htmlFor="earlyAccess">
              <input
                id="earlyAccess"
                name="earlyAccess"
                type="checkbox"
                checked={formData.earlyAccess}
                onChange={handleChange}
              />
              <span>Sign up for early access to new collections and private interior previews.</span>
            </label>

            {message.error && <div className="auth-message auth-message-error">{message.error}</div>}
            {message.success && <div className="auth-message auth-message-success">{message.success}</div>}

            <button className="auth-primary-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <footer className="auth-switch">
            <p>Already have an account?</p>
            <Link to="/Login">Sign in</Link>
          </footer>
        </div>

        <div className="auth-legal">
          <p>© 2024 Hedj Commerce OS. Privacy Policy &amp; Terms of Service.</p>
        </div>
      </section>
    </main>
  );
};

const PasswordField = ({
  id,
  label,
  name,
  value,
  show,
  onToggle,
  onChange,
  autoComplete,
}) => (
  <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    <div className="auth-password-wrap">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="auth-password-toggle"
        aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        onClick={onToggle}
      >
        <span className="material-symbols-outlined">{show ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  </div>
);

export default Signup;
