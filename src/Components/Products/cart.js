import "../../Styles/Products.css";
import "../../Styles/cart.css";

const Cart = ({ cart = [] }) => {
  // Function to calculate the total number of products in the cart
  const calculateTotalProducts = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <h3 className="hd mb-0 mt-5">Your Cart</h3>
              <p>
                There are <b>{calculateTotalProducts()}</b> products in your
                cart
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
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center cartItemimgWrapper">
                            <div className="imgWrapper2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="images"
                              />
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.price}</td>
                        <td>{item.quantity || 1}</td>
                        <td>
                          {(item.price * (item.quantity || 1)).toFixed(2)}
                        </td>
                        <td>
                          <button className="btn btn-danger">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-md-4">
              {/* Add any additional content like a summary of the cart total */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
