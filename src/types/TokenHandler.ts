import { type Request, type Response, type NextFunction } from "express";

export interface TokenHandlerInterface {
  generateToken: (user_id: string) => string | false,
  validateToken: (req: Request, res: Response, next: NextFunction) => void
};