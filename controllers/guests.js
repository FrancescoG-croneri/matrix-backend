import bcrypt from 'bcrypt';
import { GuestRepository } from '../repositories/GuestRepository.js';
import TokenGenerator from '../utils/tokenGenerator.js';


const GuestsController = {
  Create: async (req, res) => {
    if (
      !req.body.username || 
      !req.body.password || 
      req.body.username.trim() === '' ||
      req.body.password.trim() === '' 
    ) {
      res.status(400).json({ message: 'Password or Username is missing' });
      return;
    }

    if (await GuestRepository.findOne(req.body.username) !== 1) {
      res.status(403).json({ message: 'This guest already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const guest = await GuestRepository.create(req.body.username, hashedPassword);

    if (guest === 1) {
      res.status(400).json({ message: 'Something went wrong with your credentials' });
    } else {
      const token = TokenGenerator.jsonwebtoken(req.body.user_id);
      res.status(201).json({ message: 'User created successfully', guest, token });
    }
  },

  Authenticate: async (req, res) => {
    const guest = await GuestRepository.findOne(req.body.username);

    if (guest === 1) {
      res.status(404).json({ message: 'Failed to find user' });
    } else if (!(await bcrypt.compare(req.body.password, guest.password))) {
      res.status(401).json({ message: 'Passwords do not match' });
    } else {
      const token = TokenGenerator.jsonwebtoken(req.body.user_id);
      res.status(200).json({ guest, token });
    }
  },

  Update: async (req, res) => {
    const guest = await GuestRepository.update(req.body.user_id, req.body.username, req.body.password);

    if (guest === 1) {
      res.status(404).json({ message: "Failed to update user" });
    } else {
      const token = TokenGenerator.jsonwebtoken(req.body.user_id);
      res.status(200).json({ message: "OK", guest, token });
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

export default GuestsController;