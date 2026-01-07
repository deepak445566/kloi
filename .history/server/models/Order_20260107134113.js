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
    enum: ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned']
  },
  paymentType: { type: String, required: true, default: 'Online' },
  isPaid: { type: Boolean, required: true, default: false },
  transactionId: { type: String, required: true },
  
  // ✅ SHIPROCKET FIELDS
  shiprocketOrderId: { type: String, default: null },
  shipmentId: { type: String, default: null },
  awbCode: { type: String, default: null },
  courierName: { type: String, default: null },
  courierCompanyId: { type: String, default: null },
  labelUrl: { type: String, default: null },
  manifestUrl: { type: String, default: null },
  pickupScheduledDate: { type: Date, default: null },
  trackingData: {
    currentStatus: { type: String, default: null },
    currentStatusDate: { type: Date, default: null },
    currentStatusLocation: { type: String, default: null },
    history: [{
      status: String,
      date: Date,
      location: String
    }]
  }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;