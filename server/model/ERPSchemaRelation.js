import mongoose from "mongoose";

const erpSchemaRelationSchema = new mongoose.Schema(
  {
    appSlug: { type: String, required: true, trim: true },
    fromTable: { type: String, required: true, trim: true },
    fromField: { type: String, required: true, trim: true },
    toTable: { type: String, required: true, trim: true },
    toField: { type: String, required: true, trim: true },
    relationType: {
      type: String,
      enum: ["one-to-one", "one-to-many", "many-to-one", "many-to-many", "self-reference"],
      required: true,
    },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "planned", "deprecated"], default: "active" },
  },
  { timestamps: true }
);

erpSchemaRelationSchema.index({ appSlug: 1, fromTable: 1 });

export default mongoose.model("ERPSchemaRelation", erpSchemaRelationSchema);
