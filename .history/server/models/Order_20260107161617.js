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
  
  // Order Status Tracking
  status: { 
    type: String, 
    default: 'Order Placed',
    enum: [
      'Order Placed',
      'Processing',
      'Packing',
      'Ready for Pickup',
      'Picked Up',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Failed Delivery'
    ]
  },
  
  paymentType: { type: String, required: true, default: 'Online' },
  isPaid: { type: Boolean, required: true, default: false },
  transactionId: { type: String, required: true },
  
  // Automated Shipping Fields
  autoShipment: {
    enabled: { type: Boolean, default: true },
    processedAt: { type: Date },
    attempted: { type: Boolean, default: false }
  },
  
  // ShipRocket Fields
  shiprocketOrderId: { type: String },
  shiprocketStatus: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  courierCompanyId: { type: String },
  trackingUrl: { type: String },
  labelUrl: { type: String },
  manifestUrl: { type: String },
  shiprocketData: { type: mongoose.Schema.Types.Mixed },
  
  // Dates
  shippingDate: { type: Date },
  pickupDate: { type: Date },
  expectedDelivery: { type: Date },
  deliveredDate: { type: Date },
  
  // Shipping Details
  shippingCost: { type: Number, default: 0 },
  packagingCost: { type: Number, default: 0 },
  insuranceOpted: { type: Boolean, default: false },
  
  // Tracking Events
  trackingEvents: [{
    status: String,
    location: String,
    remark: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  notes: [{ type: String }],
  
}, { timestamps: true });

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ shiprocketOrderId: 1 });
orderSchema.index({ awbCode: 1 });
orderSchema.index({ autoShipment: 1, isPaid: 1, shiprocketOrderId: 1 });
orderSchema.index({ createdAt: 1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;