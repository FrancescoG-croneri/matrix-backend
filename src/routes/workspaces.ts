import express, { type Router } from 'express';
import WorkspacesController from '../controllers/workspaces';
import TokenHandler from '../utils/tokenHandler';
const router: Router = express.Router();

// POST
router.post('/create', WorkspacesController.Create);

// GET
router.get('/oneById', WorkspacesController.FindOneById);
router.get('/allByAdmin', WorkspacesController.FindAllByAdmin);

// PUT
router.put('/update', TokenHandler.validateToken, WorkspacesController.Update);

// DELETE
router.delete('/delete', TokenHandler.validateToken, WorkspacesController.Delete);

export default router;
