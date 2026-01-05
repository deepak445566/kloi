import jwt from 'jsonwebtoken';

const authUser = async(req, res, next) => {
  try {
    console.log("Auth middleware - Cookies:", req.cookies);
    console.log("Auth middleware - Path:", req.path);
    
    // Get token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log("No token found in auth middleware");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        error: "NO_TOKEN"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        error: "INVALID_TOKEN_FORMAT"
      });
    }

    // Attach user to request
    req.user = { 
      _id: decoded.id,
      email: decoded.email 
    };
    
    console.log("User authenticated:", req.user._id);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: "INVALID_TOKEN"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        error: "TOKEN_EXPIRED"
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: "AUTH_FAILED"
    });
  }
}

export default authUser;