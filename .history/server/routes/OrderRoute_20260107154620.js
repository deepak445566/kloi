// routes/orderRouter.js
import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  getOrderWhatsAppLink,
  // ShipRocket functions
  createShipment,
  checkServiceability,
  trackShipment,
  getShippingLabel,
  cancelShipment,
  getPickupLocations,
  bulkCreateShipments
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// Existing routes
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);

// ShipRocket routes
orderRouter.post('/shipment/create/:orderId', authSeller, createShipment);
orderRouter.post('/shipment/serviceability', authSeller, checkServiceability);
orderRouter.get('/shipment/track/:orderId', authSeller, trackShipment);
orderRouter.get('/shipment/label/:orderId', authSeller, getShippingLabel);
orderRouter.post('/shipment/cancel/:orderId', authSeller, cancelShipment);
orderRouter.get('/shipment/pickup-locations', authSeller, getPickupLocations);
orderRouter.post('/shipment/bulk-create', authSeller, bulkCreateShipments);

export default orderRouter;