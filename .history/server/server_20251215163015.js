import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudconfig.js';

// Import routes
import UserRouter from './routes/UserRouter.js';
import sellerRouter from './routes/SellerRouter.js';
import ProductRouter from './routes/ProductRoute.js';
import cartRouter from './routes/CardRoute.js';
import addressRouter from './routes/AddressRoute.js';
import orderRouter from './routes/OrderRoute.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Database connections
try {
  await connectDB();
  console.log('✅ MongoDB connected');
} catch (error) {
  console.log('❌ MongoDB connection error:', error.message);
}

try {
  await connectCloudinary();
  console.log('✅ Cloudinary connected');
} catch (error) {
  console.log('❌ Cloudinary connection error:', error.message);
}

// CORS configuration
const allowedOrigins = [
  'https://agro-gamma-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Handle preflight requests


// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  next();
});

// ================== ROUTES ==================

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 Agro E-commerce API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Server is healthy',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Test routes for debugging
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin
    }
  });
});

app.get('/api/debug/setcookie', (req, res) => {
  res.cookie('debug_cookie', 'test_' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  res.json({ 
    success: true, 
    message: 'Test cookie set' 
  });
});

// ================== IMPORTED ROUTES ==================

// Use imported routers
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ================== ERROR HANDLING ==================

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.originalUrl} not found`);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/health',
      '/api/user/*',
      '/api/product/*',
      '/api/seller/*',
      '/api/cart/*'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false, 
      message: 'CORS error: Origin not allowed',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
});