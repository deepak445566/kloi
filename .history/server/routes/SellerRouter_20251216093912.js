import express from 'express';
import { 
  sellerLogin, 
  isSellerAuth, 
  Sellerlogout 
} from '../controllers/sellerController.js';
import authSeller from '../middleware/authSeller.js';

const router = express.Router();

// Public routes
router.post('/login', sellerLogin);
router.get('/isauth', isSellerAuth); // Check auth status

// Protected routes (require seller authentication)
router.use(authSeller); // Apply middleware to all routes below

router.get('/dashboard', (req, res) => {
  res.json({ 
    success: true, 
    message: "Welcome to seller dashboard",
    seller: req.seller 
  });
});

router.post('/logout', Sellerlogout);

// Add other protected seller routes here
// router.get('/products', sellerProductsController);
// router.post('/add-product', addProductController);

export default router;