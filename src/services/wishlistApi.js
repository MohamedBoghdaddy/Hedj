import { requestBackendJson } from "./backendJson";

const unwrapItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.wishlist)) return payload.wishlist;
  return [];
};

export const wishlistApi = {
  getWishlist: () => requestBackendJson("/api/wishlist").then(unwrapItems),

  addWishlistItem: (productId) =>
    requestBackendJson("/api/wishlist/items", {
      method: "POST",
      body: { productId },
    }).then(unwrapItems),

  removeWishlistItem: (productId) =>
    requestBackendJson(`/api/wishlist/items/${productId}`, {
      method: "DELETE",
    }).then(unwrapItems),

  clearWishlist: () =>
    requestBackendJson("/api/wishlist", {
      method: "DELETE",
    }).then(unwrapItems),

  mergeWishlist: (items) =>
    requestBackendJson("/api/wishlist/merge", {
      method: "POST",
      body: { items },
    }).then((payload) => ({
      items: unwrapItems(payload),
      skipped: payload?.skipped || [],
    })),
};
