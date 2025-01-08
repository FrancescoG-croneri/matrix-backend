import { type InvitationsRepositoryInterface } from '@src/types/invitations/InvitationsRepositoryInterface';
import { type InvitationsControllerInterface } from '@src/types/invitations/InvitationsControllerInterface';
import { type TokenHandlerInterface } from '@src/types/utils/TokenHandlerInterface';
import { type Invitation } from '@src/types/invitations/Invitation';
import { type Request, type Response } from 'express';

class InvitationsController implements InvitationsControllerInterface {

  private repository: InvitationsRepositoryInterface;
  private tokenHandler: TokenHandlerInterface;

  constructor(repository: InvitationsRepositoryInterface, tokenHandler: TokenHandlerInterface) {
    this.repository = repository;
    this.tokenHandler = tokenHandler;
  }

  public async create(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const item_id: string = req.body.item_id;
    const admin_id: string = req.body.admin_id;
    const guest_id: string = req.body.guest_id;
    const type: string = req.body.type;

    if (
      !requester_id || !item_id || !admin_id || !guest_id || !type ||
      !requester_id.trim() || !item_id.trim() || !admin_id.trim() || !guest_id.trim() || !type.trim()
    ) {
      return res.status(400).json({ message: 'requester_id, item_id, admin_id, guest_id or Type are missing', success: false });
    }

    const response: false | Invitation[] = await this.repository.create(item_id, admin_id, guest_id, type);
    
    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Something went wrong with your invitation creation', success: false });
    } else {
      const invitation: Invitation = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(201).json({ message: 'Invitation created successfully', invitation, token, success: true });
    }
  };

  public async findOneById(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const invitation_id: string = req.query.invitation_id as string;

    if (!requester_id || !requester_id.trim() || !invitation_id || !invitation_id.trim()) return res.status(400).json({ message: "Missing requester_id or invitation_id", success: false });

    const response: false | Invitation[] = await this.repository.findOneById(invitation_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find invitation', success: false });
    } else {
      const invitation: Invitation = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitation found successfully", invitation, token, success: true });
    }
  };

  public async findAll(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;

    if (!requester_id || !requester_id.trim()) return res.status(400).json({ message: "Missing requester_id", success: false });

    const response: false | Invitation[] = await this.repository.findAll();

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find invitations', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitations fetched correctly", invitations: response, token, success: true });
    }
  };

  public async findAllByGuest(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const guest_id: string = req.query.guest_id as string;

    if (!guest_id || !requester_id || !guest_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing guest_id or requester_id", success: false });
    }

    const response: false | Invitation[] = await this.repository.findAllByGuest(guest_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find invitations', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitations fetched correctly", invitations: response, token, success: true });
    }
  };

  public async findAllByItem(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const item_id: string = req.query.item_id as string;

    if (!item_id || !requester_id || !item_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing item_id or requester_id", success: false });
    }

    const response: false | Invitation[] = await this.repository.findAllByItem(item_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find invitations', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitations fetched correctly", invitations: response, token, success: true });
    }
  };

  public async findAllByAdmin(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const admin_id: string = req.query.admin_id as string;

    if (!admin_id || !requester_id || !admin_id.trim() || !requester_id.trim()) {
      return res.status(400).json({ message: "Missing admin_id or requester_id", success: false });
    }

    const response: false | Invitation[] = await this.repository.findAllByAdmin(admin_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find invitations', success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitations fetched correctly", invitations: response, token, success: true });
    }
  };

  public async update(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const invitation_id: string = req.body.invitation_id;
    const item_id: string = req.body.item_id;
    const admin_id: string = req.body.admin_id;
    const guest_id: string = req.body.guest_id;
    const type: string = req.body.type;
    const status: string = req.body.status;

    if (!requester_id || !invitation_id || !requester_id.trim() || !invitation_id.trim()) {
      return res.status(400).json({ message: 'requester_id or invitation_id are missing', success: false });
    }

    const response: false | Invitation[] = await this.repository.update(invitation_id, item_id, admin_id, guest_id, type, status);

    if (!response || !response[0]) {
      return res.status(404).json({ message: "Failed to update invitation", success: false });
    } else {
      const invitation: Invitation = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: 'Invitation updated successfully', invitation, token, success: true });
    }
  };

  public async delete(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const invitation_id: string = req.body.invitation_id;

    if (!requester_id || !invitation_id || !requester_id.trim() || !invitation_id.trim()) {
      return res.status(400).json({ message: "requester_id or invitation_id are missing", success: false });
    }

    const response: boolean = await this.repository.delete(invitation_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete invitation", success: false });
    } else {
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Invitation deleted successfully", token, success: true });
    }
  };
};

export default InvitationsController;