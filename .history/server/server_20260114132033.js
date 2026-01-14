import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import UserRouter from './routes/UserRouter.js';
import sellerRouter from './routes/SellerRouter.js';
import connectCloudinary from './config/cloudconfig.js';
import ProductRouter from './routes/ProductRoute.js';
import cartRouter from './routes/CardRoute.js';
import addressRouter from './routes/AddressRoute.js';
import orderRouter from './routes/OrderRoute.js';
import paymentRouter from './routes/PaymentRoute.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Database connect
await connectDB();
await connectCloudinary();

// Simple CORS configuration

app.use(cors({
  origin: "https://kloi-one.vercel.app",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));




// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Cookies:`, req.cookies);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ... existing code ...

// Health route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 🆕 NEW: Keep-alive route (Vercel/Render ke liye IMPORTANT)
app.get('/api/keepalive', async (req, res) => {
  try {
    // Simple MongoDB query to keep connection alive
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      res.json({ 
        success: true, 
        message: 'MongoDB connection alive',
        timestamp: new Date().toLocaleString()
      });
    } else {
      // Reconnect if disconnected
      await connectDB();
      res.json({ 
        success: true, 
        message: 'MongoDB reconnected',
        timestamp: new Date().toLocaleString()
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'MongoDB keep-alive failed',
      error: error.message 
    });
  }
});

// 🆕 NEW: Simple warm-up route
app.get('/api/warmup', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server warmed up',
    readyState: mongoose.connection.readyState
  });
});



app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/payment', paymentRouter);
// Server start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});