import db from "../db.js";
import generateUniqueId from 'generate-unique-id';

export class AdminRepository {
  static async create(email, password) {
    try {
      const user_id = 'admin' + generateUniqueId({ useLetters: false });
      await db('admins').insert({ user_id, email, password });
      return await this.findOne(email);
    } catch {
      return 1;
    }
  }

  static async findOne(email) {
    try {
      const admin = await db.select().from('admins').where('email', email);
      return admin;
    } catch {
      return 1;
    }
  }

  static async findAll() {
    try {
      return await db.select().from('admins');
    } catch {
      return 1;
    }
  }

  static async update(user_id, email, password = '') {
    try {
      if (email) {
        await db('admins').where('user_id', user_id).update('email', email);
      }
      if (email) {
        await db('admins').where('user_id', user_id).update('password', password); 
      }
      return await this.findOne(email);
    } catch {
      return 1;
    }
  }

  static async delete(email) {
    try {
      await db('admins').where('user_id', user_id).update('email', email);
      return 0;
    } catch (error) {
      console.error(error);
      return 1;
    }
  }
};