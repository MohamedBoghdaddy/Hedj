import { requestBackendJson } from "./backendJson";

const unwrapItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.cart?.items)) return payload.cart.items;
  if (Array.isArray(payload?.cart)) return payload.cart;
  return [];
};

export const cartApi = {
  getCart: () => requestBackendJson("/api/cart").then(unwrapItems),

  addCartItem: (productId, quantity = 1) =>
    requestBackendJson("/api/cart/items", {
      method: "POST",
      body: { productId, quantity },
    }).then(unwrapItems),

  updateCartItem: (productId, quantity) =>
    requestBackendJson(`/api/cart/items/${productId}`, {
      method: "PATCH",
      body: { quantity },
    }).then(unwrapItems),

  removeCartItem: (productId) =>
    requestBackendJson(`/api/cart/items/${productId}`, {
      method: "DELETE",
    }).then(unwrapItems),

  clearCart: () =>
    requestBackendJson("/api/cart", {
      method: "DELETE",
    }).then(unwrapItems),

  mergeCart: (items) =>
    requestBackendJson("/api/cart/merge", {
      method: "POST",
      body: { items },
    }).then((payload) => ({
      items: unwrapItems(payload),
      skipped: payload?.skipped || [],
    })),
};
