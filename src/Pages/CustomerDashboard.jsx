import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  { label: "Address Book", icon: "location_on" },
  { label: "Payment Methods", icon: "payments" },
  { label: "Profile Settings", icon: "settings" },
  { label: "Order History", icon: "history" },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const user = useMemo(() => getStoredUser(), []);
  const firstName =
    user?.firstName ||
    user?.username?.split(" ")?.[0] ||
    user?.name?.split(" ")?.[0] ||
    "Julian";

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/Login", { replace: true });
  };

  return (
    <div className="customer-dashboard-page">
      {toast && (
        <div className="customer-dashboard-toast" role="status">
          {toast}
        </div>
      )}

      <header className="customer-dashboard-nav">
        <div className="customer-dashboard-nav-inner">
          <Link to="/" className="customer-dashboard-brand">
            Hedj Commerce
          </Link>

          <nav className="customer-dashboard-links">
            <Link to="/collections">Collections</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/virtual-showroom">Showrooms</Link>
            <Link to="/contact">Consultations</Link>
          </nav>

          <div className="customer-dashboard-nav-actions">
            <Link to="/cart" aria-label="Shopping bag">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>

            <button type="button" aria-label="Profile" className="active">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </header>

      <main className="customer-dashboard-main">
        <section className="customer-dashboard-hero">
          <div className="customer-dashboard-container">
            <span>Customer Dashboard</span>
            <h1>Welcome back, {firstName}.</h1>
            <p>
              Manage your collections, track orders, and curate your space with
              the precision of a master craftsman.
            </p>
          </div>
        </section>

        <section className="customer-dashboard-content">
          <div className="customer-dashboard-container customer-dashboard-grid">
            <div className="customer-dashboard-left">
              <section className="customer-dashboard-card customer-dashboard-reveal">
                <div className="customer-dashboard-section-title">
                  <h2>Active Orders</h2>
                  <button type="button" onClick={() => showToast("Order history coming soon.")}>
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
                          onClick={() =>
                            showToast(`Tracking details for #${order.id} are coming soon.`)
                          }
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
                  <button type="button" onClick={() => showToast("Wishlist page coming soon.")}>
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
                          onClick={() => showToast(`${item.title} removed from wishlist.`)}
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
                            onClick={() => showToast(`${item.title} moved to bag.`)}
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

                <button
                  type="button"
                  onClick={() => showToast("Booking flow is not connected yet.")}
                >
                  Book New Session
                </button>
              </section>

              <section className="customer-account-card customer-dashboard-reveal">
                <h2>Account Overview</h2>

                <ul>
                  {accountLinks.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => showToast(`${link.label} coming soon.`)}
                      >
                        <span>
                          <i className="material-symbols-outlined">{link.icon}</i>
                          {link.label}
                        </span>
                        <i className="material-symbols-outlined">chevron_right</i>
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

      <footer className="customer-dashboard-footer">
        <div className="customer-dashboard-container customer-footer-inner">
          <div>
            <Link to="/" className="customer-footer-brand">
              Hedj Commerce
            </Link>
            <p>© 2024 Hedj Commerce. Purveyors of Fine Craftsmanship.</p>
          </div>

          <nav>
            <Link to="/sustainability">Sustainability</Link>
            <Link to="/shipping">Shipping & Returns</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
