import { type Test } from "./Test";

export interface TestsRepositoryInterface {
  table: string,
  create: (admin_id: string, workspace_id: string, subjects: string[]) => Promise<false | Test[]>,
  findOneById: (test_id: string) => Promise<false | Test[]>,
  findAll: () => Promise<false | Test[]>,
  findAllByAdmin: (admin_id: string) => Promise<false | Test[]>,
  findAllByWorkspace: (workspace_id: string) => Promise<false | Test[]>,
  update: (test_id: string, admin_id: string, workspace_id: string, subjects: string[]) => Promise<false | Test[]>,
  delete: (test_id: string) => Promise<boolean>
};
