import express from "express";



import authSeller from "../middlewares/authSeller.js";
import { isSellerAuth, sellerLogin } from "../controllers/SellerController.js";

const sellerRouter = express.Router();

// Public routes
sellerRouter.post("/login", sellerLogin); // Seller login route (public)
sellerRouter.get("/isauth", isSellerAuth); // Check auth status (public - NO middleware here!)

// Protected routes (require seller authentication)
sellerRouter.get("/logout", authSeller, sellerLogout); // Logout with auth check

// You can add more protected routes like:
// sellerRouter.get("/dashboard", authSeller, (req, res) => {
//   res.json({ success: true, message: "Seller Dashboard" });
// });

export default sellerRouter;