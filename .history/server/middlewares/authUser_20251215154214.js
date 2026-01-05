import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login."
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!tokenDecode.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = { 
      _id: tokenDecode.id,
      email: tokenDecode.email 
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export default authUser;