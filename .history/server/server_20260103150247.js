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

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'MONGODB_URI',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://start-zeta-seven.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured'
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API Server',
    version: '1.0.0',
    docs: '/api-docs' // If you add API documentation later
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Connect to Cloudinary
    await connectCloudinary();
    console.log('✅ Cloudinary connected successfully');
    
    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🔑 Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;