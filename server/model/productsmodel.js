import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }]

    }
)
 
export const Products=mongoose.model('Products',productSchema)