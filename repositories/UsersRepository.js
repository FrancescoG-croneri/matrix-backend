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
      await this.db(this.table).insert({ user_id, email, password, role });
      
      return await this.findOne(email);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async findOneByEmail(email) {
    try {
      if (!email) throw new Error("Missing email");
      return await this.db.select().from(this.table).where('email', email);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async findOneById(user_id) {
    try {
      if (!user_id) throw new Error("Missing user_id");
      return await this.db.select().from(this.table).where('user_id', user_id); 
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(this.table);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async update(user_id, email = '', password = '', role = '') {
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

  async delete(user_id) {
    try {
      await this.db(this.table).where('user_id', user_id).del();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};