import UsersController from "@src/controllers/users";
import { UsersRepository } from "@src/repositories/UsersRepository";
import { type Knex } from "knex";
import { type Request, type Response } from 'express';
import { type UsersControllerInterface } from "@src/types/UsersControllerInterface";
import { type User } from "@src/types/User";
import TokenHandler from "@src/utils/tokenHandler";
import { TokenHandlerInterface } from "@src/types/TokenHandlerInterface";
import bcrypt from 'bcrypt';

describe('UsersController', () => {

  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRepository: jest.Mocked<UsersRepository>;
  let mockDb: Knex<any, any[]>;
  let mockTokenHandler: jest.Mocked<TokenHandlerInterface>;
  let usersController: UsersControllerInterface;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();

    mockRepository = new UsersRepository(mockDb) as jest.Mocked<UsersRepository>;
    mockTokenHandler = new TokenHandler() as jest.Mocked<TokenHandlerInterface>;
    usersController = new UsersController(mockRepository, mockTokenHandler);

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
    test('should not create a user if any of the required data for creation is missing', async () => {
      // No email
      req.body = { email: '', password: '123', role: 'admin' };
      usersController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password, Email or Role are missing', success: false });

      // No password
      req.body = { email: 'email@croneri.co.uk', password: '', role: 'admin' };
      usersController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password, Email or Role are missing', success: false });

      // No role
      req.body = { email: 'email@croneri.co.uk', password: '123', role: '' };
      usersController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password, Email or Role are missing', success: false });
    });

    test('should not create a user if the user\'s email does not belong to Croneri', () => {
      req.body = { email: 'email@example.com', password: '123', role: 'admin' };
      usersController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'You should be joining only if you are part of the right organisation', success: false });
    });

    test('should not create a user if the user\'s email is invalid', () => {
      req.body = { email: 'email.croneri.co.uk', password: '123', role: 'admin' };
      usersController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email invalid', success: false });
    });

    test('should not create a user if the user already exists', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'existing123',
        email: 'existing@croner.com',
        password: 'hashedpassword',
        role: 'admin',
        created_at: 'today',
        updated_at: 'today',
      }
      req.body = { email: 'existing@croner.com', password: 'hashedpassword', role: 'admin' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue([mockUser]);
      usersController = new UsersController(mockRepository, mockTokenHandler);

      const response = usersController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'This user already exists', success: false });
    });

    test('should not create a user if the response from the repository layer is falsy', async () => {
      req.body = { email: 'existing@croner.com', password: 'hashedpassword', role: 'admin' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue(false);
      usersController = new UsersController(mockRepository, mockTokenHandler);

      const response = usersController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong during the user\'s creation', success: false });
    });

    test('should create a user when the details are complete, unique and in the right format', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'admin123',
        email: 'admin@croner.com',
        password: 'hashedpassword',
        role: 'admin',
        created_at: 'today',
        updated_at: 'today',
      };
      req.body = { email: 'admin@croner.com', password: 'hashedpassword', role: 'admin' };
      mockRepository.create = jest.fn().mockReturnValue([mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      usersController = new UsersController(mockRepository, mockTokenHandler);

      const response = usersController.create(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', user: mockUser, token: 'token1234', success: true });
    });
  });

  describe('authenticate', () => {
    test('should not authenticate a user if any of the required parameters is missing', async () => {
      req.body = { email: 'email@croneri.co.uk', password: '   ' };

      usersController.authenticate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email, Password are missing', success: false });
    });

    test('should not authenticate a user if the response from the repository layer is falsy', async () => {
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue(false);
      req.body = { email: 'email@croneri.co.uk', password: '123' };

      const response = usersController.authenticate(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find user', success: false });
    });

    test('should not authenticate the user if the passwords do not match', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'admin123',
        email: 'admin@croner.com',
        password: 'hashedpassword',
        role: 'admin',
        created_at: 'today',
        updated_at: 'today',
      };
      req.body = { email: 'email@croneri.co.uk', password: '123' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue([mockUser]);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = usersController.authenticate(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match', success: false });
    });

    test('should authenticate the user if the data is complete, the user exists and passwords match', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'guest123',
        email: 'guest@croner.com',
        password: 'password',
        role: 'guest',
        created_at: 'today',
        updated_at: 'today',
      };
      req.body = { email: 'guest@croner.com', password: 'password' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue([mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = usersController.authenticate(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Authentication successful", user: mockUser, token: 'token1234', success: true });
    });
  });

  describe('findOneByEmail', () => {
    test('should fail to find a user if email or requester_id are missing', () => {
      req.query = { requester_id: 'admin1234', email: '' };
      usersController.findOneByEmail(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or email', success: false });

      req.query = { requester_id: '', email: 'guest@croner.com' };
      usersController.findOneByEmail(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing requester_id or email', success: false });
    });

    test('should fail to find a user if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234', email: 'guest@croner.com' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue(false);

      const response = usersController.findOneByEmail(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find user', success: false });
    });

    test('should find a user if the input data is complete and the repository layer returns a truthy response', async () => {
      const mockUser: User = {
        id: '1', 
        user_id: 'guest123',
        email: 'guest@croner.com',
        password: 'password',
        role: 'guest',
        created_at: 'today',
        updated_at: 'today',
      };
      req.query = { requester_id: 'admin1234', email: 'guest@croner.com' };
      mockRepository.findOneByEmail = jest.fn().mockResolvedValue([mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = usersController.findOneByEmail(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User found successfully", user: mockUser, token: 'token1234', success: true });
    });
  });

  describe('findOneById', () => {
    test('should fail to find a user if user_id or requester_id are missing', () => {
      req.query = { requester_id: 'admin1234', user_id: '' };
      usersController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing user_id or requester_id', success: false });

      req.query = { requester_id: '', user_id: 'guest1234' };
      usersController.findOneById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing user_id or requester_id', success: false });
    });

    test('should fail to find a user if the response from the repository layer is falsy', async () => {
      mockRepository.findOneById = jest.fn().mockResolvedValue(false);
      req.query = { requester_id: 'admin1234', user_id: 'guest1234' };

      const response = usersController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find user', success: false });
    });

    test('should find a user if the data is complete and the repository layer returns a truthy response', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'guest123',
        email: 'guest@croner.com',
        password: 'password',
        role: 'guest',
        created_at: 'today',
        updated_at: 'today',
      };
      req.query = { requester_id: 'admin1234', user_id: 'guest123' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');
      
      const response = usersController.findOneById(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User found successfully", user: mockUser, token: 'token1234', success: true });
    });
  });

  describe('findAll', () => {
    test('should fail to find the users if requester_id is missing', async () => {
      req.query = { requester_id: '' };

      usersController.findAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id is missing', success: false });
    });

    test('should fail to find the users if the response from the repository layer is falsy', async () => {
      req.query = { requester_id: 'admin1234' };
      mockRepository.findOneById = jest.fn().mockResolvedValue([]);

      const response = usersController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to find users', success: false });
    });

    test('should find all the users successfully when requester_id is present and the repository layer returns a truthy value', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'guest1234',
        email: 'guest@croner.com',
        password: 'password',
        role: 'guest',
        created_at: 'today',
        updated_at: 'today',
      };

      req.query = { requester_id: 'admin1234' };
      mockRepository.findAll = jest.fn().mockReturnValue([mockUser, mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = usersController.findAll(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Users fetched correctly", users: [mockUser, mockUser], token: 'token1234', success: true });
    });
  });

  describe('update', () => {
    test('should fail to update the user if the requester_id or user_id are missing', () => {
      req.body = { requester_id: 'admin123', user_id: '', email: 'newEmail@example.com', password: '579', role: 'guest' };

      usersController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or user_id are missing', success: false });

      req.body = { requester_id: '', user_id: 'guest123', email: 'newEmail@example.com', password: '579', role: 'guest' };

      usersController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'requester_id or user_id are missing', success: false });
    });

    test('should fail to update the user if the response from the repository layer is falsy', async () => {
      req.body = { requester_id: 'admin1234', user_id: 'guest1234', email: 'newEmail@example.com', password: '579', role: 'guest' };
      mockRepository.update = jest.fn().mockResolvedValue([]);

      const response = usersController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update user", success: false });
    });

    test('should update the user successfully if the response from the repository layer is truthy', async () => {
      const mockUser: User = { 
        id: '1',
        user_id: 'guest1234',
        email: 'guest@croner.com',
        password: 'password',
        role: 'guest',
        created_at: 'today',
        updated_at: 'today',
      };

      req.body = { requester_id: 'admin1234', user_id: 'guest1234', email: 'guest@croner.com', password: 'password', role: 'guest' };
      mockRepository.update = jest.fn().mockResolvedValue([mockUser]);
      mockTokenHandler.generateToken = jest.fn().mockReturnValue('token1234');

      const response = usersController.update(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User updated successfully", user: mockUser, token: 'token1234', success: true });
    });
  });

  describe('delete', () => {
    test('should not delete the user if the user_id is missing', () => {
      req.body = { user_id: '   ' };

      usersController.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'user_id is missing', success: false });
    });

    test('should fail to delete the user if the response from the repository layer is falsy', async () => {
      req.body = { user_id: 'guest1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(false);

      const response = usersController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete user", success: false });
    });

    test('should delete the user successfully if the response from the repository layer is truthy', async () => {
      req.body = { user_id: 'guest1234' };
      mockRepository.delete = jest.fn().mockResolvedValue(true);

      const response = usersController.delete(req as Request, res as Response);
      await Promise.resolve(response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully", success: true });
    });
  });
  
});
