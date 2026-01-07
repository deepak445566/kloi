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
    },
    gstPercentage: {
      type: Number,
      default: 5
    }
  }],
  amount: { 
    type: Number, 
    required: true 
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  totalAmount: {
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
    enum: [
      'Order Placed', 
      'Confirmed', 
      'Processing', 
      'Shipped', 
      'Out for Delivery', 
      'Delivered', 
      'Cancelled', 
      'Returned',
      'RTO'
    ]
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
  paymentStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Completed', 'Failed', 'Refunded']
  },
  
  // SHIPROCKET FIELDS
  shiprocketOrderId: { 
    type: String, 
    default: null 
  },
  shipmentId: { 
    type: String, 
    default: null 
  },
  awbCode: { 
    type: String, 
    default: null 
  },
  courierName: { 
    type: String, 
    default: null 
  },
  courierCompanyId: { 
    type: String, 
    default: null 
  },
  labelUrl: { 
    type: String, 
    default: null 
  },
  manifestUrl: { 
    type: String, 
    default: null 
  },
  invoiceUrl: {
    type: String,
    default: null
  },
  rtoAwb: {
    type: String,
    default: null
  },
  pickupScheduledDate: { 
    type: Date, 
    default: null 
  },
  pickupCompletedDate: {
    type: Date,
    default: null
  },
  expectedDeliveryDate: {
    type: Date,
    default: null
  },
  actualDeliveryDate: {
    type: Date,
    default: null
  },
  
  // TRACKING DATA
  trackingData: {
    currentStatus: { 
      type: String, 
      default: null 
    },
    currentStatusDate: { 
      type: Date, 
      default: null 
    },
    currentStatusLocation: { 
      type: String, 
      default: null 
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null
    },
    history: [{
      status: String,
      date: Date,
      location: String,
      activity: String
    }],
    pickupStatus: {
      type: String,
      default: null
    },
    deliveryStatus: {
      type: String,
      default: null
    }
  },
  
  // SELLER NOTES
  sellerNotes: {
    type: String,
    default: null
  },
  
  // CANCELLATION/REFUND
  cancellationReason: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    default: null,
    enum: [null, 'Requested', 'Processing', 'Completed', 'Rejected']
  },
  
  // METADATA
  channel: {
    type: String,
    default: 'Website'
  },
  source: {
    type: String,
    default: 'Direct'
  },
  tags: [{
    type: String
  }]
}, { 
  timestamps: true 
});

// Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ awbCode: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ shiprocketOrderId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'trackingData.currentStatus': 1 });

// Virtual for formatted order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to update tracking
orderSchema.methods.updateTracking = async function(trackingInfo) {
  this.trackingData = {
    currentStatus: trackingInfo.current_status,
    currentStatusDate: new Date(trackingInfo.current_status_time),
    currentStatusLocation: trackingInfo.current_status_location,
    estimatedDeliveryDate: trackingInfo.etd ? new Date(trackingInfo.etd) : null,
    history: trackingInfo.shipment_track_activities?.map(activity => ({
      status: activity.status,
      date: new Date(activity.date),
      location: activity.location,
      activity: activity.activity || activity.status
    })) || []
  };
  
  // Update main status based on tracking
  if (trackingInfo.current_status === 'Delivered') {
    this.status = 'Delivered';
    this.actualDeliveryDate = new Date();
  } else if (trackingInfo.current_status === 'Out for delivery') {
    this.status = 'Out for Delivery';
  } else if (trackingInfo.current_status === 'Shipped') {
    this.status = 'Shipped';
  } else if (trackingInfo.current_status === 'RTO') {
    this.status = 'RTO';
  }
  
  await this.save();
  return this;
};

// Method to cancel order
orderSchema.methods.cancelOrder = async function(reason) {
  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.trackingData.currentStatus = 'Cancelled';
  
  // If shipped, also cancel in Shiprocket
  if (this.shipmentId) {
    // You can call Shiprocket cancel API here
  }
  
  await this.save();
  return this;
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;