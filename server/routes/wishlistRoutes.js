import express from "express";
import mongoose from "mongoose";
import User from "../model/usermodel.js";
import Product from "../model/productsmodel.js";
import { verifyUser } from "../middleware/AuthMiddleware.js";

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const PRODUCT_SELECT =
  "name slug description price discountPrice imageUrl images galleryImages category collection stock lowStockThreshold status material color room useCase featured";

router.use(verifyUser);

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

const isWishableProduct = (product) =>
  product && !["archived", "inactive", "draft"].includes(String(product.status || "active"));

const toProductPayload = (product) => {
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

const getWishlist = async (userId) => {
  const user = await User.findById(userId)
    .select("wishlist")
    .populate("wishlist", PRODUCT_SELECT);
  return (user?.wishlist || [])
    .filter(isWishableProduct)
    .map(toProductPayload);
};

const sendWishlist = async (res, userId, status = 200, extra = {}) => {
  const wishlist = await getWishlist(userId);
  return res.status(status).json({
    success: true,
    wishlist,
    items: wishlist,
    ...extra,
  });
};

const findWishableProduct = async (productId) => {
  if (!isValidId(productId)) return null;
  const product = await Product.findById(productId).select(PRODUCT_SELECT);
  return isWishableProduct(product) ? product : null;
};

router.get("/", async (req, res, next) => {
  try {
    return sendWishlist(res, req.user._id);
  } catch (error) {
    return next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const productId = productIdFromPayload(req.body);
    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const product = await findWishableProduct(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: product._id },
    });
    return sendWishlist(res, req.user._id, 200, {
      message: `${product.name} added to wishlist.`,
    });
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

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: new mongoose.Types.ObjectId(productId) },
    });
    return sendWishlist(res, req.user._id, 200, { message: "Removed from wishlist." });
  } catch (error) {
    return next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { wishlist: [] } });
    return sendWishlist(res, req.user._id, 200, { message: "Wishlist cleared." });
  } catch (error) {
    return next(error);
  }
});

router.post("/merge", async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : Object.values(req.body.items || {});
    const productIds = [];
    const skipped = [];

    for (const rawItem of rawItems) {
      const productId = productIdFromPayload(rawItem);
      if (!isValidId(productId)) {
        skipped.push({ productId, reason: "invalid_product" });
        continue;
      }

      const product = await findWishableProduct(productId);
      if (!product) {
        skipped.push({ productId, reason: "product_not_found" });
        continue;
      }

      productIds.push(product._id);
    }

    if (productIds.length) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { wishlist: { $each: productIds } },
      });
    }

    return sendWishlist(res, req.user._id, 200, {
      message: "Wishlist merged.",
      skipped,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
