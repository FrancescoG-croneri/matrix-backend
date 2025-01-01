import { type WorkspacesRepositoryInterface } from '@src/types/workspaces/WorkspacesRepositoryInterface';
import { type WorkspacesControllerInterface } from '@src/types/workspaces/WorkspacesControllerInterface';
import { type TokenHandlerInterface } from '@src/types/utils/TokenHandlerInterface';
import { type Workspace } from '@src/types/workspaces/Workspace';
import { type Request, type Response } from 'express';

class WorkspacesController implements WorkspacesControllerInterface {

  private repository: WorkspacesRepositoryInterface;
  private tokenHandler: TokenHandlerInterface;

  constructor(repository: WorkspacesRepositoryInterface, tokenHandler: TokenHandlerInterface) {
    this.repository = repository;
    this.tokenHandler = tokenHandler;
  }

  public async create(req: Request, res: Response) {
    const admin_id: string = req.body.admin_id;
    const name: string = req.body.name;

    if (!admin_id || !name || !admin_id.trim() || !name.trim()) {
      return res.status(400).json({ message: 'admin_id or Name are missing', success: false });
    }

    if (!admin_id.includes('admin')) {
      return res.status(401).json({ message: 'Your role does not allow you to create workspaces', success: false });
    }

    const alreadyExistingWorkspace: false | Workspace[] = await this.repository.findOneByName(name);

    if (alreadyExistingWorkspace && alreadyExistingWorkspace[0]) {
      return res.status(403).json({ message: 'A workspace with this name already exists', success: false });
    }

    const response: false | Workspace[] = await this.repository.create(admin_id, name);
    
    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Something went wrong with your workspace creation', success: false });
    } else {
      const workspace: Workspace = response[0];
      const token: string | false = this.tokenHandler.generateToken(admin_id);
      
      return res.status(201).json({ message: 'Workspace created successfully', token, workspace, success: true });
    }
  };

  public async findOneByName(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const name: string = req.query.name as string;

    if (!name || !requester_id || !name.trim() || !requester_id.trim()) return res.status(400).json({ message: 'requester_id or Name are missing', success: false });

    const response: false | Workspace[] = await this.repository.findOneByName(name);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find workspace', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspace found successfully", token, workspace: response[0], success: true });
    }
  };

  public async findOneById(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const workspace_id: string = req.query.workspace_id as string;

    if (!workspace_id || !requester_id || !workspace_id.trim() || !requester_id.trim()) return res.status(400).json({ message: "Missing requester_id or workspace_id", success: false });

    const response: false | Workspace[] = await this.repository.findOneById(workspace_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find workspace', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspace found successfully", token, workspace: response[0], success: true });
    }
  };

  public async findAll(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;

    if (!requester_id || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing requester_id", success: false });
    }

    const response: false | Workspace[] = await this.repository.findAll();

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find workspaces', success: false});
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspaces fetched correctly", workspaces: response, token, success: true });
    }
  };

  public async findAllByAdmin(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const admin_id: string = req.query.admin_id as string;

    if (!admin_id || !requester_id || !admin_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing admin_id or requester_id", success: false });
    }

    const response: false | Workspace[] = await this.repository.findAllByAdmin(admin_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find workspaces', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspaces fetched correctly", workspaces: response, token, success: true });
    }
  };

  public async update(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const workspace_id: string = req.body.workspace_id;
    const admin_id: string = req.body.admin_id;
    const name: string = req.body.name;
    const guest_ids: string[] = req.body.guest_ids;
    const test_ids: string[] = req.body.test_ids;

    if (!requester_id || !workspace_id || !requester_id.trim() || !workspace_id.trim()) {
      return res.status(400).json({ message: 'requester_id or workspace_id are missing', success: false });
    }

    const response: false | Workspace[] = await this.repository.update(workspace_id, admin_id, name, guest_ids, test_ids);

    if (!response || !response[0]) {
      return res.status(404).json({ message: "Failed to update workspace", success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspace updated successfully", workspace: response[0], token, success: true });
    }
  };

  public async delete(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const workspace_id: string = req.body.workspace_id;

    if (!requester_id || !workspace_id || !requester_id.trim() || !workspace_id.trim()) {
      return res.status(400).json({ message: 'requester_id or workspace_id are missing', success: false });
    }

    const response: boolean = await this.repository.delete(workspace_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete workspace", success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id); 
      return res.status(200).json({ message: "Workspace deleted successfully", token, success: true });
    }
  };

};

export default WorkspacesController;