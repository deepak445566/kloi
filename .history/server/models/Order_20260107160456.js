import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number
  }],
  amount: Number,
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

  paymentType: { type: String, default: "Online" },
  isPaid: { type: Boolean, default: false },
  transactionId: String,

  courier: {
    name: String,
    awb: String,
    shipmentId: String
  },

  trackingStatus: {
    type: String,
    default: "Order Placed"
  }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
