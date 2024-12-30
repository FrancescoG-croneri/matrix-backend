import { type TestsRepositoryInterface } from '@src/types/TestsRepositoryInterface';
import { type Test } from '@src/types/Test';
import { TestsRepository } from '../repositories/TestsRepository';
import TokenHandler from '../utils/tokenHandler';
import db from "../../db";
import { type TokenHandlerInterface } from '@src/types/TokenHandler';

const repository: TestsRepositoryInterface = new TestsRepository(db);
const tokenHandler: TokenHandlerInterface = new TokenHandler();

const TestsController = {

  Create: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const admin_id: string = req.body.admin_id;
    const workspace_id: string = req.body.workspace_id;
    const subjects: string[] = req.body.subjects;

    if (
      !requester_id || 
      !admin_id || 
      !workspace_id ||
      requester_id.trim() === '' || 
      admin_id.trim() === '' || 
      workspace_id.trim() === '' ||
      subjects.length === 0
    ) {
      return res.status(400).json({ message: 'requester_id, admin_id, workspace_id or Subjects are missing', status: false });
    }

    const test: false | Test[] = await repository.create(admin_id, workspace_id, subjects);
    
    if (!test) {
      return res.status(404).json({ message: 'Something went wrong with your test creation', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(201).json({ message: 'Test created successfully', token, test: test[0], status: true });
    }
  },

  FindOneById: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const test_id: string = req.query.test_id;

    if (!test_id) return res.status(400).json({ message: "Missing test_id", status: false });

    const test: false | Test[] = await repository.findOneById(test_id);

    if (!test) {
      return res.status(404).json({ message: 'Failed to find test', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Test found successfully", token, test: test[0], status: true });
    }
  },

  FindAll: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;

    const tests: false | Test[] = await repository.findAll();

    if (!tests) {
      return res.status(404).json({ message: 'Failed to find tests', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Tests fetched correctly", token, tests, status: true });
    }
  },

  FindAllByAdmin: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const admin_id: string = req.query.admin_id;

    if (!admin_id || !requester_id) {
      return res.status(400).json({ message: "Missing admin_id or requester_id", status: false });
    }

    const tests: false | Test[] = await repository.findAllByAdmin(admin_id);

    if (!tests) {
      return res.status(404).json({ message: 'Failed to find tests', status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Tests fetched correctly", tests, token, status: true });
    }
  },

  Update: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const test_id: string = req.body.test_id;
    const admin_id: string = req.body.admin_id;
    const workspace_id: string = req.body.workspace_id;
    const subjects: string[] = req.body.subjects;

    if (!requester_id || !test_id) {
      return res.status(400).json({ message: 'requester_id or test_id are missing', status: false });
    }

    const test: false | Test[] = await repository.update(test_id, admin_id, workspace_id, subjects);

    if (!test) {
      return res.status(404).json({ message: "Failed to update test", status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: 'Test updated successfully', test: test[0], token, status: true });
    }
  },

  Delete: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const test_id: string = req.body.test_id;

    if (!requester_id || !test_id) {
      return res.status(400).json({ message: "requester_id or test_id are missing", status: false });
    }

    const response: boolean = await repository.delete(test_id);

    if (!response) {
      return res.status(404).json({ error: "Failed to delete test", status: false });
    } else {
      const token: string | false = tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Test deleted successfully", token, status: true });
    }
  },
};

export default TestsController;