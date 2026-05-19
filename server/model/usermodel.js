import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // ✅ Wishlist Array

    role: {
      type: String,
      enum: ["customer", "employee", "admin"],
      default: "customer", // Default to customer if not specified
    },

    department: {
      type: String,
      required: function () {
        return this.role === "employee"; // Department is required for employees
      },
    },

    receiveNotifications: {
      type: Boolean,
      default: true,
    },

    profilePhoto: {
      type: String,
    },
    // Supabase Storage reference (added by hybrid storage layer)
    profilePhotoUrl: { type: String },
    profilePhotoAssetId: { type: String },
    jobTitle: { type: String },
    seniorityLevel: { type: String },
    phone: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "invited", "suspended"],
      default: "active",
    },
    invitedAt: { type: Date },
    invitationEmailStatus: {
      type: String,
      enum: ["none", "pending", "queued", "sent", "failed", "provider_not_configured"],
      default: "none",
    },
    invitationEmailOutboxId: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
