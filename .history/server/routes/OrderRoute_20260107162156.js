// routes/orderRouter.js
import express from "express";
import { 
  getAllOrders, 
  getUserOrders,  
  placeOrderOnline,
  getOrderWhatsAppLink 
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);
z
export default orderRouter;