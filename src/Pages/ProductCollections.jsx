import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { commerceApi } from "../services/api";
import {
  formatProductPrice,
  normalizeProductList,
  slugify,
} from "../utils/productUtils";
import "../Styles/commerce-premium.css";
import "../Styles/product-collections-premium.css";

const ITEMS_PER_PAGE = 12;

const categoryMeta = {
  products: {
    label: "Products",
    heading: "The Collections",
    description:
      "Discover a living catalogue of Hedj furniture, materials, and architectural pieces drawn from the current product database.",
  },
  collections: {
    label: "Collections",
    heading: "Curated Collections",
    description:
      "Explore Hedj pieces by room and ritual, from architectural kitchens to softer finishing objects.",
  },
  kitchens: {
    label: "Kitchens",
    heading: "Kitchen Collections",
    description:
      "Sculptural cabinetry, worktops, tables, and lighting for the kitchen as the architectural heart of the home.",
  },
  bedrooms: {
    label: "Bedrooms",
    heading: "Bedroom Collections",
    description:
      "Considered furniture for rest and renewal, from platform beds to hand-finished storage and soft textiles.",
  },
  outdoor: {
    label: "Outdoor",
    heading: "Outdoor Collections",
    description:
      "Weather-conscious furniture for terraces, gardens, and courtyards with the same rigor as our interiors.",
  },
  complements: {
    label: "Complements",
    heading: "Complements Collection",
    description:
      "Decorative objects, textiles, and lighting selected for artisanal quality and quiet sculptural presence.",
  },
};

const priceRanges = [
  { label: "Under 5,000", min: "", max: "5000" },
  { label: "5,000-10,000", min: "5000", max: "10000" },
  { label: "10,000-20,000", min: "10000", max: "20000" },
  { label: "Above 20,000", min: "20000", max: "" },
];

const filterKeys = [
  "search",
  "category",
  "collection",
  "minPrice",
  "maxPrice",
  "stock",
  "material",
  "color",
  "room",
  "sort",
];

const uniqueOptions = (products, field) =>
  [...new Set(products.map((product) => product[field]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)));

const stockLabel = (value) => {
  if (value === "in") return "In Stock";
  if (value === "out") return "Out of Stock";
  if (value === "low") return "Low Stock";
  return "";
};

