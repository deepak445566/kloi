import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper function for cookie settings
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    ...(isProduction && {
      domain: '.vercel.app', // Adjust based on your domain
      partitioned: true // For Chrome's cookie partitioning
    })
  };
};

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 6. Set cookie
    res.cookie("token", token, getCookieOptions());

    // 7. Response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: process.env.NODE_ENV === 'development' ? token : undefined // Send token in response for frontend storage
    });
  } catch (error) {
    console.log("Registration error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5. Set cookie
    res.cookie("token", token, getCookieOptions());

    // 6. Response
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(200).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(200).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      message: "Authenticated",
      user,
    });
  } catch (error) {
    console.log("Auth check error:", error.message);
    
    // Clear invalid token cookie
    res.clearCookie("token", getCookieOptions());
    
    return res.status(200).json({ 
      success: false, 
      message: "Authentication failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());
    
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Logout error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};