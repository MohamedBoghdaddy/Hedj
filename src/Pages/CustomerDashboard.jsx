import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/AuthContext";
import { storageApi } from "../services/api";
import "../Styles/customer-dashboard-premium.css";

const activeOrders = [
  {
    id: "HJ-9402",
    title: "Elowen Armchair, Velvet Emerald",
    status: "In Production",
    statusTone: "gold",
    delivery: "Dec 15 - Dec 18",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcMZfzhStz9Qz231eRYN5fxRYLIM07sNH8Nc5MRj25eTjhReghz6VsYkWw8xU96pkGDWq5kAUEo4Qo4PZzlols5L6i2MZDGyiH-i2pk3RwR06KTXxb7-Tm_VBvww1CxKjFveNXkiASYY9opOOAHOkKSAg1aFOFkW2A7nxekcigKmViC4nA0s5ii0EX182oaPJ9hSpoCIUsQLKCfNBzSImZkKZRzO8mUabWaQwQygL5nr_gGCldhyyPXJXpq-PvpPJrFXtDM-jNTgfx",
  },
  {
    id: "HJ-9399",
    title: "Atlas Brass Floor Lamp",
    status: "Shipped",
    statusTone: "dark",
    delivery: "Dec 08",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5XdUaTlZA9QKMaJB1YdUUOALBWHwOx7weYiSdbJ-HV4sq2XlPPW6LMAPdmAjdzDAPU1IglJxbgNMXNPrfIeFXP_yFC7n8TEozeUVq2GF-kJB5z1TGTLqE3PsXLimQJKRpnxiC6plVoKxR2I4Sfe2rlIxnm11eiRr2Kx57-YuPmqyLpV8bFVJA3RtyUgmRVmzqSM-Ln41_UTKOMTDxNeULJXeUTjKDGDP2sbcIlEitCQsJPgKjwVcykVUx-ESgurXmNhK8j48G2Cj1",
  },
];

const wishlistItems = [
  {
    id: 1,
    title: "Marais Oak Dining Table",
    price: "$3,200",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbrHXg3uC-VGKmgKs8OMvTy_aT95MNstE0CLQhQqZsalH5W6fp4BugKyzKplITAR6kM2lomJWCIqCyyzvI00SRC7MSv-o1Xktd2o4C4cu9UIG8eBGs2ng4x2SdF09u1ZG6GaU5JkpHTFttiIrL2XBGP6LQbrEfNrU3erUZjfSAPgpLGoaVbwiDZdlI_SzZ1Y-Vv287Ehfv-8IzzJUCSiIbrm4dfGvyKctojvJ_jSX8Dt8vhd5-40FBsVwP9ctSqTdzMMBxW9cg9rSY",
  },
  {
    id: 2,
    title: "Lumiere Minimalist Sconce",
    price: "$450",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQEuOE36n_InwkOIwGk0JQ7pI1jfO7NE5cxFuGnvK8m_ZajzQixJax2cf8p3reu194u3Xt4TshS2dp4HVVTTMUi9Wrm7X0Zz1YcmGCjzS05SjDeSRS0lcNjPadP77epNvhnpxFS1GVG4qpE-2UuFA1KJWU2aopBu1oQoH13ftzpUANMXKvjHoyagcS5xRgi9Z6YXYnQ-ZvvLtNq6Qw8jmvz18Cv4_nYMDk741YgxE9v7WVkGPvj7YWsxMC9J941mFMz4yfMDiME5eX",
  },
  {
    id: 3,
    title: "Soren Linen Modular Sofa",
    price: "$5,800",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYRX2Jg-vPqKERIARpZCHgYVUgn0Wg_CJF8-a3eECmoUhtogTiraKRSg96N94UBqGwkLnkBhUpsOosnfmwra4NrIdeU7Kt1qXoEP9skPPW4BJeBZXOAcgJs51jQtECbZmPB7o2ZgD_90bQvDj8D4V-0u2VbcHq_08q1mjKTfyG2cRujYbTvi5C211FJB-dVwL_xUmxtsQ82r5-lfu3oRur7pEZTzjWwQ22zc5atbZYAnfjMRIfQS3TA5Bg1PYgkEvX0eE10scO2UNp",
  },
];

const accountLinks = [
  { key: "addresses", label: "Address Book", icon: "location_on" },
  { key: "payments", label: "Payment Methods", icon: "payments" },
  { key: "profile", label: "Profile Settings", icon: "settings" },
  { key: "orders", label: "Order History", icon: "history" },
];

const savedAddresses = [
  {
    id: "home",
    label: "Primary Residence",
    line1: "48 Laurel House, Pacific Heights",
    line2: "San Francisco, CA 94115",
  },
  {
    id: "studio",
    label: "Design Studio",
    line1: "210 Market Hall, Suite 8",
    line2: "San Francisco, CA 94103",
  },
];

const savedPayments = [
  { id: "visa-4242", brand: "Visa", last4: "4242", expiry: "08/28" },
  {
    id: "amex-1005",
    brand: "American Express",
    last4: "1005",
    expiry: "02/27",
  },
];

