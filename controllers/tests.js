import { TestsRepository } from '../repositories/TestsRepository.js';
import TokenHandler from '../utils/tokenHandler.js';
import bcrypt from 'bcrypt';
import db from "../db.js";
const repository = new TestsRepository(db);

const TestsController = {
  Create: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!email || !password || !role || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Password, Email or Role are missing' });
    }

    if (!email.includes('croner')) {
      return res.status(400).json({ message: 'You should be joining only if you are part of the right organisation' });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: 'Email invalid' });
    }

    const alreadyExistingUser = await repository.findOne(email);

    if (alreadyExistingUser.length !== 0) {
      return res.status(403).json({ message: 'This user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await repository.create(email, hashedPassword, role);
    
    if (user === 1) {
      return res.status(404).json({ message: 'Something went wrong with your credentials' });
    } else {
      const data = {
        token: TokenHandler.generateToken(user),
        user_id: user[0].user_id,
        email: user[0].email,
        role: user[0].role,
        workspaces: user[0].workspaces
      }
      return res.status(201).json({ message: 'User created successfully', data });
    }
  },

  FindOne: async (req, res) => {
    const email = req.body.email;

    if (!email) return res.status(400).json({ message: 'Missing email' });

    const user = await repository.findOne(email);

    if (user === 1 || !user.length) {
      return res.status(404).json({ message: 'Failed to find user' });
    } else {
      const data = {
        token: TokenHandler.generateToken(user),
        user_id: user[0].user_id,
        email: user[0].email,
        role: user[0].role,
        workspaces: user[0].workspaces
      } 
      return res.status(200).json({ message: "User found successfully", data });
    }
  },

  FindAll: async (req, res) => {
    const users = await repository.findAll();

    if (users === 1) {
      return res.status(404).json({ message: 'Failed to find users' });
    } else {
      const modifiedUsers = users.map((user) => {
        delete user.id;
        delete user.password;
        delete user.created_at;
        delete user.updated_at;
      });
      const token = TokenHandler.generateToken(users);
      return res.status(200).json({ message: "Users fetched correctly", users: modifiedUsers, token });
    }
  },
  
  Authenticate: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Email, Password or Role are missing' });
    }

    const user = await repository.findOne(email);
    
    if (user === 1 || !user.length) {
      res.status(404).json({ message: 'Failed to find user' });
    } else if (!(await bcrypt.compare(password, user[0].password))) {
      return res.status(401).json({ message: 'Passwords do not match' });
    } else {
      const data = {
       token: TokenHandler.generateToken(user),
       user_id: user[0].user_id,
       email: user[0].email,
       role: user[0].role,
       workspaces: user[0].workspaces
      }
      return res.status(201).json({ message: "Authentication successful", data});
    }
  },

  Update: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const user_id = req.body.user_id;

    if (!email || !password || !role || !user_id || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Email, Password, Role or user_id are missing' });
    }

    const response = await repository.update(email, password, role, user_id);

    if (response === 1) {
      return res.status(404).json({ message: "Failed to update user" });
    } else {
      const token = TokenHandler.generateToken(response.user);
      return res.status(200).json({ message: response.message, user: response.user, token });
    }
  },

  Delete: async (req, res) => {
    const user_id = req.body.user_id;
    const response = await repository.delete(user_id);

    if (response === 1) {
      return res.status(404).json({ error: "Failed to delete user" });
    } else {
      return res.status(200).json({ message: "User deleted successfully" });
    }
  },
};

export default TestsController;