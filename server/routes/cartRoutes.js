import express from "express";
import mongoose from "mongoose";
import Cart from "../model/Cart.js";
import Product from "../model/productsmodel.js";
import { verifyUser } from "../middleware/AuthMiddleware.js";

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const PRODUCT_SELECT =
  "name slug description price discountPrice imageUrl images galleryImages category collection stock lowStockThreshold status material color room useCase featured";

router.use(verifyUser);

const normalizeQuantity = (value, fallback = 1) => {
  const quantity = Number(value ?? fallback);
  if (!Number.isFinite(quantity)) return fallback;
  return Math.max(0, Math.floor(quantity));
};

const productIdFromPayload = (payload = {}) =>
  String(
    payload.productId ||
      payload._id ||
      payload.id ||
      payload.item?.productId ||
      payload.item?._id ||
      payload.item?.id ||
      "",
  );

const isPurchasableProduct = (product) =>
  product && !["archived", "inactive", "draft"].includes(String(product.status || "active"));

const toProductPayload = (product) => {
  if (!product) return null;
  const plain = typeof product.toObject === "function" ? product.toObject() : product;
  return {
    ...plain,
    _id: plain._id,
    id: String(plain._id),
    productId: String(plain._id),
    image: plain.imageUrl || plain.images?.[0] || plain.galleryImages?.[0]?.url || "",
    img: plain.imageUrl || plain.images?.[0] || plain.galleryImages?.[0]?.url || "",
  };
};

const serializeCart = (cart) => {
  const items = (cart?.items || []).map((item) => {
    const populatedProduct =
      item.productId && typeof item.productId === "object" && item.productId._id
        ? item.productId
        : null;
    const rawProductId = populatedProduct?._id || item.productId;
    const product = toProductPayload(populatedProduct);

    return {
      ...(product || {
        id: String(rawProductId),
        _id: rawProductId,
        productId: String(rawProductId),
        name: "Product unavailable",
        title: "Product unavailable",
        price: 0,
        stock: 0,
        status: "unavailable",
        unavailable: true,
      }),
      product,
      productId: String(rawProductId),
      quantity: Number(item.quantity || 1),
      addedAt: item.addedAt,
      unavailable: !product,
    };
  });

  return {
    _id: cart?._id,
    userId: cart?.userId,
    items,
    updatedAt: cart?.updatedAt,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

const getPopulatedCart = async (userId) =>
  Cart.findOne({ userId }).populate("items.productId", PRODUCT_SELECT);

const sendCart = async (res, userId, status = 200, extra = {}) => {
  const populated = await getPopulatedCart(userId);
  const cart = serializeCart(populated || { userId, items: [] });
  return res.status(status).json({
    success: true,
    cart,
    items: cart.items,
    ...extra,
  });
};

const findPurchasableProduct = async (productId) => {
  if (!isValidId(productId)) return null;
  const product = await Product.findById(productId).select(PRODUCT_SELECT);
  return isPurchasableProduct(product) ? product : null;
};

router.get("/", async (req, res, next) => {
  try {
    await getOrCreateCart(req.user._id);
    return sendCart(res, req.user._id);
  } catch (error) {
    return next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const productId = productIdFromPayload(req.body);
    const quantity = normalizeQuantity(req.body.quantity ?? req.body.item?.quantity, 1);

    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    const product = await findPurchasableProduct(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => String(item.productId) === String(product._id));
    const nextQuantity = Number(existing?.quantity || 0) + quantity;

    if (Number(product.stock) >= 0 && nextQuantity > Number(product.stock)) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      });
    }

    if (existing) existing.quantity = nextQuantity;
    else cart.items.push({ productId: product._id, quantity });

    await cart.save();
    return sendCart(res, req.user._id, 200, { message: "Added to cart." });
  } catch (error) {
    return next(error);
  }
});

router.patch("/items/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantity = normalizeQuantity(req.body.quantity, 0);

    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const cart = await getOrCreateCart(req.user._id);
    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => String(item.productId) !== productId);
      await cart.save();
      return sendCart(res, req.user._id, 200, { message: "Removed from cart." });
    }

    const product = await findPurchasableProduct(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (Number(product.stock) >= 0 && quantity > Number(product.stock)) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      });
    }

    const existing = cart.items.find((item) => String(item.productId) === productId);
    if (existing) existing.quantity = quantity;
    else cart.items.push({ productId, quantity });

    await cart.save();
    return sendCart(res, req.user._id, 200, { message: "Cart updated." });
  } catch (error) {
    return next(error);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((item) => String(item.productId) !== productId);
    await cart.save();
    return sendCart(res, req.user._id, 200, { message: "Removed from cart." });
  } catch (error) {
    return next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    return sendCart(res, req.user._id, 200, { message: "Cart cleared." });
  } catch (error) {
    return next(error);
  }
});

router.post("/merge", async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : Object.values(req.body.items || {});
    const cart = await getOrCreateCart(req.user._id);
    const skipped = [];

    for (const rawItem of rawItems) {
      const productId = productIdFromPayload(rawItem);
      const quantity = normalizeQuantity(rawItem.quantity, 1);

      if (!isValidId(productId) || quantity < 1) {
        skipped.push({ productId, reason: "invalid_product_or_quantity" });
        continue;
      }

      const product = await findPurchasableProduct(productId);
      if (!product) {
        skipped.push({ productId, reason: "product_not_found" });
        continue;
      }

      const existing = cart.items.find((item) => String(item.productId) === String(product._id));
      const desiredQuantity = Number(existing?.quantity || 0) + quantity;
      const nextQuantity =
        Number(product.stock) >= 0
          ? Math.min(desiredQuantity, Number(product.stock))
          : desiredQuantity;

      if (nextQuantity < 1) {
        skipped.push({ productId, reason: "out_of_stock" });
        continue;
      }

      if (existing) existing.quantity = nextQuantity;
      else cart.items.push({ productId: product._id, quantity: nextQuantity });
    }

    await cart.save();
    return sendCart(res, req.user._id, 200, {
      message: "Cart merged.",
      skipped,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
