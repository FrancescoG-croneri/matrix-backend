import { type Knex } from "knex";
import { type User } from "./User";

export interface UsersRepositoryInterface {
  table: string,
  create: (email: string, password: string, role: string) => Promise<false | User[]>,
  findOneByEmail: (email: string) => Promise<false | User[]>,
  findOneById: (user_id: string) => Promise<false | User[]>,
  findAll: () => Promise<false | User[]>,
  update: (user_id: string, email: string, password: string, role: string) => Promise<false | User[]>,
  delete: (user_id: string) => Promise<boolean>
};
