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

// ✅ COMPLETE CORS CONFIGURATION FOR PRODUCTION
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://agro-gamma-one.vercel.app',
      'https://agro-gamma.vercel.app',
      'https://agro-gamma-vercel.app',
      'https://agro-gamma-git-main-yourusername.vercel.app'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];

console.log('🌍 Allowed Origins:', allowedOrigins);
console.log('🌍 Environment:', process.env.NODE_ENV);

// ✅ CORS MIDDLEWARE - OPTIMIZED FOR PRODUCTION
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('🌍 No origin - allowing');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('🌍 Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('🌍 Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // ✅ IMPORTANT: Allows cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ HANDLE PREFLIGHT REQUESTS EXPLICITLY
app.options('*', cors(corsOptions));

// ✅ COOKIE PARSER - MUST BE BEFORE ROUTES
app.use(cookieParser());

// ✅ BODY PARSER
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ DEBUG MIDDLEWARE FOR ALL REQUESTS
app.use((req, res, next) => {
  console.log('\n📨 ========== REQUEST START ==========');
  console.log('📨 Method:', req.method);
  console.log('📨 Path:', req.path);
  console.log('📨 Origin:', req.headers.origin);
  console.log('📨 Headers:', {
    'user-agent': req.headers['user-agent'],
    'content-type': req.headers['content-type'],
    'cookie': req.headers.cookie ? 'Present' : 'Missing'
  });
  console.log('📨 Cookies:', req.cookies);
  console.log('📨 ========== REQUEST END ==========\n');
  
  // Log Set-Cookie headers in response
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('🍪 Set-Cookie Header:', value);
    }
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// ✅ CUSTOM CORS HEADERS MIDDLEWARE
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie, Origin, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ✅ HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Event Services API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ✅ DETAILED HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    cookies: req.cookies,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// ✅ API ROUTES
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ 404 HANDLER


// ✅ ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('❌ Stack:', err.stack);
  
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Request not allowed from this origin',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ START SERVER
app.listen(port, () => {
  console.log(`\n🚀 ========== SERVER STARTED ==========`);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Allowed Origins: ${JSON.stringify(allowedOrigins, null, 2)}`);
  console.log(`🚀 API URL: http://localhost:${port}`);
  console.log(`🚀 Health Check: http://localhost:${port}/api/health`);
  console.log(`🚀 ========== SERVER READY ==========\n`);
});