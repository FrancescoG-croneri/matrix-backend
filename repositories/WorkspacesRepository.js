import generateUniqueId from 'generate-unique-id';

export class WorkspacesRepository {
  constructor(db) {
    this.db = db;
    this.table = 'workspaces';
  }

  async create(admin_id, name) {
    try {
      if (!admin_id || !name) throw new Error('Missing details');
      const workspace_id = 'workspace' + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ workspace_id, admin_id, name, colors: {}, guests: [], tests: [] });
      return await this.findOne(workspace_id); 
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async findOne(workspace_id) {
    try {
      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
    } catch (e) {
      console.error(e);
    }
  }

  async findOneByName(name) {
    try {
      return await this.db.select().from(this.table).where('name', name);
    } catch (e) {
      console.error(e);
    }
  }

  async findOneById(workspace_id) {
    try {
      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
    } catch (e) {
      console.error(e);
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(this.table);
    } catch (e) {
      console.error(e);
    }
  }

  async findAllByAdmin(admin_id) {
    try {
      return await this.db.select().from(this.table).where('admin_id', admin_id);
    } catch (e) {
      console.error(e);
    }
  }

  async update(workspace_id, admin_id = '', name, guests = {}, tests = {}) {
    try {
      if (!workspace_id) throw new Error('Missing workspace_id');

      // Update the individual fields
      if (admin_id) await this.db(this.table).where('workspace_id', workspace_id).update('admin_id', admin_id);
      if (name) await this.db(this.table).where('workspace_id', workspace_id).update('name', name); 
      if (guests) await this.db(this.table).where('workspace_id', workspace_id).update('guests', guests); 
      if (tests) await this.db(this.table).where('workspace_id', workspace_id).update('tests', tests); 
      
      const newWorkspace = await this.findOne(workspace_id);
      if (!newWorkspace) return;

      return newWorkspace;
    } catch (e) {
      console.error(e);
    }
  }

  async delete(workspace_id) {
    try {
      const response = await this.db(this.table).where('workspace_id', workspace_id).del();
      return {
        message: "Workspace deleted successfully in the repository layer",
        response
      }
    } catch (e) {
      console.error(e);
    }
  }
};