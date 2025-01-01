import { TestsRepository } from "@src/repositories/TestsRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { type Test } from "@src/types/tests/Test";

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

jest.mock('knex');

describe('TestsRepository', () => {

  let mockDb: Knex<any, any[]>;
  let repository: TestsRepository;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    
    repository = new TestsRepository(mockDb);
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should interact with the correct table', () => {
    expect(repository.table).toBe('tests');
  });

  describe('create', () => {
    test('should not call the methods to create a test', async () => {
      const response1: false | Test[] = await repository.create('', '', []);
      const response2: false | Test[] = await repository.create('admin1234', 'workspace1234', []);
      const response3: false | Test[] = await repository.create('admin1234', '', ['PHP', 'Javascript']);
      const response4: false | Test[] = await repository.create('', 'workspace1234', ['PHP', 'Javascript']);
  
      expect(response1).toBe(false);
      expect(response2).toBe(false);
      expect(response3).toBe(false);
      expect(response4).toBe(false);
      expect(generateUniqueId).toHaveBeenCalledTimes(0);
      expect(mockDb.insert).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to create a test', async () => {
      const response: false | Test[] = await repository.create('admin1234', 'workspace1234', ['PHP', 'Javascript']);
  
      expect(response).not.toBe(false);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(generateUniqueId).toHaveBeenCalledTimes(1);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneById', () => {
    test('should not call the methods to find a test', async () => {
      let response: false | Test[] = await repository.findOneById('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find a test', async () => {
      let response: false | Test[] = await repository.findOneById('test1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    test('should call the methods to find all tests', async () => {
      const response: false | Test[] = await repository.findAll();

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    test('should return false when it fails', async () => {
      mockDb.select = jest.fn().mockResolvedValue(false);
      const response: false | Test[] = await repository.findAll();

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  });

  describe('findAllByAdmin, findAllByWorkspace', () => {
    test('should not call the methods to find all tests of an admin', async () => {
      let response: false | Test[] = await repository.findAllByAdmin('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);

      response = await repository.findAllByWorkspace('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find all tests of an admin', async () => {
      let response: false | Test[] = await repository.findAllByAdmin('admin1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);

      response = await repository.findAllByWorkspace('workspace1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.from).toHaveBeenCalledTimes(2);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    test('should not call the methods to update a test', async () => {
      let response: false | Test[] = await repository.update('', 'admin5678', 'workspace1234', ['PHP', 'Javascript']);
  
      expect(response).toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);

      response = await repository.update('test1234');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to update a test', async () => {
      let response: false | Test[] = await repository.update('test1234', 'admin5678', '', []);
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      response = await repository.update('test1234', 'admin91011', 'MyWorkspace2', ['PHP', 'Javascript']);

      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(4);
    });
  });

  describe('delete', () => {
    test('should not call the methods to delete a test', async () => {
      const response: boolean = await repository.delete('');
  
      expect(response).toBe(false);
      expect(mockDb.del).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to delete a test', async () => {
      const response: boolean = await repository.delete('test1234');
  
      expect(response).toBe(true);
      expect(mockDb.del).toHaveBeenCalledTimes(1);
    });
  });

});