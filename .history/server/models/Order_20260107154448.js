// models/Order.js
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
    default: 'Order Placed',
    enum: [
      'Order Placed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Failed'
    ]
  },
  paymentType: { type: String, required: true, default: 'Online' },
  isPaid: { type: Boolean, required: true, default: false },
  transactionId: { type: String, required: true },
  
  // ShipRocket Fields
  shiprocketOrderId: { type: String },
  shiprocketStatus: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  trackingUrl: { type: String },
  labelUrl: { type: String },
  manifestUrl: { type: String },
  shiprocketData: { type: mongoose.Schema.Types.Mixed },
  
  shippingDate: { type: Date },
  expectedDelivery: { type: Date },
  deliveredDate: { type: Date },
  
  notes: [{ type: String }],
  
  // Shipping Details
  shippingCost: { type: Number, default: 0 },
  packagingCost: { type: Number, default: 0 },
  insuranceOpted: { type: Boolean, default: false },
  
}, { timestamps: true });

// Indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ shiprocketOrderId: 1 });
orderSchema.index({ transactionId: 1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;