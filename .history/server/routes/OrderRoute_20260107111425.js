// routes/orderRouter.js
import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  getOrderWhatsAppLink, 
  generateShippingLabel
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);
orderRouter.post('/generate-label/:orderId', authSeller, generateShippingLabel);
orderRouter.get('/track/:orderId', authSeller, trackShipment);
export default orderRouter;