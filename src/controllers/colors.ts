import { type ColorsRepositoryInterface } from '@src/types/colors/ColorsRepositoryInterface';
import { type ColorsControllerInterface } from '@src/types/colors/ColorsControllerInterface';
import { type TokenHandlerInterface } from '@src/types/utils/TokenHandlerInterface';
import { type Color } from '@src/types/colors/Color';
import { type Request, type Response } from 'express';

class ColorsController implements ColorsControllerInterface {

  private repository: ColorsRepositoryInterface;
  private tokenHandler: TokenHandlerInterface;

  constructor(repository: ColorsRepositoryInterface, tokenHandler: TokenHandlerInterface) {
    this.repository = repository;
    this.tokenHandler = tokenHandler;
  }

  public async create(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const workspace_id: string = req.body.workspace_id;
    const guest_id: string = req.body.guest_id;
    const hex: string = req.body.hex;

    if (!requester_id || !workspace_id || !guest_id || !hex || !requester_id.trim() || !workspace_id.trim() || !guest_id.trim() || !hex.trim()) {
      return res.status(400).json({ message: 'requester_id, workspace_id, guest_id or hex are missing', success: false });
    }

    const response: false | Color[] = await this.repository.create(workspace_id, guest_id, hex);
    
    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Something went wrong with your color creation', success: false });
    } else {
      const color: Color = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(201).json({ message: 'Color created successfully', color, token, success: true });
    }
  };

  public async findOneById(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const color_id: string = req.query.color_id as string;

    if (!requester_id || !requester_id.trim() || !color_id || !color_id.trim()) {
      return res.status(400).json({ message: "Missing requester_id or color_id", success: false });
    }

    const response: false | Color[] = await this.repository.findOneById(color_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find color', success: false });
    } else {
      const color: Color = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Color found successfully", color, token, success: true });
    }
  };

  public async findOneByHex(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const hex: string = req.query.hex as string;

    if (!requester_id || !requester_id.trim() || !hex || !hex.trim()) return res.status(400).json({ message: "Missing requester_id or hex", success: false });

    const response: false | Color[] = await this.repository.findOneByHex(hex);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find color', success: false });
    } else {
      const color: Color = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Color found successfully", color, token, success: true });
    }
  };

  public async findAll(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;

    if (!requester_id || !requester_id.trim()) return res.status(400).json({ message: "Missing requester_id", success: false });

    const response: false | Color[] = await this.repository.findAll();

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find colors', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Colors fetched correctly", colors: response, token, success: true });
    }
  };

  public async findAllByWorkspace(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const workspace_id: string = req.query.workspace_id as string;

    if (!workspace_id || !requester_id || !workspace_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing workspace_id or requester_id", success: false });
    }

    const response: false | Color[] = await this.repository.findAllByWorkspace(workspace_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find colors', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Colors fetched correctly", colors: response, token, success: true });
    }
  };

  public async update(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const color_id: string = req.body.color_id;
    const workspace_id: string = req.body.workspace_id;
    const guest_id: string = req.body.guest_id;
    const hex: string = req.body.hex;

    if (!requester_id || !color_id || !requester_id.trim() || !color_id.trim()) {
      return res.status(400).json({ message: 'requester_id or color_id are missing', success: false });
    }

    const response: false | Color[] = await this.repository.update(color_id, workspace_id, guest_id, hex);

    if (!response || !response[0]) {
      return res.status(404).json({ message: "Failed to update color", success: false });
    } else {
      const color: Color = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: 'Color updated successfully', color, token, success: true });
    }
  };

  public async delete(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const color_id: string = req.body.color_id;

    if (!requester_id || !color_id || !requester_id.trim() || !color_id.trim()) {
      return res.status(400).json({ message: "requester_id or color_id are missing", success: false });
    }

    const response: boolean = await this.repository.delete(color_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete color", success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Color deleted successfully", token, success: true });
    }
  };
};

export default ColorsController;