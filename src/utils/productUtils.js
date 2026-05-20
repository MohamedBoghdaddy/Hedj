export const DEFAULT_PRODUCT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <rect width="800" height="1000" fill="#f0ede8"/>
      <path d="M180 720h440l-44-252H224l-44 252Z" fill="#d8d0c5"/>
      <path d="M256 420h288l42 48H214l42-48Z" fill="#b7aa9d"/>
      <path d="M300 322h200v98H300z" fill="#c9beb2"/>
      <text x="400" y="815" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="#645d58">Hedj Commerce</text>
    </svg>`
  );

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const productId = (product = {}) =>
  String(product._id || product.id || product.productId || product.slug || "");

export const productImage = (product = {}) => {
  const galleryImage = Array.isArray(product.galleryImages)
    ? product.galleryImages.find(Boolean)
    : null;
  const galleryUrl =
    typeof galleryImage === "string" ? galleryImage : galleryImage?.url;

  return (
    product.imageUrl ||
    product.image ||
    product.img ||
    (Array.isArray(product.images) ? product.images.find(Boolean) : "") ||
    galleryUrl ||
    DEFAULT_PRODUCT_IMAGE
  );
};

export const productImages = (product = {}) => {
  const images = [
    product.imageUrl,
    product.image,
    product.img,
    ...(Array.isArray(product.galleryImages)
      ? product.galleryImages.map((item) =>
          typeof item === "string" ? item : item?.url
        )
      : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  return images.length ? [...new Set(images)] : [DEFAULT_PRODUCT_IMAGE];
};

export const normalizeProduct = (product = {}) => {
  const id = productId(product);
  const name = product.name || product.title || "Untitled Product";
  const category = product.category || product.collection || "Uncategorized";
  const collection = product.collection || product.category || "Uncategorized";
  const image = productImage(product);
  const images = productImages({ ...product, image });
  const stock = Number(product.stock ?? product.countInStock ?? 0);
  const price = Number(String(product.price ?? 0).replace(/,/g, "")) || 0;
  const discountPrice =
    product.discountPrice === null || product.discountPrice === undefined || product.discountPrice === ""
      ? null
      : Number(String(product.discountPrice).replace(/,/g, "")) || null;

  return {
    ...product,
    _id: product._id || id,
    id,
    productId: id,
    name,
    title: name,
    slug: product.slug || slugify(name || id),
    description: product.description || "",
    price,
    discountPrice,
    category,
    collection,
    material: product.material || "",
    color: product.color || "",
    room: product.room || product.useCase || "",
    useCase: product.useCase || product.room || "",
    dimensions: product.dimensions || "",
    tags: Array.isArray(product.tags)
      ? product.tags
      : String(product.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    stock,
    isActive:
      product.isActive !== undefined
        ? Boolean(product.isActive)
        : !["archived", "inactive", "draft"].includes(product.status),
    isFeatured: Boolean(product.isFeatured ?? product.featured),
    featured: Boolean(product.featured ?? product.isFeatured),
    status: product.status || "active",
    image,
    img: image,
    images,
  };
};

export const normalizeProductList = (products = []) =>
  products.map(normalizeProduct).filter((product) => product.id);

export const formatProductPrice = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
