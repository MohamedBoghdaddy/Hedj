import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import "../Styles/catalog-premium.css";
import "../Styles/commerce-premium.css";

const products = [
  {
    id: "monolith-island-system",
    slug: "monolith-island-system",
    name: "Monolith Island System",
    price: 18400,
    material: "Carrara Marble & Matte Graphite Steel",
    materialTag: "Carrara Marble",
    category: "Islands",
    badge: "Limited Edition",
    popularity: 93,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwhawMmgV2ZRuUC_ASixvKdq4t1RnaketDVKiovS4zBoU5_XXxBxtk-G5iA38zOgD6jW3zVC1Ohj41ua9-aIVvWxpgl5wLmP2zLFTAH88tZmGjnRYbiNM4iw4Og0toe98mL1zPtAZZJgftPb4RZ0ukxk4E5KDkU9lOS-bFiP9DewAYVTrUltzqApMw4QIhlrzkWFUUg5wTeuR_Ym8HnRlZNTtw_fjXCl_doz7Wx1DyMVf2Jn4glQ-FKiddaE9hyCsMLulha__dbI_c",
  },
  {
    id: "nordic-oak-cabinetry",
    slug: "nordic-oak-cabinetry",
    name: "Nordic Oak Cabinetry",
    price: 12500,
    material: "Natural Blonde Oak & Brushed Brass",
    materialTag: "Brushed Oak",
    category: "Cabinets",
    popularity: 88,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTullwNbfrVoCaBUwYlQMbdGVVh0rHSYJeq0FVdmA6LogDb6Dt14tDnY0KEBBJday-7xQbFuQLCi6v4NBtsvt3_r_3lpRMQ8Ti3EFk76Ej9imq5amvAAsvgz7DHQI6jOWUPiT5NA-8O0buf3HsHK8txZKPGLtWVyEwwiiHFeX1NXLh1U5imnbtpdiA83Z5_w7RmSABSxsWfUhWYDVkSI-IOObgUZvZWA1krULuY2Rxui4CTxei2CG5OTBxX6lfNeCjuBtWYGvDy2nF",
  },
  {
    id: "midnight-brass-galley",
    slug: "midnight-brass-galley",
    name: "Midnight Brass Galley",
    price: 21000,
    material: "Deep Navy Enamel & Polished Brass",
    materialTag: "Graphite Steel",
    category: "Countertops",
    popularity: 96,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYIB6-cd4q59SmMBKofw25FOse0tHhos7X1R249ME5iRE7nzNcd3oyDJK9LBthGJlvsl77A489IZFv6w3HUY68n4JTyBbwqhc3Ii3-7HxYMkhHvxXJiUKZS05V_ZEU-16a7IOSgICgFbg3nO1qdqXTyXW1LA7ZkhQhVlle1yOqtrYJyvIcoM274h-AZ8MH8WXmDoVlDT_Df8pGNEBilCOLW1Ctd0_545P8DuCPuqMs7v-rPIJwEfylICU4f8lwO7az1hLcp6QnK-Ps",
  },
];

const categories = ["Islands", "Cabinets", "Countertops"];
const materials = ["Carrara Marble", "Brushed Oak", "Graphite Steel"];

const money = (value) => `$${Number(value || 0).toLocaleString()}`;

const KitchenCollections = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sort, setSort] = useState("Newest Arrivals");
  const [view, setView] = useState("grid");
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const navigate = useNavigate();

  const toggle = (value, setter) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const materialMatch =
        selectedMaterials.length === 0 || selectedMaterials.includes(product.materialTag);
      return categoryMatch && materialMatch && product.price <= maxPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "Price High to Low") return b.price - a.price;
      if (sort === "Price Low to High") return a.price - b.price;
      if (sort === "Most Popular") return b.popularity - a.popularity;
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [maxPrice, selectedCategories, selectedMaterials, sort]);

  const addProductToCart = async (product) => {
    await addToCart({
      ...product,
      img: product.image,
      image: product.image,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart.`);
  };

  const saveProduct = (product) => {
    addToWishlist({ ...product, img: product.image, image: product.image });
    toast.success(`${product.name} saved to wishlist.`);
  };

  return (
    <PublicCommerceShell active="Collections">
      <main className="catalog-page">
        <div className="catalog-container">
          <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/collections">Collections</Link>
            <span>/</span>
            <span>Kitchens</span>
          </nav>

          <section className="catalog-hero">
            <h1>The Culinary Collection</h1>
            <p>
              Discover our curated selection of high-performance kitchens where
              artisanal craftsmanship meets state-of-the-art innovation.
            </p>
          </section>

          <section className="catalog-layout">
            <aside className="catalog-filters" aria-label="Product filters">
              <div className="catalog-filter-group">
                <h2>Category</h2>
                {categories.map((category) => (
                  <label className="catalog-check" key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggle(category, setSelectedCategories)}
                    />
                    {category}
                  </label>
                ))}
              </div>

              <div className="catalog-filter-group">
                <h2>Material</h2>
                {materials.map((material) => (
                  <label className="catalog-check" key={material}>
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material)}
                      onChange={() => toggle(material, setSelectedMaterials)}
                    />
                    {material}
                  </label>
                ))}
              </div>

              <div className="catalog-filter-group">
                <h2>Price Range</h2>
                <input
                  aria-label="Maximum price"
                  max="25000"
                  min="5000"
                  step="500"
                  type="range"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
                <p>Up to {money(maxPrice)}</p>
              </div>
            </aside>

            <div>
              <div className="catalog-toolbar">
                <p>
                  Showing {visibleProducts.length} of {products.length} Products
                </p>

                <div className="catalog-controls">
                  <button
                    type="button"
                    aria-label="Grid view"
                    className={`catalog-icon-button ${view === "grid" ? "active" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    <span className="material-symbols-outlined">grid_view</span>
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    className={`catalog-icon-button ${view === "list" ? "active" : ""}`}
                    onClick={() => setView("list")}
                  >
                    <span className="material-symbols-outlined">view_list</span>
                  </button>
                  <select
                    className="catalog-sort"
                    aria-label="Sort products"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                  >
                    <option>Newest Arrivals</option>
                    <option>Price High to Low</option>
                    <option>Price Low to High</option>
                    <option>Most Popular</option>
                  </select>
                </div>
              </div>

              {visibleProducts.length === 0 ? (
                <div className="catalog-empty">No products match those filters.</div>
              ) : (
                <div className={`catalog-grid ${view}`}>
                  {visibleProducts.map((product) => (
                    <article className={`catalog-card ${view}`} key={product.id}>
                      <Link className="catalog-image-link" to={`/products/${product.slug}`}>
                        <img src={product.image} alt={product.name} />
                        {product.badge && <span className="catalog-badge">{product.badge}</span>}
                      </Link>

                      <div className="catalog-overlay-actions">
                        <button
                          type="button"
                          aria-label={`Save ${product.name}`}
                          onClick={() => saveProduct(product)}
                        >
                          <span className="material-symbols-outlined">favorite</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={() => addProductToCart(product)}
                        >
                          <span className="material-symbols-outlined">shopping_bag</span>
                        </button>
                      </div>

                      <div className="catalog-card-body">
                        <p className="catalog-label">{product.category}</p>
                        <h3>
                          <Link to={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className="catalog-price">{money(product.price)}</p>
                        <p className="catalog-material">{product.material}</p>
                        <button
                          type="button"
                          className="catalog-customize"
                          onClick={() => navigate(`/products/${product.slug}`)}
                        >
                          Customize Design
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </PublicCommerceShell>
  );
};

export default KitchenCollections;
