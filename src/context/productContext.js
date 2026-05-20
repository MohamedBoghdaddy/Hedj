import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "./AuthContext";
import { commerceApi } from "../services/api";
import { cartApi } from "../services/cartApi";
import { wishlistApi } from "../services/wishlistApi";
import { normalizeProduct, normalizeProductList, productId } from "../utils/productUtils";

export const ShopContext = createContext(null);

const CART_STORAGE_KEY = "cartItems";
const WISHLIST_STORAGE_KEY = "wishlistItems";

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getStoredData = (key, defaultValue) => {
  if (!hasStorage()) return defaultValue;
  try {
    const storedData = window.localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage data for ${key}:`, error);
    return defaultValue;
  }
};

const writeStoredData = (key, value) => {
  if (hasStorage()) window.localStorage.setItem(key, JSON.stringify(value));
};

const clearGuestStorage = () => {
  if (!hasStorage()) return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
};

const getDefaultCart = () => getStoredData(CART_STORAGE_KEY, {});
const getDefaultWishlist = () => getStoredData(WISHLIST_STORAGE_KEY, []);

const normalizeCartItem = (item = {}) => {
  const source = item.product ? { ...item.product, ...item } : item;
  const normalized = normalizeProduct(source);
  const id = productId(source) || productId(normalized);

  return {
    ...normalized,
    id,
    productId: id,
    quantity: Math.max(1, Number(item.quantity || source.quantity || 1)),
    addedAt: item.addedAt || source.addedAt,
    unavailable: Boolean(item.unavailable || source.unavailable),
  };
};

const cartItemsToMap = (items = []) =>
  items.reduce((next, item) => {
    const normalized = normalizeCartItem(item);
    if (normalized.id) next[normalized.id] = normalized;
    return next;
  }, {});

const cartMapToPayload = (cartMap = {}) =>
  Object.values(cartMap)
    .map((item) => ({
      productId: productId(item),
      quantity: Math.max(1, Number(item.quantity || 1)),
    }))
    .filter((item) => item.productId);

const wishlistToPayload = (items = []) =>
  normalizeProductList(items)
    .map((item) => ({ productId: productId(item) }))
    .filter((item) => item.productId);

const hasCartItems = (cartMap = {}) => Object.keys(cartMap).length > 0;
const hasWishlistItems = (items = []) => Array.isArray(items) && items.length > 0;

export const ShopContextProvider = ({ children }) => {
  const { state: authState } = useAuthContext();
  const [cartItems, setCartItems] = useState(getDefaultCart);
  const [wishlistItems, setWishlistItems] = useState(getDefaultWishlist);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [syncWarning, setSyncWarning] = useState("");
  const activeUserRef = useRef(null);

  const isAuthenticated = Boolean(authState.isAuthenticated && authState.user);

  useEffect(() => {
    if (authState.loading || isAuthenticated) return;
    writeStoredData(CART_STORAGE_KEY, cartItems);
    writeStoredData(WISHLIST_STORAGE_KEY, wishlistItems);
  }, [authState.loading, cartItems, isAuthenticated, wishlistItems]);

  const loadBackendShopState = useCallback(async () => {
    setCartLoading(true);
    setWishlistLoading(true);
    const [cart, wishlist] = await Promise.all([
      cartApi.getCart(),
      wishlistApi.getWishlist(),
    ]);
    setCartItems(cartItemsToMap(cart));
    setWishlistItems(normalizeProductList(wishlist));
    setCartLoading(false);
    setWishlistLoading(false);
  }, []);

  useEffect(() => {
    if (authState.loading) return;

    if (!isAuthenticated) {
      if (activeUserRef.current) {
        activeUserRef.current = null;
        setCartItems({});
        setWishlistItems([]);
        clearGuestStorage();
      }
      setCartLoading(false);
      setWishlistLoading(false);
      return;
    }

    const userId = String(authState.user?._id || authState.user?.id || authState.user?.email || "");
    if (!userId || activeUserRef.current === userId) return;
    activeUserRef.current = userId;

    const guestCart = getDefaultCart();
    const guestWishlist = getDefaultWishlist();

    const sync = async () => {
      setCartLoading(true);
      setWishlistLoading(true);
      setSyncWarning("");

      try {
        if (hasCartItems(guestCart)) {
          await cartApi.mergeCart(cartMapToPayload(guestCart));
        }
        if (hasWishlistItems(guestWishlist)) {
          await wishlistApi.mergeWishlist(wishlistToPayload(guestWishlist));
        }

        const [cart, wishlist] = await Promise.all([
          cartApi.getCart(),
          wishlistApi.getWishlist(),
        ]);

        setCartItems(cartItemsToMap(cart));
        setWishlistItems(normalizeProductList(wishlist));
        clearGuestStorage();
      } catch (error) {
        const message =
          "Signed in, but we could not sync your saved cart or wishlist. Please refresh.";
        setSyncWarning(message);
        toast.warn(message);
        console.error("Cart/wishlist sync failed:", error);

        try {
          await loadBackendShopState();
        } catch (loadError) {
          console.error("Backend cart/wishlist load failed:", loadError);
        }
      } finally {
        setCartLoading(false);
        setWishlistLoading(false);
      }
    };

    sync();
  }, [authState.loading, authState.user, isAuthenticated, loadBackendShopState]);

  const getTotalCartAmount = useCallback(
    () =>
      Object.values(cartItems).reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const addToCart = useCallback(
    async (item) => {
      const normalizedItem = normalizeProduct(item);
      const id = productId(normalizedItem);
      const quantityToAdd = Math.max(1, Number(item.quantity || 1));

      if (!id) throw new Error("Product id is required.");

      if (isAuthenticated) {
        const cart = await cartApi.addCartItem(id, quantityToAdd);
        setCartItems(cartItemsToMap(cart));
        return;
      }

      const cartItem = {
        ...normalizedItem,
        id,
        productId: id,
        quantity: quantityToAdd,
      };

      setCartItems((prev) => {
        const next = { ...prev };
        if (next[id]) next[id].quantity += quantityToAdd;
        else next[id] = cartItem;
        return next;
      });
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      const id = String(itemId || "");
      if (!id) return;
      const currentQty = Number(cartItems[id]?.quantity || 0);
      const nextQty = Math.max(0, currentQty - 1);

      if (isAuthenticated) {
        const cart = await cartApi.updateCartItem(id, nextQty);
        setCartItems(cartItemsToMap(cart));
        return;
      }

      setCartItems((prev) => {
        const next = { ...prev };
        if (next[id]?.quantity > 1) next[id].quantity -= 1;
        else delete next[id];
        return next;
      });
    },
    [cartItems, isAuthenticated],
  );

  const removeCartItem = useCallback(
    async (itemId) => {
      const id = String(itemId || "");
      if (!id) return;

      if (isAuthenticated) {
        const cart = await cartApi.removeCartItem(id);
        setCartItems(cartItemsToMap(cart));
        return;
      }

      setCartItems((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [isAuthenticated],
  );

  const addToWishlist = useCallback(
    async (item) => {
      const normalizedItem = normalizeProduct(item);
      const id = productId(normalizedItem);
      if (!id) throw new Error("Product id is required.");

      if (isAuthenticated) {
        const wishlist = await wishlistApi.addWishlistItem(id);
        setWishlistItems(normalizeProductList(wishlist));
        return;
      }

      setWishlistItems((prev) => {
        if (!prev.some((wishlistItem) => productId(wishlistItem) === id)) {
          return [...prev, { ...normalizedItem, id, productId: id }];
        }
        return prev;
      });
    },
    [isAuthenticated],
  );

  const removeFromWishlist = useCallback(
    async (itemId) => {
      const id = String(itemId || "");
      if (!id) return;

      if (isAuthenticated) {
        const wishlist = await wishlistApi.removeWishlistItem(id);
        setWishlistItems(normalizeProductList(wishlist));
        return;
      }

      setWishlistItems((prev) => prev.filter((item) => productId(item) !== id));
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      const cart = await cartApi.clearCart();
      setCartItems(cartItemsToMap(cart));
      return;
    }
    setCartItems({});
  }, [isAuthenticated]);

  const clearWishlist = useCallback(async () => {
    if (isAuthenticated) {
      const wishlist = await wishlistApi.clearWishlist();
      setWishlistItems(normalizeProductList(wishlist));
      return;
    }
    setWishlistItems([]);
  }, [isAuthenticated]);

  const checkout = useCallback(
    async (orderDetails = {}) => {
      const items = Object.values(cartItems);
      if (items.length === 0) return null;

      const result = await commerceApi.checkout({
        ...orderDetails,
        items,
      });

      setPurchaseHistory((prev) => [...prev, ...items]);
      await clearCart();
      return result?.order || result;
    },
    [cartItems, clearCart],
  );

  const contextValue = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      purchaseHistory,
      cartLoading,
      wishlistLoading,
      syncWarning,
      addToCart,
      removeFromCart,
      removeCartItem,
      addToWishlist,
      removeFromWishlist,
      clearCart,
      clearWishlist,
      refreshShopData: loadBackendShopState,
      getTotalCartAmount,
      checkout,
    }),
    [
      addToCart,
      cartItems,
      cartLoading,
      checkout,
      clearCart,
      clearWishlist,
      getTotalCartAmount,
      loadBackendShopState,
      purchaseHistory,
      removeCartItem,
      removeFromCart,
      removeFromWishlist,
      syncWarning,
      wishlistItems,
      wishlistLoading,
      addToWishlist,
    ],
  );

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};
