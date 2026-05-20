import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { commerceApi } from "../services/api";
import "../Styles/commerce-premium.css";

const galleryImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAJUMal_kT0VpIDgjlnFoV_dhylAI8wCiJ15_QOYmwQp0vw9LehBIL4WgyqoNGICwICequTHuwBFpcXjPjpgUKEXgutkyAwemAMkTp_74vsw1-wKfMW3Fy2S0JbuKL9yNjodVd2MtiUSaQ-9xG9_ptSnOpSZALl9Ws-5hmmTl_DIJ-46toeXGikoXgND9kU1j5ak5aXGl7Qz0HnNTU2X-hKBoGa-TOVd4fBnAkvlt2cnaoIoAp0fLjDwk_ugw78r6mbI0HIyApkIYAL",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCLfV6hai5sJbVlKLfywhDDS3gMzQwGhNoyw6ooSX_N2SuvCl24dCFLKNAue1Dwt4fmAvSRu7NVWGN1ehDf1tqpjdoZUMrGrfTj5o320Pzfq12JB6gaX2wuTo64SxiMb5HYbS1FhMSZAvFn3b-W451rKOTZIQCMB1lfB9nUgQGdxRqThpJs_V65y5GGIM58rOn0HoNNMQgYR9yf8rvGuQhbk_xdHirOOKJwUQZzzKVAgQC7YOYpZ9t1tAd8v9GO96x-bgJNq95dBGP8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKy7zp4QkKcXCpdWxJrfQSbKD2Lv0_mL1woAQv9qDlECmO_L5QiaO3MG9RL-UagdEpCvflvXtboCLlqcG98x8t0TAr3qNkIxxzxkqJQQFFD_X0n890bWDacBSpPLEHY50wIxzmAvQv1EjyBQO-HhjtfnsYbFkiQaGcmnYMnz1qCJKbX9mxBLEJepi0xwx4T0_OUMayE6-x4SLQE3GHRoJqx3_FNs6EIhaTEA0ra6WDzQJPBxlXNVasBy81ixPNZfER4pNlxPFLFuyn",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkbdCFZs5Tc3TXxkENWgK9KYBm6ekOvEOWNTv3gxUkYW0i5EwQc4Tc8h90Ty--RBtJS6hh9Zzc9ubjcNp_1PMmrJr9JrqSCYyplcYiYqkF_CKi-B6U_9j76JEGNSv3_2psVla7tY4kbGUWc9Witauhx1V8gY7g6E7VeLNxvTCoKeIgGUrQGLO1e3zST-uryFsSkXFQnqzSRE8qCfozqbhCpcCD3D6SfgtRvS2lcyWrxBCO1xBe7x9TU0p4zHkN2XfmIaiVwo_ocdeS",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDm-6uX9LEtqDxXQoKIsYDApUdBIMEL8BSq1pYU_qK8eXLfwDSdPkdd29x4WkYDrnCxSG3jeYozg_drYJIl5zjFyG-4ha--yV4FfrAngJBp3Wth7fvOcrlj9Fmgv3yO0oCVbqGQB3_7uLjyEpLK6gznAy9MI0jzhClbiwFKB2mvH-wuydvjc2jBui6S1Vpu-bDVG_xUDYzu0yo97my0a28HM9h7buxcI2WgFiIaZMer3U6mhMa8vsgoZCVWDh6nwtxAE2D7W54l0lPd",
];

