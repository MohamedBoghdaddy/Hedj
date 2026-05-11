import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/productContext";
import "../../Styles/cart.css";

const STEPS = ["Customer Info", "Delivery", "Payment"];

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const navigate    = useNavigate();
  const [promo, setPromo] = useState("");

  const items      = Object.values(cartItems);
  const subtotal   = getTotalCartAmount();
  const install    = subtotal > 0 ? 450 : 0;
  const tax        = Math.round(subtotal * 0.082);
  const total      = subtotal + install + tax;

  const handleQtyIncrease = (item) => {
    // re-add the item (increases quantity in context)
    const { addToCart } = require("../../context/productContext");
  };

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="cart-page-title">Cart &amp; Checkout</h1>

        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((label, i) => (
            <>
              {i > 0 && <div key={`div-${i}`} className="step-divider" />}
              <div key={label} className={`step-item${i === 0 ? " active" : ""}`}>
                <span className="step-num">{i + 1}</span>
                <span className="step-label">{label}</span>
              </div>
            </>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="material-symbols-outlined">shopping_bag</span>
            <h3>Your cart is empty</h3>
            <p>Add some beautiful pieces to get started.</p>
            <Link to="/collections" className="btn-hedj-primary">Shop Collections</Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* Cart items */}
            <div>
              <div className="cart-items-section">
                <h2 className="cart-section-title">Your Selection</h2>
                <div className="cart-items-list">
                  {items.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-img">
                        {item.img ? (
                          <img src={item.img} alt={item.name} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--color-surface-container)" }} />
                        )}
                      </div>
                      <div className="cart-item-body">
                        <div className="cart-item-top">
                          <div>
                            <h3 className="cart-item-name">{item.name}</h3>
                            {item.material && (
                              <p className="cart-item-meta">{item.material}{item.finish ? ` / ${item.finish}` : ""}</p>
                            )}
                          </div>
                          <span className="cart-item-price">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="qty-stepper">
                            <button onClick={() => removeFromCart(item.id)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => {}}>+</button>
                          </div>
                          <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <aside>
              <div className="order-summary-box">
                <h3 className="order-summary-title">Order Summary</h3>

                <div className="order-summary-rows">
                  <div className="order-summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Installation (White-Glove)</span>
                    <span>${install.toLocaleString()}</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Tax (EST)</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="order-summary-total">
                  <span className="label">Total</span>
                  <span className="amount">${total.toLocaleString()}</span>
                </div>

                <p className="order-delivery-note">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                  Estimated Delivery: 8–12 weeks
                </p>

                <div className="promo-row">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                  />
                  <button>Apply</button>
                </div>

                <button className="btn-hedj-primary checkout-cta" onClick={() => navigate("/checkout")}>
                  Secure Checkout
                </button>
                <button className="quote-cta" onClick={() => navigate("/contact")}>
                  Request Quote for Project
                </button>

                <div className="trust-icons">
                  <span className="material-symbols-outlined">security</span>
                  <span className="material-symbols-outlined">payments</span>
                  <span className="material-symbols-outlined">verified</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
