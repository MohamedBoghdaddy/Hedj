import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/productContext";
import { toast } from "react-toastify";
import "./Checkout.css";

const STEPS = ["Cart", "Information", "Delivery", "Payment", "Confirmation"];

const Checkout = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const navigate = useNavigate();

  const [step,       setStep]       = useState(1); // 0=cart,1=info,2=delivery,3=payment
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", area: "", street: "", notes: "",
    deliveryDate: "", installRequired: "yes",
    installType: "white-glove",
    paymentMethod: "card",
  });

  const items    = Object.values(cartItems);
  const subtotal = getTotalCartAmount();
  const install  = form.installType === "white-glove" ? 450 : 0;
  const tax      = Math.round(subtotal * 0.082);
  const total    = subtotal + install + tax;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    checkout();
    setShowModal(true);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        <h1 className="cart-page-title">Checkout</h1>

        {/* Stepper */}
        <div className="checkout-stepper" style={{ maxWidth: 640, marginBottom: 48 }}>
          {STEPS.map((label, i) => (
            <span key={label} style={{ display: "contents" }}>
              {i > 0 && <div className="step-divider" />}
              <div className={`step-item${i === step ? " active" : i < step ? " done" : ""}`}>
                <span className="step-num">
                  {i < step
                    ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                    : i + 1}
                </span>
                <span className="step-label">{label}</span>
              </div>
            </span>
          ))}
        </div>

        <div className="checkout-layout">

          {/* Main form */}
          <div className="checkout-form-area">

            {step === 1 && (
              <section className="co-section">
                <h2 className="co-section-title">1. Shipping &amp; Contact</h2>
                <div className="co-form-grid">
                  <div className="co-field">
                    <label>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Julian" />
                  </div>
                  <div className="co-field">
                    <label>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Vandervilt" />
                  </div>
                  <div className="co-field co-field-full">
                    <label>Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                  </div>
                  <div className="co-field co-field-full">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="co-field">
                    <label>City</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Cairo" />
                  </div>
                  <div className="co-field">
                    <label>Area</label>
                    <input name="area" value={form.area} onChange={handleChange} placeholder="Maadi" />
                  </div>
                  <div className="co-field co-field-full">
                    <label>Street Address</label>
                    <input name="street" value={form.street} onChange={handleChange} placeholder="15 Elm Street, Apt 4B" />
                  </div>
                  <div className="co-field co-field-full">
                    <label>Additional Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Access code, floor number…" rows={3} />
                  </div>
                </div>
                <button className="btn-hedj-primary co-next-btn" onClick={() => setStep(2)}>
                  Continue to Delivery
                </button>
              </section>
            )}

            {step === 2 && (
              <section className="co-section">
                <h2 className="co-section-title">2. Delivery &amp; Installation</h2>
                <div className="co-field co-field-full" style={{ marginBottom: 24 }}>
                  <label>Preferred Delivery Date</label>
                  <input name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} />
                </div>
                <div className="co-install-options">
                  <label
                    className={`co-install-card${form.installType === "white-glove" ? " selected" : ""}`}
                    onClick={() => setForm(f => ({ ...f, installType: "white-glove" }))}
                  >
                    <input type="radio" name="installType" value="white-glove" readOnly checked={form.installType === "white-glove"} />
                    <div>
                      <p className="co-install-name">White-Glove Delivery</p>
                      <p className="co-install-desc">Full assembly, room placement, and packaging removal by Hedj artisans.</p>
                    </div>
                    <span className="co-install-price">+$450</span>
                  </label>
                  <label
                    className={`co-install-card${form.installType === "threshold" ? " selected" : ""}`}
                    onClick={() => setForm(f => ({ ...f, installType: "threshold" }))}
                  >
                    <input type="radio" name="installType" value="threshold" readOnly checked={form.installType === "threshold"} />
                    <div>
                      <p className="co-install-name">Threshold Delivery</p>
                      <p className="co-install-desc">Standard delivery to your door. Installation not included.</p>
                    </div>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button className="co-back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-hedj-primary co-next-btn" onClick={() => setStep(3)}>
                    Continue to Payment
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="co-section">
                <h2 className="co-section-title">3. Payment</h2>
                <div className="co-payment-options">
                  {[
                    { value: "card",     label: "Credit / Debit Card" },
                    { value: "cash",     label: "Cash on Delivery" },
                    { value: "transfer", label: "Bank Transfer" },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`co-pay-option${form.paymentMethod === opt.value ? " selected" : ""}`}
                      onClick={() => setForm(f => ({ ...f, paymentMethod: opt.value }))}
                    >
                      <input type="radio" name="paymentMethod" value={opt.value} readOnly checked={form.paymentMethod === opt.value} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Review */}
                <div className="co-review">
                  <h3 className="co-review-title">Order Review</h3>
                  {items.map(item => (
                    <div className="co-review-item" key={item.id}>
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="co-review-item" style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: 12, marginTop: 4 }}>
                    <strong>Total</strong>
                    <strong>${total.toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button className="co-back-btn" onClick={() => setStep(2)}>← Back</button>
                  <button
                    className="btn-hedj-primary co-next-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Placing Order…" : "Place Order"}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Summary sidebar (visible on all steps) */}
          <aside>
            <div className="order-summary-box">
              <h3 className="order-summary-title">Order Summary</h3>
              <div className="order-summary-rows">
                {items.map(item => (
                  <div className="order-summary-row" key={item.id}>
                    <span>{item.name} ×{item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="order-summary-row">
                  <span>Installation</span>
                  <span>${install}</span>
                </div>
                <div className="order-summary-row">
                  <span>Tax</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
              </div>
              <div className="order-summary-total">
                <span className="label">Total</span>
                <span className="amount">${total.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="co-modal-overlay">
          <div className="co-modal">
            <div className="co-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#fff" }}>check</span>
            </div>
            <h2>The Selection is Made.</h2>
            <p>Thank you for choosing Hedj. Your design journey begins now.</p>
            <div className="co-modal-actions">
              <button className="btn-hedj-primary" onClick={() => navigate("/dashboard")}>
                View Design Timeline
              </button>
              <button className="btn-hedj-outline" onClick={() => navigate("/collections")}>
                Return to Collections
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
