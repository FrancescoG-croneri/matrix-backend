import WorkspacesController from "@src/controllers/workspaces";
import { WorkspacesRepository } from "@src/repositories/WorkspacesRepository";
import { type Knex } from "knex";
import { type Request, type Response } from 'express';
import { type WorkspacesControllerInterface } from "@src/types/workspaces/WorkspacesControllerInterface";
import { type Workspace } from "@src/types/workspaces/Workspace";
import TokenHandler from "@src/utils/tokenHandler";
import { TokenHandlerInterface } from "@src/types/utils/TokenHandlerInterface";

describe('WorkspacesController', () => {
  
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRepository: jest.Mocked<WorkspacesRepository>;
  let mockDb: Knex<any, any[]>;
  let mockTokenHandler: jest.Mocked<TokenHandlerInterface>;
  let workspacesController: WorkspacesControllerInterface;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();

    mockRepository = new WorkspacesRepository(mockDb) as jest.Mocked<WorkspacesRepository>;
    mockTokenHandler = new TokenHandler() as jest.Mocked<TokenHandlerInterface>;
    workspacesController = new WorkspacesController(mockRepository, mockTokenHandler);

    req = { 
      body: {}, 
      query: {}, 
      headers: {}, 
    }; 
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should not create a workspace if any of the required data for creation is missing', async () => {
      // No admin_id
      req.body = { admin_id: '', name: 'MyWorkspace' };
      workspacesController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'admin_id or Name are missing', success: false });

      // No name
      req.body = { admin_id: 'admin1234', name: '' };
      workspacesController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'admin_id or Name are missing', success: false });
    });

    test('should not create a workspace if admin_id does not include the word "admin"', () => {
      req.body = { admin_id: 'guest1234', name: 'MyWorkspace' };
      workspacesController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Your role does not allow you to create workspaces', success: false });
    });

    test('should not create a workspace if the user already exists', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'existing123',
        admin_id: 'admin123',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { admin_id: 'admin456', name: 'MyWorkspace1' };
      mockRepository.findOneByName = jest.fn().mockResolvedValue([mockWorkspace]);
      workspacesController = new WorkspacesController(mockRepository, mockTokenHandler);

      const response = workspacesController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'A workspace with this name already exists', success: false });
    });

    test('should not create a workspace if the response from the repository layer is falsy', async () => {
      req.body = { admin_id: 'admin456', name: 'MyWorkspace2' };
      mockRepository.create = jest.fn().mockResolvedValue([]);
      workspacesController = new WorkspacesController(mockRepository, mockTokenHandler);

      const response = workspacesController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong with your workspace creation', success: false });
    });

    test('should create a workspace when the admin_id is valid, name is unique and the repository layer does not fail', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'existing123',
        admin_id: 'admin123',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { admin_id: 'admin123', name: 'MyWorkspace1' };
      mockRepository.create = jest.fn().mockReturnValue([mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      workspacesController = new WorkspacesController(mockRepository, mockTokenHandler);

      const response = workspacesController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Workspace created successfully', workspace: mockWorkspace, token: 'token1234', success: true });
    });
  });

  describe('findOneByName', () => {
    test('should fail to find a workspace if name or requester_id are missing', () => {
      req.query = { requester_id: 'admin1234', name: '' };
      workspacesController.findOneByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or Name are missing', success: false });

      req.query = { requester_id: '', name: 'MyWorkspace1' };
      workspacesController.findOneByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or Name are missing', success: false });
    });

    test('should fail to find a workspace if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', name: 'MyWorkspace2' };
      mockRepository.findOneByName = jest.fn().mockResolvedValue([]);

      const response = workspacesController.findOneByName(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find workspace', success: false });
    });

    test('should find a workspace if the input data is complete and the repository layer returns a truthy response', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'existing123',
        admin_id: 'admin123',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin123', name: 'MyWorkspace1' };
      mockRepository.findOneByName = jest.fn().mockResolvedValue([mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = workspacesController.findOneByName(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspace found successfully", workspace: mockWorkspace, token: 'token1234', success: true });
    });
  });

  describe('findOneById', () => {
    test('should fail to find a workspace if user_id or requester_id are missing', () => {
      req.query = { requester_id: 'admin1234', workspace_id: '' };
      workspacesController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or workspace_id', success: false });

      req.query = { requester_id: '', workspace_id: 'workspace1234' };
      workspacesController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or workspace_id', success: false });
    });

    test('should fail to find a workspace if the response from the repository layer is falsy', async () => {
      mockRepository.findOneById = jest.fn().mockResolvedValue([]);
      req.query = { requester_id: 'admin1234', workspace_id: 'workspace1234' };

      const response = workspacesController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find workspace', success: false });
    });

    test('should find a workspace if the data is complete and the repository layer returns a truthy response', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'workspace123',
        admin_id: 'admin123',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234', workspace_id: 'workspace123' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      
      const response = workspacesController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspace found successfully", workspace: mockWorkspace, token: 'token1234', success: true });
    });
  });

  describe('findAll', () => {
    test('should fail to find the workspaces if requester_id is missing', async () => {
      req.query = { requester_id: '' };

      workspacesController.findAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id', success: false });
    });

    test('should fail to find the workspaces if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockResolvedValue([]);

      const response = workspacesController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find workspaces', success: false });
    });

    test('should find all the workspaces successfully when requester_id is present and the repository layer returns a truthy value', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'workspace123',
        admin_id: 'admin123',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockReturnValue([mockWorkspace, mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = workspacesController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspaces fetched correctly", workspaces: [mockWorkspace, mockWorkspace], token: 'token1234', success: true });
    });
  });

  describe('findAllByAdmin', () => {
    test('should fail to find the workspaces if requester_id is missing', async () => {
      req.query = { requester_id: '', admin_id: 'admin1234' };

      workspacesController.findAllByAdmin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing admin_id or requester_id', success: false });
    });

    test('should fail to find the workspaces if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', admin_id: 'admin1234' };
      mockRepository.findAllByAdmin = jest.fn().mockResolvedValue([]);

      const response = workspacesController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find workspaces', success: false });
    });

    test('should find all the workspaces successfully when requester_id and admin_id are present and the repository layer returns a truthy value', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'workspace123',
        admin_id: 'admin1234',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin456', admin_id: 'admin123' };
      mockRepository.findAllByAdmin = jest.fn().mockReturnValue([mockWorkspace, mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = workspacesController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspaces fetched correctly", workspaces: [mockWorkspace, mockWorkspace], token: 'token1234', success: true });
    });
  });

  describe('update', () => {
    test('should fail to update the workspace if the requester_id or workspace_id are missing', () => {
      req.body = { 
        requester_id: 'admin1234', 
        workspace_id: '', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };

      workspacesController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or workspace_id are missing', success: false });

      req.body = { 
        requester_id: '', 
        workspace_id: 'workspace1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };

      workspacesController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or workspace_id are missing', success: false });
    });

    test('should fail to update the workspace if the response from the repository layer is falsy', async () => {
      req.body = { 
        requester_id: 'admin1234', 
        workspace_id: 'workspace1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };
      mockRepository.update = jest.fn().mockResolvedValue([]);

      const response = workspacesController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update workspace", success: false });
    });

    test('should update the workspace successfully if the response from the repository layer is truthy', async () => {
      const mockWorkspace: Workspace = { 
        id: '1',
        workspace_id: 'workspace123',
        admin_id: 'admin1234',
        name: 'MyWorkspace1',
        guest_ids: ['guest123', 'guest456'],
        test_ids: ['test123', 'test456'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { 
        requester_id: 'admin1234', 
        workspace_id: 'workspace1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123', 'guest456'], 
        test_ids: ['test123', 'test456'] 
      };
      mockRepository.update = jest.fn().mockResolvedValue([mockWorkspace]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = workspacesController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspace updated successfully", workspace: mockWorkspace, token: 'token1234', success: true });
    });
  });

  describe('delete', () => {
    test('should not delete the workspace if requester_id or workspace_id are missing', () => {
      req.body = { requester_id: 'admin1234', workspace_id: '  ' };

      workspacesController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or workspace_id are missing', success: false });

      req.body = { requester_id: '   ', workspace_id: 'workspace1234' };

      workspacesController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or workspace_id are missing', success: false });
    });

    test('should fail to delete the workspace if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', workspace_id: 'workspace1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(false);

      const response = workspacesController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete workspace", success: false });
    });

    test('should delete the user successfully if the response from the repository layer is truthy', async () => {
      req.body = { requester_id: 'admin1234', workspace_id: 'workspace1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(true);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = workspacesController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Workspace deleted successfully", token: 'token1234', success: true });
    });
  });

});

