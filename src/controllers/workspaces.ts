import { type WorkspacesRepositoryInterface } from '../types/WorkspacesRepositoryInterface';
import { type Workspace } from '../types/Workspace';
import { WorkspacesRepository } from '../repositories/WorkspacesRepository';
import TokenHandler from '../utils/tokenHandler';
import db from "../../db";
import { type TokenHandlerInterface } from '@src/types/TokenHandler';

const repository: WorkspacesRepositoryInterface = new WorkspacesRepository(db);
const tokenHandler: TokenHandlerInterface = new TokenHandler();

const WorkspacesController = {

  Create: async (req: any, res: any) => {
    const admin_id: string = req.body.admin_id;
    const name: string = req.body.name;

    if (!admin_id || !name || admin_id.trim() === '' || name.trim() === '') {
      return res.status(400).json({ message: 'admin_id or Name are missing', status: false });
    }

    if (!admin_id.includes('admin')) {
      return res.status(401).json({ message: 'Your role does not allow you to create workspaces', status: false });
    }

    const alreadyExistingWorkspace: false | Workspace[] = await repository.findOneByName(name);

    if (alreadyExistingWorkspace) {
      return res.status(403).json({ message: 'A workspace with this name already exists', status: false });
    }

    const workspace: false | Workspace[] = await repository.create(admin_id, name);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Something went wrong with your workspace creation', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(admin_id);
      
      return res.status(201).json({ message: 'Workspace created successfully', token, workspace: workspace[0], status: true });
    }
  },

  FindOneByName: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const name: string = req.body.email;

    if (!name || !requester_id) return res.status(400).json({ message: 'requester_id or Name are missing', status: false });

    const workspace: false | Workspace[] = await repository.findOneByName(name);

    if (!workspace) {
      return res.status(404).json({ message: 'Failed to find workspace', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "User found successfully", token, workspace: workspace[0], status: true });
    }
  },

  FindOneById: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const workspace_id: string = req.query.workspace_id;

    if (!workspace_id) return res.status(400).json({ message: "Missing workspace_id", status: false });

    const workspace: false | Workspace[] = await repository.findOneById(workspace_id);

    if (!workspace) {
      return res.status(404).json({ message: 'Failed to find workspace', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspace found successfully", token, workspace: workspace[0], status: true });
    }
  },

  FindAll: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;

    if (!requester_id) {
      return res.status(400).json({ message: "Missing requester_id", status: false });
    }

    const workspaces: false | Workspace[] = await repository.findAll();

    if (!workspaces) {
      return res.status(404).json({ message: 'Failed to find workspaces' });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspaces fetched correctly", workspaces, token, status: true });
    }
  },

  FindAllByAdmin: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const admin_id: string = req.query.admin_id;

    if (!admin_id || !requester_id) {
      return res.status(400).json({ message: "Missing admin_id or requester_id", status: false });
    }

    const workspaces: false | Workspace[] = await repository.findAllByAdmin(admin_id);

    if (!workspaces) {
      return res.status(404).json({ message: 'Failed to find workspaces', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspaces fetched correctly", workspaces, token, status: true });
    }
  },

  Update: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const workspace_id: string = req.body.workspace_id;
    const name: string = req.body.name;
    const admin_id: string = req.body.admin_id;
    const guest_ids: string[] = req.body.guest_ids;
    const test_ids: string[] = req.body.test_ids;

    if (!requester_id || !workspace_id) {
      return res.status(400).json({ message: 'requester_id or workspace_id are missing', status: false });
    }

    const workspace: false | Workspace[] = await repository.update(workspace_id, admin_id, name, guest_ids, test_ids);

    if (!workspace) {
      return res.status(404).json({ message: "Failed to update workspace", status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);
      return res.status(200).json({ message: "Workspace updated successfully", workspace, token, status: true });
    }
  },

  Delete: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const workspace_id: string = req.body.workspace_id;

    if (!requester_id || !workspace_id) {
      return res.status(400).json({ message: 'requester_id or workspace_id are missing', status: false });
    }

    const response: boolean = await repository.delete(workspace_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete workspace", status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id); 
      return res.status(200).json({ message: "Workspace deleted successfully", token, status: true });
    }
  },
};

export default WorkspacesController;