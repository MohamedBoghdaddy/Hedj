import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./homepage-premium.css";

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Shipping & Returns", path: "/shipping" },
  { label: "Sustainability", path: "/sustainability" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
    toast.success("Thank you for joining the Hedj collective.");
  };

  return (
    <footer className="hedj-footer">
      <div className="hedj-home-container">
        <div className="hedj-footer-newsletter">
          <div>
            <h2>Join the Collective</h2>
            <p>
              Receive early access to seasonal collections and interior design insights
              from our founders.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="hedj-newsletter-email">
              Email Address
            </label>
            <input
              id="hedj-newsletter-email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="hedj-footer-bottom">
          <nav aria-label="Footer links">
            {legalLinks.map((link) => (
              <Link to={link.path} key={link.path}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p>&copy; 2024 Hedj Commerce OS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
