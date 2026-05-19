import { Link } from "react-router-dom";
import { PublicFooter, PublicNavbar } from "../Components/PublicCommerceShell";
import "../Styles/commerce-premium.css";

const placeholderContent = {
  privacy: {
    title: "Privacy Policy",
    message: "Our full privacy policy is being prepared with care. We take your data seriously and will never share or sell it to third parties.",
  },
  terms: {
    title: "Terms of Service",
    message: "Our full terms of service document is being drafted. All purchases are covered by our standard guarantee of quality and authenticity.",
  },
  shipping: {
    title: "Shipping & Returns",
    message: "We offer white-glove delivery across all major cities and a 30-day return policy on all items in their original condition. Full details coming soon.",
  },
  sustainability: {
    title: "Sustainability",
    message: "At Hedj, every material is sourced with environmental intent. Our sustainability charter and supplier standards are being published shortly.",
  },
};

export default function StaticPlaceholder({ pageKey = "privacy" }) {
  const content = placeholderContent[pageKey] || { title: "Coming Soon", message: "This page is being crafted with care." };

  return (
    <div className="commerce-page">
      <PublicNavbar />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "120px 24px 160px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#a07e48",
            marginBottom: 24,
          }}
        >
          Hedj Commerce
        </p>
        <h1
          style={{
            fontFamily: "'Noto Serif', serif",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 400,
            color: "#000000",
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          {content.title}
        </h1>
        <p
          style={{
            color: "#645d58",
            fontSize: 18,
            lineHeight: 1.7,
            marginBottom: 48,
          }}
        >
          {content.message}
        </p>
        <Link
          to="/contact"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "#000000",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Contact Us
        </Link>
        <div style={{ marginTop: 24 }}>
          <Link
            to="/"
            style={{
              fontSize: 13,
              color: "#76777d",
              textDecoration: "underline",
            }}
          >
            Return Home
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
