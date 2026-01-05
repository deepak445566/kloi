import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized - No token found"
    });
  }

  try {
    // Verify token
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    // Check if email matches seller email
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      // Add seller info to request object
      req.seller = { email: tokenDecode.email };
      next(); // ✅ Proceed to the next middleware/route
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized - Invalid seller credentials"
      });
    }
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

export default authSeller;