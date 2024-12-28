import express from 'express';
import UsersController from '../controllers/users.js';
const router = express.Router();
// import TokenHandler from '../utils/tokenHandler.js';

// POST
router.post('/create', UsersController.Create);
router.post('/authenticate', UsersController.Authenticate);

// GET
router.get('/oneByEmail', UsersController.FindOneByEmail);
router.get('/oneById',  UsersController.FindOneById);
router.get('/all', UsersController.FindAll);

// PUT
router.put('/update', UsersController.Update);

// DELETE
router.delete('/delete', UsersController.Delete);

export default router;

// TokenHandler.validateToken,