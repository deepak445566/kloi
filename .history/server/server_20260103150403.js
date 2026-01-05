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

dotenv.config();

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials are missing in environment variables');
  console.error('Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Database connect
await connectDB();
await connectCloudinary();

// CORS configuration
const allowedOrigins = [
  "https://start-zeta-seven.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));



// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logging middleware (simplified for production)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API Server',
    version: '1.0.0',
    status: 'running',
    paymentGateway: 'Razorpay'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      cloudinary: 'connected',
      razorpay: 'configured'
    }
  });
});

// API Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server start
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Razorpay configured with Key ID: ${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
});