const relatedProducts = [
  {
    id: "aero-stool",
    name: "The Aero Stool",
    price: 850,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfMX4adJoySyTQI58-vE3i4yuOjIHidalDzcH6csu0rrE-LFdzZR0w_W4_VQMxdyZ1oosX7queR66GLJjF5Vmi-zlOMgX6adg4Q9olu1bJ-8D7eay2KIfVovbXHYccmpk_cDpEVTwlzu8Dv9UMGxaVxqGxYxGOKGUGOi1FGLojqTi9aRuijdb0sGYBoxWERMf9D-v_meDhCWwP6RAWnUUn5cmi_Owtrb9DntTgJPw0Hvh2YUbzo4GMqM7O1jLDUqwixF4HHr-rLmcu",
  },
  {
    id: "lumina-pendant",
    name: "Lumina Pendant",
    price: 1200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtR84NyD_HcCEd0aVEHWFllBJM4u8RdhnjPdTwedyE4a-zLf0Do15HGKeP_g--YP3uI7S1Ip-myUIyRDWg6U76lyhJnhhWtxbcg4iWQ12cIyv6ZJlCjOhvLXT_L8KLM5NfFVtIMMkSCEzF2qiExImZDRjm7lfmUIwvi_TH94OMb0Xo-irfRh32v9zyAafQ9GNVX5GCSmR8L9x6qhpM8DFPxcuXZgBprJaXa_04iNA-o75wy5DqZnLyn8mXHnLLW9UfjqnIIP4854An",
  },
  {
    id: "artisan-tool-set",
    name: "Artisan Tool Set",
    price: 450,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHCPbbyUO68OtBjCkFtpri5TqrteBd4xqgS9GLexOIl6QXoe_49ujWTiOklcSq9DQeSptivPr8X--0KaB6RK1qTdRgtL3Z0Jy6NFFnZ_lJvRHDHX-9G15TUaJLbukW363yMYZzI0OD1MiGE_C_oTbHdQYjJZzdZKNQvDjMqCoiTDf6Xj0raIja303atWRd3yIvIF2XT6Nx5Dot0GQIbc0tj-0Vq5I4jq84MN6eg9aeYiNO7tCs4ixitL-B-JxezLtM8nXmduHWuWSv",
  },
  {
    id: "earth-collection-plating",
    name: "Earth Collection Plating",
    price: 180,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHQORDmUuFeS_yj7IsCrhMvcVbRhC5NVmnHlDXECuYIvSkmI0ZsjNOTMkF2HopqXsIFRZBJ6y87Nsh0jIOdWpYB7hBz_jARjbhbBM0MhlzCuydLaqkF-cEhwi7nShSYX2YD9lrfbiMk3yPwTcA3jFVmjhO0Rwk_2F63quTMiuRK9FtipLZNQulWEo99273FlFtE60NQqayp7tyJdVpl1VAZetu5x_xJ0ZXfttVBHGCsHPHSbc5YhMME1PPCOvtuB003v8KGLEtHoC2",
  },
];

const DEFAULT_PRODUCT = {
  id: "obsidian-kitchen-island",
  slug: "obsidian-kitchen-island",
  name: "The Obsidian Kitchen Island",
  price: 12450,
  material: "Black Marble",
  img: galleryImages[0],
  description:
    "A masterpiece of architectural balance, the Obsidian Kitchen Island merges the raw power of monolithic stone with the warmth of hand-finished oak. Designed for the epicurean heart of the home, its expansive surface and concealed storage redefine kitchen functionality as an art form.",
};

