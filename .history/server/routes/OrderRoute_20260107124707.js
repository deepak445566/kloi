// routes/orderRouter.js - Updated
import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  getOrderWhatsAppLink,
  createShiprocketShipment,
  trackShipment,
  generateShippingLabel,
  requestPickup,
  cancelShipment,
  checkServiceability,
  generateManifest,
  updateOrderStatus,
  getUserOrderTracking
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// User routes
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/track/:orderId', authUser, getUserOrderTracking);

// Seller routes
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);

// Shiprocket routes
orderRouter.post('/shiprocket/create/:orderId', authSeller, createShiprocketShipment);
orderRouter.get('/shiprocket/track/:orderId', authUser, trackShipment); // Both user and seller
orderRouter.get('/shiprocket/label/:orderId', authSeller, generateShippingLabel);
orderRouter.post('/shiprocket/pickup', authSeller, requestPickup);
orderRouter.post('/shiprocket/cancel/:orderId', authSeller, cancelShipment);
orderRouter.get('/shiprocket/serviceability', authSeller, checkServiceability);
orderRouter.post('/shiprocket/manifest', authSeller, generateManifest);

// Order management
orderRouter.put('/status/:orderId', authSeller, updateOrderStatus);

export default orderRouter;