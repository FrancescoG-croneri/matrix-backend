import { ColorsRepository } from "@src/repositories/ColorsRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { type Color } from '@src/types/colors/Color';

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

jest.mock('knex');

describe('ColorsRepository', () => {

  let mockDb: Knex<any, any[]>;
  let repository: ColorsRepository;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    
    repository = new ColorsRepository(mockDb);
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should interact with the correct table', () => {
    expect(repository.table).toBe('colors');
  });

  describe('create', () => {
    test('should not call the methods to create a color', async () => {
      const response1: false | Color[] = await repository.create('', '', '');
      const response2: false | Color[] = await repository.create('workspace1234', 'guest1234', '');
      const response3: false | Color[] = await repository.create('workspace1234', '', '#f0f0f0');
      const response4: false | Color[] = await repository.create('', 'guest1234', '#f0f0f0');
  
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
  
    test('should call the methods to create a color', async () => {
      const response: false | Color[] = await repository.create('workspace1234', 'guest1234', '#f0f0f0');
  
      expect(response).not.toBe(false);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(generateUniqueId).toHaveBeenCalledTimes(1);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneById', () => {
    test('should not call the methods to find a color', async () => {
      let response: false | Color[] = await repository.findOneById('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find a color', async () => {
      let response: false | Color[] = await repository.findOneById('color1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneByHex', () => {
    test('should not call the methods to find a color', async () => {
      let response: false | Color[] = await repository.findOneByHex('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find a color', async () => {
      let response: false | Color[] = await repository.findOneByHex('#f0f0f0');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    test('should call the methods to find all colors', async () => {
      const response: false | Color[] = await repository.findAll();

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    test('should return false when it fails', async () => {
      mockDb.select = jest.fn().mockResolvedValue(false);
      const response: false | Color[] = await repository.findAll();

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  });

  describe('findAllByWorkspace', () => {
    test('should not call the methods to find all colors of a workspace', async () => {
      const response: false | Color[] = await repository.findAllByWorkspace('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find all colors of a workspace', async () => {
      const response: false | Color[] = await repository.findAllByWorkspace('workspace1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    test('should not call the methods to update a color', async () => {
      let response: false | Color[] = await repository.update('', 'workspace1234', 'guest5678', '#f0f0f0');
  
      expect(response).toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);

      response = await repository.update('color1234');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to update a color', async () => {
      let response: false | Color[] = await repository.update('test1234', '', '', '#f0f0f0');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      response = await repository.update('test1234', 'workspace1234', 'guest5678', '#f0f0f0');

      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(4);
    });
  });

  describe('delete', () => {
    test('should not call the methods to delete a color', async () => {
      const response: boolean = await repository.delete('');
  
      expect(response).toBe(false);
      expect(mockDb.del).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to delete a color', async () => {
      const response: boolean = await repository.delete('color1234');
  
      expect(response).toBe(true);
      expect(mockDb.del).toHaveBeenCalledTimes(1);
    });
  });

});