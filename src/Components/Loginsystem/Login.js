import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLogin } from "../../hooks/useLogin";
import { useAuthContext } from "../../context/AuthContext";
import { getDashboardRoute } from "../../utils/permissions";
import "../../Styles/auth-premium.css";

const loginVisual =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0G77Y0EaIuevvsyBlAjXP4n3DqYhdREaa2GehU7zHSGXq6Wkdby2W3m_np3QXxPscKf13xeBUzGqWu-m5cyDqkw6dBOC0gMTYPDSL1xXNU4X4nAp-B07tB8eCZ47lFtYmndhkImOQjMVHukcc-VMxc-TdtHxK1WfjN1AAhNQni1K7sipyMOvz9H3XyEOS9KHxrFazbUsfvge1Jrc7VuiIO_hCBZbEXJafaiXHd06Yd-QSeYy0lgCvZwaGOt9vnW3CaHc7e1KaNFG4";

const Login = () => {
  const navigate = useNavigate();
  const { state } = useAuthContext();
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

  useEffect(() => {
    if (state.isAuthenticated && !state.loading && state.user) {
      navigate(getDashboardRoute(state.user), { replace: true });
    }
  }, [state.isAuthenticated, state.loading, state.user, navigate]);


  return (
    <main className="auth-shell auth-shell-login">
      <section className="auth-visual-panel">
        <img className="auth-visual-image" src={loginVisual} alt="Minimalist luxury living room" />
        <div className="auth-visual-overlay auth-visual-overlay-login" />
        <div className="auth-visual-copy">
          <p className="auth-visual-brand">Hedj</p>
          <p className="auth-visual-line">Access your quiet showroom and curated interiors.</p>
        </div>
      </section>

      <section className="auth-form-panel" aria-labelledby="login-title">
        <div className="auth-form-card">
          <div className="auth-mobile-brand">Hedj</div>

          <header className="auth-header">
            <p className="auth-kicker">Welcome Back</p>
            <h1 id="login-title">Sign In</h1>
            <p>Access your personal showroom and collection management tools.</p>
          </header>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/contact?reason=password-reset" className="auth-text-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {errorMessage && <div className="auth-message auth-message-error">{errorMessage}</div>}
            {successMessage && <div className="auth-message auth-message-success">{successMessage}</div>}

            <button className="auth-primary-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Social login removed — no OAuth provider configured */}
          </form>

          <footer className="auth-switch">
            <p>Don't have an account?</p>
            <Link to="/signup">Create an account</Link>
          </footer>
        </div>

        <div className="auth-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact Support</Link>
          <p>(c) 2024 Hedj Commerce OS.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
