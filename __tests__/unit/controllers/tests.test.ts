import TestsController from "@src/controllers/tests";
import { TestsRepository } from "@src/repositories/TestsRepository";
import { type Knex } from "knex";
import { type Request, type Response } from 'express';
import { type TestsControllerInterface } from "@src/types/TestsControllerInterface";
import { type Test } from "@src/types/Test";
import TokenHandler from "@src/utils/tokenHandler";
import { TokenHandlerInterface } from "@src/types/TokenHandlerInterface";

describe('TestsController', () => {
  
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRepository: jest.Mocked<TestsRepository>;
  let mockDb: Knex<any, any[]>;
  let mockTokenHandler: jest.Mocked<TokenHandlerInterface>;
  let testsController: TestsControllerInterface;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();

    mockRepository = new TestsRepository(mockDb) as jest.Mocked<TestsRepository>;
    mockTokenHandler = new TokenHandler() as jest.Mocked<TokenHandlerInterface>;
    testsController = new TestsController(mockRepository, mockTokenHandler);

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
      { requester_id: '', admin_id: 'admin1234', workspace_id: 'workspace1234', subjects: ['PHP', 'javascript'], missing: 'requester_id' },
      { requester_id: 'admin1234', admin_id: '', workspace_id: 'workspace1234', subjects: ['PHP', 'javascript'], missing: 'admin_id' },
      { requester_id: 'admin1234', admin_id: 'admin1234', workspace_id: '', subjects: ['PHP', 'javascript'], missing: 'workspace_id' },
      { requester_id: 'admin1234', admin_id: 'admin1234', workspace_id: 'workspace1234', subjects: [], missing: 'subjects' },
    ].forEach(mockRequestBody => {
      test(`should not create a test if ${mockRequestBody.missing} is missing`, async () => {
        req.body = mockRequestBody;
        testsController.create(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'requester_id, admin_id, workspace_id or Subjects are missing', success: false });
      });
    })

    test('should not create a test if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', admin_id: 'admin1234', workspace_id: 'workspace1234', subjects: ['PHP', 'javascript'] };
      mockRepository.create = jest.fn().mockResolvedValue([]);
      testsController = new TestsController(mockRepository, mockTokenHandler);

      const response = testsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong with your test creation', success: false });
    });

    test('should create a test if input data is complete and the response from the repository layer is truthy', async () => {
      const mockTest: Test = { 
        id: '1',
        test_id: 'test1234',
        admin_id: 'admin1234',
        workspace_id: 'workspace1234',
        subjects: ['PHP', 'javascript'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { requester_id: 'admin1234', admin_id: 'admin1234', workspace_id: 'workspace1234', subjects: ['PHP', 'javascript'] };
      mockRepository.create = jest.fn().mockReturnValue([mockTest]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      testsController = new TestsController(mockRepository, mockTokenHandler);

      const response = testsController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Test created successfully', test: mockTest, token: 'token1234', success: true });
    });
  });

  describe('findOneById', () => {
    test('should fail to find a test if requester_id or test_id are missing', () => {
      req.query = { requester_id: 'admin1234', test_id: '' };
      testsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or test_id', success: false });

      req.query = { requester_id: '', test_id: 'test1234' };
      testsController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or test_id', success: false });
    });

    test('should fail to find a test if the response from the repository layer is falsy', async () => {
      mockRepository.findOneById = jest.fn().mockResolvedValue([]);
      req.query = { requester_id: 'admin1234', test_id: 'test1234' };

      const response = testsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find test', success: false });
    });

    test('should find a test if the data is complete and the repository layer returns a truthy response', async () => {
      const mockTest: Test = { 
        id: '1',
        test_id: 'test1234',
        admin_id: 'admin1234',
        workspace_id: 'workspace1234',
        subjects: ['PHP', 'javascript'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234', test_id: 'test1234' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([mockTest]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      
      const response = testsController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Test found successfully", test: mockTest, token: 'token1234', success: true });
    });
  });

  describe('findAll', () => {
    test('should fail to find the tests if requester_id is missing', async () => {
      req.query = { requester_id: '' };

      testsController.findAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id', success: false });
    });

    test('should fail to find the tests if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockResolvedValue([]);

      const response = testsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find tests', success: false });
    });

    test('should find all the tests successfully when requester_id is present and the repository layer returns a truthy value', async () => {
      const mockTest: Test = { 
        id: '1',
        test_id: 'test1234',
        admin_id: 'admin1234',
        workspace_id: 'workspace1234',
        subjects: ['PHP', 'javascript'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockReturnValue([mockTest, mockTest]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = testsController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Tests fetched correctly", tests: [mockTest, mockTest], token: 'token1234', success: true });
    });
  });

  describe('findAllByAdmin', () => {
    test('should fail to find the tests if requester_id is missing', async () => {
      req.query = { requester_id: '', admin_id: 'admin1234' };

      testsController.findAllByAdmin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing admin_id or requester_id", success: false });

      req.query = { requester_id: 'admin1234', admin_id: '' };

      testsController.findAllByAdmin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing admin_id or requester_id", success: false });
    });

    test('should fail to find the tests if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', admin_id: 'admin1234' };
      mockRepository.findAllByAdmin = jest.fn().mockResolvedValue([]);

      const response = testsController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find tests', success: false });
    });

    test('should find all the tests successfully when requester_id and admin_id are present and the repository layer returns a truthy value', async () => {
      const mockTest: Test = { 
        id: '1',
        test_id: 'test1234',
        admin_id: 'admin1234',
        workspace_id: 'workspace1234',
        subjects: ['PHP', 'javascript'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.query = { requester_id: 'admin456', admin_id: 'admin1234' };
      mockRepository.findAllByAdmin = jest.fn().mockReturnValue([mockTest, mockTest]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = testsController.findAllByAdmin(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Tests fetched correctly", tests: [mockTest, mockTest], token: 'token1234', success: true });
    });
  });

  describe('update', () => {
    test('should fail to update the test if the requester_id or test_id are missing', () => {
      req.body = { 
        requester_id: 'admin1234', 
        test_id: '   ', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };

      testsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or test_id are missing', success: false });

      req.body = { 
        requester_id: '   ', 
        test_id: 'test1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };

      testsController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or test_id are missing', success: false });
    });

    test('should fail to update the test if the response from the repository layer is falsy', async () => {
      req.body = { 
        requester_id: 'admin1234', 
        test_id: 'test1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123'], 
        test_ids: ['test123'] 
      };
      mockRepository.update = jest.fn().mockResolvedValue([]);

      const response = testsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update test", success: false });
    });

    test('should update the test successfully if the response from the repository layer is truthy', async () => {
      const mockTest: Test = { 
        id: '1',
        test_id: 'test1234',
        admin_id: 'admin1234',
        workspace_id: 'workspace1234',
        subjects: ['PHP', 'javascript'],
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { 
        requester_id: 'admin1234', 
        test_id: 'test1234', 
        admin_id: 'admin1234', 
        name: 'MyWorkspace1', 
        guest_ids: ['guest123', 'guest456'], 
        test_ids: ['test123', 'test456'] 
      };
      mockRepository.update = jest.fn().mockResolvedValue([mockTest]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = testsController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Test updated successfully", test: mockTest, token: 'token1234', success: true });
    });
  });

  describe('delete', () => {
    test('should not delete the test if requester_id or test_id are missing', () => {
      req.body = { requester_id: 'admin1234', test_id: '  ' };

      testsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or test_id are missing', success: false });

      req.body = { requester_id: '   ', test_id: 'test1234' };

      testsController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or test_id are missing', success: false });
    });

    test('should fail to delete the test if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', test_id: 'test1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(false);

      const response = testsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete test", success: false });
    });

    test('should delete the user successfully if the response from the repository layer is truthy', async () => {
      req.body = { requester_id: 'admin1234', test_id: 'test1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(true);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = testsController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Test deleted successfully", token: 'token1234', success: true });
    });
  });

});

