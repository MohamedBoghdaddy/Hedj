import React from "react";
import "../../Styles/wishlist.css"; // Import your CSS file for styling

const Wishlist = ({ items }) => {
  return (
    <div className="wishlistContainer">
      {items && items.length === 0 ? (
        <div className="emptyWishlistContainer">
          <i className="material-icons" id="emptyWishlist">
            favorite_border
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
          {items &&
            items.map((item, index) => (
              <div key={index} className="wishlistItemContainer">
                <div className="wishlistImageContainer">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="wishlistTexts">
                  <a href={item.link} id="websiteLink">
                    {item.category}
                  </a>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  <div>
                    <s>{item.originalPrice}</s>{" "}
                    <span style={{ color: "red" }}>{item.discountedPrice}</span>
                  </div>
                  <div id="insideInfo">
                    <p>{item.description}</p>
                  </div>
                </div>
                <div className="buttonContainer">
                  <button id="viewButton">
                    <span id="viewMessage">View</span>
                    <span className="material-icons-outlined" id="eyeIcon">
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
