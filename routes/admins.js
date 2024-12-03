import express from 'express';
import AdminsController from '../controllers/admins.js';
const router = express.Router();

router.post('/create', AdminsController.Create);
router.get('/authenticate', AdminsController.Authenticate);
router.put('/update', AdminsController.Update);
router.put('/delete', AdminsController.Delete);

export default router;
