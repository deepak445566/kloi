import express from "express";

import authUser from "../middlewares/authUser.js";
import { loginUser, registerUser } from "../controllers/UserController.js";
import { isSellerAuth } from "../controllers/SellerController.js";

const UserRouter = express.Router();

// Route for registration
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.get("/isauth",authUser, isA);
UserRouter.get("/logout",authUser, logout);
export default UserRouter;
