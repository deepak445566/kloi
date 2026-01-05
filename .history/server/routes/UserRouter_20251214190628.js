import express from "express";

import authUser from "../middlewares/authUser.js";
import { checkAuth, loginUser, registerUser } from "../controllers/UserController.js";
import { isSellerAuth } from "../controllers/SellerController.js";

const UserRouter = express.Router();

// Route for registration
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.get("/isauth",authUser, checkAuth);
UserRouter.get("/logout",authUser, logou);
export default UserRouter;
