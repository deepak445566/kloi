import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    quantity: { type: Number, required: true }
  }],
  amount: { type: Number, required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  status: { type: String, default: 'Order Placed' },
  paymentType: { type: String, required: true, default: 'Online' },
  isPaid: { type: Boolean, required: true, default: false },
  transactionId: { type: String, required: true },
  
  // NEW: Shiprocket fields
  shiprocket: {
    orderId: { type: String },
    shipmentId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    courierCompany: { type: String },
    labelUrl: { type: String },
    manifestUrl: { type: String },
    trackingUrl: { type: String },
    status: { type: String, default: 'PENDING' }
  },
  
  trackingHistory: [{
    status: String,
    date: Date,
    location: String,
    remark: String
  }],
  
  deliveryDetails: {
    expectedDate: Date,
    deliveryBoyName: String,
    deliveryBoyPhone: String
  }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;