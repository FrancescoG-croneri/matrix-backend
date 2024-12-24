import express from 'express';
import UsersController from '../controllers/users.js';
const router = express.Router();
import TokenHandler from '../utils/tokenHandler.js';

router.post('/create', UsersController.Create);
router.post('/authenticate', UsersController.Authenticate);

router.get('/all', TokenHandler.validateToken, UsersController.FindAll);
router.put('/update', TokenHandler.validateToken, UsersController.Update);
router.delete('/delete', TokenHandler.validateToken, UsersController.Delete);

export default router;
