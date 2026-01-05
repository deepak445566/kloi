import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  sellerLogout,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const router = express.Router();

// ================== Public Routes ==================
router.post("/login", sellerLogin); // Login route (public)
router.get("/isauth", isSellerAuth); // Check auth status (public)

// ================== Protected Routes ==================
// All routes below require seller authentication
router.use(authSeller); // Apply middleware to all routes below

// Protected routes (seller authentication required)
router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to seller dashboard",
    seller: req.seller
  });
});

router.post("/logout", sellerLogout);

// Add more protected routes here
// router.get("/products", getSellerProducts);
// router.post("/add-product", addProduct);
// router.put("/product/:id", updateProduct);
// router.delete("/product/:id", deleteProduct);

export default router;