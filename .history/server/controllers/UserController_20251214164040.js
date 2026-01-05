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

    // 6. ✅ CORRECT PRODUCTION COOKIE SETTINGS
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ ALWAYS true for Vercel/Production
      sameSite: isProduction ? "none" : "lax", // ✅ 'none' for production
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      domain: isProduction ? ".vercel.app" : undefined // ✅ Optional: for subdomains
    });

    // 7. Response (TOKEN भी भेजो)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token, // ✅ CRITICAL: Frontend को token दो
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
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
        message: "User does not exist",
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

    // 5. ✅ CORRECT PRODUCTION COOKIE SETTINGS
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ ALWAYS true for Vercel
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log("✅ Cookie set for domain:", req.headers.origin);

    // 6. Response (TOKEN भी भेजो)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token, // ✅ CRITICAL: Frontend को token दो
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    // ✅ Check BOTH cookie AND authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      // Check Authorization header भी
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
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
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};