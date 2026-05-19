import { useContext } from "react";
import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../PublicCommerceShell";
import { ShopContext } from "../../context/productContext";
import "../../Styles/wishlist.css";

const Wishlist = () => {
  const { wishlistItems, addToCart, removeFromWishlist } =
    useContext(ShopContext);

  return (
    <PublicCommerceShell>
      <main className="wishlistContainer">
        {wishlistItems.length === 0 ? (
          <div className="emptyWishlistContainer">
            <i className="material-icons" id="emptyWishlist">
              favorite_border
            </i>
            <div id="yourWishlist">Your Wishlist is Empty.</div>
            <Link to="/products" id="returnButton">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="fullWishlistContainer">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlistItemContainer">
                <div className="wishlistImageContainer">
                  <img src={item.image || item.img} alt={item.name} />
                </div>
                <div className="wishlistTexts">
                  <div className="wishlistTitle">{item.name}</div>
                  <div className="wishlistPrice">
                    Price: ${Number(item.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="buttonContainer">
                  <button type="button" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                  <button type="button" onClick={() => removeFromWishlist(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PublicCommerceShell>
  );
};

export default Wishlist;
