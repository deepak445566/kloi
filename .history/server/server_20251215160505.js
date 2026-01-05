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
const app = express();
const port = process.env.PORT || 3000;

// Database connect
await connectDB();
await connectCloudinary();

// CORS configuration for Vercel deployment
const allowedOrigins = [
  'https://agro-gamma-one.vercel.app',
  'http://localhost:5173',

];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Debug middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Agro E-commerce API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for cookies
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      cookie: req.headers.cookie
    }
  });
});

// Test cookie endpoint
app.get('/api/debug/setcookie', (req, res) => {
  res.cookie('test_cookie', 'test_value_' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : 'localhost'
  });
  
  res.json({ 
    success: true, 
    message: 'Test cookie set' 
  });
});

// Health API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Server start
app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});