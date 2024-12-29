import { UsersRepository } from "@src/repositories/UsersRepository";
import { type Knex } from "knex";
import generateUniqueId from "generate-unique-id";
import { User } from "@src/types/User";

jest.mock('generate-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('1234')
}));

describe('UsersRepository', () => {

  let mockDb: jest.Mocked<Knex<any, any[]>>;
  let repository: UsersRepository;

  beforeEach(() => {
    global.console.error = jest.fn();
    mockDb = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(true),
      from: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Knex<any, any[]>>;
  });

  test('should not create a user', async () => {
    repository = new UsersRepository(mockDb);

    const response: false | User[] = await repository.create('email@exmaple.com', '123', '');

    expect(response).toBe(false);
    expect(generateUniqueId).toHaveBeenCalledTimes(0);
  });

});