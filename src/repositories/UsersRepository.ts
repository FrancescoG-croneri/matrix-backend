import generateUniqueId from 'generate-unique-id';
import { type Knex } from 'knex';
import { UsersRepositoryInterface } from '../types/UsersRepositoryInterface';

export class UsersRepository implements UsersRepositoryInterface {
  private db: Knex;
  public table: string;

  constructor(db: Knex) {
    this.db = db;
    this.table = 'users';
  }

  public async create(email: string, password: string, role: string) {
    try {
      if (!email || !password || !role) throw new Error('Missing email, password or role');

      const user_id: string = role + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ user_id, email, password, role });
      
      return await this.findOneByEmail(email);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneByEmail(email: string) {
    try {
      if (!email) throw new Error("Missing email");

      return await this.db.select().from(this.table).where('email', email);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneById(user_id: string) {
    try {
      if (!user_id) throw new Error("Missing user_id");
      
      return await this.db.select().from(this.table).where('user_id', user_id); 
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findAll() {
    try {
      return await this.db.select().from(this.table);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async update(user_id: string, email = '', password = '', role = '') {
    try {
      if (!user_id) throw new Error('Missing user_id');

      // Update the individual fields
      if (email) await this.db(this.table).where('user_id', user_id).update('email', email);
      if (password) await this.db(this.table).where('user_id', user_id).update('password', password);
      if (role) await this.db(this.table).where('user_id', user_id).update('role', role);
   
      return await this.findOneById(user_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async delete(user_id: string) {
    try {
      if (!user_id) throw new Error('Missing user_id');

      await this.db(this.table).where('user_id', user_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};