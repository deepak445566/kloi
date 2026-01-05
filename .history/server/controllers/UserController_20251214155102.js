import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // ✅ CORRECT TOKEN GENERATION
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Token generated:", token.substring(0, 20) + "..."); // Debug

    // ✅ CRITICAL COOKIE SETTINGS
    const cookieOptions = {
      httpOnly: true,
      secure: true, // ALWAYS true for Vercel
      sameSite: 'none', // MUST be 'none' for cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    // ✅ SET COOKIE
    res.cookie('token', token, cookieOptions);
    
    // ✅ ALSO SEND IN RESPONSE (temporary fix)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token, // ✅ ये line CRITICAL है
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ CORRECT TOKEN GENERATION
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Login token:", token.substring(0, 20) + "...");

    // ✅ CRITICAL COOKIE SETTINGS (SAME AS REGISTER)
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };

    // ✅ SET COOKIE
    res.cookie('token', token, cookieOptions);
    
    // ✅ ALSO SEND IN RESPONSE
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token, // ✅ ये line CRITICAL है
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    // ✅ Check BOTH cookie AND authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      // Check Authorization header
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token found" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};