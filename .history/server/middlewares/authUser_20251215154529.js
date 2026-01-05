import jwt from 'jsonwebtoken';

const authUser = async(req, res, next) => {
  const { token } = req.cookies;
  
  if(!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized"
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: tokenDecode.id };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
}

export default authUser;