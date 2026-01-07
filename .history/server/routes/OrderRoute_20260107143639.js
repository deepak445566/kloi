import express from "express";
import { 
  placeOrderOnline,
  getUserOrders,
  getAllOrders,
  getOrderWhatsAppLink,
  updateOrderStatus
} from "../controllers/OrderController.js";

import {
  createShiprocketOrder,
  bulkCreateShiprocketOrders,
  schedulePickup,
  generateManifest,
  trackShipment,
  bulkTrackShipments,
  downloadLabel,
  generateInvoice,
  checkServiceability,
  cancelShipment,
  getShiprocketStats,
  handleWebhook,
  getAllCouriers,
  retryFailedShipments,
  exportOrdersForShiprocket
} from "../controllers/shiprocketController.js";

import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// ================= USER ROUTES =================
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/track/:orderId', authUser, trackShipment);
orderRouter.get('/label/:orderId', authUser, downloadLabel);
orderRouter.get('/invoice/:orderId', authUser, generateInvoice);
orderRouter.get('/serviceability/:pincode', authUser, checkServiceability);

// ================= SELLER ROUTES =================
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);
orderRouter.put('/status/:orderId', authSeller, updateOrderStatus);

// ================= SHIPROCKET ROUTES =================
// Shipment Management
orderRouter.post('/shiprocket/create/:orderId', authSeller, createShiprocketOrder);
orderRouter.post('/shiprocket/bulk-create', authSeller, bulkCreateShiprocketOrders);
orderRouter.post('/shiprocket/schedule-pickup', authSeller, schedulePickup);
orderRouter.post('/shiprocket/generate-manifest', authSeller, generateManifest);

// Tracking
orderRouter.get('/shiprocket/track/:orderId', authSeller, trackShipment);
orderRouter.post('/shiprocket/bulk-track', authSeller, bulkTrackShipments);

// Documents
orderRouter.get('/shiprocket/label/:orderId', authSeller, downloadLabel);
orderRouter.get('/shiprocket/invoice/:orderId', authSeller, generateInvoice);

// Operations
orderRouter.post('/shiprocket/cancel/:orderId', authSeller, cancelShipment);
orderRouter.get('/shiprocket/serviceability/:pincode', authSeller, checkServiceability);
orderRouter.get('/shiprocket/couriers', authSeller, getAllCouriers);

// Dashboard & Reports
orderRouter.get('/shiprocket/stats', authSeller, getShiprocketStats);
orderRouter.get('/shiprocket/export', authSeller, exportOrdersForShiprocket);
orderRouter.post('/shiprocket/retry-failed', authSeller, retryFailedShipments);

// Webhook (no auth - called by Shiprocket)
orderRouter.post('/shiprocket/webhook', handleWebhook);

export default orderRouter;