import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Cookie options function
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  
  console.log("🍪 Cookie Options:", options);
  return options;
};

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    console.log("📝 Register attempt - Body:", req.body);
    
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
    
    console.log("🔐 Token created for user:", user._id);

    // Set cookie
    res.cookie("token", token, getCookieOptions());
    console.log("🍪 Cookie set for user:", user.email);

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
    console.error("❌ Register Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    console.log("🔑 Login attempt - Body:", req.body);
    
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
      console.log("❌ User not found:", email);
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    console.log("🔐 Token created for user:", user._id);

    // Set cookie
    res.cookie("token", token, getCookieOptions());
    console.log("🍪 Cookie set for user:", user.email);

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
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    console.log("🔍 isAuth - Cookies:", req.cookies);
    console.log("🔍 isAuth - Headers:", req.headers);
    
    const token = req.cookies.token;
    
    if (!token) {
      console.log("❌ No token found in cookies");
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" // ✅ Correct spelling
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    
    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found for id:", decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("✅ User authenticated:", user.email);
    
    return res.json({
      success: true,
      user,
      message: "User is authenticated"
    });
  } catch (error) {
    console.error("❌ isAuth Error:", error.message);
    
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
    console.log("🚪 Logout request");
    
    res.clearCookie("token", getCookieOptions());
    
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};