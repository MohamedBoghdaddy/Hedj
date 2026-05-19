import { Link } from "react-router-dom";
import "./homepage-premium.css";

const VirtualShowroomSection = () => (
  <section className="hedj-showroom" aria-labelledby="showroom-heading">
    <div className="hedj-home-container hedj-showroom-grid">
      <div className="hedj-showroom-copy">
        <span>The Future of Retail</span>
        <h2 id="showroom-heading">The Virtual Showroom</h2>
        <p>
          Visualize your dream space in stunning 4K clarity. Our AR tools allow you to
          project any piece from our collection into your home with true-to-life scaling
          and material accuracy.
        </p>
        <Link to="/virtual-showroom" className="hedj-home-light-btn">
          Explore Showroom
          <span className="material-symbols-outlined">view_in_ar</span>
        </Link>
      </div>

      <div className="hedj-showroom-image">
        <span aria-hidden="true" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuog2yqjkykr5j1itfdWvZSPo4KHkJRaDHIGna_OFiVto9OXn3Sk75FcDsnMXtUgk-ZWu4adS4Z7m_9xnfDGXUdeh4n9zAeUszNQzX_Z3uD7IqxBCKydk-Tk0M1ifEUv-ynoYYEAo8zxwF1qz1aAzpgoOXhBK2zQCpAn_vZ3DQfzQ6xmKN9YKnyes-HUJz9XP70q-IKydNYHX9EopLxpcTYb-gDkAThXWQhT1qWNpXTnu4B9FL95JOl2uunOl5qa0LxMbggW8_8mq8"
          alt="Virtual showroom preview for furniture in an interior"
        />
      </div>
    </div>
  </section>
);

export default VirtualShowroomSection;
