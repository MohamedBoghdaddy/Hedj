import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import "../../Styles/Products.css";
import "../../Styles/cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount, checkout } =
    useContext(ShopContext);

  return (
    <section className="section">
      <div className="Cart-container">
        <h3 className="hd mb-0 mt-5">Your Cart</h3>
        <p>
          You have <b>{Object.keys(cartItems).length}</b> items in your cart.
        </p>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(cartItems).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center cartItemimgWrapper">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="images"
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cart-summary">
          <h4>Total: ${getTotalCartAmount().toFixed(2)}</h4>
          <button className="btn btn-primary" onClick={checkout}>
            Confirm Purchase
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
