import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import "../Styles/commerce-premium.css";
import "../Styles/virtual-showroom-premium.css";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDGec4wiKAzXjTLBOXxk4Kz6vMHBC1gQF510j794s-OoEkLi3-vK0CDCDYc5TnPBHX-7Ohjo-rlrRujSOmYELSoyc3zFNvhsmzSmWei81Zi8G1uPnN0-GKWTuuC3Ar2ow_GpeEZJvkbUoGKHFQ1oje69fVLuwPpeXTlduAtD0sCHwFur5SUTAJIk1nkXAxW5hAkcPj3lvuuLPfQ4oP94RNgEDnjUROUuXPZteSPd5mpg4fXUCbjk37sOe9TJPqUNUp2ynydIeNPOYTM";

const featureImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzvIiJm3v93ap6eWFVEBGx9ssydy-Hgfx1JNzN9E-7YV3XBzQwB2a9rc4HZfT1PXfdlaEyEzam113CeRDeKX5FbA0yIzjsFy-RBu4OG1YAsE7Wd6a6HFIPgHQu59ZjjmN9oCCKSHzrm0HIOiC-zfFuriC3Bq8fyRxDgvll_Zz1h02al6H-rR79Tn1VG-UwHk5LjZuTS1nZFneh5nrPUgXIUeb-79UO66pGFgQI5VFlnoaGrncHb7yL6mn8O2oiclhvsmOyAoSpeMRU";

const showroomSpaces = [
  {
    title: "The Monolith Kitchen",
    subtitle: "Sculptural Minimalism",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZZugaGL8hWh4KrnDp_HsXMO6AX3yPU2Hw79YkJklSglfUimWshBbzlaFMJPHEE0Q390qvKSNgdgJl14L6rRQ4tGHU38S80rsb53LmYB3RHPYYFjAMJQzF3P_JWU8KYnMK8Uj88BMIp4kCjWRiKeu8cCvYLjwvLC9h3uqd_GsEBOvBlLrL8H5t0T1VuogMbnovW1kabAgRd85GXUkFJTaJfZVNjjRILKWJLZXEvL3S25Em5joC2VbeADbkfQQjangaJQTA1hWlWjGX",
  },
  {
    title: "Brutalist Atrium",
    subtitle: "Raw Sophistication",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnh0D4StXnbgoUmFsrRTd_tqc9yuAK-acqv03-0XAo02BHy2I3j6vmmh1Gnr2Lv2KHDIUeICx4ler0HgpoaR7flg8WwC7two5CuFFwymbIClFtQRQOy5h9-ZDc1U7xh2yYMfhgUYruPaV2plzjdh1vhbeaTgIZmlWiC-XcfnvUVwTMfkHnSoXHKOamqLG_rzg3eovJuAM3DskBi5Y6v09lV18eI33nnCYpoqPN3y7k7Q9-IbeW6SZjeSKTRliietcx1OGjgpNxN6Et",
  },
  {
    title: "Sanctuary Suite",
    subtitle: "Tactile Quietude",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTRfOD3v2alErcsoBcP5qJgWuh7ATEoRjDrGc4AzWahPdQj8tJwm7F05eddJjKWkpkEZqMI3OgdfuF5W5x9nikpOuvCKVM52osLBO-go2xjg8qWjGZ98D0v-iQr5ipMixGFHjamPnVjFlxw_jdQjrkdSY19nUyNOp6PhL5tUvpUJ1lMUZIjK-YhRQIBm4f27Br7GBlgGrsj5eI8EhNXr52R_iLAgXAIzyMYwQkPwBDUEKN59Cx_xoxdtQQX6gp8ZMSejh3AYmoA830",
  },
  {
    title: "The Terrace Lounge",
    subtitle: "Infinite Horizon",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJwSQAqLhH149J4yo-QxXwnLMIq6ThojFqymcOUvHd1wifry9TTT9vpsomiWNEJ6DahflX-2S0_BNpyViPeX5TwUyj9PweWGIWfkr9uba6V-yURa8UYJqfbTl4Emtd4yamqD26AHKdkGErO57NnniepUj9GmNlMj9dEcT_xHdXnM3CXk_QTrSsMQaBF5ofmaEINAp329CJJV_2Hvna2mQCQqhD_eI5--Y_fwQz1YET6s7fSLIq3lbzGk9qUDxmVETdKAN1rlEf5g8L",
  },
];

