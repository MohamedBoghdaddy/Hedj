import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from "../services/api";
import { setAxiosAuthToken } from "../services/authHeaders";
import "../Styles/commerce-premium.css";

const benefits = [
  "Trade pricing",
  "Bulk order support",
  "Project-based purchasing",
  "Priority showroom assistance",
  "Early access to collections",
  "Dedicated account support",
];

const tradeRoles = new Set(["trade", "trade_user", "trade_admin", "wholesale", "business"]);
const AUTH_TIMEOUT_MS = 15000;

const hasTradeAccess = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return tradeRoles.has(role) || Boolean(user?.tradeApproved || user?.approvedTrade);
};

const TradeLogin = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        { ...form, email: form.email.trim().toLowerCase() },
        {
          withCredentials: true,
          timeout: AUTH_TIMEOUT_MS,
        },
      );
      const { token, user } = response.data || {};

      if (!token || !user) {
        setError("Login failed. The server did not return an account session.");
        return;
      }

      if (!hasTradeAccess(user)) {
        await axios.post(`${API_URL}/api/users/logout`, {}, { withCredentials: true }).catch(() => {});
        setError(
          "This account is not approved for trade access yet. Apply for the Trade Program or contact support.",
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAxiosAuthToken(token);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      if (requestError?.code === "ECONNABORTED") {
        setError("Trade login is taking too long. Please try again in a moment.");
        return;
      }

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Trade login is unavailable right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicCommerceShell active="Contact">
      <main className="trade-page">
        <section className="trade-login-layout">
          <div className="trade-login-copy">
            <p className="support-kicker">Trade Access</p>
            <h1>Trade Program Login</h1>
            <p>
              Access trade pricing, saved projects, bulk order support, and designer
              resources.
            </p>

            <div className="trade-benefit-list">
              {benefits.map((benefit) => (
                <div className="trade-benefit-item" key={benefit}>
                  <span className="material-symbols-outlined">check</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trade-login-card">
            <h2>Sign in to trade</h2>
            <p>
              Trade-specific account roles are not enabled unless your account has been
              approved.
            </p>

            <form className="support-form" onSubmit={handleSubmit} noValidate>
              <div className="commerce-field">
                <label htmlFor="trade-email">Email</label>
                <input
                  id="trade-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="trade@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="commerce-field">
                <label htmlFor="trade-password">Password</label>
                <input
                  id="trade-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="support-form-message error">
                  <span className="material-symbols-outlined">error</span>
                  <p>{error}</p>
                </div>
              )}

              <button className="commerce-button" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Login"}
              </button>
            </form>

            <div className="trade-login-links">
              <Link to="/contact?reason=password-reset">Forgot password</Link>
              <Link to="/trade-program">Apply for Trade Program</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default TradeLogin;
