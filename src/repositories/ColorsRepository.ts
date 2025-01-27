import generateUniqueId from 'generate-unique-id';
import { type Knex } from 'knex';
import { type ColorsRepositoryInterface } from '@src/types/colors/ColorsRepositoryInterface';

export class ColorsRepository implements ColorsRepositoryInterface {

  private db: Knex;
  public table: string;

  constructor(db: Knex) {
    this.db = db;
    this.table = 'colors';
  }

  public async create(workspace_id: string, guest_id: string, hex: string) {
    try {
      if (!workspace_id || !guest_id || !hex) throw new Error('Missing details');

      const color_id: string = 'color' + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ color_id, workspace_id, guest_id, hex });
      
      return await this.findOneById(color_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneById(color_id: string) {
    try {
      if (!color_id) throw new Error('Missing color_id');

      return await this.db.select().from(this.table).where('color_id', color_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneByHex(hex: string) {
    try {
      if (!hex) throw new Error('Missing hex');

      return await this.db.select().from(this.table).where('hex', hex);
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

  public async findAllByWorkspace(workspace_id: string) {
    try {
      if (!workspace_id) throw new Error("Missing workspace_id");

      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async update(color_id: string, workspace_id: string = '', guest_id: string = '', hex: string = '') {
    try {
      if (!color_id) throw new Error('Missing color_id');

      // Update the individual fields
      if (workspace_id) await this.db(this.table).where('color_id', color_id).update('workspace_id', workspace_id);
      if (guest_id) await this.db(this.table).where('color_id', color_id).update('guest_id', guest_id);
      if (hex) await this.db(this.table).where('color_id', color_id).update('hex', hex);
      
      return await this.findOneById(color_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async delete(color_id: string) {
    try {
      if (!color_id) throw new Error('Missing color_id');

      await this.db(this.table).where('color_id', color_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};