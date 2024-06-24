import React from "react";
import "../../Styles/Products.css";
import "../../Styles/cart.css";

const Cart = () => {

  return(
    <>
    <section className="section">
      <div className="container">
       <div className="row">
        <div className="col-md-8">
        <h3 className="hd mb-0 mt-5">Your Cart</h3>
        <p>There are <b>3</b> products in your cart</p>
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
          </table>
          <tbody>
            <tr>
              <td>
<div className="d-flex align-items-center cartItemimgWrapper">
  <div className="imgWrapper2">
    <img src="https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg" className="images"/>
  </div>
</div>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </div>
        </div>
        <div className="col-md-4">

        </div>
       </div>
      </div>
    </section>
    
    </>
  )


 
};

export default Cart;
