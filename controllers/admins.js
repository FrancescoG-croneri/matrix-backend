import bcrypt from 'bcrypt';
import { AdminRepository } from '../repositories/AdminRepository.js';
import TokenGenerator from '../utils/tokenGenerator.js';

const AdminsController = {
  Create: async (req, res) => {
    console.log("req: ", req)
    if (
      !req.body.email || 
      !req.body.password || 
      req.body.email.trim() === '' ||
      req.body.password.trim() === '' 
    ) {
      res.status(400).json({ message: 'Password or Email is missing' });
      return;
    }

    const alreadyExistingAdmin = await AdminRepository.findOne(req.body.email);

    if (alreadyExistingAdmin.email === req.body.email) {
      res.status(403).json({ message: 'This admin already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = await AdminRepository.create(req.body.email, hashedPassword);
    
    if (admin === 1) {
      res.status(404).json({ message: 'Something went wrong with your credentials' });
    } else {
      const token = TokenGenerator.jsonwebtoken(admin.user_id);
      res.status(201).json({ message: 'User created successfully', admin, token });
    }
  },
  
  Authenticate: async (req, res) => {
    const admin = await AdminRepository.findOne(req.body.email);
    console.log("DIOCANEEEEEEEEE  ", admin);
    
    if (admin === 1) {
      res.status(404).json({ message: 'Failed to find user' });
    } else if (!(await bcrypt.compare(req.body.password, admin.password))) {
      res.status(401).json({ message: 'Passwords do not match' });
    } else {
      const token = TokenGenerator.jsonwebtoken(req.body.user_id);
      res.status(200).json({ admin, token });
    }
  },

  Update: async (req, res) => {
    const guest = await GuestRepository.update(req.body.user_id, req.body.username, req.body.password);

    if (guest === 1) {
      res.status(404).json({ message: "Failed to update user" });
    } else {
      const token = TokenGenerator.jsonwebtoken(req.body.user_id);
      res.status(200).json({ message: "User updated successfully", guest, token });
    }
  },

  Delete: async (req, res) => {
    const user = await GuestRepository.delete(req.body.username);

    if (user === 1) {
      return res.status(404).json({ error: "Failed to delete user" });
    } else {
      res.status(200).json({ message: "User deleted successfully" });
    }
  },
};

export default AdminsController;