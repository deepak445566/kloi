// models/Shipment.js
import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  waybill: {
    type: String,
    unique: true
  },
  paymentMode: {
    type: String,
    enum: ['Prepaid', 'COD', 'Pickup', 'REPL'],
    required: true
  },
  shipmentType: {
    type: String,
    enum: ['SPS', 'MPS'],
    default: 'SPS'
  },
  masterId: {
    type: String // For MPS shipments
  },
  mpsChildren: {
    type: Number,
    default: 1
  },
  mpsAmount: {
    type: Number,
    default: 0
  },
  // Delhivery API Payload
  delhiveryPayload: {
    type: mongoose.Schema.Types.Mixed
  },
  delhiveryResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  // Status
  status: {
    type: String,
    enum: ['created', 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled', 'failed'],
    default: 'created'
  },
  trackingUrl: {
    type: String
  },
  // Metadata
  attempts: {
    type: Number,
    default: 0
  },
  errors: [{
    timestamp: Date,
    error: String,
    response: Object
  }],
  manifestedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Shipment = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);
export default Shipment;