export default function ProductCollections() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const shop = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const routeCollection = pathname.match(/^\/collections\/([^/?]+)/)?.[1];
  const isCollectionsRoute = pathname.startsWith("/collections");
  const meta =
    categoryMeta[routeCollection] ||
    (isCollectionsRoute ? categoryMeta.collections : categoryMeta.products);

  const filters = useMemo(() => {
    const value = (key) => searchParams.get(key) || "";
    const routeValue = routeCollection ? categoryMeta[routeCollection]?.label || routeCollection : "";
    return {
      search: value("search"),
      category: value("category"),
      collection: value("collection") || routeValue,
      minPrice: value("minPrice"),
      maxPrice: value("maxPrice"),
      stock: value("stock"),
      material: value("material"),
      color: value("color"),
      room: value("room"),
      sort: value("sort") || "newest",
    };
  }, [routeCollection, searchParams]);

  const apiFilters = useMemo(() => {
    const next = {
      search: filters.search,
      category: filters.category,
      collection: filters.collection,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      material: filters.material,
      color: filters.color,
      room: filters.room,
      sort: filters.sort,
    };

    if (filters.stock === "in") next.inStock = "true";
    if (filters.stock === "out") next.inStock = "false";
    return next;
  }, [filters]);

  useEffect(() => {
    let alive = true;
    setLoadingProducts(true);

    Promise.all([commerceApi.getProducts(), commerceApi.getProducts(apiFilters)])
      .then(([facetProducts, filteredProducts]) => {
        if (!alive) return;
        setAllProducts(normalizeProductList(facetProducts));
        setProducts(normalizeProductList(filteredProducts));
        setProductError("");
      })
      .catch((error) => {
        if (!alive) return;
        setProducts([]);
        setProductError(error.message || "Products could not be loaded from the backend.");
      })
      .finally(() => {
        if (alive) setLoadingProducts(false);
      });

    return () => {
      alive = false;
    };
  }, [apiFilters]);

  useEffect(() => {
    setPage(1);
  }, [pathname, searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.stock === "low") {
      result = result.filter(
        (product) =>
          Number(product.stock) > 0 &&
          Number(product.stock) <= Number(product.lowStockThreshold || 5)
      );
    }

    if (filters.sort === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (filters.sort === "price_asc") result.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") result.sort((a, b) => b.price - a.price);
    if (filters.sort === "featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
  }, [filters.sort, filters.stock, products]);

  const options = useMemo(
    () => ({
      category: uniqueOptions(allProducts, "category"),
      collection: uniqueOptions(allProducts, "collection"),
      material: uniqueOptions(allProducts, "material"),
      color: uniqueOptions(allProducts, "color"),
      room: uniqueOptions(allProducts, "room"),
    }),
    [allProducts]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const visibleProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "sort" && next.get("page")) next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setFiltersOpen(false);
  };

  const applyPricePreset = (range) => {
    const next = new URLSearchParams(searchParams);
    if (range.min) next.set("minPrice", range.min);
    else next.delete("minPrice");
    if (range.max) next.set("maxPrice", range.max);
    else next.delete("maxPrice");
    setSearchParams(next, { replace: true });
  };

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleWishlist = (product) => {
    shop?.addToWishlist?.(product);
    showMessage(`${product.name} added to wishlist.`);
  };

  const handleAddToCart = async (product) => {
    await shop?.addToCart?.({ ...product, quantity: 1 });
    showMessage(`${product.name} added to cart.`);
  };

  const activeChips = filterKeys
    .filter((key) => key !== "sort")
    .map((key) => {
      const value = filters[key];
      if (!value) return null;
      if (key === "stock") return { key, label: stockLabel(value) };
      if (key === "minPrice" || key === "maxPrice") return null;
      return { key, label: `${key[0].toUpperCase()}${key.slice(1)}: ${value}` };
    })
    .filter(Boolean);

  if (filters.minPrice || filters.maxPrice) {
    activeChips.push({
      key: "price",
      label: `Price: ${filters.minPrice || "0"}-${filters.maxPrice || "any"}`,
    });
  }

  const removeChip = (chip) => {
    if (chip.key === "price") {
      const next = new URLSearchParams(searchParams);
      next.delete("minPrice");
      next.delete("maxPrice");
      setSearchParams(next, { replace: true });
      return;
    }
    setFilter(chip.key, "");
  };

  const filterPanel = (
    <div className="products-filter-panel">
      <div className="products-filter-heading">
        <h2>Filters</h2>
        <button type="button" onClick={resetFilters}>Reset</button>
      </div>

      <label className="products-filter-field">
        <span>Search</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => setFilter("search", event.target.value)}
          placeholder="Name, material, collection"
        />
      </label>

      <FilterSelect label="Category" value={filters.category} options={options.category} onChange={(value) => setFilter("category", value)} />
      {!routeCollection && (
        <FilterSelect label="Collection" value={filters.collection} options={options.collection} onChange={(value) => setFilter("collection", value)} />
      )}
      <FilterSelect label="Material" value={filters.material} options={options.material} onChange={(value) => setFilter("material", value)} />
      <FilterSelect label="Color" value={filters.color} options={options.color} onChange={(value) => setFilter("color", value)} />
      <FilterSelect label="Room / Use" value={filters.room} options={options.room} onChange={(value) => setFilter("room", value)} />

      <div className="products-filter-field">
        <span>Price</span>
        <div className="products-price-inputs">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(event) => setFilter("minPrice", event.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(event) => setFilter("maxPrice", event.target.value)}
          />
        </div>
        <div className="products-price-presets">
          {priceRanges.map((range) => (
            <button key={range.label} type="button" onClick={() => applyPricePreset(range)}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <FilterSelect
        label="Availability"
        value={filters.stock}
        options={[
          ["in", "In stock"],
          ["out", "Out of stock"],
          ["low", "Low stock"],
        ]}
        onChange={(value) => setFilter("stock", value)}
      />
    </div>
  );

  return (
    <PublicCommerceShell active={isCollectionsRoute ? "Collections" : "Products"}>
      <main className="products-collection-container">
        <nav className="products-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          {isCollectionsRoute ? (
            <>
              <Link to="/collections">Collections</Link>
              {routeCollection && (
                <>
                  <span className="material-symbols-outlined">chevron_right</span>
                  <span>{meta.label}</span>
                </>
              )}
            </>
          ) : (
            <span>Products</span>
          )}
        </nav>

        <section className="products-intro">
          <h1>{meta.heading}</h1>
          <p>{meta.description}</p>
        </section>

        {message && <div className="products-toast" role="status">{message}</div>}

        <section className="products-toolbar">
          <div className="products-toolbar-left">
            <button
              className="products-filter-button"
              type="button"
              onClick={() => setFiltersOpen(true)}
            >
              <span className="material-symbols-outlined">filter_list</span>
              Filters
            </button>
            <div className="products-toolbar-divider" />
            <label className="products-sort">
              <span>Sort By</span>
              <select value={filters.sort} onChange={(event) => setFilter("sort", event.target.value)}>
                <option value="newest">Newest</option>
                <option value="featured">Featured first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </label>
          </div>

          <div className="products-toolbar-right">
            <div className="products-view-toggle">
              <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} aria-label="Grid view">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-label="List view">
                <span className="material-symbols-outlined">view_list</span>
              </button>
            </div>
            <p>
              Showing <strong>{visibleProducts.length}</strong> of{" "}
              <strong>{filteredProducts.length}</strong> products
            </p>
          </div>
        </section>

        {activeChips.length > 0 && (
          <div className="products-active-chips" aria-label="Active filters">
            {activeChips.map((chip) => (
              <button key={`${chip.key}-${chip.label}`} type="button" onClick={() => removeChip(chip)}>
                {chip.label}
                <span className="material-symbols-outlined">close</span>
              </button>
            ))}
            <button type="button" className="products-reset-chip" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}

        <div className="products-shop-layout">
          <aside className="products-filter-sidebar">{filterPanel}</aside>

          <section className="products-results">
            {loadingProducts && <p className="products-state">Loading products from the backend...</p>}
            {!loadingProducts && productError && <p className="products-state products-state-error">{productError}</p>}
            {!loadingProducts && !productError && filteredProducts.length === 0 && (
              <div className="products-empty-state">
                <span className="material-symbols-outlined">search_off</span>
                <h2>No products match your filters.</h2>
                <p>Try clearing one or two filters to widen the catalogue.</p>
                <button type="button" onClick={resetFilters}>Reset Filters</button>
              </div>
            )}

            {!loadingProducts && !productError && filteredProducts.length > 0 && (
              <div className={viewMode === "list" ? "products-grid products-grid-list" : "products-grid"}>
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onWishlist={handleWishlist}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {page < totalPages && !loadingProducts && filteredProducts.length > visibleProducts.length && (
          <section className="products-pagination">
            <div className="products-pagination-line" />
            <button
              type="button"
              className="products-load-more"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <span>Load More Products</span>
            </button>
          </section>
        )}
      </main>

      {filtersOpen && (
        <div className="products-filter-drawer" role="dialog" aria-modal="true">
          <div className="products-filter-drawer-panel">
            <div className="products-filter-drawer-top">
              <strong>Refine Products</strong>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {filterPanel}
            <button type="button" className="products-apply-filters" onClick={() => setFiltersOpen(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </PublicCommerceShell>
  );
}

const FilterSelect = ({ label, value, options, onChange }) => (
  <label className="products-filter-field">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">All</option>
      {options.map((option) => {
        const optionValue = Array.isArray(option) ? option[0] : option;
        const optionLabel = Array.isArray(option) ? option[1] : option;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  </label>
);

const ProductCard = ({ product, onAddToCart, onWishlist }) => {
  const stockText =
    product.stock > 0
      ? product.stock <= Number(product.lowStockThreshold || 5)
        ? "Low stock"
        : "In stock"
      : "Out of stock";

  return (
    <article className="collection-product-card">
      <div className="collection-product-image">
        <img src={product.image} alt={product.name} />
        {product.featured && <span className="collection-product-label">Featured</span>}
        <div className="collection-product-actions">
          <Link to={`/products/${product.slug || slugify(product.name)}`} className="collection-quick-view">
            View Details
          </Link>
          <button type="button" className="collection-add-to-cart" onClick={() => onAddToCart(product)}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Add to Cart
          </button>
          <button type="button" className="collection-wishlist" onClick={() => onWishlist(product)}>
            <span className="material-symbols-outlined">favorite</span>
            Add to Wishlist
          </button>
        </div>
      </div>
      <div className="collection-product-info">
        <span>{product.collection || product.category || "Uncategorized"}</span>
        <h3>{product.name}</h3>
        <p>{formatProductPrice(product.price)}</p>
        <small className={product.stock > 0 ? "stock-ok" : "stock-out"}>{stockText}</small>
      </div>
    </article>
  );
};
