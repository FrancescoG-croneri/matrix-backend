import express, { type Router } from 'express';
import TestsController from '../controllers/tests';
import TokenHandler from '../utils/tokenHandler';
const router: Router = express.Router();

// POST
router.post('/create', TokenHandler.validateToken, TestsController.Create);

// PUT
router.put('/update', TokenHandler.validateToken, TestsController.Update);

// DELETE
router.delete('/delete', TokenHandler.validateToken, TestsController.Delete);

export default router;
