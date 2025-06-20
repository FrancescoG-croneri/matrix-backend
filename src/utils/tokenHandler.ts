import JWT, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';
import { type NextFunction, type Request, type Response } from "express";
import { TokenHandlerInterface } from "@src/types/utils/TokenHandlerInterface";

dotenv.config();
const secret: string = process.env.ACCESS_JWT_TOKEN;

class TokenHandler implements TokenHandlerInterface {

  generateToken(user_id: string) {
    try {

      if (!user_id) throw new Error('Missing user_id');

      return JWT.sign({
        user_id,
        iat: Math.floor(Date.now() / 1000),
        
        // Set the JWT token to expire in 60 minutes
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, secret);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  validateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string; 

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ').length < 2) { 
      return res.status(401).json({ message: 'Token missing', status: false }); 
    } 
    const token = authHeader.split(' ')[1];

    return JWT.verify(token, secret, (error: Error, payload: JwtPayload) => {
      if (error) {
        console.log(error);
        res.status(403).json({ message: "Token expired", status: false });
      } else {
        if (req.method.toLowerCase() === 'get') {
          req.query.user_id = payload.user_id;
        } else {  
          req.body.user_id = payload.user_id; 
        }
        next();
      }
    });
  }
}

export default TokenHandler;
