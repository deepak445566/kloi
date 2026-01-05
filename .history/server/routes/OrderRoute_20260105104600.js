import express from "express";
import { getAllOrders, getUserOrders, placeOrderOnline } from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();

// User routes
orderRouter.post('/cod', authUser, placeOrderOnline);
orderRouter.get('/user', authUser, getUserOrders);

// Seller routes
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;