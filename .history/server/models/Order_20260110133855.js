import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    quantity: { type: Number, required: true },
    name: String,
    price: Number,
    gstPercentage: { type: Number, default: 5 },
    shippingCharge: { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false }
  }],
  amount: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  totalGST: { type: Number, required: true },
  totalShipping: { type: Number, required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  status: { 
    type: String, 
    default: 'Order Placed',
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  paymentType: { 
    type: String, 
    required: true, 
    default: 'COD',
    enum: ['COD', 'Razorpay', 'Other Online'] 
  },
  isPaid: { type: Boolean, required: true, default: false },
  
  // For COD orders
  transactionId: { type: String },
  
  // For Razorpay orders
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  
  // Timestamps
  paidAt: { type: Date },
  deliveredAt: { type: Date }
}, { 
  timestamps: true 
});

// Indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ razorpay_order_id: 1 }, { unique: true, sparse: true });
orderSchema.index({ razorpay_payment_id: 1 }, { unique: true, sparse: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;