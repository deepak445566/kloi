import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.json({
      success: false,
      message: "Not Authorized"
    });
  }

  try {
    // Verify token (user की तरह)
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    // Check if it's a seller (user की तरह)
    if (tokenDecode.role === 'seller' && tokenDecode.email === process.env.SELLER_EMAIL) {
      // Add seller to request object (user की तरह)
      req.seller = { 
        email: tokenDecode.email,
        role: 'seller'
      };
      next();
    } else {
      return res.json({
        success: false,
        message: "Not authorized"
      });
    }
  } catch (error) {
    // Handle errors (user की तरह)
    res.json({
      success: false,
      message: "Invalid Token"
    });
  }
};

export default authSeller;