import generateUniqueId from 'generate-unique-id';
import { type Knex } from 'knex';
import { type TestsRepositoryInterface } from '../types/tests/TestsRepositoryInterface';

export class TestsRepository implements TestsRepositoryInterface {

  private db: Knex;
  public table: string;

  constructor(db: Knex) {
    this.db = db;
    this.table = 'tests';
  }

  public async create(admin_id: string, workspace_id: string, subjects: string[]) {
    try {
      if (!admin_id || !workspace_id || subjects.length === 0) throw new Error('Missing details');

      const test_id: string = 'test' + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ test_id, admin_id, workspace_id, subjects });
      
      return await this.findOneById(test_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneById(test_id: string) {
    try {
      if (!test_id) throw new Error('Missing test_id');

      return await this.db.select().from(this.table).where('test_id', test_id);
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

  public async findAllByAdmin(admin_id: string) {
    try {
      if (!admin_id) throw new Error('Missing admin_id');

      return await this.db.select().from(this.table).where('admin_id', admin_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findAllByWorkspace(workspace_id: string) {
    try {
      if (!workspace_id) throw new Error("Missing workspace_id");

      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async update(test_id: string, admin_id: string = '', workspace_id: string = '', subjects: string[] = []) {
    try {
      if (!test_id) throw new Error('Missing test_id');

      // Update the individual fields
      if (admin_id) await this.db(this.table).where('test_id', test_id).update('admin_id', admin_id);
      if (workspace_id) await this.db(this.table).where('test_id', test_id).update('workspace_id', workspace_id);
      if (subjects.length !== 0) await this.db(this.table).where('test_id', test_id).update('subjects', subjects);
      
      return await this.findOneById(test_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async delete(test_id: string) {
    try {
      if (!test_id) throw new Error('Missing test_id');

      await this.db(this.table).where('test_id', test_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
