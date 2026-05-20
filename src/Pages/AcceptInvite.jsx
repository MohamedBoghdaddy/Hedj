import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/**
 * /accept-invite
 *
 * Landing page for employee invitations.
 * Supabase Auth redirects to this URL after the employee clicks the invite link.
 * The URL will contain a Supabase session fragment (#access_token=...) or query params.
 * We display a confirmation and guide the employee to log in / set their password.
 */
export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [message, setMessage] = useState("");

  // employeeId param is set by the email-outbox fallback path
  const employeeId = searchParams.get("employeeId");

  useEffect(() => {
    // Check for Supabase invite session (hash fragment) or outbox fallback
    const hash = window.location.hash;
    const hasSupabaseSession = hash.includes("access_token") || hash.includes("type=invite");

    if (hasSupabaseSession) {
      setStatus("supabase");
      setMessage("Your Supabase account is being set up. You can now set your password and log in.");
    } else if (employeeId) {
      setStatus("outbox");
      setMessage("Your invitation has been received. Please log in with the credentials provided by your administrator.");
    } else {
      setStatus("ready");
      setMessage("Welcome to Hedj Commerce. If you received an invitation email, please click the link in that email to proceed.");
    }
  }, [employeeId]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8f7f4", fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "48px 40px", maxWidth: 480, width: "100%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 32, color: "#1c1c19" }}>
          HEDJ
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#0f172a",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <span className="material-symbols-outlined" style={{ color: "#a07e48", fontSize: 32 }}>badge</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1c1c19", marginBottom: 12 }}>
          You've been invited
        </h1>

        <p style={{ color: "#45464d", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          {status === "loading" ? "Processing your invitation…" : message}
        </p>

        {status === "supabase" && (
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "16px", marginBottom: 24, textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>
              <strong>Next steps:</strong><br />
              1. Set your password when prompted.<br />
              2. Log in to Hedj Commerce.<br />
              3. Your administrator will assign you to your workspace.
            </p>
          </div>
        )}

        {status === "outbox" && (
          <div style={{ background: "#fffbeb", borderRadius: 8, padding: "16px", marginBottom: 24, textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
              <strong>Next steps:</strong><br />
              1. Use the credentials your administrator sent you.<br />
              2. Log in at the link below.<br />
              3. Contact your admin if you need a new password.
            </p>
          </div>
        )}

        <Link
          to="/Login"
          style={{
            display: "inline-block", background: "#0f172a", color: "#fff",
            padding: "12px 32px", borderRadius: 6, textDecoration: "none",
            fontSize: 15, fontWeight: 600, letterSpacing: "0.04em",
          }}
        >
          Go to Login
        </Link>

        <p style={{ marginTop: 24, fontSize: 13, color: "#94a3b8" }}>
          Need help? Contact your Hedj Commerce administrator.
        </p>
      </div>

      {/* Material Symbols for the badge icon */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />
    </div>
  );
}
