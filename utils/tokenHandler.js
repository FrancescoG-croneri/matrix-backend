import JWT from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.ACCESS_JWT_TOKEN;

class TokenHandler {
  static generateToken(user) {
    return JWT.sign({
      user: user,
      iat: Math.floor(Date.now() / 1000),
      
      // Set the JWT token to expire in 60 minutes
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }, secret);
  }

  static validateToken(req, res, next) {
    let token;
    const authHeader = req.headers('Authorization');
  
    if (authHeader) token = authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    return JWT.verify(token, secret, (error, payload) => {
      if (error) {
        console.log(error);
        res.status(403).json({ message: "Token expired" });
      } else {
        req.user_id = payload.user_id;
        next();
      }
    });
  }
}

export default TokenHandler;
