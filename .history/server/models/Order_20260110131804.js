import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    quantity: { type: Number, required: true }
  }],
  amount: { type: Number, required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  status: { 
    type: String, 
    default: 'Payment Pending',
    enum: ['Payment Pending', 'Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  paymentType: { 
    type: String, 
    required: true, 
    enum: ['COD', 'Online', 'Razorpay'],
    default: 'Online' 
  },
  isPaid: { type: Boolean, required: true, default: false },
  transactionId: { type: String },
  
  // Razorpay specific fields
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  
  // Timestamps
  orderCreatedAt: { type: Date },
  paidAt: { type: Date },
  
  // Additional fields
  notes: { type: String },
  shippingTracking: { type: String }
}, { 
  timestamps: true 
});

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;