import generateUniqueId from 'generate-unique-id';

export class TestsRepository {
  constructor(db) {
    this.db = db;
    this.table = 'tests';
  }

  async create(admin_id, workspace_id, subjects) {
    try {
      if (!admin_id || !workspace_id) throw new Error('Missing details');
      const test_id = 'test' + generateUniqueId({ useLetters: false });
      const response = await this.db(this.table).insert({ admin_id, workspace_id, subjects, guests: {}, results: {} });
      
      const newTest = await this.findOne(test_id);
      return {
        message: "Test created successfully",
        response,
        test: newTest,
      }
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async findOne(test_id) {
    try {
      const test = await this.db.select().from(this.table).where('test_id', test_id);
      return {
        message: "Test fetched succcessfully from the repository layer",
        test
      }
    } catch (e) {
      console.error(e);
    }
  }

  async findAll() {
    try {
      const tests = await this.db.select().from(this.table);
      return {
        message: "All tests fetched successfully in the repository layer",
        tests
      }
    } catch (e) {
      console.error(e);
    }
  }

  async findTestsOfAdmin(admin_id) {
    try {
      const tests = await this.db.select().from(this.table).where('admin_id', admin_id);
      return {
        message: "Tests of admin fetched successfully in the repository layer",
        tests
      }
    } catch (e) {
      console.error(e);
    }
  }

  async update(test_id, workspace_id = '', admin_id = '', guests = {}, subjects = {}, results = {}) {
    try {
      if (!test_id) throw new Error('Missing test_id');

      // Update the individual fields
      if (workspace_id) await this.db(this.table).where('test_id', test_id).update('workspace_id', workspace_id);
      if (admin_id) await this.db(this.table).where('test_id', test_id).update('admin_id', admin_id); 
      if (guests) await this.db(this.table).where('test_id', test_id).update('guests', guests); 
      if (subjects) await this.db(this.table).where('test_id', test_id).update('subjects', subjects); 
      if (results) await this.db(this.table).where('test_id', test_id).update('results', results)
      
      const newTest = await this.findOne(test_id);
      if (!newTest) return;

      return {
        message: 'Test updated and fetched successfully in the repository layer',
        test: newTest
      }
    } catch (e) {
      console.error(e);
    }
  }

  async delete(test_id) {
    try {
      const response = await this.db(this.table).where('test_id', test_id).del();
      return {
        message: "Test deleted successfully in the repository layer",
        response
      }
    } catch (e) {
      console.error(e);
    }
  }
};