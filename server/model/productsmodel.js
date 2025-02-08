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
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null }, // Optional discounted price
    images: { type: [String], required: true },
    stock: { type: Number, required: true, min: 0 }, // Available quantity
    sold: { type: Number, default: 0 }, // Track the number of sales
    reviews: [reviewSchema], // Array of reviews
    averageRating: { type: Number, default: 0 }, // Average rating calculated from reviews
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Admin/Employee
  },
  { timestamps: true }
);

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
