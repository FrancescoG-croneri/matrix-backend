import { type Workspace } from "./workspaces/Workspace";

export interface WorkspacesRepositoryInterface {
  table: string,
  create: (admin_id: string, name: string) => Promise<false | Workspace[]>,
  findOneByName: (name: string) => Promise<false | Workspace[]>,
  findOneById: (workspace_id: string) => Promise<false | Workspace[]>,
  findAll: () => Promise<false | Workspace[]>,
  findAllByAdmin: (admin_id: string) => Promise<false | Workspace[]>,
  update: (workspace_id: string, admin_id: string, name: string, guest_ids: string[], test_ids: string[]) => Promise<false | Workspace[]>,
  delete: (user_id: string) => Promise<boolean>
};
