import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/AuthContext";
import { commerceApi, customerApi, storageApi } from "../services/api";
import "../Styles/customer-dashboard-premium.css";

// ─── Constants (non-Mongo UI data — no backend model needed) ─────────────────

const STATUS_TONE = {
  new: "gold", confirmed: "gold", in_production: "gold",
  ready: "dark", delivered: "dark", cancelled: "muted",
};
const STATUS_LABEL = {
  new: "New", confirmed: "Confirmed", in_production: "In Production",
  ready: "Ready for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};



const accountLinks = [
  { key: "orders", label: "Order History", icon: "history" },
  { key: "addresses", label: "Address Book", icon: "location_on" },
  { key: "payments", label: "Payment Methods", icon: "payments" },
  { key: "profile", label: "Profile Settings", icon: "settings" },
];



const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

function ProfileForm({ user, dispatch, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    receiveNotifications: user?.receiveNotifications !== false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) { showToast("Cannot update: user ID missing."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, ...form };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch({ type: "USER_LOADED", payload: updatedUser });
        showToast("Profile updated successfully.");
      } else {
        showToast(data.message || "Update failed.");
      }
    } catch {
      showToast("Network error — could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="customer-profile-form" onSubmit={handleSubmit}>
      <label>
        First Name
        <input
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          required
        />
      </label>
      <label>
        Last Name
        <input
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
      </label>
      <label>
        Notifications
        <select
          value={form.receiveNotifications ? "on" : "off"}
          onChange={(e) => setForm((f) => ({ ...f, receiveNotifications: e.target.value === "on" }))}
        >
          <option value="on">Enabled</option>
          <option value="off">Disabled</option>
        </select>
      </label>
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}

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
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", line1: "", city: "", country: "UK" });
  const user = useMemo(() => state.user || getStoredUser(), [state.user]);

  const loadMyOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const orders = await commerceApi.getMyOrders();
      setMyOrders(Array.isArray(orders) ? orders : []);
    } catch {
      setMyOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadAccountData = useCallback(async () => {
    setAccountLoading(true);
    try {
      const [addr, pay, wish] = await Promise.allSettled([
        customerApi.getAddresses(),
        customerApi.getPaymentMethods(),
        customerApi.getWishlist(),
      ]);
      if (addr.status === "fulfilled") setAddresses(addr.value);
      if (pay.status === "fulfilled") setPaymentMethods(pay.value);
      if (wish.status === "fulfilled") setWishlist(wish.value);
    } finally {
      setAccountLoading(false);
    }
  }, []);

  useEffect(() => { loadMyOrders(); loadAccountData(); }, [loadMyOrders, loadAccountData]);

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

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const created = await customerApi.createAddress(addressForm);
      setAddresses((prev) => [...prev, created.address]);
      setAddAddressOpen(false);
      setAddressForm({ label: "Home", line1: "", city: "", country: "UK" });
      showToast("Address saved.");
    } catch (err) {
      showToast(`Could not save address: ${err.message}`);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await customerApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
      showToast("Address removed.");
    } catch (err) {
      showToast(`Could not remove: ${err.message}`);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await customerApi.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
      showToast("Removed from wishlist.");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const renderAccountPanel = () => {
    if (accountLoading) return <p style={{ padding: "24px", color: "#94a3b8" }}>Loading…</p>;

    if (activePanel === "addresses") {
      return (
        <div className="customer-account-panel-list">
          {addresses.length === 0 && !addAddressOpen && (
            <p style={{ padding: "16px", color: "#94a3b8", fontSize: 14 }}>
              No saved addresses yet.
            </p>
          )}
          {addresses.map((address) => (
            <article className="customer-account-panel-item" key={address._id || address.id}>
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <strong>{address.label}</strong>
                <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                <p>{address.city}{address.country ? `, ${address.country}` : ""}{address.postalCode ? ` ${address.postalCode}` : ""}</p>
                {address.isDefaultShipping && <p style={{ fontSize: 11, color: "#a07e48" }}>Default shipping</p>}
              </div>
              <button type="button" onClick={() => handleDeleteAddress(address._id || address.id)}>Remove</button>
            </article>
          ))}
          {addAddressOpen ? (
            <form onSubmit={handleAddAddress} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Label (e.g. Home)" value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} />
              <input placeholder="Address line 1 *" required value={addressForm.line1} onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))} />
              <input placeholder="City *" required value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} />
              <input placeholder="Country *" required value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="customer-profile-photo-btn">Save Address</button>
                <button type="button" onClick={() => setAddAddressOpen(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button type="button" className="customer-profile-photo-btn" style={{ margin: "8px 0" }} onClick={() => setAddAddressOpen(true)}>
              + Add Address
            </button>
          )}
        </div>
      );
    }

    if (activePanel === "payments") {
      return (
        <div className="customer-account-panel-list">
          {paymentMethods.length === 0 ? (
            <div style={{ padding: "16px" }}>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 8 }}>No saved payment methods.</p>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                Online card saving requires a payment provider (Stripe, etc.) which is not configured yet.
                Contact your administrator to enable payments.
              </p>
            </div>
          ) : (
            paymentMethods.map((pm) => (
              <article className="customer-account-panel-item" key={pm._id || pm.id}>
                <span className="material-symbols-outlined">credit_card</span>
                <div>
                  <strong>{pm.brand} ···· {pm.last4}</strong>
                  <p>Expires {pm.expMonth}/{pm.expYear}</p>
                  {pm.isDefault && <p style={{ fontSize: 11, color: "#a07e48" }}>Default</p>}
                </div>
                <button type="button" onClick={async () => {
                  try {
                    await customerApi.removePaymentMethod(pm._id || pm.id);
                    setPaymentMethods((prev) => prev.filter((p) => (p._id || p.id) !== (pm._id || pm.id)));
                    showToast("Payment method removed.");
                  } catch (err) {
                    showToast(`Could not remove: ${err.message}`);
                  }
                }}>
                  Remove
                </button>
              </article>
            ))
          )}
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
          <ProfileForm user={user} dispatch={dispatch} showToast={showToast} />
        </div>
      );
    }

    // Order History tab — real orders from API
    if (ordersLoading) {
      return <p style={{ padding: "24px", color: "#94a3b8" }}>Loading your orders…</p>;
    }
    if (myOrders.length === 0) {
      return (
        <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40 }}>receipt_long</span>
          <p style={{ marginTop: 12 }}>No orders yet. <Link to="/products" style={{ color: "#a07e48" }}>Browse products →</Link></p>
        </div>
      );
    }
    return (
      <div className="customer-account-panel-list">
        {myOrders.map((order) => {
          const orderId = order._id || order.id;
          const title = order.items?.map(i => i.name).join(", ") || "Hedj Order";
          const label = STATUS_LABEL[order.status] || order.status;
          const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "";
          return (
            <article className="customer-account-panel-item" key={orderId}>
              <span className="material-symbols-outlined">receipt_long</span>
              <div>
                <strong>#{order.orderNumber}</strong>
                <p>{title.length > 60 ? title.slice(0,57)+"…" : title}</p>
                <p>{label}{date ? ` — ${date}` : ""} — ${Number(order.total||0).toLocaleString()}</p>
              </div>
              <Link
                to={`/dashboard?order=${orderId}`}
                style={{ fontSize: 13, color: "#a07e48", textDecoration: "underline" }}
              >
                View Details
              </Link>
            </article>
          );
        })}
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
                    {ordersLoading ? (
                      <p style={{ padding: "16px", color: "#94a3b8", fontSize: 14 }}>Loading orders…</p>
                    ) : myOrders.filter(o => !["delivered","cancelled"].includes(o.status)).length === 0 ? (
                      <p style={{ padding: "16px", color: "#94a3b8", fontSize: 14 }}>
                        No active orders. <Link to="/products" style={{ color: "#a07e48" }}>Start shopping →</Link>
                      </p>
                    ) : (
                      myOrders.filter(o => !["delivered","cancelled"].includes(o.status)).slice(0,3).map((order) => {
                        const orderId = order._id || order.id;
                        const thumb = order.items?.[0]?.imageUrl;
                        const title = order.items?.map(i => i.name).join(", ") || "Hedj Order";
                        const tone = STATUS_TONE[order.status] || "gold";
                        const label = STATUS_LABEL[order.status] || order.status;
                        return (
                          <article className="customer-order-row" key={orderId}>
                            <div className="customer-order-info">
                              <div className="customer-order-image">
                                {thumb
                                  ? <img src={thumb} alt={title} />
                                  : <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#94a3b8" }}>chair</span>
                                }
                              </div>
                              <div>
                                <p>#{order.orderNumber}</p>
                                <h3 style={{ fontSize: 14 }}>{title.length > 50 ? title.slice(0,47)+"…" : title}</h3>
                                <span>Status: <strong className={`status-${tone}`}>{label}</strong></span>
                              </div>
                            </div>
                            <div className="customer-order-action">
                              <span>${Number(order.total||0).toLocaleString()}</span>
                              <button type="button" onClick={() => { setActivePanel("orders"); showToast(`Viewing #${order.orderNumber}`); }}>
                                View Order
                              </button>
                            </div>
                          </article>
                        );
                      })
                    )}
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
                    {wishlist.length === 0 ? (
                      <p style={{ padding: "12px 0", color: "#94a3b8", fontSize: 14 }}>
                        Your wishlist is empty. <Link to="/products" style={{ color: "#a07e48" }}>Browse products →</Link>
                      </p>
                    ) : (
                      wishlist.slice(0, 3).map((item) => {
                        const itemId = item._id || item.id;
                        return (
                          <article className="customer-wishlist-card" key={itemId}>
                            <div className="customer-wishlist-image">
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt={item.name} />
                                : <div style={{ background: "#f1f5f9", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="material-symbols-outlined" style={{ color: "#94a3b8" }}>chair</span></div>
                              }
                              <button
                                type="button"
                                aria-label={`Remove ${item.name} from wishlist`}
                                onClick={() => handleRemoveFromWishlist(itemId)}
                              >
                                <span className="material-symbols-outlined filled">favorite</span>
                              </button>
                            </div>
                            <div className="customer-wishlist-body">
                              <h3>{item.name}</h3>
                              <p>${Number(item.price || 0).toLocaleString()}</p>
                              <div className="customer-wishlist-actions">
                                <button type="button" onClick={() => handleMoveToBag({ id: itemId, name: item.name, price: item.price, image: item.imageUrl, quantity: 1 })}>
                                  Move to Bag
                                </button>
                                <Link to={`/products/${item.slug || itemId}`}>View Details</Link>
                              </div>
                            </div>
                          </article>
                        );
                      })
                    )}
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
                    <p>Schedule a one-on-one session with our design team to personalise your space.</p>
                    <small>Available Mon–Sat, 9 AM – 6 PM</small>
                  </div>

                  <button type="button" onClick={() => navigate("/contact?reason=consultation")}>
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
