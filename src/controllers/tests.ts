import { type TestsRepositoryInterface } from '@src/types/tests/TestsRepositoryInterface';
import { type TestsControllerInterface } from '@src/types/tests/TestsControllerInterface';
import { type TokenHandlerInterface } from '@src/types/utils/TokenHandlerInterface';
import { type Test } from '@src/types/tests/Test';
import { type Request, type Response } from 'express';

class TestsController implements TestsControllerInterface {

  private repository: TestsRepositoryInterface;
  private tokenHandler: TokenHandlerInterface;

  constructor(repository: TestsRepositoryInterface, tokenHandler: TokenHandlerInterface) {
    this.repository = repository;
    this.tokenHandler = tokenHandler;
  }

  public async create(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const admin_id: string = req.body.admin_id;
    const workspace_id: string = req.body.workspace_id;
    const subjects: string[] = req.body.subjects;

    if (!requester_id || !admin_id || !workspace_id || !requester_id.trim() || !admin_id.trim() || !workspace_id.trim() || !subjects.length) {
      return res.status(400).json({ message: 'requester_id, admin_id, workspace_id or Subjects are missing', success: false });
    }

    const response: false | Test[] = await this.repository.create(admin_id, workspace_id, subjects);
    
    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Something went wrong with your test creation', success: false });
    } else {
      const test: Test = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(201).json({ message: 'Test created successfully', test, token, success: true });
    }
  };

  public async findOneById(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const test_id: string = req.query.test_id as string;

    if (!requester_id || !requester_id.trim() || !test_id || !test_id.trim()) return res.status(400).json({ message: "Missing requester_id or test_id", success: false });

    const response: false | Test[] = await this.repository.findOneById(test_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find test', success: false });
    } else {
      const test: Test = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Test found successfully", test, token, success: true });
    }
  };

  public async findAll(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;

    if (!requester_id || !requester_id.trim()) return res.status(400).json({ message: "Missing requester_id", success: false });

    const response: false | Test[] = await this.repository.findAll();

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find tests', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Tests fetched correctly", tests: response, token, success: true });
    }
  };

  public async findAllByAdmin(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const admin_id: string = req.query.admin_id as string;

    if (!admin_id || !requester_id || !admin_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing admin_id or requester_id", success: false });
    }

    const response: false | Test[] = await this.repository.findAllByAdmin(admin_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find tests', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Tests fetched correctly", tests: response, token, success: true });
    }
  };

  public async update(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const test_id: string = req.body.test_id;
    const admin_id: string = req.body.admin_id;
    const workspace_id: string = req.body.workspace_id;
    const subjects: string[] = req.body.subjects;

    if (!requester_id || !test_id || !requester_id.trim() || !test_id.trim()) {
      return res.status(400).json({ message: 'requester_id or test_id are missing', success: false });
    }

    const response: false | Test[] = await this.repository.update(test_id, admin_id, workspace_id, subjects);

    if (!response || !response[0]) {
      return res.status(404).json({ message: "Failed to update test", success: false });
    } else {
      const test: Test = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: 'Test updated successfully', test, token, success: true });
    }
  };

  public async delete(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const test_id: string = req.body.test_id;

    if (!requester_id || !test_id || !requester_id.trim() || !test_id.trim()) {
      return res.status(400).json({ message: "requester_id or test_id are missing", success: false });
    }

    const response: boolean = await this.repository.delete(test_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete test", success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Test deleted successfully", token, success: true });
    }
  };
};

export default TestsController;