import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: "User" 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "Product" 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  address: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Address",
    required: true
  },
  status: { 
    type: String, 
    default: 'Payment Pending',
    enum: [
      'Payment Pending',
      'Order Placed', 
      'Processing', 
      'Shipped', 
      'Delivered', 
      'Cancelled',
      'Failed'
    ] 
  },
  paymentType: { 
    type: String, 
    required: true, 
    default: 'Online',
    enum: ['COD', 'Online'] 
  },
  isPaid: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  transactionId: { 
    type: String
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number,
    currency: { type: String, default: 'INR' },
    timestamp: Date
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ transactionId: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;