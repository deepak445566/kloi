// models/Order.js - Updated
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
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    weight: { 
      type: Number, 
      default: 0 
    }
  }],
  amount: { 
    type: Number, 
    required: true 
  },
  address: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Address" 
  },
  status: { 
    type: String, 
    default: 'Order Placed',
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']
  },
  paymentType: { 
    type: String, 
    required: true, 
    default: 'Online',
    enum: ['Online', 'COD']
  },
  isPaid: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  transactionId: { 
    type: String, 
    required: true 
  },
  
  // Shiprocket Fields
  shippingInfo: {
    hasShiprocket: { type: Boolean, default: false },
    shippingStatus: { 
      type: String, 
      default: 'Not Initiated',
      enum: ['Not Initiated', 'Created', 'AWB Generated', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled', 'RTO']
    },
    awbNumber: { type: String },
    courierName: { type: String },
    trackingUrl: { type: String },
    shipmentId: { type: String },
    labelUrl: { type: String },
    manifestUrl: { type: String },
    pickUpDate: { type: Date },
    expectedDelivery: { type: Date },
    deliveredDate: { type: Date },
    charges: {
      shipping: { type: Number, default: 0 },
      cod: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  },
  
  // Tracking History
  trackingHistory: [{
    status: String,
    location: String,
    date: Date,
    description: String
  }],
  
  // Return/Exchange
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: String,
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected', 'Completed']
    },
    trackingNumber: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Completed']
    }
  }
}, { 
  timestamps: true 
});

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ 'shippingInfo.awbNumber': 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;