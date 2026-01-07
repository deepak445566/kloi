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
  
  // Shiprocket fields
  shiprocketOrderId: { type: String },
  shiprocketShipmentId: { type: String },
  awbNumber: { type: String },
  shiprocketStatus: { 
    type: String, 
    enum: ['Not initiated', 'Created', 'AWB Generated', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Not initiated'
  },
  courierName: { type: String },
  trackingUrl: { type: String }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;