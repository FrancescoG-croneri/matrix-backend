import { WorkspacesRepository } from '../repositories/WorkspacesRepository.js';
import { UsersRepository } from '../repositories/UsersRepository.js';
import TokenHandler from '../utils/tokenHandler.js';
import bcrypt from 'bcrypt';
import db from "../db.js";
const repository = new WorkspacesRepository(db);
const usersRepository = new UsersRepository(db);

const WorkspacesController = {
  Create: async (req, res) => {
    const admin_id = req.body.admin_id;
    const name = req.body.name;

    if (!admin_id || !name || admin_id.trim() === '' || name.trim() === '') {
      return res.status(400).json({ message: 'admin_id or Name are missing' });
    }

    const alreadyExistingWorkspace = await repository.findOneByName(name);

    if (alreadyExistingWorkspace.length !== 0) {
      console.log(alreadyExistingWorkspace);
      return res.status(403).json({ message: 'A workspace with this name already exists' });
    }

    const workspace = await repository.create(admin_id, name);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Something went wrong with your workspace creation', status: false });
    } else {
      const data = {
        token: TokenHandler.generateToken(admin_id),
        workspace: workspace[0]
      }
      return res.status(201).json({ message: 'Workspace created successfully', data, status: true });
    }
  },

  // FindOne: async (req, res) => {
  //   const email = req.body.email;

  //   if (!email) return res.status(400).json({ message: 'Missing email' });

  //   const user = await repository.findOne(email);

  //   if (user === 1 || !user.length) {
  //     return res.status(404).json({ message: 'Failed to find user' });
  //   } else {
  //     const data = {
  //       token: TokenHandler.generateToken(user),
  //       user_id: user[0].user_id,
  //       email: user[0].email,
  //       role: user[0].role,
  //       workspaces: user[0].workspaces
  //     } 
  //     return res.status(200).json({ message: "User found successfully", data });
  //   }
  // },

  FindOneById: async (req, res) => {
    const workspace_id = req.query.workspace_id;

    if (!workspace_id) return res.status(400).json({ message: "Missing workspace_id" });

    const workspace = await repository.findOneById(workspace_id);

    if (workspace === 1 || !workspace) {
      return res.status(404).json({ message: 'Failed to find workspace' });
    } else {
      const data = {
        token: TokenHandler.generateToken(workspace[0].admin_id),
        workspace: workspace[0]
      }
      return res.status(200).json({ message: "Workspace found successfully", data });
    }
  },

  // FindAll: async (req, res) => {
  //   const workspaces = await repository.findAll();

  //   if (users === 1) {
  //     return res.status(404).json({ message: 'Failed to find users' });
  //   } else {
  //     const modifiedUsers = users.map((user) => {
  //       delete user.id;
  //       delete user.password;
  //       delete user.created_at;
  //       delete user.updated_at;
  //     });
  //     const token = TokenHandler.generateToken(users);
  //     return res.status(200).json({ message: "Users fetched correctly", users: modifiedUsers, token });
  //   }
  // },

  FindAllByAdmin: async (req, res) => {
    const admin_id = req.query.admin_id;

    if (!admin_id) {
      return res.status(400).json({ message: "Missing admin_id" });
    }

    const workspaces = await repository.findAllByAdmin(admin_id);
    const admin = await usersRepository.findOneById(admin_id);

    if (workspaces === 1) {
      return res.status(404).json({ message: 'Failed to find workspaces' });
    } else if (admin === 1) {
      return res.status(404).json({ message: 'Failed to find user'});
    } else {
      const token = TokenHandler.generateToken(admin);
      return res.status(200).json({ message: "Workspaces fetched correctly", workspaces, token });
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
      return res.status(200).json({ message: response.message, user: response.workspace, token });
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

export default WorkspacesController;