import { Fragment, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/productContext";
import "./Checkout.css";

const STEPS = ["Cart", "Information", "Delivery", "Payment", "Confirmation"];

const requiredInfoFields = ["firstName", "lastName", "email", "phone", "city", "street"];

const Checkout = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdOrder, setCreatedOrder] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    street: "",
    notes: "",
    deliveryDate: "",
    installRequired: "yes",
    installType: "white-glove",
    paymentMethod: "card",
  });

  const items = Object.values(cartItems);
  const subtotal = getTotalCartAmount();
  const install = form.installType === "white-glove" ? 450 : 0;
  const tax = Math.round(subtotal * 0.082);
  const total = subtotal + install + tax;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateInfo = () => {
    const nextErrors = {};
    requiredInfoFields.forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = "Required";
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const continueToDelivery = () => {
    if (!validateInfo()) {
      toast.error("Complete the required checkout fields.");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validateInfo()) {
      setStep(1);
      toast.error("Complete the required checkout fields.");
      return;
    }

    setLoading(true);
    try {
      const order = await checkout({
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          area: form.area,
          street: form.street,
          notes: form.notes,
        },
        delivery: {
          date: form.deliveryDate,
          installRequired: form.installRequired,
          installType: form.installType,
        },
        payment: {
          method: form.paymentMethod,
        },
        totals: {
          subtotal,
          install,
          tax,
          total,
        },
      });

      setCreatedOrder(order);
      setShowModal(true);
      setStep(4);
      toast.success(`Order ${order?.id || ""} created.`);
    } catch {
      toast.error("We could not place the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => errors[name] && <span className="co-field-error">{errors[name]}</span>;

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        <h1 className="cart-page-title">Checkout</h1>

        <div className="checkout-stepper" style={{ maxWidth: 640, marginBottom: 48 }}>
          {STEPS.map((label, index) => (
            <Fragment key={label}>
              {index > 0 && <div className="step-divider" />}
              <div className={`step-item${index === step ? " active" : index < step ? " done" : ""}`}>
                <span className="step-num">
                  {index < step ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="step-label">{label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        {items.length === 0 && (
          <div className="cart-empty" style={{ marginBottom: 32 }}>
            <span className="material-symbols-outlined">shopping_bag</span>
            <h3>Your cart is empty</h3>
            <p>Add an item before checkout.</p>
            <button className="btn-hedj-primary" type="button" onClick={() => navigate("/collections")}>
              Shop Collections
            </button>
          </div>
        )}

        <div className="checkout-layout">
          <div className="checkout-form-area">
            {step === 1 && (
              <section className="co-section">
                <h2 className="co-section-title">1. Shipping &amp; Contact</h2>
                <div className="co-form-grid">
                  <CheckoutField id="firstName" label="First Name" error={fieldError("firstName")}>
                    <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Julian" />
                  </CheckoutField>
                  <CheckoutField id="lastName" label="Last Name" error={fieldError("lastName")}>
                    <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Thorne" />
                  </CheckoutField>
                  <CheckoutField id="email" label="Email Address" error={fieldError("email")} full>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                  </CheckoutField>
                  <CheckoutField id="phone" label="Phone" error={fieldError("phone")} full>
                    <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </CheckoutField>
                  <CheckoutField id="city" label="City" error={fieldError("city")}>
                    <input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Cairo" />
                  </CheckoutField>
                  <CheckoutField id="area" label="Area">
                    <input id="area" name="area" value={form.area} onChange={handleChange} placeholder="Maadi" />
                  </CheckoutField>
                  <CheckoutField id="street" label="Street Address" error={fieldError("street")} full>
                    <input id="street" name="street" value={form.street} onChange={handleChange} placeholder="15 Elm Street, Apt 4B" />
                  </CheckoutField>
                  <CheckoutField id="notes" label="Additional Notes" full>
                    <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Access code, floor number..." rows={3} />
                  </CheckoutField>
                </div>
                <button className="btn-hedj-primary co-next-btn" type="button" onClick={continueToDelivery}>
                  Continue to Delivery
                </button>
              </section>
            )}

            {step === 2 && (
              <section className="co-section">
                <h2 className="co-section-title">2. Delivery &amp; Installation</h2>
                <CheckoutField id="deliveryDate" label="Preferred Delivery Date" full>
                  <input id="deliveryDate" name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} />
                </CheckoutField>
                <div className="co-install-options">
                  <div className={`co-install-card${form.installType === "white-glove" ? " selected" : ""}`}>
                    <input
                      id="installWhiteGlove"
                      type="radio"
                      name="installType"
                      value="white-glove"
                      checked={form.installType === "white-glove"}
                      onChange={handleChange}
                      aria-label="White-Glove Delivery"
                    />
                    <div>
                      <p className="co-install-name">White-Glove Delivery</p>
                      <p className="co-install-desc">Full assembly, room placement, and packaging removal by Hedj artisans.</p>
                    </div>
                    <span className="co-install-price">+$450</span>
                  </div>
                  <div className={`co-install-card${form.installType === "threshold" ? " selected" : ""}`}>
                    <input
                      id="installThreshold"
                      type="radio"
                      name="installType"
                      value="threshold"
                      checked={form.installType === "threshold"}
                      onChange={handleChange}
                      aria-label="Threshold Delivery"
                    />
                    <div>
                      <p className="co-install-name">Threshold Delivery</p>
                      <p className="co-install-desc">Standard delivery to your door. Installation not included.</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button className="co-back-btn" type="button" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-hedj-primary co-next-btn" type="button" onClick={() => setStep(3)}>
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
                    { value: "card", label: "Credit / Debit Card" },
                    { value: "cash", label: "Cash on Delivery" },
                    { value: "transfer", label: "Bank Transfer" },
                  ].map((option) => (
                    <label key={option.value} className={`co-pay-option${form.paymentMethod === option.value ? " selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={form.paymentMethod === option.value}
                        onChange={handleChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="co-review">
                  <h3 className="co-review-title">Order Review</h3>
                  {items.map((item) => (
                    <div className="co-review-item" key={item.id}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="co-review-item" style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: 12, marginTop: 4 }}>
                    <strong>Total</strong>
                    <strong>${total.toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button className="co-back-btn" type="button" onClick={() => setStep(2)}>Back</button>
                  <button
                    className="btn-hedj-primary co-next-btn"
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </section>
            )}
          </div>

          <aside>
            <div className="order-summary-box">
              <h3 className="order-summary-title">Order Summary</h3>
              <div className="order-summary-rows">
                {items.length === 0 ? (
                  <div className="order-summary-row">
                    <span>No items</span>
                    <span>$0</span>
                  </div>
                ) : (
                  items.map((item) => (
                    <div className="order-summary-row" key={item.id}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))
                )}
                <div className="order-summary-row">
                  <span>Installation</span>
                  <span>${install.toLocaleString()}</span>
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

      {showModal && (
        <div className="co-modal-overlay">
          <div className="co-modal">
            <div className="co-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#fff" }}>check</span>
            </div>
            <h2>Order Created</h2>
            <p>
              Thank you for choosing Hedj. {createdOrder?.id ? `Order ${createdOrder.id} is now visible in Admin Orders.` : "Your order is now visible in Admin Orders."}
            </p>
            <div className="co-modal-actions">
              <button className="btn-hedj-primary" type="button" onClick={() => navigate("/admin/orders")}>
                View Admin Orders
              </button>
              <button className="btn-hedj-outline" type="button" onClick={() => navigate("/collections")}>
                Return to Collections
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutField = ({ id, label, children, error, full = false }) => (
  <div className={`co-field${full ? " co-field-full" : ""}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    {error}
  </div>
);

export default Checkout;
