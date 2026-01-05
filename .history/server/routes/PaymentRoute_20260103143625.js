import express from "express";
import authUser from "../middlewares/authUser.js";
import { createRazorpayOrder, verifyPayment } from "../controllers/PaymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", authUser, createRazorpayOrder);
paymentRouter.post("/verify", authUser, verifyPayment);

export default paymentRouter;