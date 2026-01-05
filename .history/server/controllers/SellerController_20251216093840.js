import jwt from 'jsonwebtoken';

// Seller Login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
      // Create token with seller info
      const token = jwt.sign(
        { 
          email,
          role: 'seller',
          sellerId: process.env.SELLER_ID || 'admin_seller' // Optional: add seller ID
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      // Set cookie
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return res.json({ 
        success: true, 
        message: "Logged In",
        seller: { email }
      });
      
    } else {
      return res.json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

// Check if seller is authenticated
export const isSellerAuth = async (req, res) => {
  try {
    const { sellerToken } = req.cookies;
    
    if (!sellerToken) {
      return res.json({
        success: false,
        message: "No seller token found"
      });
    }
    
    // Verify token
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    // Check if it's a seller token
    if (decoded.email === process.env.SELLER_EMAIL) {
      return res.json({
        success: true,
        message: "Seller is authenticated",
        seller: { email: decoded.email }
      });
    } else {
      return res.json({
        success: false,
        message: "Not a valid seller token"
      });
    }
    
  } catch (error) {
    console.log(error.message);
    return res.json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
}

// Seller Logout
export const Sellerlogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}