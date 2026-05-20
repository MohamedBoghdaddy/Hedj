import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { commerceApi } from "../services/api";
import "../Styles/commerce-premium.css";
import "../Styles/product-collections-premium.css";

const ITEMS_PER_PAGE = 9;

const categoryMeta = {
  products: {
    label: "Products",
    heading: "The Collections",
    description:
      "Discover our curated selection of high-performance furniture and product design, where artisanal craftsmanship meets state-of-the-art innovation. Each piece is a testament to timeless aesthetics and functional excellence.",
    ids: null,
  },
  collections: {
    label: "Collections",
    heading: "Curated Collections",
    description:
      "Explore Hedj pieces by room and ritual, from architectural kitchens to softer finishing objects.",
    ids: null,
  },
  kitchens: {
    label: "Kitchens",
    heading: "Kitchen Collections",
    description:
      "Sculptural cabinetry, worktops, tables, and lighting for the kitchen as the architectural heart of the home.",
    ids: [1, 2, 5, 8, 9],
  },
  bedrooms: {
    label: "Bedrooms",
    heading: "Bedroom Collections",
    description:
      "Considered furniture for rest and renewal, from platform beds to hand-finished storage and soft textiles.",
    ids: [7, 10, 11, 12, 18],
  },
  outdoor: {
    label: "Outdoor",
    heading: "Outdoor Collections",
    description:
      "Weather-conscious furniture for terraces, gardens, and courtyards with the same rigor as our interiors.",
    ids: [13, 14, 15],
  },
  complements: {
    label: "Complements",
    heading: "Complements Collection",
    description:
      "Decorative objects, textiles, and lighting selected for artisanal quality and quiet sculptural presence.",
    ids: [4, 8, 16, 17, 18],
  },
};

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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProduct(product) {
  const slug = product.slug || slugify(product.name || product._id || product.id);
  const image =
    product.imageUrl ||
    product.image ||
    product.img ||
    product.images?.[0] ||
    product.galleryImages?.[0]?.url ||
    "";
  return {
    ...product,
    id: product._id || product.id,
    slug,
    price: Number(product.price || 0),
    category: product.category || product.collection || "Product",
    collection: product.collection || product.category || "",
    image,
  };
}

export default function ProductCollections() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const shop = useContext(ShopContext);
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [serverProducts, setServerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const typeFilter = searchParams.get("type");
  const routeCollection = pathname.match(/^\/collections\/([^/?]+)/)?.[1];
  const isCollectionsRoute = pathname.startsWith("/collections");
  const meta =
    categoryMeta[routeCollection] ||
    (isCollectionsRoute ? categoryMeta.collections : categoryMeta.products);

  useEffect(() => {
    let alive = true;
    setLoadingProducts(true);
    commerceApi
      .getProducts()
      .then((products) => {
        if (!alive) return;
        setServerProducts(products.map(normalizeProduct));
        setProductError("");
      })
      .catch((error) => {
        if (!alive) return;
        setProductError(error.message || "Products could not be loaded from MongoDB.");
      })
      .finally(() => {
        if (alive) setLoadingProducts(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const sortedProducts = useMemo(() => {
    const usingServer = serverProducts.length > 0;
    const sourceProducts = usingServer ? serverProducts : allProducts;
    const allowedIds = !usingServer && meta.ids ? new Set(meta.ids) : null;
    const result = sourceProducts.filter((product) => {
      const collectionBucket = slugify(product.collection || "");
      const categoryBucket = slugify(product.category || "");
      if (allowedIds && !allowedIds.has(product.id)) return false;
      if (usingServer && routeCollection) {
        const route = slugify(routeCollection);
        const routeSingular = route.replace(/s$/, "");
        if (route === "complements") {
          return ["complements", "decor", "lighting", "textiles"].includes(collectionBucket) ||
                 ["complements", "decor", "lighting", "textiles"].includes(categoryBucket);
        }
        return collectionBucket === route || collectionBucket === routeSingular ||
               categoryBucket === route || categoryBucket === routeSingular;
      }
      if (routeCollection === "complements" && typeFilter === "day") {
        return ["Decor", "Lighting", "Complements"].includes(product.category);
      }
      if (routeCollection === "complements" && typeFilter === "night") {
        return ["Textiles", "Lighting", "Complements"].includes(product.category);
      }
      return true;
    });

    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [meta.ids, routeCollection, serverProducts, sort, typeFilter]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const visibleProducts = sortedProducts.slice(0, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [pathname, typeFilter]);

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const showMessage = (message) => {
    setWishlistMessage(message);
    setTimeout(() => setWishlistMessage(""), 2500);
  };

  const handleWishlist = (product) => {
    shop?.addToWishlist?.({
      id: product.id,
      slug: slugify(product.name),
      name: product.name,
      price: product.price,
      image: product.image,
      img: product.image,
    });
    showMessage(`${product.name} added to wishlist.`);
  };

  const handleAddToCart = async (product) => {
    await shop?.addToCart?.({
      id: product.id,
      slug: slugify(product.name),
      name: product.name,
      price: product.price,
      image: product.image,
      img: product.image,
      quantity: 1,
    });
    showMessage(`${product.name} added to cart.`);
  };

  const goToPage = (p) => {
    setPage(Math.min(Math.max(p, 1), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

        {wishlistMessage && (
          <div className="products-toast" role="status">
            {wishlistMessage}
          </div>
        )}

        {loadingProducts && (
          <div className="products-toast" role="status">
            Loading products from MongoDB...
          </div>
        )}
        {!loadingProducts && productError && serverProducts.length === 0 && (
          <div className="products-toast" role="status">
            {productError}
          </div>
        )}

        <section className="products-toolbar">
          <div className="products-toolbar-left">
            <button
              className="products-filter-button"
              type="button"
              onClick={() =>
                showMessage("Use the Collections menu and sort control to refine products.")
              }
            >
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
                    to={`/products/${product.slug || slugify(product.name)}`}
                    className="collection-quick-view"
                  >
                    Quick View
                  </Link>
                  <button
                    type="button"
                    className="collection-add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="collection-wishlist"
                    onClick={() => handleWishlist(product)}
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

        {totalPages > 1 && (
          <section className="products-pagination">
            <div className="products-pagination-line" />

            {page < totalPages && (
              <button
                type="button"
                className="products-load-more"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
                  aria-label={`Show through page ${p}`}
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
        )}
      </main>
    </PublicCommerceShell>
  );
}
