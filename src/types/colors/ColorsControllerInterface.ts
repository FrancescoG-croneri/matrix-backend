import { type Request, type Response } from 'express';

export interface ColorsControllerInterface {
  create: (req: Request, res: Response) => void,
  findOneById: (req: Request, res: Response) => void,
  findOneByHex: (req: Request, res: Response) => void,
  findAll: (req: Request, res: Response) => void,
  findAllByWorkspace: (req: Request, res: Response) => void,
  update: (req: Request, res: Response) => void,
  delete: (req: Request, res: Response) => void,
}
