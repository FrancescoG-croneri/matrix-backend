import express, { type Router } from 'express';
import { type WorkspacesRepositoryInterface } from '@src/types/workspaces/WorkspacesRepositoryInterface';
import { type WorkspacesControllerInterface } from '@src/types/workspaces/WorkspacesControllerInterface';
import { type TokenHandlerInterface } from '@src/types/utils/TokenHandlerInterface';
import { WorkspacesRepository } from '@src/repositories/WorkspacesRepository';
import WorkspacesController from '../controllers/workspaces';
import TokenHandler from '../utils/tokenHandler';
import db from '../../db';

const repository: WorkspacesRepositoryInterface = new WorkspacesRepository(db);
const tokenHandler: TokenHandlerInterface = new TokenHandler();
const workspacesController: WorkspacesControllerInterface = new WorkspacesController(repository, tokenHandler);
const router: Router = express.Router();

// POST
router.post('/create', tokenHandler.validateToken, workspacesController.create);

// GET
router.get('/oneByName', tokenHandler.validateToken, workspacesController.findOneByName);
router.get('/oneById', tokenHandler.validateToken, workspacesController.findOneById);
router.get('/all', tokenHandler.validateToken, workspacesController.findAll);
router.get('/allByAdmin', tokenHandler.validateToken, workspacesController.findAllByAdmin);

// PUT
router.put('/update', tokenHandler.validateToken, workspacesController.update);

// DELETE
router.delete('/delete', tokenHandler.validateToken, workspacesController.delete);

export default router;
