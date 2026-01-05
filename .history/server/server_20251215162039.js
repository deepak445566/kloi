import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for Render
const allowedOrigins = [
  'https://agro-gamma-one.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Simple debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes - SIMPLIFIED VERSION
app.get('/', (req, res) => {
  res.json({ message: 'Agro E-commerce API', status: 'running' });
});

// User routes (simplified)
app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    
    // TODO: Add actual user registration logic
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: 'temp_id', name, email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    // TODO: Add actual login logic
    const token = 'temp_token_123';
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { id: 'temp_id', email, name: 'Test User' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/user/isauth', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.json({ 
        success: false, 
        message: 'No token found',
        isAuthenticated: false 
      });
    }
    
    // TODO: Verify actual token
    res.json({
      success: true,
      message: 'User authenticated',
      isAuthenticated: true,
      user: { id: 'temp_id', email: 'test@test.com', name: 'Test User' }
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: error.message,
      isAuthenticated: false 
    });
  }
});

app.post('/api/user/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});