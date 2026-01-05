import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: [{ type: String, required: true }],
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  image: [{ type: String, required: true }],
  cartItems: { type: Object, default: {} },
  category: { type: String, required: true },
  subCategory: { type: String, default: "" },
  weightUnit: { type: String, default: "kg" },
  weightValue: { type: Number },
  gstPercentage: { type: Number, default: 5 }, // ✅ New GST field
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;