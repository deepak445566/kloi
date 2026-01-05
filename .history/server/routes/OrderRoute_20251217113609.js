import express from "express";

import { getAllOrders, getUserOrders,  placeOrderOnline } from "../controllers/OrderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();
orderRouter.post('/', authUser,placeOrderOnline);
orderRouter.get('/user',authUser,getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;
