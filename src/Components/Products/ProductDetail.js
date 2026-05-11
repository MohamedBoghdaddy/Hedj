import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import { commerceApi } from "../../services/api";
import "./ProductDetail.css";

const TABS = ["Details", "Craftsmanship", "Delivery & Installation", "Customization Options"];

const StarFilled = () => (
  <span
    className="material-symbols-outlined"
    style={{ fontVariationSettings: "'FILL' 1", fontSize: 16, color: "var(--color-on-tertiary-container)" }}
  >
    star
  </span>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [selectedMat, setSelMat] = useState("");
  const [selectedFin, setSelFin] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        const [item, products] = await Promise.all([
          commerceApi.getProductBySlug(slug),
          commerceApi.getProducts(),
        ]);

        if (!mounted) return;
        if (!item) {
          setError("Product not found.");
          return;
        }

        setProduct(item);
        setSelMat(item.materials?.[0] || item.material || "");
        setSelFin(0);
        setActiveImg(0);
        setRelated(
          (item.relatedIds || [])
            .map((id) => products.find((candidate) => candidate.id === id || candidate.slug === id))
            .filter(Boolean)
        );
        setError("");
      } catch {
        if (mounted) setError("We could not load this product.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    await addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      img: product.images?.[0] || product.img,
      material: selectedMat,
      finish: product.finishes?.[selectedFin]?.name,
      quantity: qty,
    });
    setAddedToCart(true);
    toast.success(`${product.name} added to cart.`);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleWishlist = () => {
    if (!product) return;

    addToWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      img: product.images?.[0] || product.img,
    });
    setWishlisted(true);
    toast.success("Saved to wishlist.");
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-inner">
          <div className="kitchen-state">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-inner">
          <div className="kitchen-state kitchen-state-error">{error || "Product not found."}</div>
          <Link to="/collections" className="btn-hedj-primary">Back to Collections</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.img];
  const materials = product.materials?.length ? product.materials : [product.material].filter(Boolean);
  const finishes = product.finishes?.length ? product.finishes : [{ name: "Standard", color: "#1a1a1a" }];

  return (
    <div className="pd-page">
      <div className="pd-inner">
        <nav className="hedj-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <Link to="/Kitchen">Kitchens</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="pd-product-grid">
          <div className="pd-gallery">
            <div className="pd-main-img">
              <img src={images[activeImg]} alt={product.name} />
            </div>
            <div className="pd-thumbnails">
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  className={`pd-thumb${activeImg === index ? " active" : ""}`}
                  onClick={() => setActiveImg(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                  {index === images.length - 1 && images.length > 3 && (
                    <span className="pd-thumb-more">+12 Photos</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-info">
            <div className="pd-rating-row">
              <div className="pd-stars">
                {[...Array(5)].map((_, index) => <StarFilled key={index} />)}
              </div>
              <span className="pd-review-count">{product.reviewCount || 0} Reviews</span>
            </div>

            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-price-row">
              <span className="pd-price">${Number(product.price || 0).toLocaleString()}</span>
              <span className={`badge-status ${product.inStock ? "badge-success" : "badge-error"}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <p className="pd-desc">{product.description}</p>

            <div className="pd-option-group">
              <p className="pd-option-label">Primary Material</p>
              <div className="pd-material-btns">
                {materials.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    className={`pd-mat-btn${selectedMat === mat ? " active" : ""}`}
                    onClick={() => setSelMat(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-option-group">
              <p className="pd-option-label">Base Finish</p>
              <div className="pd-finish-btns">
                {finishes.map((fin, index) => (
                  <button
                    key={fin.name}
                    type="button"
                    className={`pd-finish-btn${selectedFin === index ? " active" : ""}`}
                    style={{ backgroundColor: fin.color }}
                    title={fin.name}
                    aria-label={fin.name}
                    onClick={() => setSelFin(index)}
                  />
                ))}
              </div>
            </div>

            <div className="pd-option-group">
              <p className="pd-option-label">Quantity</p>
              <div className="pd-qty-stepper">
                <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))}>-</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((value) => value + 1)}>+</button>
              </div>
            </div>

            <button
              className={`btn-hedj-primary pd-add-btn${addedToCart ? " added" : ""}`}
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {addedToCart ? (
                <>
                  <span className="material-symbols-outlined">check</span> Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </button>

            <div className="pd-action-row">
              <button
                className={`pd-secondary-btn${wishlisted ? " active" : ""}`}
                type="button"
                onClick={handleWishlist}
              >
                <span className="material-symbols-outlined">favorite</span>
                Wishlist
              </button>
              <button className="pd-secondary-btn" type="button" onClick={() => navigate("/contact")}>
                <span className="material-symbols-outlined">edit_note</span>
                Custom Quote
              </button>
            </div>
          </div>
        </div>

        <section className="pd-tabs-section">
          <div className="pd-tabs-nav">
            {TABS.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`pd-tab${activeTab === index ? " active" : ""}`}
                onClick={() => setActiveTab(index)}
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
                    {(product.specs || []).map((spec) => (
                      <li key={spec.label}>
                        <span>{spec.label}</span>
                        <span>{spec.value}</span>
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
                Lead time is typically 8-12 weeks and includes placement, leveling, and finishing checks.
              </p>
            </div>
          )}

          {activeTab === 3 && (
            <div className="pd-tab-content">
              <p className="pd-tab-body">
                Customize dimensions, materials, finishes, and hardware. Request a custom design quote
                to speak with our design team about bespoke configurations.
              </p>
              <button className="btn-hedj-outline" type="button" onClick={() => navigate("/contact")} style={{ marginTop: 20 }}>
                Request Custom Design
              </button>
            </div>
          )}
        </section>

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
            {related.length === 0 ? (
              <p className="pd-tab-body">No related products yet.</p>
            ) : (
              related.map((rel) => (
                <RelatedCard
                  key={rel.id}
                  product={rel}
                  onOpen={() => navigate(`/products/${rel.slug || rel.id}`)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const RelatedCard = ({ product, onOpen }) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className="pd-related-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`View ${product.name}`}
    >
      <div className="img-hover-scale pd-related-img">
        <img src={product.img || product.images?.[0]} alt={product.name} />
      </div>
      <h4>{product.name}</h4>
      <p>${Number(product.price || 0).toLocaleString()}</p>
    </div>
  );
};

export default ProductDetail;
