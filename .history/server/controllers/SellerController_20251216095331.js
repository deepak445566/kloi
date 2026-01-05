import jwt from 'jsonwebtoken';

// ================== Seller Login ==================
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // 2. Check credentials against environment variables
    if (email !== process.env.SELLER_EMAIL || password !== process.env.SELLER_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Create token (user की तरह)
    const token = jwt.sign({ 
      email: email,
      role: 'seller',
      sellerId: 'admin_seller'  // या कोई unique ID
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Set cookie (user की तरह)
    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Response (user की तरह)
    return res.json({
      success: true,
      message: "Logged in successfully",
      seller: {
        email: email,
        name: "Admin Seller", // या environment से नाम लें
        role: 'seller'
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Check Seller Auth ==================
export const isSellerAuth = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    
    if (!token) {
      return res.json({ 
        success: false, 
        message: "Not authorized - No token found" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a seller token
    if (decoded.role === 'seller' && decoded.email === process.env.SELLER_EMAIL) {
      return res.json({
        success: true,
        seller: {
          email: decoded.email,
          name: "Admin Seller",
          role: 'seller'
        },
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Not a valid seller" 
      });
    }
  } catch (error) {
    console.log(error.message);
    
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    return res.json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Seller Logout ==================
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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