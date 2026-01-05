import express from "express";
import { 
  createRazorpayOrder, 
  verifyPayment, 
  getRazorpayKey,
  getUserOrders, 
  getAllOrders,
  placeOrderCOD 
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// Payment routes
orderRouter.post('/create-order', authUser, createRazorpayOrder);
orderRouter.post('/verify-payment', authUser, verifyPayment);
orderRouter.get('/razorpay-key', getRazorpayKey);

// COD route
orderRouter.post('/cod', authUser, placeOrderCOD);

// Order history routes
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;