import { type Request, type Response } from 'express';

export interface TestsControllerInterface {
  create: (req: Request, res: Response) => void,
  findOneById: (req: Request, res: Response) => void,
  findAll: (req: Request, res: Response) => void,
  findAllByAdmin: (req: Request, res: Response) => void,
  update: (req: Request, res: Response) => void,
  delete: (req: Request, res: Response) => void,
}