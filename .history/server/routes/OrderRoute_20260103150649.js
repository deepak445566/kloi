import express from "express";
import { 
  createRazorpayOrder, 
  verifyPayment, 
  getRazorpayKey,
  placeOrderCOD,
  getUserOrders, 
  getAllOrders,
  updateOrderStatus
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// Payment routes
orderRouter.post('/create-order', authUser, createRazorpayOrder);
orderRouter.post('/verify-payment', authUser, verifyPayment);
orderRouter.get('/razorpay-key', getRazorpayKey);

// Order placement
orderRouter.post('/cod', authUser, placeOrderCOD);

// User order history
orderRouter.get('/user', authUser, getUserOrders);

// Seller routes
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.put('/status', authSeller, updateOrderStatus);

export default orderRouter;