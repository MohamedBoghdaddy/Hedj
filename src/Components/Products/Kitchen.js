import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/productContext";
import "../../Styles/kitchen-premium.css";

const KITCHEN_PRODUCTS = [
  {
    id: "monolith-island-system",
    slug: "monolith-island-system",
    name: "Monolith Island System",
    collection: "The Zenith Collection",
    price: 18400,
    material: "Carrara Marble & Matte Graphite Steel",
    badge: "Limited Edition",
    category: "Islands",
    materialTag: "Carrara Marble",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",
  },
  {
    id: "nordic-oak-cabinetry",
    slug: "nordic-oak-cabinetry",
    name: "Nordic Oak Cabinetry",
    collection: "The Zenith Collection",
    price: 12500,
    material: "Natural Blonde Oak & Brushed Brass",
    badge: null,
    category: "Cabinets",
    materialTag: "Brushed Oak",
    img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=80",
  },
  {
    id: "midnight-brass-galley",
    slug: "midnight-brass-galley",
    name: "Midnight Brass Galley",
    collection: "The Zenith Collection",
    price: 21000,
    material: "Deep Navy Enamel & Polished Brass",
    badge: null,
    category: "Cabinets",
    materialTag: "Brushed Oak",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=700&q=80",
  },
  {
    id: "obsidian-kitchen-island",
    slug: "obsidian-kitchen-island",
    name: "The Obsidian Kitchen Island",
    collection: "The Obsidian Series",
    price: 12450,
    material: "Black Marble & Hand-finished Oak",
    badge: "Bestseller",
    category: "Islands",
    materialTag: "Carrara Marble",
    img: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=700&q=80",
  },
  {
    id: "carrara-countertop-suite",
    slug: "carrara-countertop-suite",
    name: "Carrara Countertop Suite",
    collection: "The Stone Series",
    price: 8900,
    material: "Carrara Marble",
    badge: null,
    category: "Countertops",
    materialTag: "Carrara Marble",
    img: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=700&q=80",
  },
  {
    id: "graphite-steel-kitchen",
    slug: "graphite-steel-kitchen",
    name: "Graphite Steel Kitchen",
    collection: "The Industrial Series",
    price: 15800,
    material: "Graphite Steel",
    badge: "New Arrival",
    category: "Cabinets",
    materialTag: "Graphite Steel",
    img: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=700&q=80",
  },
];

const CATEGORIES  = ["Islands", "Cabinets", "Countertops"];
const MATERIALS   = ["Carrara Marble", "Brushed Oak", "Graphite Steel"];
const SORT_OPTIONS = [
  { value: "newest",       label: "Newest Arrivals" },
  { value: "price-high",   label: "Price: High to Low" },
  { value: "price-low",    label: "Price: Low to High" },
  { value: "popular",      label: "Most Popular" },
];

const Kitchen = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const navigate = useNavigate();

  const [selectedCategories, setSelCats]  = useState([]);
  const [selectedMaterials,  setSelMats]  = useState([]);
  const [sort,   setSort]   = useState("newest");
  const [priceMax, setPMax] = useState(50000);
  const [visibleCount, setVisible] = useState(4);

  const toggleFilter = (value, arr, setArr) => {
    setArr(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
    setVisible(4);
  };

  const filtered = KITCHEN_PRODUCTS.filter(p => {
    if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
    if (selectedMaterials.length  && !selectedMaterials.includes(p.materialTag))  return false;
    if (p.price > priceMax) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "price-high") return b.price - a.price;
    if (sort === "price-low")  return a.price - b.price;
    return 0;
  });

  const visible  = filtered.slice(0, visibleCount);
  const progress = Math.round((visibleCount / filtered.length) * 100);

  return (
    <div className="kitchen-page">
      <div className="kitchen-page-inner">

        {/* Breadcrumb */}
        <nav className="hedj-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <Link to="/collections">Collections</Link>
          <span className="sep material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="current">Kitchens</span>
        </nav>

        {/* Header */}
        <div className="kitchen-header">
          <h1>The Culinary Collection</h1>
          <p>Discover our curated selection of high-performance kitchens where artisanal craftsmanship meets state-of-the-art innovation.</p>
        </div>

        {/* Layout */}
        <div className="kitchen-layout">

          {/* Sidebar Filters */}
          <aside className="kitchen-sidebar">
            {/* Category */}
            <div className="filter-group">
              <p className="filter-group-title">Category</p>
              {CATEGORIES.map(cat => (
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

            {/* Material */}
            <div className="filter-group">
              <p className="filter-group-title">Material</p>
              {MATERIALS.map(mat => (
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

            {/* Price Range */}
            <div className="filter-group">
              <p className="filter-group-title">Price Range</p>
              <input
                type="range"
                className="price-slider"
                min={5000}
                max={50000}
                step={1000}
                value={priceMax}
                onChange={e => { setPMax(Number(e.target.value)); setVisible(4); }}
              />
              <div className="price-range-labels">
                <span>$5,000</span>
                <span>${priceMax.toLocaleString()}+</span>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <div className="kitchen-main">

            {/* Toolbar */}
            <div className="kitchen-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-count">
                  Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} Products
                </span>
                <div className="toolbar-divider" />
                <div className="view-toggles">
                  <button className="view-toggle-btn active">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
                  </button>
                  <button className="view-toggle-btn">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>view_list</span>
                  </button>
                </div>
              </div>
              <div className="toolbar-right">
                <span className="sort-label">Sort by:</span>
                <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="product-grid-premium">
              {visible.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDetail={() => navigate(`/products/${product.slug}`)}
                  onCart={() => addToCart({ ...product, id: product.id })}
                  onWishlist={() => addToWishlist({ ...product, id: product.id })}
                />
              ))}
            </div>

            {/* Load more */}
            {filtered.length > visibleCount && (
              <div className="load-more-section">
                <div className="load-more-progress">
                  <div className="load-more-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="load-more-count">
                  Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} items
                </span>
                <button
                  className="btn-hedj-primary"
                  onClick={() => setVisible(v => v + 4)}
                >
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

const ProductCard = ({ product, onDetail, onCart, onWishlist }) => (
  <div className="product-card-premium">
    <div className="product-card-img" onClick={onDetail}>
      <img src={product.img} alt={product.name} loading="lazy" />
      {product.badge && <span className="product-card-badge">{product.badge}</span>}
      <div className="product-card-actions">
        <button className="product-card-action-btn" title="Add to cart" onClick={(e) => { e.stopPropagation(); onCart(); }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_bag</span>
        </button>
        <button className="product-card-action-btn" title="Add to wishlist" onClick={(e) => { e.stopPropagation(); onWishlist(); }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>favorite</span>
        </button>
      </div>
    </div>
    <div className="product-card-info">
      <p className="product-card-collection">{product.collection}</p>
      <div className="product-card-title-row">
        <h2 className="product-card-name">{product.name}</h2>
        <span className="product-card-price">${product.price.toLocaleString()}</span>
      </div>
      <p className="product-card-material">{product.material}</p>
      <button className="product-card-customize" onClick={onDetail}>Customize Design</button>
    </div>
  </div>
);

export default Kitchen;
