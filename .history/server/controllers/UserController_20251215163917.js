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

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Create token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Set cookie - FIXED DOMAIN
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };
    
    // Don't set domain for cross-domain cookies
    // Let the browser handle it

    res.cookie("token", token, cookieOptions);

    // 7. Response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token // Send token in response for debugging
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
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
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Create token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Set cookie - FIXED
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    // 6. Response
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {}
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    console.log("=== isAuth Endpoint Hit ===");
    console.log("Origin:", req.headers.origin);
    console.log("Cookies received:", req.cookies);
    console.log("Auth header:", req.headers.authorization);
    
    // Try multiple ways to get token
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    console.log("Token found:", !!token);
    
    if (!token) {
      return res.status(200).json({ 
        success: false, 
        message: "No authentication token found",
        isAuthenticated: false,
        debug: {
          cookiesPresent: !!req.cookies?.token,
          authHeaderPresent: !!req.headers.authorization
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded for user:", decoded.id);
    
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(200).json({ 
        success: false, 
        message: "User not found",
        isAuthenticated: false 
      });
    }

    return res.json({
      success: true,
      message: "User is authenticated",
      isAuthenticated: true,
      user: {
        ...user.toObject(),
        cartItems: user.cartItems || {}
      }
    });
  } catch (error) {
    console.error("isAuth error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(200).json({ 
        success: false, 
        message: "Invalid token",
        isAuthenticated: false 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ 
        success: false, 
        message: "Token expired",
        isAuthenticated: false 
      });
    }
    
    return res.status(200).json({ 
      success: false, 
      message: "Authentication check failed",
      isAuthenticated: false,
      error: error.message 
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };
    
    res.clearCookie("token", cookieOptions);

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error during logout" 
    });
  }
};

