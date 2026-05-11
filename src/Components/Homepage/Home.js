import { useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import "../../Styles/home-premium.css";

/* ── Seed data used when backend is offline ── */
const BEST_SELLERS = [
  {
    id: "eames-lounge",
    name: "Eames-inspired Lounge",
    material: "Walnut & Obsidian Leather",
    price: 3450,
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    slug: "eames-inspired-lounge",
  },
  {
    id: "minimalist-oak-island",
    name: "Minimalist Oak Island",
    material: "Solid European Oak",
    price: 2800,
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    slug: "minimalist-oak-island",
  },
  {
    id: "bronze-geometric-table",
    name: "Bronze Geometric Table",
    material: "Tinted Glass & Bronze",
    price: 4100,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    slug: "bronze-geometric-table",
  },
  {
    id: "obsidian-kitchen-island",
    name: "The Obsidian Kitchen Island",
    material: "Black Marble & Oak",
    price: 12450,
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    slug: "obsidian-kitchen-island",
  },
];

const TESTIMONIALS = [
  {
    quote: '"The customization process was effortless. Our new dining table is the heartbeat of our home."',
    name: "Eleanor Vance",
    location: "San Francisco, CA",
  },
  {
    quote: '"Quiet luxury defined. The delivery and installation team were as professional as the designers."',
    name: "Julian Thorne",
    location: "London, UK",
  },
  {
    quote: '"Seeing the furniture in AR before buying gave us the confidence to choose bold, larger pieces."',
    name: "Maya Rodriguez",
    location: "Barcelona, ES",
  },
];

const COLLECTIONS = [
  { label: "Kitchens",    sub: "Culinary sanctuaries designed for craft.", path: "/Kitchen",      img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" },
  { label: "Bedrooms",   sub: "Restful spaces of quiet luxury.",           path: "/Bedroom",      img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80" },
  { label: "Outdoor",    sub: "",                                           path: "/Outdoor",      img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80" },
  { label: "Complements",sub: "",                                           path: "/DayComplement",img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80" },
];

const StarIcon = () => (
  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>star</span>
);

const Home = () => {
  const { addToCart } = useContext(ShopContext);
  const scrollRef      = useRef(null);
  const navigate       = useNavigate();

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 360, behavior: "smooth" });
    }
  };

  const openWithKeyboard = (event, path) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  const handleBestSellerAdd = async (product) => {
    await addToCart({ ...product, id: product.id });
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <div style={{ background: "var(--color-background)" }}>

      {/* ── Hero ── */}
      <section className="hero-section-premium">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">Est. 2024</span>
            <h1 className="hero-heading">Design-led furniture for modern living.</h1>
            <p className="hero-body">
              Experience the pinnacle of premium crafted furniture and customizable interiors.
              Each piece is an intentional statement of luxury, designed to harmonize with your unique spatial narrative.
            </p>
            <div className="hero-cta-group">
              <Link to="/collections" className="btn-hedj-primary">Shop Collections</Link>
              <Link to="/contact" className="btn-hedj-outline">Book a Showroom Visit</Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-bg" />
            <img
              className="hero-image-main"
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85"
              alt="Luxury living room with premium furniture"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="stats-band">
        <div className="stats-band-inner">
          {[
            { n: "12",   l: "Collections" },
            { n: "5k+",  l: "Custom Orders" },
            { n: "45",   l: "Delivery Cities" },
            { n: "98%",  l: "Client Satisfaction" },
          ].map(({ n, l }) => (
            <div className="stat-item" key={l}>
              <div className="stat-number">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Curated Collections ── */}
      <section className="collections-section">
        <div className="section-header">
          <h2>Curated Collections</h2>
          <div className="hedj-divider" />
        </div>
        <div className="collections-bento">
          {COLLECTIONS.map(({ label, sub, path, img }) => (
            <div
              className="col-card"
              key={label}
              role="button"
              tabIndex={0}
              onClick={() => navigate(path)}
              onKeyDown={(event) => openWithKeyboard(event, path)}
              aria-label={`Open ${label} collection`}
            >
              <img src={img} alt={label} />
              <div className="col-card-overlay">
                <h3>{label}</h3>
                {sub && <p>{sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="bestsellers-section">
        <div className="bestsellers-header">
          <div>
            <p className="left-label">Iconic Pieces</p>
            <h2>Best Sellers</h2>
          </div>
          <div className="scroll-arrows">
            <button onClick={() => scrollBy(-1)} aria-label="scroll left">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={() => scrollBy(1)} aria-label="scroll right">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="bestsellers-scroll" ref={scrollRef}>
          {BEST_SELLERS.map((p) => (
            <div className="bs-card" key={p.id}>
              <div className="bs-card-img">
                <img src={p.img} alt={p.name} />
                <button
                  className="bs-card-add"
                  onClick={() => handleBestSellerAdd(p)}
                  title="Add to cart"
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
              <h4>{p.name}</h4>
              <p className="bs-material">{p.material}</p>
              <p className="bs-price">${p.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How Hedj Works ── */}
      <section className="how-section">
        <div className="how-inner">
          <h2>How Hedj Works</h2>
          <div className="how-steps">
            {[
              { icon: "search",          title: "Browse",           body: "Explore our curated collections or start a bespoke project with our designers." },
              { icon: "edit_note",       title: "Customize",        body: "Select finishes, dimensions, and hardware to perfectly fit your spatial needs." },
              { icon: "verified",        title: "Order",            body: "Place your order through our secure portal with full transparency on lead times." },
              { icon: "local_shipping",  title: "Deliver & Install", body: "White-glove delivery and professional installation for a seamless transition." },
            ].map(({ icon, title, body }) => (
              <div className="how-step" key={title}>
                <div className="how-step-icon">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Virtual Showroom Teaser ── */}
      <section className="showroom-section">
        <div className="showroom-inner">
          <div className="showroom-content">
            <span className="showroom-eyebrow">The Future of Retail</span>
            <h2 className="showroom-heading">The Virtual Showroom</h2>
            <p className="showroom-body">
              Visualize your dream space in stunning 4K clarity. Our AR tools allow you to project
              any piece from our collection into your home with true-to-life scaling and material accuracy.
            </p>
            <Link to="/contact" className="btn-showroom">
              Explore Showroom
              <span className="material-symbols-outlined">view_in_ar</span>
            </Link>
          </div>
          <div className="showroom-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80"
              alt="Virtual showroom AR preview"
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="testimonials-inner">
          <h2>Voices of Hedj</h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(({ quote, name, location }) => (
              <div className="testi-card" key={name}>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="testi-quote">{quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar" />
                  <div>
                    <p className="testi-name">{name}</p>
                    <p className="testi-location">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