const features = [
  {
    icon: "info",
    title: "Hotspot Information",
    body: "Click on any product within the 360° view to instantly access technical specifications, material origins, and pricing.",
  },
  {
    icon: "view_in_ar",
    title: "AR Placement",
    body: "Seamlessly transition from our virtual showroom to your own home using advanced Augmented Reality preview.",
  },
  {
    icon: "palette",
    title: "Material Swapping",
    body: "Customize your environment in real-time. Change wood finishes, fabric textures, and metal accents with a tap.",
  },
  {
    icon: "videocam",
    title: "Live Guided Tours",
    body: "Book a session with a Hedj specialist for a synchronized virtual walkthrough and expert styling advice.",
  },
];

export default function VirtualShowroom() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    const elements = document.querySelectorAll(".vs-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <PublicCommerceShell active="Virtual Showroom">
      <div className="virtual-showroom-page">
      {toast && (
        <div className="vs-toast" role="status">
          {toast}
        </div>
      )}

      <main>
        <section className="vs-hero">
          <div className="vs-hero-media">
            <img src={heroImage} alt="Minimalist architectural loft" />
            <div className="vs-hero-gradient" />
          </div>

          <div className="vs-hero-content">
            <div className="vs-hero-copy">
              <span>The Future of Curation</span>
              <h1>Step into the Extraordinary.</h1>
              <p>
                Experience Hedj collections in meticulously curated
                architectural environments from the comfort of your home.
                Explore every texture, angle, and detail in immersive 3D.
              </p>

              <div className="vs-hero-actions">
                <button
                  type="button"
                  className="vs-primary-button"
                  onClick={() =>
                    showMessage("360° experience preview is not connected yet.")
                  }
                >
                  Launch 360° Experience
                  <span className="material-symbols-outlined">explore</span>
                </button>

                <Link className="vs-secondary-button" to="/collections">
                  View Collections
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="vs-gallery-section">
          <div className="vs-container">
            <div className="vs-section-heading">
              <div>
                <h2>Curated Environments</h2>
                <p>
                  Select a space to begin your virtual journey. Each room is a
                  masterclass in architectural harmony, featuring limited
                  edition Hedj pieces.
                </p>
              </div>

              <div className="vs-arrow-row">
                <button
                  type="button"
                  aria-label="Previous showroom"
                  onClick={() => showMessage("Showroom gallery navigation is not connected yet.")}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  type="button"
                  aria-label="Next showroom"
                  onClick={() => showMessage("Showroom gallery navigation is not connected yet.")}
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="vs-gallery-grid">
              {showroomSpaces.map((space) => (
                <article className="vs-space-card" key={space.title}>
                  <div className="vs-space-image">
                    <img src={space.image} alt={space.title} />
                    <div className="vs-space-overlay">
                      <span className="vs-space-label">3D View</span>
                    </div>
                  </div>

                  <h3>{space.title}</h3>
                  <p>{space.subtitle}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vs-features-section">
          <div className="vs-container">
            <div className="vs-features-grid">
              <div className="vs-feature-visual vs-reveal">
                <div className="vs-feature-image">
                  <img src={featureImage} alt="Interactive product visualization" />
                  <span className="vs-hotspot vs-hotspot-one">
                    <i />
                  </span>
                  <span className="vs-hotspot vs-hotspot-two">
                    <i />
                  </span>
                </div>
                <div className="vs-feature-block" />
              </div>

              <div className="vs-feature-copy vs-reveal">
                <div>
                  <span>Digital Craftsmanship</span>
                  <h2>Designed for Immersion</h2>
                </div>

                <div className="vs-feature-list">
                  {features.map((feature) => (
                    <article className="vs-feature-card" key={feature.title}>
                      <div className="vs-feature-icon">
                        <span className="material-symbols-outlined">
                          {feature.icon}
                        </span>
                      </div>
                      <h4>{feature.title}</h4>
                      <p>{feature.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="vs-consultation-section">
          <div className="vs-consultation-card vs-reveal">
            <div className="vs-corner vs-corner-top-left" />
            <div className="vs-corner vs-corner-bottom-right" />

            <span>Bespoke Services</span>
            <h2>
              Your Vision,
              <br />
              Expertly Curated.
            </h2>
            <p>
              Transform your space with a personalized virtual design
              consultation. Our experts use high-fidelity VR tools to help you
              visualize and refine your interior layout.
            </p>

            <button
              type="button"
              className="vs-primary-button"
              onClick={() =>
                showMessage("Virtual consultation booking is not connected yet.")
              }
            >
              Book Virtual Consultation
            </button>
          </div>
        </section>
      </main>

      </div>
    </PublicCommerceShell>
  );
}
