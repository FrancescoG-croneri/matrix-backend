import { type Color } from "./Color";

export interface ColorsRepositoryInterface {
  table: string,
  create: (workspace_id: string, guest_id: string, hex: string) => Promise<false | Color[]>,
  findOneById: (color_id: string) => Promise<false | Color[]>,
  findOneByHex: (hex: string) => Promise<false | Color[]>,
  findAll: () => Promise<false | Color[]>,
  findAllByWorkspace: (workspace_id: string) => Promise<false | Color[]>,
  update: (color_id: string, workspace_id: string, guest_id: string, hex: string) => Promise<false | Color[]>,
  delete: (color_id: string) => Promise<boolean>
};
