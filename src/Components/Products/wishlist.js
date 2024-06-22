import React, { useState } from "react";
import "../../Styles/wishlist.css"; // Import your CSS file

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]); // State to manage wishlist items

  return (
    <div>
      <div className="header">{/* Header content here */}</div>

      <div className="signup1">
        <p className="sign1">Wishlist</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="emptyWishlistContainer">
          <i className="material-icons" id="emptyWishlist">
            heart_broken
          </i>
          <div id="yourWishlist">WISHLIST IS EMPTY.</div>
          <div>You don't have any products in the wishlist yet.</div>
          <div>
            You will find a lot of interesting products on our "Shop" page.
          </div>
          <a href="index.html">
            <button id="returnButton">RETURN TO SHOP</button>
          </a>
        </div>
      ) : (
        <div className="fullWishlistContainer">
          {wishlist.map((item, index) => (
            <div className="wishlistItemContainer" key={index}>
              <div className="wishlistImageContainer">
                <img
                  src={item.image}
                  width="100px"
                  height="100px"
                  alt={item.name}
                />
              </div>
              <div className="wishlistTexts">
                <a href={item.link} id="websiteLink">
                  {item.brand}
                </a>
                <div style={{ fontWeight: "bold" }}>{item.name}</div>
                <div>
                  <s>{item.originalPrice}</s>{" "}
                  <span style={{ color: "red" }}>{item.discountedPrice}</span>
                </div>
                <div id="insideInfo">
                  <p style={{ fontSize: "10px" }}>{item.description}</p>
                </div>
              </div>
              <div className="buttonContainer">
                <button id="viewButton">
                  <span id="viewMessage">View</span>
                  <span className="material-symbols-outlined" id="eyeIcon">
                    visibility
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
