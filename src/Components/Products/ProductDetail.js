import { useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/productContext";
import { toast } from "react-toastify";
import "./ProductDetail.css";

/* ── Seed catalog ── */
const PRODUCTS_DB = {
  "obsidian-kitchen-island": {
    id: "obsidian-kitchen-island",
    name: "The Obsidian Kitchen Island",
    collection: "The Obsidian Series",
    price: 12450,
    description:
      "A masterpiece of architectural balance, the Obsidian Kitchen Island merges the raw power of monolithic stone with the warmth of hand-finished oak. Designed for the epicurean heart of the home, its expansive surface and concealed storage redefine kitchen functionality as an art form.",
    rating: 4.9,
    reviewCount: 24,
    inStock: true,
    images: [
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=85",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=85",
      "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=800&q=85",
    ],
    materials: ["Black Marble", "Granite", "Walnut Wood"],
    finishes: [
      { name: "Midnight",   color: "#1a1a1a" },
      { name: "Sandstone",  color: "#C9C0B4" },
      { name: "Aged Bronze",color: "#7D4E2C" },
    ],
    specs: [
      { label: "Dimensions", value: "300cm × 110cm × 92cm" },
      { label: "Weight",      value: "420 kg" },
      { label: "Origin",      value: "Tuscany, Italy" },
      { label: "Certification", value: "FSC Certified Oak Base" },
    ],
    craftText:
      "Each Obsidian Island is uniquely carved from a single slab of premium black marble, selected for its distinct character and veining. Our master artisans in Carrara, Italy, spend over 120 hours hand-finishing each surface.",
    relatedIds: ["monolith-island-system", "nordic-oak-cabinetry", "aero-stool"],
  },
  "monolith-island-system": {
    id: "monolith-island-system",
    name: "Monolith Island System",
    collection: "The Zenith Collection",
    price: 18400,
    description: "A seamless architectural centerpiece that integrates Carrara marble with Matte Graphite Steel, delivering unrivaled presence in any contemporary kitchen.",
    rating: 4.8,
    reviewCount: 18,
    inStock: true,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=85",
    ],
    materials: ["Carrara Marble", "Matte Graphite Steel"],
    finishes: [
      { name: "Graphite", color: "#333" },
      { name: "White",    color: "#f5f5f5" },
    ],
    specs: [
      { label: "Dimensions", value: "280cm × 100cm × 90cm" },
      { label: "Weight",      value: "380 kg" },
      { label: "Origin",      value: "Tuscany, Italy" },
    ],
    craftText: "The Monolith Island System is precision-engineered from a single slab of Carrara marble. The matte graphite steel base is hand-welded and powder-coated for durability.",
    relatedIds: ["obsidian-kitchen-island", "nordic-oak-cabinetry"],
  },
};

const RELATED_CATALOG = {
  "aero-stool": {
    name: "The Aero Stool",
    price: 850,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    slug: "aero-stool",
  },
  "monolith-island-system": {
    name: "Monolith Island System",
    price: 18400,
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    slug: "monolith-island-system",
  },
  "nordic-oak-cabinetry": {
    name: "Nordic Oak Cabinetry",
    price: 12500,
    img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
    slug: "nordic-oak-cabinetry",
  },
};

const TABS = ["Details", "Craftsmanship", "Delivery & Installation", "Customization Options"];

