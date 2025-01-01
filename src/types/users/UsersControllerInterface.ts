import { Request, Response } from 'express';

export interface UsersControllerInterface {
  create: (req: Request, res: Response) => void,
  authenticate: (req: Request, res: Response) => void,
  findOneByEmail: (req: Request, res: Response) => void,
  findOneById: (req: Request, res: Response) => void,
  findAll: (req: Request, res: Response) => void,
  update: (req: Request, res: Response) => void,
  delete: (req: Request, res: Response) => void,
}