import jwt from 'jsonwebtoken';

const authUser = async(req, res, next) => {
  try {
    // ✅ 1. Pehle cookie se token check करो
    let token = req.cookies.token;
    
    // ✅ 2. Agar cookie में nahi hai to header se check करो
    if(!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if(!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized"
      });
    }
    
    // ✅ 3. Token verify करो
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    if(tokenDecode.id) {
      req.user = { _id: tokenDecode.id };
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
};

export default authUser;