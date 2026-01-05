import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  
  console.log("🔐 authUser Middleware - Token from cookies:", token ? "Exists" : "Missing");
  console.log("🔐 authUser - Cookies:", req.cookies);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized" // ✅ SPELLING CORRECTED
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded:", tokenDecode);
    
    if (tokenDecode.id) {
      req.user = { _id: tokenDecode.id };      
      console.log("🔐 User authenticated:", tokenDecode.id);
      return next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized - Invalid token"
      });
    }
  } catch (error) {
    console.error("🔐 JWT Verification Error:", error.message);
    
    // Clear invalid cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
};

export default authUser;