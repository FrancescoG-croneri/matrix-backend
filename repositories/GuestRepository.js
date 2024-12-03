import db from "../db.js";
import generateUniqueId from 'generate-unique-id';

export class GuestRepository {
  static async create(username, password) {
    try {
      const user_id = 'guest' + generateUniqueId({ useLetters: false })
      await db('guests').insert({ user_id, username, password });
      return await this.findOne(username);
    } catch (error) {
      console.error(error);
      return 1;
    }
  }

  static async findOne(username) {
    try {
      return await db.select().from('guests').where('username', username);
    } catch (error) {
      console.error(error);
      return 1;
    }
  }

  static async findAll() {
    try {
      return await db.select().from('guests');
    } catch (error) {
      console.error(error);
      return 1;
    }
  }

  static async update(user_id, username = '', password = '') {
    try {
      if (username) {
        await db('guests').where('user_id', user_id).update('username', username);
      }
      if (password) {
        await db('guests').where('user_id', user_id).update('password', password); 
      }
      return await this.findOne(username);
    } catch (error) {
      console.error(error);
      return 1;
    }
  }

  static async delete(username) {
    try {
      await db('guests').where('username', username).del();
      return 0;
    } catch (error) {
      console.error(error);
      return 1;
    }
  }
};