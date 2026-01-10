import express from "express";
import {
  getAllOrders,
  getUserOrders,
  placeOrderOnline,
  getOrderWhatsAppLink,
  createPaymentOrder,
  verifyAndCapturePayment,
  getPaymentOrderStatus
} from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// Razorpay payment routes
orderRouter.post('/create-payment-order', authUser, createPaymentOrder);
orderRouter.post('/verify-payment', authUser, verifyAndCapturePayment);
orderRouter.get('/payment-status/:orderId', authUser, getPaymentOrderStatus);

// Existing routes
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/whatsapp/:orderId', authSeller, getOrderWhatsAppLink);

export default orderRouter;