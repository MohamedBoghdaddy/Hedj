import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogin } from "../../hooks/useLogin";
import loginVisual from "../../Assets/Images/23.jpg";
import "../../Styles/login.css";

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

  const handleSocialClick = () => {
    toast.info("Social login is not configured yet.");
  };

  return (
    <main className="auth-shell auth-shell-login">
      <section className="auth-visual-panel">
        <img className="auth-visual-image" src={loginVisual} alt="Minimalist luxury living room" />
        <div className="auth-visual-overlay auth-visual-overlay-login" />
        <div className="auth-visual-copy">
          <p className="auth-visual-brand">Hedj</p>
          <p className="auth-visual-line">Curated living for the modern professional.</p>
          <p className="auth-visual-muted">Elevating spaces with intentionality and craft.</p>
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
                <a href="#forgot-password" onClick={(event) => event.preventDefault()}>
                  Forgot Password?
                </a>
              </div>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
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

            <div className="auth-divider">
              <span>Or Continue With</span>
            </div>

            <div className="auth-social-grid">
              <button type="button" className="auth-social-btn" onClick={handleSocialClick}>
                <span className="material-symbols-outlined">account_circle</span>
                Google
              </button>
              <button type="button" className="auth-social-btn" onClick={handleSocialClick}>
                <span className="material-symbols-outlined">phone_iphone</span>
                Apple
              </button>
            </div>
          </form>

          <footer className="auth-switch">
            <p>Don't have an account?</p>
            <Link to="/Signup">Create an account</Link>
          </footer>
        </div>

        <div className="auth-legal">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#support">Contact Support</a>
          <p>© 2024 Hedj Commerce OS.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
