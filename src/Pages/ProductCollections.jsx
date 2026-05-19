import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicFooter, PublicNavbar } from "../Components/PublicCommerceShell";
import "../Styles/commerce-premium.css";
import "../Styles/product-collections-premium.css";

const ITEMS_PER_PAGE = 9;

const allProducts = [
  { id: 1, name: "Monolith Island System", price: 18400, label: "New Arrival", category: "Kitchen", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
  { id: 2, name: "Nordic Oak Cabinetry", price: 12500, category: "Storage", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
  { id: 3, name: "Sven Modular Sofa", price: 4500, label: "Limited Edition", category: "Seating", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
  { id: 4, name: "Atlas Brass Floor Lamp", price: 2100, category: "Lighting", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
  { id: 5, name: "Travertine Dining Table", price: 9200, category: "Tables", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
  { id: 6, name: "Aero Task Chair", price: 3850, category: "Office", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO97pjMDCcZHkZLDkTJStXN_VkalJ9XVqhG0Z-zDM5EGv0fVYu8UiO-hgR9eby2IJqnW1rri-Q_3r__ah3j7xiPGGTMF3Hu40zxqrmU5S1ao7gLSNuWtAhYZJPVZW4hUHQInc3B_UatQdZEJ0Mrj1t-M1JK9bemegL-hlkLqNxjjGajozfufK1giZPZMEvjPDb232yty5cVv-oZ8dSuqyh96ehFgRc7jxrBlqhJ1IJO6MC3HJjohgdr1c1_Hk8RhaoZjjHrnZll3JK" },
  { id: 7, name: "Elowen Velvet Armchair", price: 2800, label: "Best Seller", category: "Seating", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
  { id: 8, name: "Lumiere Sconce Duo", price: 850, category: "Lighting", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
  { id: 9, name: "Marais Oak Dining Table", price: 3200, category: "Tables", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
  { id: 10, name: "Copenhagen Platform Bed", price: 6400, label: "New Arrival", category: "Bedroom", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
  { id: 11, name: "Zen Linen Dresser", price: 3200, category: "Bedroom", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
  { id: 12, name: "Belgian Oak Wardrobe", price: 8100, category: "Storage", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
  { id: 13, name: "Teak Lounge Chair", price: 2600, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
  { id: 14, name: "Weather Oak Dining Set", price: 7800, label: "Collection", category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
  { id: 15, name: "Slate Stone Planter Set", price: 890, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
  { id: 16, name: "Wabi-Sabi Ceramic Vase", price: 480, label: "Artisan", category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
  { id: 17, name: "Onyx Travertine Bookends", price: 320, category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
  { id: 18, name: "Belgian Linen Throw", price: 280, category: "Textiles", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
];

function formatPrice(price) {
  return `$${price.toLocaleString()}`;
}

export default function ProductCollections() {
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [wishlistMessage, setWishlistMessage] = useState("");

  const sortedProducts = useMemo(() => {
    const result = [...allProducts];
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [sort]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const visibleProducts = sortedProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const handleWishlist = (productName) => {
    setWishlistMessage(`${productName} added to wishlist.`);
    setTimeout(() => setWishlistMessage(""), 2500);
  };

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="commerce-page">
      <PublicNavbar active="Products" />

      <main className="products-collection-container">
        <nav className="products-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <span>Products</span>
        </nav>

        <section className="products-intro">
          <h1>The Collections</h1>
          <p>
            Discover our curated selection of high-performance furniture and
            product design, where artisanal craftsmanship meets state-of-the-art
            innovation. Each piece is a testament to timeless aesthetics and
            functional excellence.
          </p>
        </section>

        {wishlistMessage && (
          <div className="products-toast" role="status">
            {wishlistMessage}
          </div>
        )}

        <section className="products-toolbar">
          <div className="products-toolbar-left">
            <button className="products-filter-button" type="button">
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
            <div className="products-toolbar-divider" />
            <label className="products-sort">
              <span>Sort By</span>
              <select value={sort} onChange={(e) => handleSort(e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>

          <div className="products-toolbar-right">
            <div className="products-view-toggle">
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                type="button"
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <span className="material-symbols-outlined">view_list</span>
              </button>
            </div>
            <p>
              Showing <strong>{visibleProducts.length}</strong> of{" "}
              <strong>{sortedProducts.length}</strong> products
            </p>
          </div>
        </section>

        <section
          className={
            viewMode === "list"
              ? "products-grid products-grid-list"
              : "products-grid"
          }
        >
          {visibleProducts.map((product) => (
            <article className="collection-product-card" key={product.id}>
              <div className="collection-product-image">
                <img src={product.image} alt={product.name} />
                {product.label && (
                  <span
                    className={
                      product.label === "Limited Edition" || product.label === "Artisan"
                        ? "collection-product-label soft"
                        : "collection-product-label"
                    }
                  >
                    {product.label}
                  </span>
                )}
                <div className="collection-product-actions">
                  <Link
                    to="/products/obsidian-kitchen-island"
                    className="collection-quick-view"
                  >
                    Quick View
                  </Link>
                  <button
                    type="button"
                    className="collection-wishlist"
                    onClick={() => handleWishlist(product.name)}
                  >
                    <span className="material-symbols-outlined">favorite</span>
                    Add to Wishlist
                  </button>
                </div>
              </div>
              <div className="collection-product-info">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="products-pagination">
          <div className="products-pagination-line" />

          {page < totalPages && (
            <button
              type="button"
              className="products-load-more"
              onClick={() => goToPage(page + 1)}
            >
              <span>Load More Products</span>
            </button>
          )}

          <div className="products-page-numbers">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              style={{ opacity: page === 1 ? 0.35 : 1 }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                style={{
                  fontWeight: p === page ? 700 : 400,
                  color: p === page ? "#000000" : "#76777d",
                  borderBottom: p === page ? "1px solid #000000" : "none",
                  padding: "4px 2px",
                }}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              style={{ opacity: page === totalPages ? 0.35 : 1 }}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
