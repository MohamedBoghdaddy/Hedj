import mongoose from "mongoose";
import Product from "../model/productsmodel.js";

const PUBLIC_ACTIVE_FILTER = {
  $or: [{ status: "active" }, { status: { $exists: false } }, { status: null }],
};

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const numberOr = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const next = Number(value);
  return Number.isFinite(next) ? next : NaN;
};

const sanitizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProductPayload = (body, { partial = false } = {}) => {
  const payload = {};
  const stringFields = [
    "name",
    "description",
    "category",
    "collection",
    "sku",
    "material",
    "color",
    "room",
    "useCase",
    "dimensions",
  ];

  stringFields.forEach((field) => {
    if (body[field] !== undefined) payload[field] = sanitizeString(body[field]);
  });

  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (!partial && !payload.slug && payload.name) payload.slug = slugify(payload.name);
  if (payload.sku === "") delete payload.sku;
  if (payload.slug === "") delete payload.slug;

  ["price", "discountPrice", "stock", "lowStockThreshold"].forEach((field) => {
    if (body[field] !== undefined) payload[field] = numberOr(body[field], field === "stock" ? 0 : null);
  });

  if (body.featured !== undefined) payload.featured = Boolean(body.featured);
  if (body.isFeatured !== undefined) payload.featured = Boolean(body.isFeatured);
  if (body.status !== undefined) payload.status = sanitizeString(body.status);
  if (Array.isArray(body.images)) payload.images = body.images.filter(Boolean);
  if (Array.isArray(body.tags)) {
    payload.tags = body.tags.map(sanitizeString).filter(Boolean);
  } else if (typeof body.tags === "string") {
    payload.tags = body.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return payload;
};

const validateProductPayload = (payload, { partial = false } = {}) => {
  const required = ["name", "description", "category", "price", "stock"];
  if (!partial) {
    const missing = required.filter((field) => payload[field] === undefined || payload[field] === "");
    if (missing.length) return `${missing.join(", ")} required.`;
  }

  if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price < 0)) {
    return "Price must be a non-negative number.";
  }
  if (
    payload.discountPrice !== undefined &&
    payload.discountPrice !== null &&
    (!Number.isFinite(payload.discountPrice) || payload.discountPrice < 0)
  ) {
    return "Discount price must be a non-negative number.";
  }
  if (payload.stock !== undefined && (!Number.isFinite(payload.stock) || payload.stock < 0)) {
    return "Stock must be a non-negative number.";
  }
  if (
    payload.lowStockThreshold !== undefined &&
    payload.lowStockThreshold !== null &&
    (!Number.isFinite(payload.lowStockThreshold) || payload.lowStockThreshold < 0)
  ) {
    return "Low stock threshold must be a non-negative number.";
  }

  return null;
};

