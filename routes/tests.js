import express from 'express';
import TestsController from '../controllers/tests.js';
const router = express.Router();
import TokenHandler from '../utils/tokenHandler.js';

router.post('/create', TestsController.Create);
router.post('/authenticate', TestsController.Authenticate);

router.get('/all', TokenHandler.validateToken, TestsController.FindAll);
router.put('/update', TokenHandler.validateToken, TestsController.Update);
router.delete('/delete', TokenHandler.validateToken, TestsController.Delete);

export default router;
