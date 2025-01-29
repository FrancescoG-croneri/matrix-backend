import ColorsController from "@src/controllers/colors";
import { ColorsRepository } from "@src/repositories/ColorsRepository";
import { type Knex } from "knex";
import { type Request, type Response } from 'express';
import { type ColorsControllerInterface } from "@src/types/colors/ColorsControllerInterface";
import { type Color } from '@src/types/colors/Color';
import TokenHandler from "@src/utils/tokenHandler";
import { TokenHandlerInterface } from "@src/types/utils/TokenHandlerInterface";

describe('ColorsController', () => {
  
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRepository: jest.Mocked<ColorsRepository>;
  let mockDb: Knex<any, any[]>;
  let mockTokenHandler: jest.Mocked<TokenHandlerInterface>;
  let colorsController: ColorsControllerInterface;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    mockRepository = new ColorsRepository(mockDb) as jest.Mocked<ColorsRepository>;
    mockTokenHandler = new TokenHandler() as jest.Mocked<TokenHandlerInterface>;
    colorsController = new ColorsController(mockRepository, mockTokenHandler);

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
      { requester_id: '   ', workspace_id: 'workspace1234', hex: '#f0f0f0', missing: 'requester_id' },
      { requester_id: 'guest1234', workspace_id: '   ', guest_id: 'guest1234', hex: '#f0f0f0', missing: 'workspace_id' },
      { requester_id: 'guest1234', workspace_id: 'workspace1234', guest_id: '   ', hex: '#f0f0f0', missing: 'guest_id' },
      { requester_id: 'guest1234', workspace_id: 'workspace1234', guest_id: 'guest1234', hex: '   ', missing: 'hex' },
    ].forEach(mockRequestBody => {
      test(`should not create a color if ${mockRequestBody.missing} is missing`, async () => {
        req.body = mockRequestBody;
        colorsController.create(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'requester_id, workspace_id, guest_id or hex are missing', success: false });
      });
    })

    test('should not create a color if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'guest1234', workspace_id: 'workspace1234', guest_id: 'guest1234', hex: 'f0f0f0' };
      mockRepository.create = jest.fn().mockResolvedValue([]);
      colorsController = new ColorsController(mockRepository, mockTokenHandler);

      const response = colorsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong with your color creation', success: false });
    });

    test('should create a color if input data is complete and the response from the repository layer is truthy', async () => {
      const mockColor: Color = { 
        id: '1',
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { requester_id: 'admin1234', workspace_id: 'workspace1234', guest_id: 'guest1234', hex: '#f0f0f0' };
      mockRepository.create = jest.fn().mockReturnValue([mockColor]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      colorsController = new ColorsController(mockRepository, mockTokenHandler);

      const response = colorsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Color created successfully', color: mockColor, token: 'token1234', success: true });
    });
  });

  describe('findOneById', () => {
    test('should fail to find a color if requester_id or color_id are missing', () => {
      req.query = { requester_id: 'guest1234', color_id: '' };
      colorsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or color_id', success: false });

      req.query = { requester_id: '', color_id: 'color1234' };
      colorsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or color_id', success: false });
    });

    test('should fail to find a color if the response from the repository layer is falsy', async () => {
      mockRepository.findOneById = jest.fn().mockResolvedValue([]);
      req.query = { requester_id: 'admin1234', color_id: 'color1234' };

      const response = colorsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find color', success: false });
    });

    test('should find a color if the data is complete and the repository layer returns a truthy response', async () => {
      const mockColor: Color = { 
        id: '1',
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'guest1234', color_id: 'color1234' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([mockColor]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      
      const response = colorsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Color found successfully", color: mockColor, token: 'token1234', success: true });
    });
  });

  describe('findAll', () => {
    test('should fail to find the colors if requester_id is missing', async () => {
      req.query = { requester_id: '' };

      colorsController.findAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id', success: false });
    });

    test('should fail to find the colors if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockResolvedValue([]);

      const response = colorsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find colors', success: false });
    });

    test('should find all the colors successfully when requester_id is present and the repository layer returns a truthy value', async () => {
      const mockColor: Color = { 
        id: '1',
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockReturnValue([mockColor, mockColor]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = colorsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Colors fetched correctly", colors: [mockColor, mockColor], token: 'token1234', success: true });
    });
  });

  describe('findAllByWorkspace', () => {
    test('should fail to find the colors if requester_id is missing', async () => {
      req.query = { requester_id: '', workspace_id: 'workspace1234' };

      colorsController.findAllByWorkspace(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing workspace_id or requester_id", success: false });

      req.query = { requester_id: 'admin1234', admin_id: '' };

      colorsController.findAllByWorkspace(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing workspace_id or requester_id", success: false });
    });

    test('should fail to find the colors if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', workspace_id: 'workspace1234' };
      mockRepository.findAllByWorkspace = jest.fn().mockResolvedValue([]);

      const response = colorsController.findAllByWorkspace(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find colors', success: false });
    });

    test('should find all the colors successfully when requester_id and workspace_id are present and the repository layer returns a truthy value', async () => {
      const mockColor: Color = { 
        id: '1',
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin456', workspace_id: 'workspace1234' };
      mockRepository.findAllByWorkspace = jest.fn().mockReturnValue([mockColor, mockColor]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = colorsController.findAllByWorkspace(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Colors fetched correctly", colors: [mockColor, mockColor], token: 'token1234', success: true });
    });
  });

  describe('update', () => {
    test('should fail to update the color if the requester_id or color_id are missing', () => {
      req.body = { 
        requester_id: 'admin1234', 
        color_id: '   ',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
      };

      colorsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or color_id are missing', success: false });

      req.body = { 
        requester_id: '   ', 
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
      };

      colorsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or color_id are missing', success: false });
    });

    test('should fail to update the color if the response from the repository layer is falsy', async () => {
      req.body = { 
        requester_id: 'admin1234', 
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
      };
      mockRepository.update = jest.fn().mockResolvedValue([]);

      const response = colorsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update color", success: false });
    });

    test('should update the color successfully if the response from the repository layer is truthy', async () => {
      const mockColor: Color = { 
        id: '1',
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { 
        requester_id: 'admin1234', 
        color_id: 'color1234',
        workspace_id: 'workspace1234',
        guest_id: 'guest1234',
        hex: '#f0f0f0',
      };
      mockRepository.update = jest.fn().mockResolvedValue([mockColor]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = colorsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Color updated successfully", color: mockColor, token: 'token1234', success: true });
    });
  });

  describe('delete', () => {
    test('should not delete the color if requester_id or color_id are missing', () => {
      req.body = { requester_id: 'guest1234', color_id: '  ' };

      colorsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or color_id are missing', success: false });

      req.body = { requester_id: '   ', color_id: 'color1234' };

      colorsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or color_id are missing', success: false });
    });

    test('should fail to delete the color if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'guest1234', color_id: 'color1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(false);

      const response = colorsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete color", success: false });
    });

    test('should delete the color successfully if the response from the repository layer is truthy', async () => {
      req.body = { requester_id: 'guest1234', color_id: 'color1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(true);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = colorsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Color deleted successfully", token: 'token1234', success: true });
    });
  });

});
