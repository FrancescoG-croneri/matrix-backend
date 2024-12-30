import generateUniqueId from 'generate-unique-id';
import { type Knex } from 'knex';
import { type WorkspacesRepositoryInterface } from '../types/WorkspacesRepositoryInterface';

export class WorkspacesRepository implements WorkspacesRepositoryInterface {

  private db: Knex;
  public table: string;

  constructor(db: Knex) {
    this.db = db;
    this.table = 'workspaces';
  }

  public async create(admin_id: string, name: string) {
    try {
      if (!admin_id || !name) throw new Error('Missing admin_id or name');

      const workspace_id: string = 'workspace' + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ workspace_id, admin_id, name, guest_ids: [], test_ids: [] });
      
      return await this.findOneById(workspace_id); 
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneByName(name: string) {
    try {
      if (!name) throw new Error('Missing name');

      return await this.db.select().from(this.table).where('name', name);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneById(workspace_id: string) {
    try {
      if (!workspace_id) throw new Error('Missing workspace_id');

      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
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

  public async update(workspace_id: string, admin_id = '', name = '', guest_ids = [], test_ids = []) {
    try {
      if (!workspace_id) throw new Error('Missing workspace_id');

      // Update the individual fields
      if (admin_id) await this.db(this.table).where('workspace_id', workspace_id).update('admin_id', admin_id);
      if (name) await this.db(this.table).where('workspace_id', workspace_id).update('name', name); 
      if (guest_ids.length !== 0) await this.db(this.table).where('workspace_id', workspace_id).update('guest_ids', guest_ids); 
      if (test_ids.length !== 0) await this.db(this.table).where('workspace_id', workspace_id).update('test_ids', test_ids); 

      return await this.findOneById(workspace_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async delete(workspace_id: string) {
    try {
      if (!workspace_id) throw new Error('Missing workspace_id');

      await this.db(this.table).where('workspace_id', workspace_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};