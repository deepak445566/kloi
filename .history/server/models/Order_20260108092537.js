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
      type: Number 
    },
    name: { 
      type: String 
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
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'RTO']
  },
  paymentType: { 
    type: String, 
    required: true, 
    default: 'Online',
    enum: ['COD', 'Online', 'Prepaid', 'Pickup', 'REPL']
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
  // Delhivery Integration Fields
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },
  waybill: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  delhiveryStatus: {
    type: String,
    enum: ['pending', 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled'],
    default: 'pending'
  },
  pickupLocation: {
    type: String,
    default: 'Your_Warehouse_Name' // Replace with your registered warehouse name
  },
  shippingMode: {
    type: String,
    enum: ['Surface', 'Express'],
    default: 'Surface'
  },
  // Additional details
  productsDesc: {
    type: String
  },
  weight: {
    type: Number // in grams
  },
  dimensions: {
    height: Number, // in cm
    width: Number,  // in cm
    length: Number  // in cm
  },
  codAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number
  }
}, { 
  timestamps: true 
});

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;