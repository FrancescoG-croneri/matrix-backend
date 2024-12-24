import generateUniqueId from 'generate-unique-id';

export class UsersRepository {
  constructor(db) {
    this.db = db;
    this.table = 'users';
  }

  async create(email, password, role) {
    try {
      if (!email || !password || !role) throw new Error('Missing details');

      const user_id = role + generateUniqueId({ useLetters: false });
      await this.db(this.table).insert({ user_id, email, password, role, workspaces: {} });
      
      return await this.findOne(email);;
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async findOne(email) {
    try {
      if (!email) throw new Error("Missing email");
      return await this.db.select().from(this.table).where('email', email); 
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async findOneById(user_id) {
    try {
      if (!user_id) throw new Error("Missing user_id");
      return await this.db.select().from(this.table).where('user_id', user_id); 
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(this.table);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async findAllByWorkspace(workspace_id) {
    try {
      return await this.db.select().from(this.table).where('workspace_id', workspace_id);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async update(user_id, email = '', password = '', role = '', workspaces = []) {
    try {
      if (!user_id) throw new Error('Missing user_id');

      // Update the individual fields
      if (email) await this.db(this.table).where('user_id', user_id).update('email', email);
      if (password) await this.db(this.table).where('user_id', user_id).update('password', password); 
      if (role) await this.db(this.table).where('user_id', user_id).update('role', role); 
      if (workspaces) await this.db(this.table).where('user_id', user_id).update('workspaces', workspaces); 
      
      const user = await this.findOne(email);
      if (!user) return 1;

      return user;
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async delete(user_id) {
    try {
      return await this.db(this.table).where('user_id', user_id).del();
    } catch (e) {
      console.error(e);
      return 1;
    }
  }
};