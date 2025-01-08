import { InvitationsRepository } from "@src/repositories/InvitationsRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { type Invitation } from "@src/types/invitations/Invitation";

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

jest.mock('knex');

describe('InvitationsRepository', () => {

  let mockDb: Knex<any, any[]>;
  let repository: InvitationsRepository;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb) as unknown as Knex;
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.update = jest.fn().mockReturnThis();
    mockDb.del = jest.fn().mockReturnThis();
    
    repository = new InvitationsRepository(mockDb);
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should interact with the correct table', () => {
    expect(repository.table).toBe('invitations');
  });

  describe('create', () => {
    test('should not call the methods to create an invitation', async () => {
      const response1: false | Invitation[] = await repository.create('', '', '', '');
      const response2: false | Invitation[] = await repository.create('workspace1234', 'admin1234', 'guest1234', '');
      const response3: false | Invitation[] = await repository.create('test1234', '', 'guest1234', 'test');
      const response4: false | Invitation[] = await repository.create('workspace1234', 'admin1234', '', 'workspace');
      const response5: false | Invitation[] = await repository.create('', 'admin1234', 'guest1234', 'test');
  
      expect(response1).toBe(false);
      expect(response2).toBe(false);
      expect(response3).toBe(false);
      expect(response4).toBe(false);
      expect(response5).toBe(false);
      expect(generateUniqueId).toHaveBeenCalledTimes(0);
      expect(mockDb.insert).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to create an invitation', async () => {
      const response: false | Invitation[] = await repository.create('workspace1234', 'admin1234', 'guest1234', 'workspace');
  
      expect(response).not.toBe(false);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(generateUniqueId).toHaveBeenCalledTimes(1);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneById', () => {
    test('should not call the methods to find an invitation', async () => {
      let response: false | Invitation[] = await repository.findOneById('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find an invitation', async () => {
      let response: false | Invitation[] = await repository.findOneById('invitation1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    test('should call the methods to find all invitations', async () => {
      const response: false | Invitation[] = await repository.findAll();

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    test('should return false when it fails', async () => {
      mockDb.select = jest.fn().mockResolvedValue(false);
      const response: false | Invitation[] = await repository.findAll();

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
    });
  });

  describe('findAllByGuest, findAllByItem, findAllByAdmin', () => {
    test('should not call the methods to find all invitations of an guest or an item or an admin', async () => {
      let response: false | Invitation[] = await repository.findAllByGuest('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);

      response = await repository.findAllByItem('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);

      response = await repository.findAllByAdmin('');

      expect(response).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(0);
      expect(mockDb.from).toHaveBeenCalledTimes(0);
      expect(mockDb.where).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to find all invitations of a guest or an item or an admin', async () => {
      let response: false | Invitation[] = await repository.findAllByGuest('guest1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);

      response = await repository.findAllByItem('test1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.from).toHaveBeenCalledTimes(2);
      expect(mockDb.where).toHaveBeenCalledTimes(2);

      response = await repository.findAllByAdmin('admin1234');

      expect(response).not.toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(3);
      expect(mockDb.from).toHaveBeenCalledTimes(3);
      expect(mockDb.where).toHaveBeenCalledTimes(3);
    });
  });

  describe('update', () => {
    test('should not call the methods to update an invitation', async () => {
      let response: false | Invitation[] = await repository.update('', 'workspace1234', 'admin5678', 'guest1234', 'workspace', 'accepted');
  
      expect(response).toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);

      response = await repository.update('invitation1234');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(0);
    });
  
    test('should call the methods to update an invitation', async () => {
      let response: false | Invitation[] = await repository.update('invitation1234', '', '', '', '', 'accepted');
  
      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      response = await repository.update('invitation1234', 'workspace1234', 'admin5678', 'guest1234', 'workspace', 'declined');

      expect(response).not.toBe(false);
      expect(mockDb.update).toHaveBeenCalledTimes(6);
    });
  });

  describe('delete', () => {
    test('should not call the methods to delete an invitation', async () => {
      const response: boolean = await repository.delete('');
  
      expect(response).toBe(false);
      expect(mockDb.del).toHaveBeenCalledTimes(0);
    });

    test('should call the methods to delete an invitation', async () => {
      const response: boolean = await repository.delete('invitation1234');
  
      expect(response).toBe(true);
      expect(mockDb.del).toHaveBeenCalledTimes(1);
    });
  });

});