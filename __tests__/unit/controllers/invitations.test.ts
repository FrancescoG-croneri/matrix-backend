import InvitationsController from "@src/controllers/invitations";
import { InvitationsRepository } from "@src/repositories/InvitationsRepository";
import { type Knex } from "knex";
import { type Request, type Response } from 'express';
import { type TokenHandlerInterface } from "@src/types/utils/TokenHandlerInterface";
import { type InvitationsControllerInterface } from "@src/types/invitations/InvitationsControllerInterface";
import { type Invitation } from "@src/types/invitations/Invitation";
import TokenHandler from "@src/utils/tokenHandler";

describe('InvitationsController', () => {
  
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRepository: jest.Mocked<InvitationsRepository>;
  let mockDb: Knex<any, any[]>;
  let mockTokenHandler: jest.Mocked<TokenHandlerInterface>;
  let invitationsController: InvitationsControllerInterface;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();

    mockRepository = new InvitationsRepository(mockDb) as jest.Mocked<InvitationsRepository>;
    mockTokenHandler = new TokenHandler() as jest.Mocked<TokenHandlerInterface>;
    invitationsController = new InvitationsController(mockRepository, mockTokenHandler);

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
    [
      { requester_id: '', item_id: 'workspace1234', admin_id: 'admin1234', guest_id: 'guest1234', type: 'workspace', missing: 'requester_id' },
      { requester_id: 'admin1234', item_id: '', admin_id: 'admin1234', guest_id: 'guest1234', type: 'workspace', missing: 'item_id' },
      { requester_id: 'admin1234', item_id: 'workspace1234', admin_id: '', guest_id: 'guest1234', type: 'workspace', missing: 'admin_id' },
      { requester_id: 'admin1234', item_id: 'workspace1234', admin_id: 'admin1234', guest_id: '', type: '', missing: 'guest_id' },
      { requester_id: 'admin1234', item_id: 'workspace1234', admin_id: 'admin1234', guest_id: 'guest1234', type: '', missing: 'type' },
    ].forEach(mockRequestBody => {
      test(`should not create an invitation if ${mockRequestBody.missing} is missing`, async () => {
        req.body = mockRequestBody;
        invitationsController.create(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'requester_id, item_id, admin_id, guest_id or Type are missing', success: false });
      });
    })

    test('should not create an invitation if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', item_id: 'workspace1234', admin_id: 'admin1234', guest_id: 'guest1234', type: 'workspace' };
      mockRepository.create = jest.fn().mockResolvedValue([]);
      invitationsController = new InvitationsController(mockRepository, mockTokenHandler);

      const response = invitationsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong with your invitation creation', success: false });
    });

    test('should create an invitation if input data is complete and the response from the repository layer is truthy', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { requester_id: 'admin1234', item_id: 'workspace1234', admin_id: 'admin1234', guest_id: 'guest1234', type: 'workspace' };
      mockRepository.create = jest.fn().mockReturnValue([mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      invitationsController = new InvitationsController(mockRepository, mockTokenHandler);

      const response = invitationsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invitation created successfully', invitation: mockInvitation, token: 'token1234', success: true });
    });
  });

  describe('findOneById', () => {
    test('should fail to find an invitation if requester_id or invitation_id are missing', () => {
      req.query = { requester_id: 'admin1234', invitation_id: '' };
      invitationsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or invitation_id', success: false });

      req.query = { requester_id: '', invitation_id: 'invitation1234' };
      invitationsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or invitation_id', success: false });
    });

    test('should fail to find an invitation if the response from the repository layer is falsy', async () => {
      mockRepository.findOneById = jest.fn().mockResolvedValue([]);
      req.query = { requester_id: 'admin1234', invitation_id: 'invitation1234' };

      const response = invitationsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find invitation', success: false });
    });

    test('should find an invitation if the data is complete and the repository layer returns a truthy response', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234', invitation_id: 'invitation1234' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      
      const response = invitationsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitation found successfully", invitation: mockInvitation, token: 'token1234', success: true });
    });
  });

  describe('findAll', () => {
    test('should fail to find the invitations if requester_id is missing', async () => {
      req.query = { requester_id: '' };

      invitationsController.findAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id', success: false });
    });

    test('should fail to find the invitations if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockResolvedValue([]);

      const response = invitationsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find invitations', success: false });
    });

    test('should find all the invitations successfully when requester_id is present and the repository layer returns a truthy value', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockReturnValue([mockInvitation, mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitations fetched correctly", invitations: [mockInvitation, mockInvitation], token: 'token1234', success: true });
    });
  });

  describe('findAllByGuest', () => {
    test('should fail to find the invitations if requester_id or guest_id are missing', async () => {
      req.query = { requester_id: '', guest_id: 'admin1234' };

      invitationsController.findAllByGuest(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing guest_id or requester_id", success: false });

      req.query = { requester_id: 'admin1234', guest_id: '' };

      invitationsController.findAllByGuest(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing guest_id or requester_id", success: false });
    });

    test('should fail to find the invitations if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', guest_id: 'admin1234' };
      mockRepository.findAllByGuest = jest.fn().mockResolvedValue([]);

      const response = invitationsController.findAllByGuest(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find invitations', success: false });
    });

    test('should find all the invitations successfully when requester_id and guest_id are present and the repository layer returns a truthy value', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'guest1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      };
      req.query = { requester_id: 'admin456', guest_id: 'guest1234' };
      mockRepository.findAllByGuest = jest.fn().mockReturnValue([mockInvitation, mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.findAllByGuest(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitations fetched correctly", invitations: [mockInvitation, mockInvitation], token: 'token1234', success: true });
    });
  });

  describe('findAllByItem', () => {
    test('should fail to find the invitations if requester_id  or item_id are missing', async () => {
      req.query = { requester_id: '', item_id: 'test1234' };

      invitationsController.findAllByItem(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing item_id or requester_id", success: false });

      req.query = { requester_id: 'admin1234', item_id: '' };

      invitationsController.findAllByItem(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing item_id or requester_id", success: false });
    });

    test('should fail to find the invitations if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', item_id: 'test1234' };
      mockRepository.findAllByItem = jest.fn().mockResolvedValue([]);

      const response = invitationsController.findAllByItem(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find invitations', success: false });
    });

    test('should find all the invitations successfully when requester_id and item_id are present and the repository layer returns a truthy value', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      };
      req.query = { requester_id: 'admin456', item_id: 'test1234' };
      mockRepository.findAllByItem = jest.fn().mockReturnValue([mockInvitation, mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.findAllByItem(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitations fetched correctly", invitations: [mockInvitation, mockInvitation], token: 'token1234', success: true });
    });
  });

  describe('findAllByAdmin', () => {
    test('should fail to find the invitations if requester_id is missing', async () => {
      req.query = { requester_id: '', admin_id: 'admin1234' };

      invitationsController.findAllByAdmin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing admin_id or requester_id", success: false });

      req.query = { requester_id: 'admin1234', admin_id: '' };

      invitationsController.findAllByAdmin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing admin_id or requester_id", success: false });
    });

    test('should fail to find the invitations if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', admin_id: 'admin1234' };
      mockRepository.findAllByAdmin = jest.fn().mockResolvedValue([]);

      const response = invitationsController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find invitations', success: false });
    });

    test('should find all the invitations successfully when requester_id and admin_id are present and the repository layer returns a truthy value', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin456', admin_id: 'admin1234' };
      mockRepository.findAllByAdmin = jest.fn().mockReturnValue([mockInvitation, mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitations fetched correctly", invitations: [mockInvitation, mockInvitation], token: 'token1234', success: true });
    });
  });

  describe('update', () => {
    test('should fail to update the invitation if the requester_id or test_id are missing', () => {
      req.body = { 
        requester_id: 'admin1234', 
        invitation_id: '   ', 
        item_id: 'workspace1234', 
        admin_id: 'admin1234', 
        guest_id: 'guest1234', 
        type: 'test',
        status: 'accepted', 
      };

      invitationsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or invitation_id are missing', success: false });

      req.body = { 
        requester_id: '   ', 
        invitation_id: 'invitation1234', 
        item_id: 'workspace1234', 
        admin_id: 'admin1234', 
        guest_id: 'guest1234', 
        type: 'test',
        status: 'accepted', 
      };

      invitationsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or invitation_id are missing', success: false });
    });

    test('should fail to update the test if the response from the repository layer is falsy', async () => {
      req.body = { 
        requester_id: 'admin1234', 
        invitation_id: 'invitation1234', 
        item_id: 'workspace1234', 
        admin_id: 'admin1234', 
        guest_id: 'guest1234', 
        type: 'test',
        status: 'accepted', 
      };
      mockRepository.update = jest.fn().mockResolvedValue([]);

      const response = invitationsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update invitation", success: false });
    });

    test('should update the invitation successfully if the response from the repository layer is truthy', async () => {
      const mockInvitation: Invitation = { 
        id: '1',
        invitation_id: 'invitation1234',
        item_id: 'test1234',
        admin_id: 'admin1234',
        guest_id: 'workspace1234',
        type: 'test',
        status: 'pending',
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { 
        requester_id: 'admin1234', 
        invitation_id: 'invitation1234', 
        item_id: 'workspace1234', 
        admin_id: 'admin1234', 
        guest_id: 'guest1234', 
        type: 'test',
        status: 'accepted', 
      };
      mockRepository.update = jest.fn().mockResolvedValue([mockInvitation]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitation updated successfully", invitation: mockInvitation, token: 'token1234', success: true });
    });
  });

  describe('delete', () => {
    test('should not delete the invitation if requester_id or invitation_id are missing', () => {
      req.body = { requester_id: 'admin1234', invitation_id: '  ' };

      invitationsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or invitation_id are missing', success: false });

      req.body = { requester_id: '   ', invitation_id: 'invitation1234' };

      invitationsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or invitation_id are missing', success: false });
    });

    test('should fail to delete the test if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', invitation_id: 'invitation1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(false);

      const response = invitationsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete invitation", success: false });
    });

    test('should delete the invitation successfully if the response from the repository layer is truthy', async () => {
      req.body = { requester_id: 'admin1234', invitation_id: 'invitation1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(true);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = invitationsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitation deleted successfully", token: 'token1234', success: true });
    });
  });

});

