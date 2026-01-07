import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  getOrderWhatsAppLink 
} from "../controllers/OrderController.js";
import { 
  createShiprocketOrder,
  getTracking,
  generateManifest,
  schedulePickup,
  cancelShipment,
  getCouriersForOrder,
  updateOrderStatus,
  getAllShipments
} from "../controllers/shiprocketController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
import { generateInvoice } from "../controllers/invoiceController.js";

const orderRouter = express.Router();

// User routes
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/track/:orderId', authUser, getTracking);

// Seller routes - Shiprocket integration
orderRouter.get('/seller', authSeller, getAllShipments);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);
orderRouter.get('/invoice/:orderId', authUser, generateInvoice);
// Shiprocket specific routes
orderRouter.post('/shiprocket/create/:orderId', authSeller, createShiprocketOrder);
orderRouter.get('/shiprocket/track/:orderId', authSeller, getTracking);
orderRouter.post('/shiprocket/manifest', authSeller, generateManifest);
orderRouter.post('/shiprocket/pickup', authSeller, schedulePickup);
orderRouter.post('/shiprocket/cancel/:orderId', authSeller, cancelShipment);
orderRouter.get('/shiprocket/couriers/:orderId', authSeller, getCouriersForOrder);
orderRouter.put('/status/:orderId', authSeller, updateOrderStatus);

export default orderRouter;