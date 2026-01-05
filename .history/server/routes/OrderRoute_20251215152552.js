import express from "express";


import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();
orderRouter.post('/cod', authUser,placeOrderCOD);
orderRouter.get('/user',authUser,getUserOrder);
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;
