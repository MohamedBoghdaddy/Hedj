import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import "../../Styles/wishlist.css";

const Wishlist = () => {
  const { wishlistItems, addToCart, removeFromWishlist } =
    useContext(ShopContext);

  return (
    <div className="wishlistContainer">
      {wishlistItems.length === 0 ? (
        <div className="emptyWishlistContainer">
          <i className="material-icons" id="emptyWishlist">
            favorite_border
          </i>
          <div id="yourWishlist">Your Wishlist is Empty.</div>
          <a href="/products">
            <button id="returnButton">Continue Shopping</button>
          </a>
        </div>
      ) : (
        <div className="fullWishlistContainer">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlistItemContainer">
              <div className="wishlistImageContainer">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="wishlistTexts">
                <div className="wishlistTitle">{item.name}</div>
                <div className="wishlistPrice">
                  Price: ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="buttonContainer">
                <button onClick={() => addToCart(item)}>Add to Cart</button>
                <button onClick={() => removeFromWishlist(item.id)}>
                  Remove
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
