import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { commerceApi } from "../../services/api";

const Products = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const data = await commerceApi.getProducts();
        if (mounted) {
          setProducts(data.filter((product) => product.active !== false));
          setError("");
        }
      } catch {
        if (mounted) setError("Products could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCart = async (product) => {
    await addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      img: product.img || product.images?.[0],
      material: product.material,
    });
    toast.success(`${product.name} added to cart.`);
  };

  const handleWishlist = (product) => {
    addToWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      img: product.img || product.images?.[0],
    });
    toast.success(`${product.name} saved to wishlist.`);
  };

  const openProduct = (product) => navigate(`/products/${product.slug || product.id}`);

  const renderProduct = (product) => (
    <div key={product.id} className={viewMode === "grid" ? "product-card" : "product-row"}>
      <button
        className="product-image-button"
        type="button"
        onClick={() => openProduct(product)}
        aria-label={`View ${product.name}`}
      >
        <img
          src={product.img || product.images?.[0]}
          alt={product.name}
          className={viewMode === "grid" ? "product-image" : "product-image-list"}
        />
      </button>
      <div className={viewMode === "grid" ? undefined : "product-info"}>
        <button
          className="product-title-button"
          type="button"
          onClick={() => openProduct(product)}
        >
          {product.name}
        </button>
        <p>{product.description}</p>
        <p>Price: ${Number(product.price || 0).toLocaleString()}</p>
        <div className="actionsandrating">
          <Rating
            name={`rating-${product.id}`}
            value={Number(product.rating || product.averageRating || 0)}
            readOnly
            size="small"
            precision={0.5}
          />
          <div className="actions">
            <Button onClick={() => handleWishlist(product)} aria-label={`Save ${product.name}`}>
              <FaRegHeart />
            </Button>
          </div>
          <Button
            variant="dark"
            className="cart-button"
            onClick={() => handleCart(product)}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="product-container">
      <h1>Our Products</h1>

      <div className="view-toggle">
        <Button
          onClick={() => setViewMode("grid")}
          variant={viewMode === "grid" ? "primary" : "light"}
        >
          Grid View
        </Button>
        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "primary" : "light"}
        >
          List View
        </Button>
      </div>

      {loading && <div className="kitchen-state">Loading products...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="kitchen-state">No products found.</div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className={`product-list${viewMode === "list" ? " list-view" : ""}`}>
          {products.map(renderProduct)}
        </div>
      )}
    </div>
  );
};

export default Products;
