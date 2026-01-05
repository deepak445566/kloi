import jwt from 'jsonwebtoken';

// ✅ COOKIE OPTIONS FUNCTION (same as UserController)
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

export const sellerLogin = async(req, res) => {
  try {
    const {email, password} = req.body;
    
    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
      const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});
      
      // ✅ SET COOKIE WITH PROPER OPTIONS
      res.cookie("sellerToken", token, getCookieOptions());
      
      return res.json({
        success: true, 
        message: "Seller Logged In",
        token: token // Optional: send token in response too
      });
    } else {
      return res.json({
        success: false, 
        message: "Invalid credentials"
      });
    }
  } catch (error) {
    console.log("Seller Login Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

export const isSellerAuth = async (req, res) => {
  try {
    const sellerToken = req.cookies.sellerToken;
    
    console.log("isSellerAuth - Token:", sellerToken ? "Exists" : "Missing");
    
    if (!sellerToken) {
      return res.json({
        success: false,
        message: "Seller not authenticated"
      });
    }
    
    // Verify token
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      return res.json({
        success: true,
        message: "Seller is authenticated"
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid seller token"
      });
    }
  } catch (error) {
    console.log("isSellerAuth Error:", error.message);
    
    // Clear invalid cookie
    res.clearCookie("sellerToken", getCookieOptions());
    
    return res.json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const Sellerlogout = async (req, res) => {
  try {
    // ✅ CLEAR COOKIE WITH SAME OPTIONS
    res.clearCookie("sellerToken", getCookieOptions());
    
    return res.json({
      success: true,
      message: "Seller logged out successfully",
    });
  } catch (error) {
    console.log("Seller Logout Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};