const ensureUniqueSlug = async (baseSlug, existingId = null) => {
  const fallback = baseSlug || `product-${Date.now()}`;
  let candidate = fallback;
  let suffix = 2;

  while (
    await Product.exists({
      slug: candidate,
      ...(existingId ? { _id: { $ne: existingId } } : {}),
    })
  ) {
    candidate = `${fallback}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const handleDuplicate = (error, res) => {
  if (error?.code !== 11000) return false;
  const key = Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";
  res.status(409).json({
    success: false,
    message: `${key === "sku" ? "SKU" : "Slug"} must be unique.`,
  });
  return true;
};

export const publicActiveProductFilter = PUBLIC_ACTIVE_FILTER;

export const listPublicProducts = async (filters = {}) => {
  const query = { ...PUBLIC_ACTIVE_FILTER };
  const {
    search,
    q,
    category,
    collection,
    minPrice,
    maxPrice,
    material,
    color,
    room,
    useCase,
    inStock,
    sort = "newest",
    page,
    limit,
  } = filters;
  const searchText = String(search || q || "").trim();

  const andFilters = [];

  if (collection) {
    const value = String(collection).trim();
    const singular = value.replace(/s$/i, "");
    const exact = new RegExp(`^${escapeRegExp(singular)}s?$`, "i");
    andFilters.push({ $or: [{ collection: exact }, { category: exact }] });
  }
  if (category) query.category = new RegExp(`^${escapeRegExp(String(category).trim())}$`, "i");
  if (material) query.material = new RegExp(`^${escapeRegExp(String(material).trim())}$`, "i");
  if (color) query.color = new RegExp(`^${escapeRegExp(String(color).trim())}$`, "i");
  if (room || useCase) {
    const roomValue = String(room || useCase).trim();
    const exact = new RegExp(`^${escapeRegExp(roomValue)}$`, "i");
    andFilters.push({ $or: [{ room: exact }, { useCase: exact }] });
  }
  if (searchText) {
    const fuzzy = new RegExp(escapeRegExp(searchText), "i");
    andFilters.push({
      $or: [
        { name: fuzzy },
        { description: fuzzy },
        { category: fuzzy },
        { collection: fuzzy },
        { material: fuzzy },
        { color: fuzzy },
        { tags: fuzzy },
      ],
    });
  }

  if (andFilters.length) query.$and = andFilters;

  const price = {};
  const min = numberOr(minPrice, null);
  const max = numberOr(maxPrice, null);
  if (Number.isFinite(min) && min >= 0) price.$gte = min;
  if (Number.isFinite(max) && max >= 0) price.$lte = max;
  if (Object.keys(price).length) query.price = price;

  if (String(inStock) === "true") query.stock = { $gt: 0 };
  if (String(inStock) === "false") query.stock = { $lte: 0 };

  const sortMap = {
    newest: { featured: -1, createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    name_asc: { name: 1 },
    featured: { featured: -1, createdAt: -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.newest;
  const queryBuilder = Product.find(query).sort(sortSpec);

  if (page || limit) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 24));
    queryBuilder.skip((pageNumber - 1) * limitNumber).limit(limitNumber);
  }

  return queryBuilder;
};

export const getPublicProductBySlugOrId = async (slugOrId) => {
  const identity = isValidId(slugOrId) ? { _id: slugOrId } : { slug: slugOrId };
  return Product.findOne({ ...identity, ...PUBLIC_ACTIVE_FILTER });
};

export const getAdminProducts = async (req, res) => {
  const {
    status,
    collection,
    category,
    q,
    page = 1,
    limit = 100,
  } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (collection) filter.collection = new RegExp(`^${String(collection).trim()}$`, "i");
  if (category) filter.category = new RegExp(`^${String(category).trim()}$`, "i");
  if (q) {
    filter.$or = [
      { name: new RegExp(String(q), "i") },
      { sku: new RegExp(String(q), "i") },
      { description: new RegExp(String(q), "i") },
    ];
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(200, Math.max(1, Number(limit) || 100));
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Product.countDocuments(filter),
  ]);

  return res.json({ success: true, count: products.length, total, products });
};

export const getAdminProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return res.json({ success: true, product });
};

export const createAdminProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);
    const validationError = validateProductPayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    payload.slug = await ensureUniqueSlug(payload.slug || slugify(payload.name));
    if (payload.sku) payload.sku = payload.sku.toUpperCase();
    if (req.user?._id) payload.createdBy = req.user._id;

    const product = await Product.create(payload);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    if (handleDuplicate(error, res)) return;
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }

  try {
    const payload = buildProductPayload(req.body, { partial: true });
    const validationError = validateProductPayload(payload, { partial: true });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (payload.name && !payload.slug && req.body.slug === undefined) {
      payload.slug = await ensureUniqueSlug(slugify(payload.name), req.params.id);
    } else if (payload.slug) {
      payload.slug = await ensureUniqueSlug(payload.slug, req.params.id);
    }
    if (payload.sku) payload.sku = payload.sku.toUpperCase();

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, product });
  } catch (error) {
    if (handleDuplicate(error, res)) return;
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveAdminProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    { new: true }
  );
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return res.json({ success: true, product, message: "Product archived." });
};

export const updateAdminProductStock = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }
  const stock = numberOr(req.body.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    return res.status(400).json({ success: false, message: "Stock must be a non-negative number." });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return res.json({ success: true, product });
};

export const updateAdminProductStatus = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }

  const status = sanitizeString(req.body.status);
  if (!["active", "draft", "archived", "inactive"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid product status." });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return res.json({ success: true, product });
};
