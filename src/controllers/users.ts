import { type UsersRepositoryInterface } from '../types/UsersRepositoryInterface';
import { type User } from '../types/User';
import { UsersRepository } from '../repositories/UsersRepository';
import TokenHandler from '../utils/tokenHandler';
import bcrypt from 'bcrypt';
import db from "../../db";

const repository: UsersRepositoryInterface = new UsersRepository(db);

const UsersController = {

  Create: async (req: any, res: any) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const role: string = req.body.role;

    if (!email || !password || !role || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Password, Email or Role are missing', success: false });
    }

    if (!email.includes('croner')) {
      return res.status(400).json({ message: 'You should be joining only if you are part of the right organisation', success: false });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: 'Email invalid', success: false });
    }

    const alreadyExistingUser: false | User[] = await repository.findOneByEmail(email);

    if (alreadyExistingUser) {
      return res.status(403).json({ message: 'This user already exists', success: false });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const response: false | User[] = await repository.create(email, hashedPassword, role);
    
    if (!response) {
      return res.status(404).json({ message: 'Something went wrong during the user\'s creation', success: false });
    } else {
      const user: User = response[0];
      const token: string = TokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: 'User created successfully', user, token, success: true });
    }
  },

  Authenticate: async (req: any, res: any) => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Email, Password are missing', success: false });
    }

    const response: false | User[] = await repository.findOneByEmail(email);
    
    if (!response) {
      res.status(404).json({ message: 'Failed to find user', success: false });
    } else if (!(await bcrypt.compare(password, response[0].password))) {
      return res.status(401).json({ message: 'Passwords do not match', success: false });
    } else {
      const user: User = response[0];
      const token: string = TokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: "Authentication successful", user, token, success: true });
    }
  },

  FindOneByEmail: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const email: string = req.query.email;

    if (!email || !requester_id) return res.status(400).json({ message: 'Missing email', success: false });

    const response: false | User[] = await repository.findOneByEmail(email);

    if (!response) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user: User = response[0];
      const token = TokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  },

  FindOneById: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;
    const user_id: string = req.query.user_id;

    if (!user_id || !requester_id) return res.status(400).json({ message: 'Missing user_id', success: false });

    const response: false | User[] = await repository.findOneById(user_id);

    if (!response) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user: User = response[0];
      const token: string = TokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  },

  FindAll: async (req: any, res: any) => {
    const requester_id: string = req.query.requester_id;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response: false | User[] = await repository.findAll();

    if (!response) {
      return res.status(404).json({ message: 'Failed to find users', success: false });
    } else {
      const modifiedUsers = response.map((user: User) => { // TODO: doublecheck what type this has to be
        delete user.id;
        delete user.password;
      });
      const token: string = TokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Users fetched correctly", users: modifiedUsers, token, success: true });
    }
  },

  Update: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const role: string = req.body.role;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response: false | User[] = await repository.update(requester_id, email, password, role);

    if (!response) {
      return res.status(404).json({ message: "Failed to update user", success: false });
    } else {
      const user: User = response[0];
      const token: string = TokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User updated successfully", user, token, success: true });
    }
  },

  Delete: async (req: any, res: any) => {
    const requester_id: string = req.body.requester_id;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response: boolean = await repository.delete(requester_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete user", success: false });
    } else {
      return res.status(200).json({ message: "User deleted successfully", success: true });
    }
  },
  
};

export default UsersController;