const orderHistory = [
  ...activeOrders,
  {
    id: "HJ-9321",
    title: "Marais Oak Dining Table",
    status: "Installed",
    statusTone: "dark",
    delivery: "Oct 22",
    image: wishlistItems[0].image,
  },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function moneyToNumber(value) {
  return Number(String(value).replace(/[^0-9.]/g, ""));
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const shop = useContext(ShopContext);
  const { logout } = useLogout();
  const { dispatch, state } = useAuthContext();
  const [toast, setToast] = useState("");
  const [activePanel, setActivePanel] = useState("orders");
  const user = useMemo(() => state.user || getStoredUser(), [state.user]);

  // profile photo upload state
  const photoFileRef = useRef();
  const [photoPreview, setPhotoPreview] = useState(
    user?.profilePhotoUrl || user?.profilePhoto || null
  );
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    setPhotoPreview(user?.profilePhotoUrl || user?.profilePhoto || null);
  }, [user?.profilePhoto, user?.profilePhotoUrl]);

  const firstName =
    user?.firstName ||
    user?.username?.split(" ")?.[0] ||
    user?.name?.split(" ")?.[0] ||
    "Julian";

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/Login", { replace: true });
  };

  const handleMoveToBag = async (item) => {
    await shop?.addToCart?.({
      id: item.id,
      name: item.title,
      price: moneyToNumber(item.price),
      image: item.image,
      img: item.image,
      quantity: 1,
    });
    showToast(`${item.title} moved to bag.`);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPhotoUploading(true);

    try {
      const result = await storageApi.uploadMyProfilePhoto(file);
      // Persist the Supabase URL back into localStorage so the avatar stays
      // visible after page reload (until a full auth refresh).
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const nextUser = { ...stored, ...(result.user || {}), profilePhotoUrl: result.photoUrl };
      localStorage.setItem("user", JSON.stringify(nextUser));
      dispatch({ type: "USER_LOADED", payload: nextUser });
      setPhotoPreview(result.photoUrl);
      showToast("Profile photo updated.");
    } catch (err) {
      // Revert preview on failure
      setPhotoPreview(user?.profilePhotoUrl || user?.profilePhoto || null);
      showToast(`Photo upload failed: ${err.message}`);
    } finally {
      setPhotoUploading(false);
    }
  };

  const renderAccountPanel = () => {
    if (activePanel === "addresses") {
      return (
        <div className="customer-account-panel-list">
          {savedAddresses.map((address) => (
            <article className="customer-account-panel-item" key={address.id}>
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <strong>{address.label}</strong>
                <p>{address.line1}</p>
                <p>{address.line2}</p>
              </div>
              <button
                type="button"
                onClick={() => showToast(`${address.label} set as default.`)}
              >
                Use Default
              </button>
            </article>
          ))}
        </div>
      );
    }

    if (activePanel === "payments") {
      return (
        <div className="customer-account-panel-list">
          {savedPayments.map((payment) => (
            <article className="customer-account-panel-item" key={payment.id}>
              <span className="material-symbols-outlined">credit_card</span>
              <div>
                <strong>
                  {payment.brand} ending {payment.last4}
                </strong>
                <p>Expires {payment.expiry}</p>
              </div>
              <button
                type="button"
                onClick={() => showToast(`${payment.brand} set as default.`)}
              >
                Set Default
              </button>
            </article>
          ))}
        </div>
      );
    }

    if (activePanel === "profile") {
      return (
        <div className="customer-profile-section">
          {/* ── Profile photo ── */}
          <div className="customer-profile-photo-row">
            <div className="customer-profile-avatar-wrap">
              {photoPreview ? (
                <img
                  className="customer-profile-avatar"
                  src={photoPreview}
                  alt="Profile"
                />
              ) : (
                <div className="customer-profile-avatar customer-profile-avatar--initials">
                  {firstName?.slice(0, 2).toUpperCase()}
                </div>
              )}
              {photoUploading && (
                <div className="customer-profile-avatar-uploading">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
              )}
            </div>

            <div className="customer-profile-photo-controls">
              <p className="customer-profile-photo-label">Profile Photo</p>
              <p className="customer-profile-photo-hint">
                JPG, PNG or WebP · max 2 MB · stored securely in Supabase
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={photoFileRef}
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                className="customer-profile-photo-btn"
                onClick={() => photoFileRef.current?.click()}
                disabled={photoUploading}
              >
                <span className="material-symbols-outlined">upload</span>
                {photoUploading ? "Uploading…" : "Upload New Photo"}
              </button>
            </div>
          </div>

          {/* ── Profile form ── */}
          <form
            className="customer-profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              showToast("Profile details saved locally for this session.");
            }}
          >
            <label>
              First Name
              <input defaultValue={user?.firstName || firstName} />
            </label>
            <label>
              Last Name
              <input defaultValue={user?.lastName || ""} />
            </label>
            <label>
              Email
              <input type="email" defaultValue={user?.email || ""} />
            </label>
            <label>
              Notifications
              <select
                defaultValue={user?.receiveNotifications === false ? "off" : "on"}
              >
                <option value="on">Enabled</option>
                <option value="off">Disabled</option>
              </select>
            </label>
            <button type="submit">Save Profile</button>
          </form>
        </div>
      );
    }

    return (
      <div className="customer-account-panel-list">
        {orderHistory.map((order) => (
          <article className="customer-account-panel-item" key={order.id}>
            <span className="material-symbols-outlined">receipt_long</span>
            <div>
              <strong>#{order.id}</strong>
              <p>{order.title}</p>
              <p>
                {order.status} - {order.delivery}
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast(`Opened order #${order.id}.`)}
            >
              View Details
            </button>
          </article>
        ))}
      </div>
    );
  };

  return (
    <PublicCommerceShell active="Dashboard">
      <div className="customer-dashboard-page">
        {toast && (
          <div className="customer-dashboard-toast" role="status">
            {toast}
          </div>
        )}

        <main className="customer-dashboard-main">
          <section className="customer-dashboard-hero">
            <div className="customer-dashboard-container">
              <span>Customer Dashboard</span>
              <h1>Welcome back, {firstName}.</h1>
              <p>
                Manage your collections, track orders, and curate your space
                with the precision of a master craftsman.
              </p>
            </div>
          </section>

          <section className="customer-dashboard-content">
            <div className="customer-dashboard-container customer-dashboard-grid">
              <div className="customer-dashboard-left">
                <section className="customer-dashboard-card customer-dashboard-reveal">
                  <div className="customer-dashboard-section-title">
                    <h2>Active Orders</h2>
                    <button
                      type="button"
                      onClick={() => setActivePanel("orders")}
                    >
                      View All
                    </button>
                  </div>

                  <div className="customer-orders-list">
                    {activeOrders.map((order) => (
                      <article className="customer-order-row" key={order.id}>
                        <div className="customer-order-info">
                          <div className="customer-order-image">
                            <img src={order.image} alt={order.title} />
                          </div>

                          <div>
                            <p>#{order.id}</p>
                            <h3>{order.title}</h3>
                            <span>
                              Status:{" "}
                              <strong className={`status-${order.statusTone}`}>
                                {order.status}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="customer-order-action">
                          <span>Est. Delivery: {order.delivery}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePanel("orders");
                              showToast(`Tracking #${order.id}.`);
                            }}
                          >
                            Track Order
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="customer-wishlist-section customer-dashboard-reveal">
                  <div className="customer-dashboard-section-title">
                    <h2>My Wishlist</h2>
                    <button type="button" onClick={() => navigate("/wishlist")}>
                      View All
                    </button>
                  </div>

                  <div className="customer-wishlist-grid">
                    {wishlistItems.map((item) => (
                      <article className="customer-wishlist-card" key={item.id}>
                        <div className="customer-wishlist-image">
                          <img src={item.image} alt={item.title} />
                          <button
                            type="button"
                            aria-label={`Remove ${item.title} from wishlist`}
                            onClick={() =>
                              showToast(`${item.title} removed from wishlist.`)
                            }
                          >
                            <span className="material-symbols-outlined filled">
                              favorite
                            </span>
                          </button>
                        </div>

                        <div className="customer-wishlist-body">
                          <h3>{item.title}</h3>
                          <p>{item.price}</p>

                          <div className="customer-wishlist-actions">
                            <button
                              type="button"
                              onClick={() => handleMoveToBag(item)}
                            >
                              Move to Bag
                            </button>
                            <Link to="/products/obsidian-kitchen-island">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="customer-dashboard-card customer-account-panel customer-dashboard-reveal">
                  <div className="customer-dashboard-section-title">
                    <h2>
                      {accountLinks.find((link) => link.key === activePanel)
                        ?.label || "Order History"}
                    </h2>
                    <button type="button" onClick={() => navigate("/contact")}>
                      Need Help?
                    </button>
                  </div>
                  {renderAccountPanel()}
                </section>
              </div>

              <aside className="customer-dashboard-right">
                <section className="customer-consultation-card customer-dashboard-reveal">
                  <span>Your Curated Space</span>
                  <h2>Design Consultation</h2>

                  <div className="customer-consultation-box">
                    <p>Next Session:</p>
                    <h3>Dec 12 at 10:00 AM</h3>
                    <em>with Marcus Thorne</em>
                    <small>Senior Interior Designer</small>
                  </div>

                  <button type="button" onClick={() => navigate("/contact")}>
                    Book New Session
                  </button>
                </section>

                <section className="customer-account-card customer-dashboard-reveal">
                  <h2>Account Overview</h2>

                  <ul>
                    {accountLinks.map((link) => (
                      <li key={link.key}>
                        <button
                          type="button"
                          className={activePanel === link.key ? "active" : ""}
                          onClick={() => setActivePanel(link.key)}
                        >
                          <span>
                            <i className="material-symbols-outlined">
                              {link.icon}
                            </i>
                            {link.label}
                          </span>
                          <i className="material-symbols-outlined">
                            chevron_right
                          </i>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="customer-signout-button"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </section>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </PublicCommerceShell>
  );
}
