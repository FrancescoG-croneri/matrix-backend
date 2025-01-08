import generateUniqueId from 'generate-unique-id';
import { type Knex } from 'knex';
import { type InvitationsRepositoryInterface } from '@src/types/invitations/InvitationsRepositoryInterface';

export class InvitationsRepository implements InvitationsRepositoryInterface {

  private db: Knex;
  public table: string;

  constructor(db: Knex) {
    this.db = db;
    this.table = 'invitations';
  }

  public async create(item_id: string, admin_id: string, guest_id: string, type: string) {
    try {
      if (!item_id || !admin_id || !guest_id || !type) throw new Error('Missing required params');

      const invitation_id: string = 'invitation' + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ invitation_id, item_id, admin_id, guest_id, type, status: 'pending' });
      
      return await this.findOneById(invitation_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findOneById(invitation_id: string) {
    try {
      if (!invitation_id) throw new Error('Missing invitation_id');

      return await this.db.select().from(this.table).where('invitation_id', invitation_id);
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

  public async findAllByGuest(guest_id: string) {
    try {
      if (!guest_id) throw new Error('Missing guest_id');

      return await this.db.select().from(this.table).where('guest_id', guest_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findAllByItem(item_id: string) {
    try {
      if (!item_id) throw new Error("Missing item_id");

      return await this.db.select().from(this.table).where('item_id', item_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findAllByAdmin(admin_id: string) {
    try {
      if (!admin_id) throw new Error("Missing admin_id");

      return await this.db.select().from(this.table).where('admin_id', admin_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async update(invitation_id: string, item_id: string = '', admin_id: string = '', guest_id: string = '', type: string = '', status: string = '') {
    try {
      if (!invitation_id) throw new Error('Missing invitation_id');

      // Update the individual fields
      if (item_id) await this.db(this.table).where('invitation_id', invitation_id).update('item_id', item_id);
      if (admin_id) await this.db(this.table).where('invitation_id', invitation_id).update('admin_id', admin_id);
      if (guest_id) await this.db(this.table).where('invitation_id', invitation_id).update('guest_id', guest_id);
      if (type) await this.db(this.table).where('invitation_id', invitation_id).update('type', type);
      if (status) await this.db(this.table).where('invitation_id', invitation_id).update('status', status);
      
      return await this.findOneById(invitation_id);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async delete(invitation_id: string) {
    try {
      if (!invitation_id) throw new Error('Missing invitation_id');

      await this.db(this.table).where('invitation_id', invitation_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};