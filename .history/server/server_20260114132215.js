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

// Health check
app.get('/api/health', (req, res) => {
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    success: true, 
    message: 'Server is running',
    mongoStatus: mongoStates[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState
  });
});

// ✅ Simple ping route (without keepalive)
app.get('/api/ping', async (req, res) => {
  try {
    const start = Date.now();
    
    // Simple query - just count documents
    const result = await mongoose.connection.db.command({ ping: 1 });
    
    const duration = Date.now() - start;
    
    res.json({ 
      success: true, 
      message: 'Ping successful',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ping failed',
      error: error.message 
    });
  }
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