const StarFilled = () => (
  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 16, color: "var(--color-on-tertiary-container)" }}>star</span>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const product = PRODUCTS_DB[slug] || PRODUCTS_DB["obsidian-kitchen-island"];

  const [activeImg,     setActiveImg]   = useState(0);
  const [selectedMat,   setSelMat]      = useState(product.materials[0]);
  const [selectedFin,   setSelFin]      = useState(0);
  const [qty,           setQty]         = useState(1);
  const [activeTab,     setActiveTab]   = useState(0);
  const [wishlisted,    setWishlisted]  = useState(false);
  const [addedToCart,   setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.images[0],
      material: selectedMat,
      finish: product.finishes[selectedFin]?.name,
      quantity: qty,
    });
    setAddedToCart(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleWishlist = () => {
    addToWishlist({ id: product.id, name: product.name, price: product.price, img: product.images[0] });
    setWishlisted(true);
    toast.success("Saved to wishlist!");
  };

  return (
    <div className="pd-page">
      <div className="pd-inner">

        {/* Breadcrumb */}
        <nav className="hedj-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <Link to="/Kitchen">Kitchens</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="current">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="pd-product-grid">

          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              <img src={product.images[activeImg]} alt={product.name} />
            </div>
            <div className="pd-thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb${activeImg === i ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                  {i === product.images.length - 1 && product.images.length > 3 && (
                    <span className="pd-thumb-more">+12 Photos</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-rating-row">
              <div className="pd-stars">
                {[...Array(5)].map((_, i) => <StarFilled key={i} />)}
              </div>
              <span className="pd-review-count">{product.reviewCount} Reviews</span>
            </div>

            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-price-row">
              <span className="pd-price">${product.price.toLocaleString()}</span>
              <span className={`badge-status ${product.inStock ? "badge-success" : "badge-error"}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <p className="pd-desc">{product.description}</p>

            {/* Material Selector */}
            <div className="pd-option-group">
              <label className="pd-option-label">Primary Material</label>
              <div className="pd-material-btns">
                {product.materials.map(mat => (
                  <button
                    key={mat}
                    className={`pd-mat-btn${selectedMat === mat ? " active" : ""}`}
                    onClick={() => setSelMat(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish Selector */}
            <div className="pd-option-group">
              <label className="pd-option-label">Base Finish</label>
              <div className="pd-finish-btns">
                {product.finishes.map((fin, i) => (
                  <button
                    key={fin.name}
                    className={`pd-finish-btn${selectedFin === i ? " active" : ""}`}
                    style={{ backgroundColor: fin.color }}
                    title={fin.name}
                    onClick={() => setSelFin(i)}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="pd-option-group">
              <label className="pd-option-label">Quantity</label>
              <div className="pd-qty-stepper">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <button
              className={`btn-hedj-primary pd-add-btn${addedToCart ? " added" : ""}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {addedToCart ? (
                <><span className="material-symbols-outlined">check</span> Added to Cart</>
              ) : (
                "Add to Cart"
              )}
            </button>

            <div className="pd-action-row">
              <button
                className={`pd-secondary-btn${wishlisted ? " active" : ""}`}
                onClick={handleWishlist}
              >
                <span className="material-symbols-outlined">{wishlisted ? "favorite" : "favorite"}</span>
                Wishlist
              </button>
              <button className="pd-secondary-btn" onClick={() => navigate("/contact")}>
                <span className="material-symbols-outlined">edit_note</span>
                Custom Quote
              </button>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <section className="pd-tabs-section">
          <div className="pd-tabs-nav">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`pd-tab${activeTab === i ? " active" : ""}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div className="pd-tab-content">
              <div className="pd-specs-grid">
                <div>
                  <h3 className="pd-tab-heading">Artisan Craftsmanship</h3>
                  <p className="pd-tab-body">{product.craftText}</p>
                </div>
                <div className="pd-specs-box">
                  <h4 className="pd-specs-title">Technical Specifications</h4>
                  <ul className="pd-specs-list">
                    {product.specs.map(s => (
                      <li key={s.label}>
                        <span>{s.label}</span>
                        <span>{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="pd-tab-content">
              <p className="pd-tab-body">{product.craftText}</p>
            </div>
          )}

          {activeTab === 2 && (
            <div className="pd-tab-content">
              <p className="pd-tab-body">
                Hedj offers white-glove delivery and professional installation by our certified team.
                Lead time is typically 8–12 weeks. Installation includes placement, leveling, and final finishing checks.
              </p>
            </div>
          )}

          {activeTab === 3 && (
            <div className="pd-tab-content">
              <p className="pd-tab-body">
                Customize dimensions, materials, finishes, and hardware. Request a custom design quote
                to speak with our design team about bespoke configurations.
              </p>
              <button className="btn-hedj-outline" onClick={() => navigate("/contact")} style={{ marginTop: 20 }}>
                Request Custom Design
              </button>
            </div>
          )}
        </section>

        {/* Related Products */}
        <section className="pd-related-section">
          <div className="pd-related-header">
            <div>
              <h2>Complete the Look</h2>
              <p style={{ color: "var(--color-on-surface-variant)", marginTop: 4 }}>
                Curated essentials to complement your centerpiece.
              </p>
            </div>
            <Link to="/products" className="btn-hedj-ghost">Shop All</Link>
          </div>
          <div className="pd-related-grid">
            {(product.relatedIds || [])
              .map(id => RELATED_CATALOG[id])
              .filter(Boolean)
              .map(rel => (
                <div
                  key={rel.slug}
                  className="pd-related-card"
                  onClick={() => navigate(`/products/${rel.slug}`)}
                >
                  <div className="img-hover-scale pd-related-img">
                    <img src={rel.img} alt={rel.name} />
                  </div>
                  <h4>{rel.name}</h4>
                  <p>${rel.price.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductDetail;