const money = (value) => `$${Number(value || 0).toLocaleString()}`;

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(DEFAULT_PRODUCT);
  const [loadError, setLoadError] = useState("");
  const [mainImage, setMainImage] = useState(galleryImages[0]);
  const [material, setMaterial] = useState("Black Marble");
  const [finish, setFinish] = useState("Midnight");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Details");
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    commerceApi
      .getProductBySlug(slug)
      .then((data) => {
        if (!alive || !data) return;
        const images = [
          data.imageUrl,
          ...(data.galleryImages || []).map((item) => item.url),
          ...(data.images || []),
        ].filter(Boolean);
        const normalized = {
          ...data,
          id: data._id || data.id,
          slug: data.slug || slug,
          price: Number(data.price || 0),
          material: data.material || data.category || "Hedj finish",
          img: images[0] || DEFAULT_PRODUCT.img,
        };
        setProduct(normalized);
        setMainImage(images[0] || DEFAULT_PRODUCT.img);
        setLoadError("");
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error.message || "Product details could not be loaded from MongoDB.");
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  const activeGallery = useMemo(() => {
    const images = [
      product.imageUrl,
      product.img,
      ...(product.galleryImages || []).map((item) => item.url),
      ...(product.images || []),
      ...galleryImages,
    ].filter(Boolean);
    return [...new Set(images)];
  }, [product]);

  const handleAddToCart = async () => {
    await addToCart({
      ...product,
      image: mainImage,
      img: mainImage,
      material,
      finish,
      quantity,
    });
    toast.success(`${product.name} was added to your cart.`);
  };

  const handleWishlist = async () => {
    try {
      await addToWishlist({ ...product, image: mainImage, img: mainImage, material, finish });
      toast.success("Saved to wishlist.");
    } catch (error) {
      toast.error(error.message || "Could not save to wishlist.");
    }
  };

  return (
    <PublicCommerceShell active="Products">
      <main className="commerce-container">
        <section className="product-layout">
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={mainImage} alt={product.name} />
            </div>

            <div className="product-thumbs">
              {activeGallery.slice(1, 6).map((image, index) => (
                <button
                  key={image}
                  className={`product-thumb ${mainImage === image ? "active" : ""}`}
                  type="button"
                  onClick={() => setMainImage(image)}
                >
                  <img src={image} alt={`${product.name} view ${index + 2}`} />
                  {index === 3 && activeGallery.length > 6 && <span>+{activeGallery.length - 5} Photos</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="product-info-sticky">
            <div className="product-rating-row">
              <div className="product-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined">
                    star
                  </span>
                ))}
              </div>
              <span className="product-review-count">24 Reviews</span>
            </div>

            <h1 className="product-title">{product.name}</h1>
            {loadError && <p className="product-description">{loadError}</p>}

            <div className="product-price-row">
              <span className="product-price">{money(product.price)}</span>
              <span className="product-stock">
                {Number(product.stock || 0) > 0 ? "In Stock" : "Made to Order"}
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-options">
              <div>
                <span className="product-option-label">Primary Material</span>
                <div className="product-choice-row">
                  {["Black Marble", "Granite", "Walnut Wood"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`product-choice ${material === item ? "active" : ""}`}
                      onClick={() => setMaterial(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="product-option-label">Base Finish</span>
                <div className="finish-row">
                  {[
                    ["Midnight", "finish-midnight"],
                    ["Sandstone", "finish-sandstone"],
                    ["Aged Bronze", "finish-bronze"],
                  ].map(([name, className]) => (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      aria-label={name}
                      className={`finish-button ${className} ${finish === name ? "active" : ""}`}
                      onClick={() => setFinish(name)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="product-option-label">Quantity</span>
                <div className="commerce-qty-box">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((value) => value + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="product-action-stack">
              <button className="commerce-button" type="button" onClick={handleAddToCart}>
                Add to Cart
              </button>

              <div className="product-secondary-actions">
                <button className="commerce-button-outline" type="button" onClick={handleWishlist}>
                  <span className="material-symbols-outlined">favorite</span>
                  Wishlist
                </button>
                <button
                  className="commerce-button-outline"
                  type="button"
                  onClick={() => navigate("/contact")}
                >
                  <span className="material-symbols-outlined">edit_note</span>
                  Custom Quote
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="product-tabs-section">
          <div className="product-tabs" role="tablist" aria-label="Product information tabs">
            {["Details", "Reviews (24)", "Delivery & Installation", "Customization Options"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`product-tab ${activeTab === tab ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="product-tab-content">
            <div>
              <h3>Artisan Craftsmanship</h3>
              <p>
                Each Obsidian Island is uniquely carved from a single slab of premium black
                marble, selected for its distinct character and veining. Master artisans
                hand-finish each surface to achieve Hedj's matte-satin signature.
              </p>
            </div>

            <div className="spec-card">
              <h4>Technical Specifications</h4>
              <ul>
                <li>
                  <span>Dimensions</span>
                  <span>300cm x 110cm x 92cm</span>
                </li>
                <li>
                  <span>Weight</span>
                  <span>420 kg</span>
                </li>
                <li>
                  <span>Origin</span>
                  <span>Tuscany, Italy</span>
                </li>
                <li>
                  <span>Certification</span>
                  <span>FSC Certified Oak Base</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="related-section">
          <div className="related-header">
            <div className="related-title">
              <h2>Complete the Look</h2>
              <p>Curated essentials to complement your obsidian centerpiece.</p>
            </div>
            <Link className="product-tab active" to="/products">
              Shop All
            </Link>
          </div>

          <div className="related-grid">
            {relatedProducts.map((item) => (
              <article className="related-card" key={item.id}>
                <div className="related-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <h4>{item.name}</h4>
                <p>{money(item.price)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default ProductDetail;
