// routes/orderRouter.js - Updated
import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  placeOrderCOD,
  createShipment,
  getOrderWhatsAppLink 
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// User routes
orderRouter.post('/online', authUser, placeOrderOnline);
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);

// Seller routes
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);
orderRouter.post('/:orderId/create-shipment', authSeller, createShipment);

export default orderRouter;