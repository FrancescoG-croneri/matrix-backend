import { Request, Response } from 'express';
import { type UsersRepositoryInterface } from '../types/UsersRepositoryInterface';
import { type UsersControllerInterface } from '../types/UsersControllerInterface';
import { type User } from '../types/User';
import { type TokenHandlerInterface } from '@src/types/TokenHandler';
import bcrypt from 'bcrypt';

class UsersController implements UsersControllerInterface {

  private repository: UsersRepositoryInterface;
  private tokenHandler: TokenHandlerInterface;

  constructor(repository: UsersRepositoryInterface, tokenHandler: TokenHandlerInterface) {
    this.repository = repository;
    this.tokenHandler = tokenHandler;
  }

  public async create(req: Request, res: Response) {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const role: string = req.body.role;

    if (!email || !password || !role || !email.trim() || !password.trim() || !role.trim()) {
      return res.status(400).json({ message: 'Password, Email or Role are missing', success: false });
    }

    if (!email.includes('croner')) {
      return res.status(400).json({ message: 'You should be joining only if you are part of the right organisation', success: false });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: 'Email invalid', success: false });
    }

    const alreadyExistingUser: false | User[] = await this.repository.findOneByEmail(email);

    if (alreadyExistingUser) {
      return res.status(403).json({ message: 'This user already exists', success: false });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const response: false | User[] = await this.repository.create(email, hashedPassword, role);
    
    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Something went wrong during the user\'s creation', success: false });
    } else {
      const user: User = response[0];
      const token: string | false = this.tokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: 'User created successfully', user, token, success: true });
    }
  }

  public async authenticate(req: Request, res: Response) {
    const email: string = req.body.email;
    const password: string = req.body.password;

    if (!email || !password || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: 'Email, Password are missing', success: false });
    }

    const response: false | User[] = await this.repository.findOneByEmail(email);
    
    if (!response || !response[0]) {
      res.status(404).json({ message: 'Failed to find user', success: false });
    } else if (!(await bcrypt.compare(password, response[0].password))) {
      return res.status(401).json({ message: 'Passwords do not match', success: false });
    } else {
      const user: User = response[0];
      const token: string | false = this.tokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: "Authentication successful", user, token, success: true });
    }
  }

  public async findOneByEmail(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const email: string = req.query.email as string;

    if (!email || !requester_id || email.trim() === '' || requester_id.trim() === '') return res.status(400).json({ message: 'Missing requester_id or email', success: false });

    const response: false | User[] = await this.repository.findOneByEmail(email);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user: User = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  }

  public async findOneById(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;
    const user_id: string = req.query.user_id as string;

    if (!user_id || !requester_id || user_id.trim() === '' || requester_id.trim() === '') return res.status(400).json({ message: 'Missing user_id or requester_id', success: false });

    const response: false | User[] = await this.repository.findOneById(user_id);

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user: User = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  }

  public async findAll(req: Request, res: Response) {
    const requester_id: string = req.query.requester_id as string;

    if (!requester_id || requester_id.trim() === '') {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response: false | User[] = await this.repository.findAll();

    if (!response || !response[0]) {
      return res.status(404).json({ message: 'Failed to find users', success: false });
    } else {
      for (let i = 0; i < response.length; i++) {
        delete response[i].id;
        delete response[i].password;
      }
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Users fetched correctly", users: response, token, success: true });
    }
  }

  public async update(req: Request, res: Response) {
    const requester_id: string = req.body.requester_id;
    const user_id: string = req.body.user_id;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const role: string = req.body.role;

    if (!requester_id || !user_id || requester_id.trim() === '' || user_id.trim() === '') {
      return res.status(400).json({ message: 'requester_id or user_id are missing', success: false });
    }

    const response: false | User[] = await this.repository.update(user_id, email, password, role);

    if (!response || !response[0]) {
      return res.status(404).json({ message: "Failed to update user", success: false });
    } else {
      const user: User = response[0];
      const token: string | false = this.tokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User updated successfully", user, token, success: true });
    }
  }

  public async delete(req: Request, res: Response) {
    const user_id: string = req.body.user_id;

    if (!user_id || !user_id.trim()) {
      return res.status(400).json({ message: 'user_id is missing', success: false });
    }

    const response: boolean = await this.repository.delete(user_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete user", success: false });
    } else {
      return res.status(200).json({ message: "User deleted successfully", success: true });
    }
  }
  
};

export default UsersController;