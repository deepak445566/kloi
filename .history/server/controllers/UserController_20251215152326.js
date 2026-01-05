import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
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
    const token = jwt.sign({ 
      id: user._id,
      email: user.email 
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 6. Set cookie with enhanced options
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: isProduction ? process.env.COOKIE_DOMAIN : 'localhost'
    });

    // 7. Response without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again." 
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
        message: "Please provide email and password",
      });
    }

    // 2. Check user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Create token
    const token = jwt.sign({ 
      id: user._id,
      email: user.email 
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5. Set cookie
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProduction ? process.env.COOKIE_DOMAIN : 'localhost'
    });

    // 6. Response
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      cartItems: user.cartItems || {}
    };

    return res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Login failed. Please try again." 
    });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(200).json({ 
        success: false, 
        message: "No token found" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      // Clear invalid token cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: '/'
      });
      
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {}
      },
    });
  } catch (error) {
    console.error("Auth check error:", error.message);
    
    // Clear invalid token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: '/'
    });
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Authentication check failed" 
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: '/',
      domain: isProduction ? process.env.COOKIE_DOMAIN : 'localhost'
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Logout failed" 
    });
  }
};

// ================== Get Current User ==================
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {}
      },
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user information" 
    });
  }
};