import { type Invitation } from "./Invitation";

export interface InvitationsRepositoryInterface {
  table: string,
  create: (item_id: string, admin_id: string, guest_id: string, type: string) => Promise<false | Invitation[]>,
  findOneById: (invitation_id: string) => Promise<false | Invitation[]>,
  findAll: () => Promise<false | Invitation[]>,
  findAllByGuest: (guest_id: string) => Promise<false | Invitation[]>,
  findAllByItem: (item_id: string) => Promise<false | Invitation[]>,
  findAllByAdmin: (admin_id: string) => Promise<false | Invitation[]>,
  update: (invitation_id: string, item_id: string, admin_id: string, guest_id: string, type: string, status: string) => Promise<false | Invitation[]>,
  delete: (invitation_id: string) => Promise<boolean>
};
