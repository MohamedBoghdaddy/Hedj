import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { ShopContext } from "../context/productContext";
import { productImage } from "../utils/productUtils";
import "../Styles/commerce-premium.css";

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CartCheckout = () => {
  const { cartItems, addToCart, removeFromCart, removeCartItem, checkout, cartLoading, syncWarning } =
    useContext(ShopContext);
  const [installType, setInstallType] = useState("white-glove");
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const items = useMemo(() => Object.values(cartItems || {}), [cartItems]);
  const installation = installType === "white-glove" ? 450 : 0;
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [items]
  );
  const tax = Math.round((subtotal + installation) * 0.08);
  const total = subtotal + installation + tax;

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const increment = async (item) => {
    await addToCart({ ...item, quantity: 1 });
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.email.trim()) {
      toast.error("Please complete your customer information.");
      return;
    }

    setSubmitting(true);
    try {
      await checkout({
        customer: {
          ...customer,
          name: `${customer.firstName} ${customer.lastName}`.trim(),
        },
        delivery: {
          installationPreference: installType,
        },
        totals: {
          subtotal,
          install: installation,
          tax,
          total,
        },
      });
      setSuccessOpen(true);
    } catch (error) {
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicCommerceShell>
      <main className="commerce-container">
        <h1 className="commerce-cart-title">Cart & Checkout</h1>

        <div className="commerce-stepper">
          <div className="commerce-step active">
            <span>1</span>
            Customer Info
          </div>
          <div className="commerce-step-line" />
          <div className="commerce-step">
            <span>2</span>
            Delivery
          </div>
          <div className="commerce-step-line" />
          <div className="commerce-step">
            <span>3</span>
            Payment
          </div>
        </div>

        <div className="commerce-cart-layout">
          <div className="commerce-cart-main">
            <section className="commerce-cart-card">
              <h2>Your Selection</h2>
              {syncWarning && <p className="commerce-delivery-note">{syncWarning}</p>}

              {cartLoading ? (
                <div className="commerce-empty-state">
                  <p>Loading your saved cart...</p>
                </div>
              ) : items.length > 0 ? (
                <div className="commerce-cart-list">
                  {items.map((item) => {
                    const image = productImage(item);
                    return (
                      <article className="commerce-cart-item" key={item.id}>
                        <div className="commerce-cart-item-image">
                          {image && <img src={image} alt={item.name} />}
                        </div>

                        <div className="commerce-cart-item-body">
                          <div className="commerce-cart-item-top">
                            <div>
                              <h3>{item.name}</h3>
                              <p className="commerce-cart-item-meta">
                                {[item.material, item.finish].filter(Boolean).join(" / ") ||
                                  item.meta ||
                                  "Hedj selected configuration"}
                              </p>
                            </div>
                            <p className="commerce-cart-item-price">{money(item.price)}</p>
                          </div>

                          <div className="commerce-cart-item-bottom">
                            <div className="commerce-qty-box">
                              <button
                                type="button"
                                aria-label={`Decrease ${item.name} quantity`}
                                onClick={() => removeFromCart(item.id)}
                              >
                                -
                              </button>
                              <span>{item.quantity || 1}</span>
                              <button
                                type="button"
                                aria-label={`Increase ${item.name} quantity`}
                                onClick={() => increment(item)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="commerce-remove-button"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="commerce-empty-state">
                  <p>Your cart is empty.</p>
                  <Link className="commerce-button-outline" to="/collections/kitchens">
                    Return to Collections
                  </Link>
                </div>
              )}
            </section>

            <section className="checkout-section">
              <h2>1. Shipping & Installation</h2>

              <div className="checkout-form-grid">
                <div className="commerce-field">
                  <label htmlFor="checkout-first-name">First Name</label>
                  <input
                    id="checkout-first-name"
                    name="firstName"
                    value={customer.firstName}
                    onChange={handleCustomerChange}
                    placeholder="Julian"
                    type="text"
                  />
                </div>

                <div className="commerce-field">
                  <label htmlFor="checkout-last-name">Last Name</label>
                  <input
                    id="checkout-last-name"
                    name="lastName"
                    value={customer.lastName}
                    onChange={handleCustomerChange}
                    placeholder="Vandervilt"
                    type="text"
                  />
                </div>

                <div className="commerce-field full">
                  <label htmlFor="checkout-email">Email Address</label>
                  <input
                    id="checkout-email"
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="j.vandervilt@studio.com"
                    type="email"
                  />
                </div>

                <div className="commerce-field full">
                  <span className="product-option-label">Installation Preference</span>

                  <div className="install-options">
                    <div
                      className={`install-option ${
                        installType === "white-glove" ? "active" : ""
                      }`}
                    >
                      <input
                        id="install-white-glove"
                        name="install"
                        type="radio"
                        checked={installType === "white-glove"}
                        onChange={() => setInstallType("white-glove")}
                      />
                      <label htmlFor="install-white-glove">
                        <strong>White-Glove Delivery</strong>
                        <p>
                          Full assembly, room placement, and packaging removal by Hedj
                          artisans.
                        </p>
                      </label>
                      <span className="install-price">+$450</span>
                    </div>

                    <div
                      className={`install-option ${
                        installType === "threshold" ? "active" : ""
                      }`}
                    >
                      <input
                        id="install-threshold"
                        name="install"
                        type="radio"
                        checked={installType === "threshold"}
                        onChange={() => setInstallType("threshold")}
                      />
                      <label htmlFor="install-threshold">
                        <strong>Threshold Delivery</strong>
                        <p>Standard delivery to your door. Installation not included.</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="commerce-cart-summary">
            <div className="commerce-summary-card">
              <h3>Order Summary</h3>

              <div className="commerce-summary-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="commerce-summary-row">
                <span>Installation</span>
                <span>{money(installation)}</span>
              </div>
              <div className="commerce-summary-row">
                <span>Tax (EST)</span>
                <span>{money(tax)}</span>
              </div>
              <div className="commerce-summary-row commerce-summary-total">
                <span>Total</span>
                <strong>{money(total)}</strong>
              </div>

              <p className="commerce-delivery-note commerce-summary-delivery">
                <span className="material-symbols-outlined">schedule</span>
                Estimated Delivery: Oct 12 - Oct 19
              </p>

              {/* Promo codes are not yet implemented — field is hidden to avoid confusion */}

              <div className="commerce-summary-actions">
                <button
                  className="commerce-button commerce-checkout-button"
                  type="button"
                  disabled={submitting || items.length === 0}
                  onClick={handleCheckout}
                >
                  {submitting ? "Processing..." : "Secure Checkout"}
                </button>

                <Link className="quote-button" to="/contact?reason=quote">
                  Request Quote for Project
                </Link>
              </div>

              <div className="secure-icons" aria-label="Checkout trust signals">
                <span>
                  <span className="material-symbols-outlined">security</span>
                  Secure payment
                </span>
                <span>
                  <span className="material-symbols-outlined">request_quote</span>
                  Quote available
                </span>
                <span>
                  <span className="material-symbols-outlined">verified</span>
                  Verified checkout
                </span>
              </div>
            </div>

            <div className="consultant-card">
              <p>Need design assistance?</p>
              <Link to="/contact">Speak with an Interior Consultant</Link>
            </div>
          </aside>
        </div>
      </main>

      {successOpen && (
        <div className="success-modal-backdrop" role="dialog" aria-modal="true">
          <div className="success-modal">
            <div className="success-icon">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2>Order Placed Successfully.</h2>
            <p>
              Thank you for choosing Hedj. Your order has been received and is
              pending confirmation. Our team will contact you to arrange payment
              and delivery.
            </p>
            <p style={{ fontSize: 13, color: "#a07e48", marginTop: 8 }}>
              Payment is collected offline. You will receive a confirmation once
              payment is processed.
            </p>

            <div className="success-actions">
              <Link className="commerce-button" to="/dashboard">
                View My Orders
              </Link>
              <Link className="commerce-button-outline" to="/collections/kitchens">
                Return to Collections
              </Link>
            </div>
          </div>
        </div>
      )}
    </PublicCommerceShell>
  );
};

export default CartCheckout;
