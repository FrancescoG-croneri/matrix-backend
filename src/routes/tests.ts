import express, { type Router } from 'express';
import TestsController from '../controllers/tests';
import TokenHandler from '../utils/tokenHandler';
import { type TokenHandlerInterface } from '@src/types/TokenHandler';

const tokenHandler: TokenHandlerInterface = new TokenHandler();
const router: Router = express.Router();

// POST
router.post('/create', tokenHandler.validateToken, TestsController.Create);

// PUT
router.put('/update', tokenHandler.validateToken, TestsController.Update);

// DELETE
router.delete('/delete', tokenHandler.validateToken, TestsController.Delete);

export default router;
