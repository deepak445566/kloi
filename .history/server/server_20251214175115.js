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

// ✅ COMPLETE CORS CONFIGURATION
const allowedOrigins = [
  'https://agro-gamma-one.vercel.app',
  'https://agro-gamma.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // ✅ IMPORTANT: Allows cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// ✅ COOKIE PARSER - MUST BE BEFORE ROUTES
app.use(cookieParser());

// ✅ BODY PARSER
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ PREFLIGHT REQUESTS HANDLER
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);
  console.log('Origin:', req.headers.origin);
  next();
});

// ✅ CUSTOM RESPONSE HEADERS MIDDLEWARE
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    cookies: req.cookies
  });
});

// API Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Server start
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed Origins: ${allowedOrigins.join(', ')}`);
});