import { WorkspacesRepository } from "@src/repositories/WorkspacesRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { Workspace } from "@src/types/Workspace";

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

jest.mock('knex');

describe('WorkspacesRepository', () => {

  let mockDb: Knex<any, any[]>;
  let repository: WorkspacesRepository;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    
    repository = new WorkspacesRepository(mockDb);
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should interact with the correct table', () => {
    expect(repository.table).toBe('workspaces');
  });

  describe('create', () => {
    test('should not call the methods to create a workspace', async () => {
      const response1: false | Workspace[] = await repository.create('', '');
      const response2: false | Workspace[] = await repository.create('admin1234', '');
      const response3: false | Workspace[] = await repository.create('', 'MyWorkspace');
  
      expect(response1).toBe(false);
      expect(response2).toBe(false);
      expect(response3).toBe(false);
      expect(generateUniqueId).toHaveBeenCalledTimes(0);
      expect(mockDb.insert).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to create a workspace', async () => {
      const response: false | Workspace[] = await repository.create('admin1234', 'MyWorkspace');
  
      expect(response).not.toBe(false);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(generateUniqueId).toHaveBeenCalledTimes(1);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneByName, findOneById', () => {
    test('should not call the methods to find a workspace', async () => {
      let response: false | Workspace[] = await repository.findOneByName('');

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

    test('should call the methods to find a workspace', async () => {
      let response: false | Workspace[] = await repository.findOneByName('MyWorkspace');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);

      response = await repository.findOneById('workspace1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.from).toHaveBeenCalledTimes(2);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    test('should call the methods to find all workspaces', async () => {
      const response: false | Workspace[] = await repository.findAll();

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllByAdmin', () => {
    test('should not call the methods to find all workspaces of an admin', async () => {
      const response: false | Workspace[] = await repository.findAllByAdmin('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find all workspaces of an admin', async () => {
      const response: false | Workspace[] = await repository.findAllByAdmin('admin1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    test('should not call the methods to update a workspace', async () => {
      let response: false | Workspace[] = await repository.update('', 'admin5678', 'MyWorkspace2', ['guest1234', 'guest5678'], ['test1234', 'test5678']);
  
      expect(response).toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);

      response = await repository.update('admin1234', '', '', [], []);
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to update a workspace', async () => {
      let response: false | Workspace[] = await repository.update('workspace1234', 'admin5678', '', [], []);
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      response = await repository.update('workspace1234', 'admin91011', 'MyWorkspace2', ['guest1234', 'guest5678'], ['test1234', 'test5678']);

      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(5);
    });
  });

  describe('delete', () => {
    test('should not call the methods to delete a workspace', async () => {
      const response: boolean = await repository.delete('');
  
      expect(response).toBe(false);
      expect(mockDb.del).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to delete a workspace', async () => {
      const response: boolean = await repository.delete('workspace1234');
  
      expect(response).toBe(true);
      expect(mockDb.del).toHaveBeenCalledTimes(1);
    });
  });

});