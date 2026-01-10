import express from "express";
import { 
  createOrder, 
  verifyAndPlaceOrder, 
  getPaymentStatus 
} from "../controllers/PaymentController.js";
import authUser from "../middlewares/authUser.js";

const paymentRouter = express.Router();

// Create Razorpay order
paymentRouter.post('/create-order', authUser, createOrder);

// Verify payment and place order
paymentRouter.post('/verify', authUser, verifyAndPlaceOrder);

// Get payment status
paymentRouter.get('/status/:orderId', authUser, getPaymentStatus);

export default paymentRouter;