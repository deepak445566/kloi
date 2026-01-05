import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ COOKIE OPTIONS FUNCTION
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction, // Production mein true
    sameSite: isProduction ? 'none' : 'lax', // ✅ IMPORTANT: 'none' for production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    // domain: isProduction ? '.vercel.app' : undefined // Optional for subdomains
  };
};

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ SET COOKIE WITH PROPER OPTIONS
    res.cookie("token", token, getCookieOptions());

    // Response
    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      message: "Registration successful"
    });
  } catch (error) {
    console.log("Register Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ SET COOKIE WITH PROPER OPTIONS
    res.cookie("token", token, getCookieOptions());

    // Response
    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      message: "Login successful"
    });
  } catch (error) {
    console.log("Login Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    console.log("isAuth - Token from cookies:", token ? "Exists" : "Missing");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized - No token" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user,
      message: "User is authenticated"
    });
  } catch (error) {
    console.log("isAuth Error:", error.message);
    
    // Clear invalid cookie
    res.clearCookie("token", getCookieOptions());
    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    // ✅ CLEAR COOKIE WITH SAME OPTIONS
    res.clearCookie("token", getCookieOptions());
    
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Logout Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};