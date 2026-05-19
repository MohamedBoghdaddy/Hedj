import { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import "./homepage-premium.css";

const bestSellers = [
  {
    id: "eames-lounge",
    name: "Eames-inspired Lounge",
    material: "Walnut & Obsidian Leather",
    price: 3450,
    slug: "eames-inspired-lounge",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDQRi1k8N6-bVUnHb9sRnIfygIzsSrb83AbVv4Zrp7P_iwBAfVSOsuNjZo-v3HKXCp7YyTWjGsuvkx5HKPclsJ8u6xp-ljLJ15wiu7PJ7BSrdwUbGQk-wF8zu4NsPgGF5jIWWG6dv3X4T8H_LdwtyYfMJD9CyUL4r-tzRc9-19GjofYEEZN4hrNfVZW4G31iHxcjpwJiaekiiRCTVA5JboW3SjpB4whlKBhvMO-cgzORFMRwP0WHhBe8aZfq-_WVC6wmKln5qiQ4qo4",
  },
  {
    id: "minimalist-oak-island",
    name: "Minimalist Oak Island",
    material: "Solid European Oak",
    price: 2800,
    slug: "minimalist-oak-island",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCr4eCO5SgTp4VuDPv1koXNLq8PR4kobnSWGbvPg41FZ4Fvcu1eR1N8tRnhvJRUhavRu727cXrxCvYAzTBkwk7gNecfuFMO67Y2hi8aMutEqoUp0x7-MEPRBJq4qb2S_SYGouMKH0MkJXmAGo16bMOr5wjpXj480c9BztYnFYpIc4PW280TOj53IM2GbEIvhao3C5p1xwBq6kJL4H4hXZun4nw0HE8jeU26CYcpsOPVMgBFVt6wd9nxympQkEraOzHv2dyL0vKUioRQ",
  },
  {
    id: "bronze-geometric-table",
    name: "Bronze Geometric Table",
    material: "Tinted Glass & Bronze",
    price: 4100,
    slug: "bronze-geometric-table",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1NRvFt7-d_HJ2hl5vRggxT4gEulZ8ejVYQmFRQhTmy2TY5buWoOFAZwoDUS0pJFl0HkXlpO0L8WY9s0-KY4GQgsDwVu3k30zq3WrQwyrUMyLkVrutJ_hY7dlAUPin23T4-TwNkS5GkPgkvxHZnDoK6vtJJNbWjMWBf0RShdEWqvOQwbJqnNHlAQcdtolMSCKjiQI5HDKfBVeB0gh9LljXSBIRYMTzpSGqL_dz4FJa8655yisT9wR7W_ryssRYBycIX3BaPCL3bPXx",
  },
];

const money = (amount) => `$${amount.toLocaleString()}`;

const Slideshow = () => {
  const scrollRef = useRef(null);
  const { addToCart } = useContext(ShopContext);

  const scrollBy = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        ...product,
        quantity: 1,
        img: product.image,
      });
      toast.success(`${product.name} added to your cart.`);
    } catch {
      toast.info("Cart is unavailable right now. Please try again in a moment.");
    }
  };

  return (
    <section className="hedj-best" aria-labelledby="best-sellers-heading">
      <div className="hedj-home-container hedj-best-header">
        <div>
          <span>Iconic Pieces</span>
          <h2 id="best-sellers-heading">Best Sellers</h2>
        </div>
        <div className="hedj-best-controls">
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous best sellers">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button type="button" onClick={() => scrollBy(1)} aria-label="Next best sellers">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="hedj-best-scroll" ref={scrollRef}>
        {bestSellers.map((product) => (
          <article className="hedj-best-card" key={product.id}>
            <div className="hedj-best-image">
              <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
              </button>
            </div>
            <Link to={`/products/${product.slug}`} className="hedj-best-title">
              {product.name}
            </Link>
            <p>{product.material}</p>
            <strong>{money(product.price)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Slideshow;
