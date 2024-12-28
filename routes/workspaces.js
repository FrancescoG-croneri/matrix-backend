import express from 'express';
import WorkspacesController from '../controllers/workspaces.js';
const router = express.Router();
import TokenHandler from '../utils/tokenHandler.js';

router.post('/create', WorkspacesController.Create);
router.get('/find-all-by-admin', WorkspacesController.FindAllByAdmin);
router.get('/find-one-by-id', WorkspacesController.FindOneById);

router.put('/update', TokenHandler.validateToken, WorkspacesController.Update);
router.delete('/delete', TokenHandler.validateToken, WorkspacesController.Delete);

export default router;
