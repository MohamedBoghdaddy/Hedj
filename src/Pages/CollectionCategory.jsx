import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PublicFooter, PublicNavbar } from "../Components/PublicCommerceShell";
import "../Styles/commerce-premium.css";
import "../Styles/product-collections-premium.css";

const categoryData = {
  kitchens: {
    label: "Kitchens",
    heading: "Kitchen Collections",
    description:
      "Sculptural cabinetry and precision-engineered worktops for the considered cook. Each system is designed to transform the kitchen into the architectural heart of the home.",
    products: [
      { id: 101, name: "Monolith Island System", price: 18400, label: "New Arrival", category: "Kitchen", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
      { id: 102, name: "Nordic Oak Cabinetry", price: 12500, category: "Storage", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
      { id: 103, name: "Travertine Dining Table", price: 9200, category: "Tables", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
      { id: 104, name: "Brass Hardware Collection", price: 480, label: "Limited Edition", category: "Accessories", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
      { id: 105, name: "Obsidian Marble Worktop", price: 6800, category: "Kitchen", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
      { id: 106, name: "Matte White Island Pendant", price: 1200, category: "Lighting", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
    ],
  },
  bedrooms: {
    label: "Bedrooms",
    heading: "Bedroom Collections",
    description:
      "Considered furniture for rest and renewal. From platform beds sculpted in solid oak to hand-stitched linen dressers, each piece is crafted to make the bedroom a sanctuary.",
    products: [
      { id: 201, name: "Copenhagen Platform Bed", price: 6400, label: "New Arrival", category: "Bedroom", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
      { id: 202, name: "Zen Linen Dresser", price: 3200, category: "Bedroom", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
      { id: 203, name: "Belgian Oak Wardrobe", price: 8100, label: "Best Seller", category: "Storage", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
      { id: 204, name: "Elowen Velvet Armchair", price: 2800, category: "Seating", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO97pjMDCcZHkZLDkTJStXN_VkalJ9XVqhG0Z-zDM5EGv0fVYu8UiO-hgR9eby2IJqnW1rri-Q_3r__ah3j7xiPGGTMF3Hu40zxqrmU5S1ao7gLSNuWtAhYZJPVZW4hUHQInc3B_UatQdZEJ0Mrj1t-M1JK9bemegL-hlkLqNxjjGajozfufK1giZPZMEvjPDb232yty5cVv-oZ8dSuqyh96ehFgRc7jxrBlqhJ1IJO6MC3HJjohgdr1c1_Hk8RhaoZjjHrnZll3JK" },
      { id: 205, name: "Lumiere Bedside Sconce", price: 850, category: "Lighting", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
      { id: 206, name: "Cashmere Bedding Set", price: 640, label: "Limited Edition", category: "Textiles", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
    ],
  },
  outdoor: {
    label: "Outdoor",
    heading: "Outdoor Collections",
    description:
      "Weather-resistant furniture built with the same rigor as our interiors. Solid teak, marine-grade stainless, and woven synthetics for terraces, gardens, and courtyards that endure.",
    products: [
      { id: 301, name: "Teak Lounge Chair", price: 2600, label: "Best Seller", category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
      { id: 302, name: "Weather Oak Dining Set", price: 7800, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
      { id: 303, name: "Slate Stone Planter Set", price: 890, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
      { id: 304, name: "Woven Rattan Daybed", price: 4200, label: "New Arrival", category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
      { id: 305, name: "Lava Stone Side Table", price: 1600, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO97pjMDCcZHkZLDkTJStXN_VkalJ9XVqhG0Z-zDM5EGv0fVYu8UiO-hgR9eby2IJqnW1rri-Q_3r__ah3j7xiPGGTMF3Hu40zxqrmU5S1ao7gLSNuWtAhYZJPVZW4hUHQInc3B_UatQdZEJ0Mrj1t-M1JK9bemegL-hlkLqNxjjGajozfufK1giZPZMEvjPDb232yty5cVv-oZ8dSuqyh96ehFgRc7jxrBlqhJ1IJO6MC3HJjohgdr1c1_Hk8RhaoZjjHrnZll3JK" },
      { id: 306, name: "Marine Teak Parasol", price: 2100, category: "Outdoor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
    ],
  },
  complements: {
    label: "Complements",
    heading: "Complements Collection",
    description:
      "Decorative objects, textiles, and lighting that complete a considered interior. Each complement is selected for its artisanal quality and its ability to anchor a space.",
    products: [
      { id: 401, name: "Atlas Brass Floor Lamp", price: 2100, category: "Lighting", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcF64dD4xzKIG8bePS1spDmXgqDuMKj2slWZDQ5p-5-KBF8-vK9vHeBN4ik4wTvpCeRF0-WNsdXAWhAW6YBstBQHuz5K0u8zixnEDt_9kdvIgRsBgIP7bcyR_UBJNQFtHnrEofLQUHQjfdUOcUrNeoxbFdCJHULEfgSYxEqA10IyLO-UvZ5LyXZQxvxzW4cq24rzCbKajn67W8HCn4YMFiSGbNX2tpCxU4442ZUbGkrjIqdowM2VuoR3Ok3HQ0ALYbpBhW_AL7shqU" },
      { id: 402, name: "Wabi-Sabi Ceramic Vase", price: 480, label: "Artisan", category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_w7rTKQ_FyVLGfKTnwAf_aiHuj64bdakO-svdmKlvuTJMbN10Vp1GDimLOplR1fxTnpPCW2ccvibTNpcCtAtH3rUF1mytkjIXarPqzXS3qzVfDegKhOmV_vdyPCRDMbXOj0hJnLskMnFDtIE0fSBWyjggq8DB49QRBj0VxK1hALnRD_Mi7x-KfYmovj86U5qwPZEmoqRLWtJAna_C6zA_Whb20g1IBEN7nNagqgmphWgYIWJGmTgobDoPS0jXtqWzp22-8tWxXmGk" },
      { id: 403, name: "Onyx Travertine Bookends", price: 320, category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3rNyH47ju6HEJXpaJyztrvk1GuSIQY_aLlVUAQ1O2VypnX5dq3DiLX2JFFWHnY6xdM-teBECLbRUVq5uHxzrjSmLt82nMsGoau7gOWRTb-KXb5dYutWqpEpsxYsdBEfXb6Pc3F6TqGE6e7opexk9L7rnrL6g4MwIb68GNTLyi7eJvZCLSPkvnNKVyMjbRE6uZq1Xl1xKUapVgfmi5rD4KysKjVytHNuMrShVbcVReNoFx2nJHa6CKcZOXQY7Fm56XnZslY8Ym_Nms" },
      { id: 404, name: "Belgian Linen Throw", price: 280, category: "Textiles", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNdMbQkrcgVQdg41-_-__-CpTHtSUAkTRNE876CdMBvT1T4GhHJ8405g0EY02fTmcFW1Etykg2ZkZ-aI9vKYeHu-lB3BP_sS7cNn8wzpXDCnhJ69EFKGo3hdYa_qiPxVLdjTURRJ3iCZQexlou9UFbBnZSX57Ozx_TkdRx41kbl_Zdo2Q6NZu5Rqy_RHnWJi9-b5yvenrd9LZnFd0o17_TLbUTbIZMvWrnyLhoUYlVXpUiCrfiE5szR9LUTgXFIONBuq6dndrSE_XK" },
      { id: 405, name: "Hammered Brass Tray", price: 195, label: "Artisan", category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO97pjMDCcZHkZLDkTJStXN_VkalJ9XVqhG0Z-zDM5EGv0fVYu8UiO-hgR9eby2IJqnW1rri-Q_3r__ah3j7xiPGGTMF3Hu40zxqrmU5S1ao7gLSNuWtAhYZJPVZW4hUHQInc3B_UatQdZEJ0Mrj1t-M1JK9bemegL-hlkLqNxjjGajozfufK1giZPZMEvjPDb232yty5cVv-oZ8dSuqyh96ehFgRc7jxrBlqhJ1IJO6MC3HJjohgdr1c1_Hk8RhaoZjjHrnZll3JK" },
      { id: 406, name: "Hand-poured Soy Candle Set", price: 120, category: "Decor", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqr4iFhQDw4oQ6PXhM-lWDMfLkLRIrZiGhQRQtn_vpYhZoldyAch_oRJWGXrhLDg8nGt5vXk89oCU6Gv4io2qP89C8i_URayMjSrH-4Gxdy39g3LyUYUWhQMysqzxnhQDUJXS-LOkRy4L1qIeFvytLe9x0nuqXWazRKZe2LhlAhgez9JeQ7dGhQ1ZoB1-FwyMPc4LJ03IxYnJWfBnpEz5Ul9YXf12HbFR6icIASkkebHRXVr6COHvRVTwont6DXb8YM9qINyBtDpc" },
    ],
  },
};

function formatPrice(price) {
  return `$${price.toLocaleString()}`;
}

export default function CollectionCategory() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type");

  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [wishlistMessage, setWishlistMessage] = useState("");

  const catKey = categorySlug || "kitchens";
  const cat = categoryData[catKey] || categoryData.kitchens;

  const sortedProducts = useMemo(() => {
    let list = [...cat.products];
    if (typeFilter === "day") list = list.filter((p) => ["Lighting", "Decor"].includes(p.category));
    if (typeFilter === "night") list = list.filter((p) => ["Textiles", "Bedroom"].includes(p.category));
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [cat, sort, typeFilter]);

  const handleWishlist = (name) => {
    setWishlistMessage(`${name} added to wishlist.`);
    setTimeout(() => setWishlistMessage(""), 2500);
  };

  return (
    <div className="commerce-page">
      <PublicNavbar active="Collections" />

      <main className="products-collection-container">
        <nav className="products-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <Link to="/collections">Collections</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <span>{cat.label}</span>
        </nav>

        <section className="products-intro">
          <h1>{cat.heading}</h1>
          <p>{cat.description}</p>
        </section>

        {wishlistMessage && (
          <div className="products-toast" role="status">
            {wishlistMessage}
          </div>
        )}

        <section className="products-toolbar">
          <div className="products-toolbar-left">
            <div className="products-sort">
              <span>Sort By</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
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
          {sortedProducts.map((product) => (
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
      </main>

      <PublicFooter />
    </div>
  );
}
