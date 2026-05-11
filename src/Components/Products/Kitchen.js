import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import { commerceApi } from "../../services/api";
import "../../Styles/kitchen-premium.css";

const FALLBACK_CATEGORIES = ["Islands", "Cabinets", "Countertops", "Hardware"];
const FALLBACK_MATERIALS = ["Carrara Marble", "Brushed Oak", "Graphite Steel", "Brass"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "popular", label: "Most Popular" },
];

const unique = (items, fallback) => {
  const values = [...new Set(items.filter(Boolean))];
  return values.length ? values : fallback;
};

const Kitchen = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategories, setSelCats] = useState([]);
  const [selectedMaterials, setSelMats] = useState([]);
  const [sort, setSort] = useState("newest");
  const [priceMax, setPMax] = useState(50000);
  const [visibleCount, setVisible] = useState(4);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const data = await commerceApi.getProducts({ collection: "Kitchens" });
        if (mounted) {
          setProducts(data);
          setError("");
        }
      } catch {
        if (mounted) setError("We could not load the kitchen collection.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = unique(products.map((product) => product.category), FALLBACK_CATEGORIES);
  const materials = unique(products.map((product) => product.materialTag), FALLBACK_MATERIALS);

  const toggleFilter = (value, arr, setArr) => {
    setArr((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    setVisible(4);
  };

  const filtered = products
    .filter((product) => {
      if (selectedCategories.length && !selectedCategories.includes(product.category)) return false;
      if (selectedMaterials.length && !selectedMaterials.includes(product.materialTag)) return false;
      if (Number(product.price || 0) > priceMax) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "popular") return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
      return 0;
    });

  const visible = filtered.slice(0, visibleCount);
  const progress = filtered.length
    ? Math.round((Math.min(visibleCount, filtered.length) / filtered.length) * 100)
    : 0;

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

  return (
    <div className="kitchen-page">
      <div className="kitchen-page-inner">
        <nav className="hedj-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <Link to="/collections">Collections</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="current">Kitchens</span>
        </nav>

        <div className="kitchen-header">
          <h1>The Culinary Collection</h1>
          <p>Discover high-performance kitchens where artisanal craftsmanship meets state-of-the-art innovation.</p>
        </div>

        <div className="kitchen-layout">
          <aside className="kitchen-sidebar">
            <div className="filter-group">
              <p className="filter-group-title">Category</p>
              {categories.map((cat) => (
                <label className="filter-check" key={cat}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleFilter(cat, selectedCategories, setSelCats)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <p className="filter-group-title">Material</p>
              {materials.map((mat) => (
                <label className="filter-check" key={mat}>
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(mat)}
                    onChange={() => toggleFilter(mat, selectedMaterials, setSelMats)}
                  />
                  {mat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <p className="filter-group-title">Price Range</p>
              <input
                type="range"
                className="price-slider"
                min={5000}
                max={50000}
                step={1000}
                value={priceMax}
                onChange={(event) => {
                  setPMax(Number(event.target.value));
                  setVisible(4);
                }}
              />
              <div className="price-range-labels">
                <span>$5,000</span>
                <span>${priceMax.toLocaleString()}+</span>
              </div>
            </div>
          </aside>

          <div className="kitchen-main">
            <div className="kitchen-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-count">
                  Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} Products
                </span>
                <div className="toolbar-divider" />
                <div className="view-toggles">
                  <button className="view-toggle-btn active" type="button" aria-label="Grid view">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
                  </button>
                  <button className="view-toggle-btn" type="button" aria-label="List view">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>view_list</span>
                  </button>
                </div>
              </div>
              <div className="toolbar-right">
                <span className="sort-label">Sort by:</span>
                <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading && <div className="kitchen-state">Loading collection...</div>}
            {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="kitchen-state">No products match these filters.</div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="product-grid-premium">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetail={() => navigate(`/products/${product.slug || product.id}`)}
                    onCart={() => handleCart(product)}
                    onWishlist={() => handleWishlist(product)}
                  />
                ))}
              </div>
            )}

            {filtered.length > visibleCount && (
              <div className="load-more-section">
                <div className="load-more-progress">
                  <div className="load-more-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="load-more-count">
                  Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} items
                </span>
                <button className="btn-hedj-primary" type="button" onClick={() => setVisible((value) => value + 4)}>
                  View More Collections
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onDetail, onCart, onWishlist }) => {
  const image = product.img || product.images?.[0];

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDetail();
    }
  };

  return (
    <div className="product-card-premium">
      <div
        className="product-card-img"
        role="button"
        tabIndex={0}
        onClick={onDetail}
        onKeyDown={handleKeyDown}
        aria-label={`View ${product.name}`}
      >
        <img src={image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-card-badge">{product.badge}</span>}
        <div className="product-card-actions">
          <button className="product-card-action-btn" type="button" title="Add to cart" onClick={(event) => { event.stopPropagation(); onCart(); }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_bag</span>
          </button>
          <button className="product-card-action-btn" type="button" title="Add to wishlist" onClick={(event) => { event.stopPropagation(); onWishlist(); }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>favorite</span>
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <p className="product-card-collection">{product.collectionName || product.collection}</p>
        <div className="product-card-title-row">
          <h2 className="product-card-name">{product.name}</h2>
          <span className="product-card-price">${Number(product.price || 0).toLocaleString()}</span>
        </div>
        <p className="product-card-material">{product.material}</p>
        <button className="product-card-customize" type="button" onClick={onDetail}>Customize Design</button>
      </div>
    </div>
  );
};

export default Kitchen;
