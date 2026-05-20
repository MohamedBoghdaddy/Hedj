import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import {
  formatProductPrice,
  normalizeProductList,
  productId,
  productImage,
} from "../utils/productUtils";
import "../Styles/wishlist.css";

const stockLabel = (product) => {
  const stock = Number(product.stock || 0);
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= 5) return { text: "Low stock", tone: "low" };
  return { text: "In stock", tone: "in" };
};

const productPath = (product) => `/products/${product.slug || productId(product)}`;

const WishlistCard = ({ product, onRemove, onMoveToBag }) => {
  const id = productId(product);
  const stock = stockLabel(product);

  return (
    <article className="wishlist-card">
      <div className="wishlist-card-image">
        <img
          src={productImage(product)}
          alt={product.name || "Wishlist product"}
          loading="lazy"
        />

        <button
          type="button"
          onClick={() => onRemove(product)}
          aria-label={`Remove ${product.name} from wishlist`}
          className="wishlist-remove-floating"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="wishlist-card-body">
        <div className="wishlist-card-meta">
          <span>{product.category || product.collection || "Furniture"}</span>
          <span className={`wishlist-stock ${stock.tone}`}>{stock.text}</span>
        </div>

        <h3>{product.name || product.title || "Untitled Product"}</h3>
        <p className="wishlist-card-price">{formatProductPrice(product.price)}</p>

        <div className="wishlist-card-actions">
          <button
            type="button"
            onClick={() => onMoveToBag(product)}
            disabled={stock.tone === "out"}
          >
            {stock.tone === "out" ? "Unavailable" : "Move to Bag"}
          </button>

          <Link to={productPath(product)} state={{ product, productId: id }}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

const EmptyWishlist = () => (
  <div className="wishlist-empty">
    <div className="wishlist-empty-icon">
      <span className="material-symbols-outlined">heart_broken</span>
    </div>
    <h2>Your wishlist is empty</h2>
    <p>Saved products you may want to come back to will appear here.</p>
    <Link to="/products" className="wishlist-primary-link">
      Continue Shopping
    </Link>
  </div>
);

const Wishlist = () => {
  const navigate = useNavigate();
  const shop = useContext(ShopContext);
  const [notice, setNotice] = useState("");

  const wishlistItems = useMemo(
    () => normalizeProductList(shop?.wishlistItems || []),
    [shop?.wishlistItems],
  );

  const itemCount = wishlistItems.length;
  const countLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"} saved`;

  const handleRemove = async (product) => {
    const id = productId(product);
    try {
      await shop?.removeFromWishlist?.(id);
      setNotice(`${product.name || "Product"} removed from your wishlist.`);
    } catch (error) {
      setNotice(error.message || "Could not remove this product. Please try again.");
    }
  };

  const handleMoveToBag = async (product) => {
    try {
      await shop?.addToCart?.({ ...product, quantity: 1 });
      await shop?.removeFromWishlist?.(productId(product));
      setNotice(`${product.name || "Product"} moved to your bag.`);
    } catch (error) {
      setNotice(error.message || "Could not move this product. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Hedj Commerce Wishlist",
      text: "View my curated Hedj Commerce wishlist.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice("Wishlist link copied to clipboard.");
      }
    } catch {
      setNotice("Wishlist sharing was cancelled.");
    }
  };

  return (
    <PublicCommerceShell active="Products">
      <main className="wishlist-page">
        <section className="wishlist-header">
          <div>
            <p className="wishlist-eyebrow">Selected Works</p>
            <h1>My Wishlist</h1>
            <p>Saved products you may want to come back to.</p>
          </div>

          <div className="wishlist-header-actions">
            <span>{countLabel}</span>
            {itemCount > 0 && (
              <button type="button" onClick={handleShare}>
                <span className="material-symbols-outlined">share</span>
                Share List
              </button>
            )}
          </div>
        </section>

        {(notice || shop?.syncWarning) && (
          <div className="wishlist-notice" role="status">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{notice || shop.syncWarning}</span>
          </div>
        )}

        {shop?.wishlistLoading ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <h2>Loading your wishlist</h2>
            <p>Fetching saved products from your account.</p>
          </div>
        ) : itemCount > 0 ? (
          <section className="wishlist-grid" aria-label="Wishlist products">
            {wishlistItems.map((product) => (
              <WishlistCard
                key={productId(product)}
                product={product}
                onRemove={handleRemove}
                onMoveToBag={handleMoveToBag}
              />
            ))}
          </section>
        ) : (
          <EmptyWishlist />
        )}

        <section className="wishlist-consultation">
          <div>
            <h2>Interior Design Consultations</h2>
            <p>
              Looking to integrate these pieces into your home? Our expert designers
              provide personalized guidance for every space.
            </p>
          </div>

          <button type="button" onClick={() => navigate("/contact")}>
            Book a Consultation
          </button>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default Wishlist;
