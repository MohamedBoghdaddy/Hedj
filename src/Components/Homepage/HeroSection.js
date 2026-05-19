import { Link } from "react-router-dom";
import "./homepage-premium.css";

const HeroSection = () => (
  <section className="hedj-hero" aria-labelledby="hedj-hero-title">
    <div className="hedj-home-container hedj-hero-grid">
      <div className="hedj-hero-copy">
        <span>EST. 2024</span>
        <h1 id="hedj-hero-title">Design-led furniture for modern living.</h1>
        <p>
          Experience the pinnacle of premium crafted furniture and customizable interiors.
          Each piece is an intentional statement of luxury, designed to harmonize with your
          unique spatial narrative.
        </p>
        <div className="hedj-hero-actions">
          <Link to="/collections" className="hedj-home-primary-btn">
            Shop Collections
          </Link>
          <Link to="/contact" className="hedj-home-outline-btn">
            Book a Showroom Visit
          </Link>
        </div>
      </div>

      <div className="hedj-hero-image-wrap">
        <span className="hedj-hero-image-back" aria-hidden="true" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK9BS_GWXIhpSoNzvZlecqJawyFOztxSWGC41eA78BybgayPVNQc_PdpD1SqIrl21z_waJ0orN3wWs4fpwY0icIwE-dIDZ4be24NtrGCHhSVetdOdlY7j9VVVrB_kRARENtGzv8Mh8k7MZC8xHh6RVDjAtE_tuO1P0tTqWXvFLF-WQWAxQpS3dt_-ZMij30zZNT6jVfR_RuBhTd0C6YdVji9QIM-YkPYeKskO8PAzRchOWlJu-BOk1f8yu9c94qZR8rBW1kPBoOFo5"
          alt="Luxury living room with premium crafted furniture"
        />
      </div>
    </div>
  </section>
);

export default HeroSection;
