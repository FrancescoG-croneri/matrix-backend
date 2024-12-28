import { UsersRepository } from '../repositories/UsersRepository.js';
import TokenHandler from '../utils/tokenHandler.js';
import bcrypt from 'bcrypt';
import db from "../db.js";
const repository = new UsersRepository(db);

const UsersController = {

  Create: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!email || !password || !role || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Password, Email or Role are missing', success: false });
    }

    if (!email.includes('croner')) {
      return res.status(400).json({ message: 'You should be joining only if you are part of the right organisation', success: false });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: 'Email invalid', success: false });
    }

    const alreadyExistingUser = await repository.findOne(email);

    if (alreadyExistingUser.length !== 0) {
      return res.status(403).json({ message: 'This user already exists', success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await repository.create(email, hashedPassword, role);
    
    if (!response) {
      return res.status(404).json({ message: 'Something went wrong during the user\'s creation', success: false });
    } else {
      const user = response[0];
      const token = TokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: 'User created successfully', user, token, success: true });
    }
  },

  Authenticate: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Email, Password are missing', success: false });
    }

    const response = await repository.findOne(email);
    
    if (!response) {
      res.status(404).json({ message: 'Failed to find user', success: false });
    } else if (!(await bcrypt.compare(password, response[0].password))) {
      return res.status(401).json({ message: 'Passwords do not match', success: false });
    } else {
      const user = response[0];
      const token = TokenHandler.generateToken(user.user_id);

      delete user.id;
      delete user.password;
      return res.status(201).json({ message: "Authentication successful", user, token, success: true });
    }
  },

  FindOneByEmail: async (req, res) => {
    const requester_id = req.query.requester_id;
    const email = req.query.email;

    if (!email || !requester_id) return res.status(400).json({ message: 'Missing email', success: false });

    const response = await repository.findOneByEmail(email);

    if (!response) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user = response[0];
      const token = TokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  },

  FindOneById: async (req, res) => {
    const requester_id = req.query.requester_id;
    const user_id = req.query.user_id;

    if (!user_id || !requester_id) return res.status(400).json({ message: 'Missing user_id', success: false });

    const response = await repository.findOneById(user_id);

    if (!response) {
      return res.status(404).json({ message: 'Failed to find user', success: false });
    } else {
      const user = response[0];
      const token = TokenHandler.generateToken(requester_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User found successfully", user, token, success: true });
    }
  },

  FindAll: async (req, res) => {
    const requester_id = req.query.requester_id;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response = await repository.findAll();

    if (!response) {
      return res.status(404).json({ message: 'Failed to find users', success: false });
    } else {
      const modifiedUsers = response.map((user) => {
        delete user.id;
        delete user.password;
      });
      const token = TokenHandler.generateToken(requester_id);

      return res.status(200).json({ message: "Users fetched correctly", users: modifiedUsers, token, success: true });
    }
  },

  Update: async (req, res) => {
    const requester_id = req.body.requester_id;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response = await repository.update(user_id, email, password, role);

    if (!response) {
      return res.status(404).json({ message: "Failed to update user", success: false });
    } else {
      const user = response[0];
      const token = TokenHandler.generateToken(user_id);

      delete user.id;
      delete user.password;
      return res.status(200).json({ message: "User updated successfully", user, token, success: true });
    }
  },

  Delete: async (req, res) => {
    const requester_id = req.body.requester_id;

    if (!requester_id) {
      return res.status(400).json({ message: 'requester_id is missing', success: false });
    }

    const response = await repository.delete(requester_id);

    if (!response) {
      return res.status(404).json({ message: "Failed to delete user", success: false });
    } else {
      return res.status(200).json({ message: "User deleted successfully", success: false });
    }
  },
  
};

export default UsersController;