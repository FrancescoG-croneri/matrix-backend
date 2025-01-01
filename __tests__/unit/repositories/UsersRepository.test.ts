import { UsersRepository } from "@src/repositories/UsersRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { User } from "@src/types/users/User";

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

jest.mock('knex');

describe('UsersRepository', () => {

  let mockDb: Knex<any, any[]>;
  let repository: UsersRepository;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    
    repository = new UsersRepository(mockDb);
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should interact with the correct table', () => {
    expect(repository.table).toBe('users');
  });

  describe('create', () => {
    test('should not call the methods to create a user', async () => {
      const response1: false | User[] = await repository.create('', '', '');
      const response2: false | User[] = await repository.create('email@example.com', '', '');
      const response3: false | User[] = await repository.create('', '123', '');
      const response4: false | User[] = await repository.create('', '', 'admin');
  
      expect(response1).toBe(false);
      expect(response2).toBe(false);
      expect(response3).toBe(false);
      expect(response4).toBe(false);
      expect(generateUniqueId).toHaveBeenCalledTimes(0);
      expect(mockDb.insert).toHaveBeenCalledTimes(0);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to create a user', async () => {
      const response: false | User[] = await repository.create('email@example.com', '123', 'admin');
  
      expect(response).not.toBe(false);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneByEmail, findOneById', () => {
    test('should not call the methods to find a user', async () => {
      let response: false | User[] = await repository.findOneByEmail('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);

      response = await repository.findOneById('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find a user', async () => {
      let response: false | User[] = await repository.findOneByEmail('email@example.com');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);

      response = await repository.findOneById('admin1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.from).toHaveBeenCalledTimes(2);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    test('should call the methods to find all users', async () => {
      const response: false | User[] = await repository.findAll();

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    test('should return false when it fails', async () => {
      mockDb.select = jest.fn().mockResolvedValue(false);
      const response: false | User[] = await repository.findAll();

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  });

  describe('update', () => {
    test('should not call the methods to update a user', async () => {
      let response: false | User[] = await repository.update('', 'email@example.com', '123', 'admin');
  
      expect(response).toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);

      response = await repository.update('admin1234');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to update a user', async () => {
      let response: false | User[] = await repository.update('admin1234', 'email@example.com', '', '');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      response = await repository.update('admin1234', '', '123', 'admin');

      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('delete', () => {
    test('should not call the methods to delete a user', async () => {
      const response: boolean = await repository.delete('');
  
      expect(response).toBe(false);
      expect(mockDb.del).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to delete a user', async () => {
      const response: boolean = await repository.delete('admin1234');
  
      expect(response).toBe(true);
      expect(mockDb.del).toHaveBeenCalledTimes(1);
    });
  });

});