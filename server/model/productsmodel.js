import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    collection: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null }, // Optional discounted price
    sku: { type: String, trim: true, uppercase: true },
    material: { type: String, trim: true },
    color: { type: String, trim: true },
    room: { type: String, trim: true },
    useCase: { type: String, trim: true },
    dimensions: { type: String, trim: true },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0 }, // Available quantity
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    sold: { type: Number, default: 0 }, // Track the number of sales
    reviews: [reviewSchema], // Array of reviews
    averageRating: { type: Number, default: 0 }, // Average rating calculated from reviews
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Supabase Storage references (added by hybrid storage layer)
    imageUrl: { type: String },
    imageAssetId: { type: String },
    galleryImages: [
      {
        url: { type: String },
        assetId: { type: String },
        altText: { type: String },
      },
    ],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "draft", "archived", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true, sparse: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ status: 1, collection: 1 });
productSchema.index({ status: 1, category: 1 });
productSchema.index({ status: 1, material: 1 });
productSchema.index({ status: 1, color: 1 });

// Pre-save middleware to calculate average rating dynamically
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = totalRating / this.reviews.length;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
